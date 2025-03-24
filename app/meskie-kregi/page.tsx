import { prisma } from "@/lib/prisma";
import MensCircleWrapper from "./wrapper";

const MensCirclePage = async () => {
    const meetings = await prisma.groupMeeting.findMany({
        where: {
            startTime: {
                gte: new Date()
            }
        },
        orderBy: {
            startTime: "asc"
        },
        distinct: ['groupId'],
        include: {
            group: {
                include: {
                    _count: {
                        select: {
                            members: true
                        }
                    },
                    moderator: {
                        select: {
                            name: true,
                            image: true
                        }
                    }
                    
                }
            }
        }
    })
    
    
    return <MensCircleWrapper meetings={meetings}/>
}
 
export default MensCirclePage;