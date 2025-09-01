"use server"

import { CompleteMeetingSchema, CreateMeetingSchema, EditMeetingSchema } from "@/schema/meeting"
import { date, z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { CircleMeeting, CircleMeetingStatus, CircleMembershipStatus, MeetingParticipantStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { GetCircleById } from "./circle"
import { PermissionGate } from "@/utils/gate"
import { GetActiveCircleMembersByCircleID } from "./circle-membership"
import { resend, sendEmail } from "@/lib/resend"
import { MeetingInvite } from "@/components/emails/Meeting-Invite"
import MeetingUpdatedEmail from "@/components/emails/Meeting-update"
import { setTimeout } from "timers"
import { FormError } from "@/utils/errors"

export const CreateMeeting = async (data: z.infer<ReturnType<typeof CreateMeetingSchema>>) => {    
    const user = await CheckLoginReturnUser()
    if (!user) return { success: false, message: "Musisz być zalogowanym by utworzyć spotkanie" }
  
    
    const circle = await GetCircleById(data.circleId)
    if (!circle) return { success: false, message: "Dana grupa nie istnieje" }
    
    if (!user.roles.includes(Role.Admin) && (user.id !== circle.moderatorId || !user.roles.includes(Role.Moderator))) return { success: false, message: "Brak uprawnień do dodania spotkania" }

    const activeMembers = (await GetActiveCircleMembersByCircleID(circle.id)) || []
  
    let overlappingMeeting: CircleMeeting | null
    try {
         // Sprawdzenie nakładających się spotkań
        overlappingMeeting = await prisma.circleMeeting.findFirst({
            where: {
                moderatorId: user.id,
                AND: [
                    { startTime: { lt: data.TimeRangeSchema.endTime } },
                    { endTime: { gt: data.TimeRangeSchema.startTime } },
                ],
            },
        })
    } catch (error) {
        console.error(error);
        return { success: false, message: "Błąd sprawdzania konfliktu spotkań" };
    }

    if (overlappingMeeting) {
        return {
          success: false,
          message: "Nie udało się edytować spotkania",
          fieldErrors: { date: "W tym dniu masz już inne spotkanie" }
        }
    }

    try {
        const existingMeetings = await prisma.circleMeeting.count({ where: { circleId: data.circleId } })
  
        // Przygotowanie uczestników
        const participantData =
            activeMembers.length > 0
            ? activeMembers.filter(m => m.user).map(m => ({
                user: { connect: { id: m.user.id } },
                status: MeetingParticipantStatus.Pending,
            }))
            : undefined
  
        // Tworzenie spotkania z uczestnikami
        const meeting = await prisma.circleMeeting.create({
            data: {
                status: CircleMeetingStatus.Scheduled,
                startTime: data.TimeRangeSchema.startTime,
                endTime: data.TimeRangeSchema.endTime,
                street: data.street,
                cityId: data.cityId,
                price: data.price,
                circleId: data.circleId,
                moderatorId: user.id,
                number: existingMeetings + 1,
                ...(participantData && { participants: { create: participantData } }),
            },
            include: {
                participants: { include: { user: true } },
                circle: true,
                moderator: true,
                city: { include: { region: { include: { country:true }}}}
            },
        })
  
        // Wysyłka maili w osobnym try/catch
        for (const participant of meeting.participants) {
            try {
                await sendEmail({
                    to: participant.user.email,
                    subject: `Nowe spotkanie ${meeting.circle.name}`,
                    react: MeetingInvite({
                        userName: participant.user.name,
                        circleName: meeting.circle.name,
                        startTime: meeting.startTime,
                        endTime: meeting.endTime,
                        street: meeting.street,
                        city: meeting.city.name,
                        timeZone: meeting.city.region.country.timeZone,
                        price: meeting.price,
                        moderatorName: meeting.moderator?.name,
                        moderatorAvatarUrl: meeting.moderator?.image,
                    }),
                });
            } catch (error) {
                console.error(error);
            }
        }
          
        return { message: "Spotkanie utworzone pomyślnie" };
    } catch (error) {
        console.error(error)
        return { success: false, message: "Błąd połączenia z bazą danych" }
    }
}
  
async function RefreshMeetingsNumbering (circleId: string) {
    const meetings = await prisma.circleMeeting.findMany({
        where: {circleId: circleId},
        orderBy: {startTime: "asc"}
    })

    for (let i = 0; i < meetings.length ; i++) {
        await prisma.circleMeeting.update({
            where: {id: meetings[i].id },
            data: { number: i+1 }
        })
    }
    return meetings.length
}

export const EditMeeting = async (data: z.infer<ReturnType<typeof EditMeetingSchema>>) => {
    const user = await CheckLoginReturnUser()
  
    if (!user) 
      return { success: false, message: "Musisz być zalogowanym by edytować spotkanie" }
  
    const meeting = await GetMeetingById(data.meetingId)
    if (!meeting) 
      return { success: false, message: "Dane spotkanie nie istnieje" }
  
    if (!(user.roles.includes(Role.Admin) || (user.roles.includes(Role.Moderator) && user.id === meeting.moderatorId))) {
      return { success: false, message: "Brak uprawnień do edycji spotkania" }
    }
  
    // Sprawdzanie konfliktu spotkań
    let overlappingMeeting: CircleMeeting | null
    try {
        overlappingMeeting = await prisma.circleMeeting.findFirst({
            where: {
                moderatorId: user.id,
                id: { not: data.meetingId }, // <-- wykluczamy edytowane spotkanie
                AND: [
                    { startTime: { lt: data.TimeRangeSchema.endTime } },
                    { endTime: { gt: data.TimeRangeSchema.startTime } }
                ]
            }
        });
    } catch (error) {
        console.error(error);
        return { success: false, message: "Błąd sprawdzania konfliktu spotkań" };
    }
  
    if (overlappingMeeting) {
      return {
        success: false,
        message: "Nie udało się edytować spotkania",
        fieldErrors: { date: "W tym dniu masz już inne spotkanie" }
      }
    }
  
    try {
      const updatedMeeting = await prisma.circleMeeting.update({
        where: { id: data.meetingId },
        data: {
          startTime: data.TimeRangeSchema.startTime,
          endTime: data.TimeRangeSchema.endTime,
          price: data.price,
          street: data.street,
          cityId: data.cityId
        },
        include: { 
          participants: { include: { user: true } },
          city: { include: { region: { include: { country:true }}}}
        }
      })
  
      await sortMeetings(meeting.circleId)
  
      // wysyłka maili do uczestników jeśli spotkanie w przyszłości
      if (updatedMeeting.startTime > new Date()) {
        for (const participant of updatedMeeting.participants) {
          try {
            await sendEmail({
              to: participant.user.email,
              subject: `Zmiana spotkania w kręgu ${meeting.circle.name}`,
              react: MeetingUpdatedEmail({
                userName: participant.user.name,
                circleName: meeting.circle.name,
                oldMeeting: {
                  startTime: meeting.startTime,
                  endTime: meeting.endTime,
                  street: meeting.street,
                  city: meeting.city.name,
                  price: meeting.price,
                  timeZone: meeting.city.region.country.timeZone
                },
                newMeeting: {
                  startTime: updatedMeeting.startTime,
                  endTime: updatedMeeting.endTime,
                  street: updatedMeeting.street,
                  city: updatedMeeting.city.name,
                  price: updatedMeeting.price,
                  timeZone: updatedMeeting.city.region.country.timeZone
                },
                moderatorName: user.name
              })
            })
          } catch (error) {
            console.error(error)
          }
        }
      }
  
      return { success: true, message: "Pomyślnie zmieniono dane spotkania" }
    } catch(error) {
      console.error(error)
      return { success: false, message: "Błąd połączenia z bazą danych" }
    }
  }
  

// export const RegisterToMeeting = async (data: z.infer<typeof RegisterToMeetingSchema>) => {
//     let circle

//     try {
//         circle = await prisma.circle.findUnique({
//             where: {
//                 id: data.circleId
//             },
//             include: {
//                 _count: {
//                     select: {
//                         members: true
//                     }
//                 }
//             }
//         })
//     } catch (error) {
//         throw new Error("Błąd połączenia z bazą danych.");
//     }

//     if (!circle) throw new Error("Nie znaleziono grupy.")    
//     if (circle._count.members >= circle.maxMembers) throw new Error("Brak wolnych miejsc w tej grupie.");
    
//     let user

//     try {
//         user = await prisma.user.findUnique({
//             where: { email: data.email}
//         })
//     } catch (error) {
//         throw new Error("Błąd połączenia z bazą danych.");
//     }

//     if (!user) {
//         try {
//             user = await prisma.user.create({ data })
//         } catch (error) {
//             throw new Error("Rejestracja nie powiodła się. Spróbuj ponownie.")
//         }

//         try {
//             const verificationToken = await GenerateVerificationToken(data.email)
//             await sendVerificationEmail(verificationToken)
//         } catch (error) {
//             throw new Error("Nie udało się wysłać e-maila weryfikacyjnego.")
//         }
//     }


// }

export const GetMeetingById = async (id: string) => {
    try {
        return await prisma.circleMeeting.findUnique({
            where: { id },
            include: { 
                city: { include: { region: { include: { country: true }}}},
                circle: true
            }
        })
    } catch (error) {
        return null
    }
}

export const sortMeetings = async (circleId: string) => {
    const meetings = await prisma.circleMeeting.findMany({
        where: {circleId: circleId},
        orderBy: { startTime: "asc"}
    })

    for (let i = 0; i < meetings.length; i++) {
        const meeting = meetings[i];
        await prisma.circleMeeting.update({
          where: { id: meeting.id },
          data: { number: i + 1 } // najstarszy = 1
        });
      }
}

export const CompleteMeeting = async (data: z.infer<typeof CompleteMeetingSchema>) => {
    const user = await CheckLoginReturnUser()

    if (!user) return {
        success: false,
        message: "Musisz być zalogowanym by zatwierdzić spotkanie"
    }

    if (!PermissionGate(user.roles, [Role.Moderator])) return {
        success: false,
        message: "Brak uprawnień do zatwierdzenia spotkania"
    }

    const meeting = await GetMeetingById(data.meetingId)

    if (!meeting) return {
        success: false,
        message: "Dana spotkanie nie istnieje"
    }

    if (PermissionGate(user.roles, [Role.Moderator]) && user.id !== meeting.moderatorId) return {
        success: false,
        message: "Brak uprawień do zatwierdzenia spotkania"
    }

    try {
        await prisma.circleMeeting.update({
            where: { id: data.meetingId },
            data: { status: CircleMeetingStatus.Completed }
        })
    } catch {
        return {
            success: false,
            message: "Błąd połączenia z bazą danych"
        }
    }

    return {
        success: true,
        message: "Pomyślnie zatwierdzono spotkanie"
    }
}

export const GetCircleFutureMeetingsByCircleID = async (ID:string) => {
    try {
        return await prisma.circleMeeting.findMany({
            where: { 
                circleId:ID,
                startTime: { gte: new Date() }
            },
            include: { city: { include: { region: { include: { country: true }}}} },
            orderBy: { startTime: "asc" }
        })
    } catch(error) {
        console.error(error)
        return null
    }
}

export const GetScheduledMeetingsByModeratorID = async (moderatorID: string) => {
    try {
        return await prisma.circleMeeting.findMany({
            where: {
                moderatorId: moderatorID,
                status: CircleMeetingStatus.Scheduled,
            },
            orderBy: { startTime: "asc" }
        })
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych")
    }
}

export const GetModeratorMeetingsByModeratorID = async (moderatorID: string, status?: CircleMeetingStatus) => {
    try {
        return await prisma.circleMeeting.findMany({
            where: {
                moderatorId: moderatorID,
                status: status
            },
            orderBy: { startTime: "asc" },
            include: { 
                city : { include: { region: {include: {country:true}}}},
                circle:true
            }
        })
    } catch (error) {
        console.error(error)
        throw new Error("Błąd połączenia z bazą danych")
    }
}

export const FindModeratorOverlappingMeeting = async(moderatorID:string, startTime:Date, endTime:Date) => {
    try {
        return await prisma.circleMeeting.findFirst({
            where: {
                moderatorId: moderatorID,
                AND: [
                    { startTime: { lt: endTime }},
                    { endTime: { gt: startTime }}
                ]
            }
        })
    } catch(error) {
        console.log(error)
        return null
    }
}