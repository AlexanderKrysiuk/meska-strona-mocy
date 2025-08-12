// import { prisma } from "@/lib/prisma";
// import MensCircleWrapper from "./wrapper";
// import { CircleMembershipStatus } from "@prisma/client";

const MensCirclePage = async () => {
//     const meetings = await prisma.circleMeeting.findMany({
//         where: {
//             startTime: {
//                 gte: new Date(), // Spotkania, które odbędą się w przyszłości
//             },
//         },
//         distinct: ["circleId"],
//         include: {
//             circle: {
//                 select: {
//                     id: true,
//                     name: true,
//                     maxMembers: true,
//                     _count: {
//                         select: {
//                             members: {
//                                 where: {
//                                     status: {
//                                         in: [CircleMembershipStatus.Candidate, CircleMembershipStatus.Member]
//                                     }
//                                 } 
//                             }
//                         },
//                     },
//                     moderator: {
//                         select: {
//                             name: true,
//                             image: true,
//                         },
//                     },
//                 },
//             },
//         },
//     }).then(meetings => {
//         // Filtrujemy tylko spotkania, które mają wolne miejsca
//         return meetings.filter(meeting => meeting.circle._count.members < meeting.circle.maxMembers);
//     });
    
//     return <MensCircleWrapper meetings={meetings}/>
}
 
export default MensCirclePage;