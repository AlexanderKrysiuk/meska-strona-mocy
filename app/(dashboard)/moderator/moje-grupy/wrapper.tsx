"use client"

import CreateGroupModal from "@/components/moderator/create-group-modal";
import { Card, CardBody, CardHeader, Divider, Link } from "@heroui/react";
import { Group } from "@prisma/client";

const MyGroupsWrapper = ({
    groups
} : {
    groups: Group[]
}) => {
    return ( 
        <main className="p-4 space-y-4">
            <div className="flex space-x-4">
                <CreateGroupModal/>
            </div>
            <div>
                Kręgi
                <Divider/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {groups.map((group) => (
                    <Card 
                        key={group.id}
                        isHoverable
                        isPressable
                        as={Link}
                        href={`moje-grupy/${group.id}`}
                    >
                        <CardHeader>
                            {group.name}    
                        </CardHeader>
                        <CardBody>
                        <p className="text-sm text-gray-600">
                            Max: {group.maxMembers} członków <br/>
                            Unikalny odnośnik: {group.slug}
                        </p>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </main>
    );
}
 
export default MyGroupsWrapper;