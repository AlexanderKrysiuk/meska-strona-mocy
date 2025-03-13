"use client"

import CreateGroupModal from "@/components/moderator/create-group-modal";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Group } from "@prisma/client";

const MyGroupsWrapper = ({
    groups
} : {
    groups: Group[]
}) => {
    return ( 
        <main className="p-4 space-y-4">
            <CreateGroupModal/>
            <div>
                Grupy
                <Divider/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {groups.map((group) => (
                    <Card 
                        key={group.id}
                        isHoverable
                        isPressable
                    >
                        <CardHeader>
                            {group.name}    
                        </CardHeader>
                        <CardBody>
                        <p className="text-sm text-gray-600">Max: {group.maxMembers} członków</p>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </main>
    );
}
 
export default MyGroupsWrapper;