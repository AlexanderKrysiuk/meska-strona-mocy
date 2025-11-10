"use client"

import { GetModeratorCircles } from "@/actions/circle";
import Loader from "@/components/loader";
import CreateCircleModal from "@/components/moderator/circles/create-circle-modal";
import EditCircleForm from "@/components/moderator/circles/edit-circle-form";
import { clientAuth } from "@/hooks/auth";
import { ModeratorQueries } from "@/utils/query";
import { Divider, Select, SelectItem } from "@heroui/react";
import { Circle } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const CircleSettingsPage = () => {
    const [selectedCircle, setSelectedCircle] = useState<Circle | undefined>()
    
    const moderator = clientAuth()
    
    const { data: circles, isLoading } = useQuery({
        queryKey: [ModeratorQueries.Circles, moderator?.id],
        queryFn: () => GetModeratorCircles(moderator!.id),
        enabled: !!moderator
    })

    if (isLoading) return <Loader/>

    return <main className="p-4 space-y-4">
        <div className="flex space-x-4 items-center">
            <Select
                label="Krąg"
                items={circles}
                placeholder="Wybierz krąg"
                variant="bordered"
                onSelectionChange={(keys) => {
                    const id = Array.from(keys)[0];
                    const circle = circles?.find(c => c.id === id)
                    setSelectedCircle(circle)
                }}
                isDisabled={!circles}
                hideEmptyContent
            >
                {(circle) => <SelectItem key={circle.id}>{circle.name}</SelectItem>}
            </Select>
            <CreateCircleModal/>
        </div>
        <Divider/>
        <EditCircleForm
            circle={selectedCircle}
        />
       
    </main>;
}
 
export default CircleSettingsPage;