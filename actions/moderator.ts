"use server"

import { SendMemberToVacationSchema } from "@/schema/moderator"
import { z } from "zod"
import { CheckLoginReturnUser } from "./auth"
import { MeetingParticipantStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { GetMeetingParticipationByID, GetMeetingParticipationWithMeetingAndUserByID } from "./meeting-participants"
import { resend } from "@/lib/resend"
//import { SendMemberToVacationEmail } from "@/components/emails/send-member-to-vacation-email"

export const SendMemberToVacation = async (data: z.infer<typeof SendMemberToVacationSchema>) => {
    const user = await CheckLoginReturnUser()
    if (!user) return {success: false, message: "Musisz być zalogowany"}
    
    const participation = await GetMeetingParticipationByID(data.participationID)
    if (!participation) return {success: false, message: "Nie znaleziono informacji o "}

    // const moderator = await CheckLoginReturnUser()
    // if (!moderator) throw new Error ("Musisz być zalogowanym by wykonać tę operację")
    
    // const participation = await GetMeetingParticipationWithMeetingAndUserByID(data.participationID)
    // if (!participation) throw new Error ("Użytkownik nie jest zapisany na spotkanie")
    // if (!moderator.roles.includes(Role.Moderator) && moderator.id !== participation.meeting.moderatorId) throw new Error ("Brak uprawień do wykonania akcji!")
    // if (participation.status === MeetingParticipantStatus.Vacation) throw new Error ("Kręgowiec już jest na urlopie!")

    // try {
    //     await prisma.circleMeetingParticipant.update({
    //         where: {id: participation.id},
    //         data: {
    //             status: MeetingParticipantStatus.Vacation,
    //             amountPaid: 0,
    //             user: {
    //                 update: {
    //                     vacationDays:{ decrement: 1 },
    //                     balance: participation.amountPaid > 0 
    //                         ? { increment: participation.amountPaid }
    //                         : undefined
    //                 }
    //             }
    //         }
    //     })
    // } catch (error) {
    //     console.error(error)
    //     throw new Error("Nie udało się wysłać użytkownika na urlop. Spróbuj ponownie."); // czytelny komunikat dla użytkownika
    // }

    // try {
    //     await resend.emails.send({
    //         from: "Męska Strona Mocy <info@meska-strona-mocy.pl>",
    //         to: participation.user.email,
    //         subject: "Przyznano urlop",
    //         react: SendMemberToVacationEmail({
    //             startTime: participation.meeting.startTime,
    //             endTime: participation.meeting.endTime,
    //             cityId: participation.meeting.cityId,
    //             circleName: participation.meeting.circle.name,
    //             memberName: participation.user.name,
    //             authorName: moderator.name,
    //             authorAvatar: moderator.image,
    //             authorTitle: moderator.title,
    //             amountRefunded: participation.amountPaid
    //         })

    //     })
    // } catch (error) {
    //     console.error(error)
    // }
}
