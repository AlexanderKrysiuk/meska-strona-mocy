// "use server"

// import { prisma } from "@/lib/prisma"
// import { redirect } from "next/navigation"
// import MeetingReservationWrapper from "./wrapper"

const MeetingReservationPage = async (
//     props: {
//         params: Promise<{
//             id: string
//         }>
//     }
) => {
//     const params = await props.params

//     const meeting = await prisma.groupMeeting.findUnique({
//         where: {id: params.id},
//         include: {
//             group: {
//                 select: {
//                     moderator: {
//                         select: {
//                             name: true,
//                             image: true
//                         }
//                     }
//                 }
//             }
//         }
//     })

//     if (!meeting) return redirect("/meskie-kregi")

//     return <MeetingReservationWrapper meeting={meeting}/>
}
export default MeetingReservationPage