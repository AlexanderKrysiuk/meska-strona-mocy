// import { prisma } from "@/lib/prisma";
// import MensCircleWrapper from "./wrapper";
// import { GroupMembershipStatus } from "@prisma/client";

const MensCirclePage = async () => {
//     const meetings = await prisma.groupMeeting.findMany({
//         where: {
//             startTime: {
//                 gte: new Date(), // Spotkania, które odbędą się w przyszłości
//             },
//         },
//         distinct: ["groupId"],
//         include: {
//             group: {
//                 select: {
//                     id: true,
//                     name: true,
//                     maxMembers: true,
//                     _count: {
//                         select: {
//                             members: {
//                                 where: {
//                                     status: {
//                                         in: [GroupMembershipStatus.Candidate, GroupMembershipStatus.Member]
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
//         return meetings.filter(meeting => meeting.group._count.members < meeting.group.maxMembers);
//     });
    
//     return <MensCircleWrapper meetings={meetings}/>
}
 
export default MensCirclePage;