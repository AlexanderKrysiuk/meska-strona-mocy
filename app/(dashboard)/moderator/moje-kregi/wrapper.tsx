"use client"

import CreatecircleModal from "@/components/moderator/create-circle-modal";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Circle } from "@prisma/client";

const MycirclesWrapper = ({
    circles
} : {
    circles: Circle[]
}) => {
    return ( 
        <main className="p-4 space-y-4">
            <div className="flex space-x-4">
                <CreatecircleModal/>
            </div>
            <div>
                Kręgi
                <Divider/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {circles.map((circle) => (
                    <Card
                        key={circle.id}
                    >
                        <CardHeader>
                            {circle.name}    
                        </CardHeader>
                        <CardBody>
                        <p className="text-sm text-gray-600">
                            Max: {circle.maxMembers} członków <br/>
                            Unikalny odnośnik: {circle.slug}
                        </p>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </main>
    );
}
 
export default MycirclesWrapper;