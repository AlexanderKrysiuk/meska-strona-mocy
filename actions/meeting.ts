"use server"

import { CompleteMeetingSchema, CreateMeetingSchema, EditMeetingSchema } from "@/schema/meeting"
import { z } from "zod"
import { ServerAuth } from "./auth"
import { MeetingStatus, MembershipStatus, ParticipationStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { GetCircleByID } from "./circle"
import { sendEmail } from "@/lib/resend"
import { MeetingInvite } from "@/components/emails/Meeting-Invite"
import { GetMembersByCircleIdAndStatus } from "./membership"
import { MeetingUpdatedEmail } from "@/components/emails/Meeting-Update"
import { MeetingAction, moderatorMeetingActions } from "@/utils/meeting"

// const MODERATOR_SHARE = parseFloat(process.env.MODERATOR_SHARE!);

export const CreateMeeting = async (data: z.infer<ReturnType<typeof CreateMeetingSchema>>) => {
    try {
        const auth = await ServerAuth()
      
        const circle = await GetCircleByID(data.circleId)
        if (!circle) return { success: false, message: "Brak danych o kręgu" }
      
        if (!auth.roles.includes(Role.Admin) && (auth.id !== circle.moderator.id || !auth.roles.includes(Role.Moderator))) return { success: false, message: "Brak uprawnień do dodania spotkania" }
  
        const overlappingMeeting = await CheckOverlapingMeeting(
            auth.id,
            data.TimeRangeSchema.startTime,
            data.TimeRangeSchema.endTime
        )
        
        if (overlappingMeeting) return {
            success: false,
            message: "Nie udało się utworzyć spotkania",
            fieldErrors: { date: "W tym dniu masz już inne spotkanie" },
        }
        
        const activeMembers = await GetMembersByCircleIdAndStatus({
            circleId: circle.id, 
            status: MembershipStatus.Active
        })

        //const existingMeetings = await prisma.meeting.count({ where: { circleId: data.circleId } })

        const meeting = await prisma.$transaction(async (tx) => {
            const meeting = await tx.meeting.create({
                data: {
                    status: MeetingStatus.Scheduled,
                    startTime: data.TimeRangeSchema.startTime,
                    endTime: data.TimeRangeSchema.endTime,
                    circleId: data.circleId,
                    moderatorId: circle.moderator.id,
                },
                select: {
                    id: true,
                    startTime: true,
                    endTime: true,
                    circle: { select: {
                        name: true,
                        street: true,
                        price: true,
                        currency: true,
                        city: { select: {
                            name: true,
                            region: { select: {
                                country: { select: {
                                    timeZone: true,
                                }}
                            }}
                        }}
                    }},
                    moderator: { select: {
                        name: true,
                        image: true,
                        title: true,
                    }}
                }
            })

            if (activeMembers.length > 0) {
                await tx.participation.createMany({
                    data: activeMembers.map((membership) => ({
                        membershipId: membership.id,
                        meetingId: meeting.id
                    }))
                })
            }

            return meeting
        })

        for (const member of activeMembers) {
            try {
                await sendEmail({
                    to: member.user.email,
                    subject: `Nowe spotkanie ${circle.name}`,
                    react: MeetingInvite({
                        participant: member.user,
                        circle: meeting.circle,
                        city: meeting.circle.city ?? undefined,
                        country: meeting.circle.city?.region.country ?? { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
                        meeting: meeting,
                        moderator: meeting.moderator
                    })
                })
            } catch (error) {
                console.error(error)
            }
        }
        
        return { success: true, message: "Spotkanie utworzone pomyślnie" }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Błąd serwera lub połączenia z bazą danych" }
    }
}  

export const EditMeeting = async (data: z.infer<ReturnType<typeof EditMeetingSchema>>) => {
    try {
        const auth = await ServerAuth();
  
        const meeting = await GetMeeting(data.meetingId);
        if (!meeting) return {
            success: false,
            message: "Dane spotkanie nie istnieje"
        }

        if (!moderatorMeetingActions[meeting.status]?.includes(MeetingAction.Edit)) return {
            success: false,
            message: "Akcja niedozwolona"
        }    
  
        if (!auth.roles.includes(Role.Admin) && (auth.id !== meeting.moderatorId || !auth.roles.includes(Role.Moderator))) return {
            success: false,
            message: "Brak uprawnień do edycji spotkania"
        }
  
        // if (data.priceCurrency.currency === meeting.currency && data.priceCurrency.price > meeting.price && data.priceCurrency.price < meeting.price + 10) return {
        //     success: false,
        //     message: `Minimalna podwyżka ceny to 10 ${meeting.currency} (obecnie ${meeting.price} ${meeting.currency})`
        // }
  
        const overlappingMeeting = await CheckOverlapingMeeting(auth.id, data.TimeRangeSchema.startTime, data.TimeRangeSchema.endTime, meeting.id);
        if (overlappingMeeting) {
            return {
                success: false,
                message: "Nie udało się edytować spotkania",
                fieldErrors: { date: "W tym dniu masz już inne spotkanie" }
            };
        }
  
        const activeMembers = await GetMembersByCircleIdAndStatus({
            circleId: meeting.circleId,
            status: MembershipStatus.Active
        });
  
        const updatedMeeting = await prisma.$transaction(async (tx) => {
            if (data.TimeRangeSchema.startTime > new Date()) {
                // 1️⃣ Upsert aktywnych członków
                await tx.participation.createMany({
                    data: activeMembers.map((member) => ({
                        meetingId: meeting.id,
                        membershipId: member.id,
                    })),
                    skipDuplicates: true
                })
            }

            // 2️⃣ Aktualizacja spotkania i pobranie uczestników
            const updated = await tx.meeting.update({
                where: { id: data.meetingId },
                data: {
                    startTime: data.TimeRangeSchema.startTime,
                    endTime: data.TimeRangeSchema.endTime,
                },
                select: {
                    startTime: true,
                    endTime: true,
                    circle: { select: { 
                        name: true,
                        street: true,
                        price: true,
                        currency: true,
                        city: {
                            select: {
                                name: true,
                            }
                        }
                    }},
                    moderator: { select: { 
                        name: true, 
                        image: true, 
                        title: true 
                    }},
                    participants: { select: {
                        id: true,
                        status: true,
                        membership: { select: {
                            id: true,
                            user: { select: {
                                name: true,
                                email: true,
                            }}
                        }},
                    }}
                }
            });
            return updated
        })

        // 4️⃣ Wysyłka maili poza transakcją
        if (updatedMeeting.startTime > new Date()) {
            for (const participant of updatedMeeting.participants) {
                if (participant.status === ParticipationStatus.Active) {
                    try {
                        await sendEmail({
                            to: participant.membership.user.email,
                            subject: `Zmiana spotkania w kręgu ${updatedMeeting.circle.name}`,
                            react: MeetingUpdatedEmail({
                                participant: participant.membership.user,
                                oldMeeting: meeting,
                                newMeeting: updatedMeeting,
                                circle: updatedMeeting.circle,
                                city: updatedMeeting.circle.city ?? undefined,
                                timeZone: data.timeZone,
                                moderator: updatedMeeting.moderator
                            })
                        });
                    } catch (error) {
                        console.error("Błąd wysyłki maila:", error);
                    }
                }
            }
        }

        return { success: true, message: "Pomyślnie zmieniono dane spotkania" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Błąd połączenia z bazą danych" };
    }
}
  
export const GetMeeting = async (id: string) => {
    return await prisma.meeting.findUnique({
        where: { id },
        select: {
            id: true,
            circleId: true,
            status: true,
            moderatorId: true,
            startTime: true,
            endTime: true,
        }
    })
}

export const CompleteMeeting = async (data: z.infer<typeof CompleteMeetingSchema>) => {
    try {
        const auth = await ServerAuth()

        const meeting = await GetMeeting(data.meetingId);
        if (!meeting) return {
            success: false,
            message: "Dane spotkanie nie istnieje"
        }

        if (meeting.status !== MeetingStatus.Scheduled) return {
            success: false,
            message: "Nie możesz zakończyć tego spotkania"
        }

        if (!auth.roles.includes(Role.Admin) && (auth.id !== meeting.moderatorId || !auth.roles.includes(Role.Moderator))) return {
            success: false,
            message: "Brak uprawnień do edycji spotkania"
        }

        await prisma.meeting.update({
            where: { id: meeting.id },
            data: { status: MeetingStatus.Completed }
        })

        return {
            success: true,
            message: "Pomyślnie zakończono spotkanie"
        }
    } catch (error) {
        console.error(error)
        return { success: false, message: "Błąd połączenia z bazą danych" };
    }
}

export const GetModeratorMeetings = async (moderatorID: string, status?: MeetingStatus, year?: number) => {
    return await prisma.meeting.findMany({
        where: {
            moderatorId: moderatorID,
            status: status,
            ...(year
                ? {
                    startTime: {
                        gte: new Date(year, 0, 1),       // 1 stycznia o 00:00
                        lt: new Date(year + 1, 0, 1),    // 1 stycznia następnego roku
                    },
                } : {}),
        },
        orderBy: { startTime: "desc" },
        select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            circle: {
                select: {
                    id: true,
                    name: true,
                    city: {
                        select: {
                            region: {
                                select: {
                                    country: {
                                        select: {
                                            timeZone: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}

export const GetModeratorMeetingsDates = async (moderatorID: string) => {
    const meetings = await prisma.meeting.findMany({
        where: { moderatorId: moderatorID },
        select: { startTime: true },
        orderBy: { startTime: "asc" }
    })

    return meetings.map(m => m.startTime)
}


export const CheckOverlapingMeeting = async(moderatorID: string, start: Date, end: Date, meetingID?: string) => {
    const overlappingMeeting = await prisma.meeting.findFirst({
        where: {
            moderatorId: moderatorID,
            id: meetingID ? { not: meetingID } : undefined,
            AND: [
                { startTime: { lt: end }},
                { endTime: { gt: start }}
            ]
        }
    })

    return !!overlappingMeeting
}

export const GetModeratorMeetingsYears = async(moderatorID: string) => {
    const years = await prisma.meeting.groupBy({ by: ["startTime"] })
    const uniqueYears = Array.from(new Set(years.map(y => y.startTime.getFullYear()))).sort((a, b) => b - a)
    return uniqueYears
}

export const GetFutureMeetingsByCricleId = async(circleId: string, fromDate?: Date) => {
    return await prisma.meeting.findMany({
        where: {
            circleId: circleId, 
            endTime: { gte: fromDate ?? new Date() }
        },
        select: {
            id: true,
            startTime: true,
            endTime: true,
        }
    })
}