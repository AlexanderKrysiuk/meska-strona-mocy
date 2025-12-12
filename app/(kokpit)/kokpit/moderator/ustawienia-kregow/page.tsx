"use client"

import CirclesTable from "@/components/moderator/circles/circles-table";
import CreateCircleModal from "@/components/moderator/circles/create-circle-modal";
//import EditCircleForm from "@/components/moderator/circles/edit-circle-form";
import { Divider } from "@heroui/react";

const CircleSettingsPage = () => {
    return <main>
        <div className="p-4">
            <CreateCircleModal/>
        </div>
        <Divider/>
        <div className="p-4">
            <CirclesTable/>
        </div>

        {/* {ianaTimeZones.map((timezone) => (
            <div>

            {formatTimeZone(timezone.name)}
            </div>
        ))} */}
        {/* <EditCircleForm/> */}
    </main>;
}
 
export default CircleSettingsPage;