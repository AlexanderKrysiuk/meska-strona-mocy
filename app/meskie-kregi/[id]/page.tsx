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

//     const meeting = await prisma.circleMeeting.findUnique({
//         where: {id: params.id},
//         include: {
//             circle: {
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