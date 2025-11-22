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
import type {Selection} from "@heroui/react";


const CircleSettingsPage = () => {


    return <main className="p-4 space-y-4">
        <CreateCircleModal/>
        <Divider/>
        <EditCircleForm/>
    </main>;
}
 
export default CircleSettingsPage;