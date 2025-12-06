"use client"

import CreateCircleModal from "@/components/moderator/circles/create-circle-modal";
//import EditCircleForm from "@/components/moderator/circles/edit-circle-form";
import { Divider } from "@heroui/react";

const CircleSettingsPage = () => {
    return <main className="p-4 space-y-4">
        <CreateCircleModal/>
        <Divider/>
        {/* {ianaTimeZones.map((timezone) => (
            <div>

            {formatTimeZone(timezone.name)}
            </div>
        ))} */}
        {/* <EditCircleForm/> */}
    </main>;
}
 
export default CircleSettingsPage;