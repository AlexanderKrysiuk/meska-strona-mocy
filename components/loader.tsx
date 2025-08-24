"use client"

import { Spinner } from "@heroui/react";

const Loader = () => {
    return <main className="w-full h-full">
        <Spinner label="Ładowanie..." className="w-full h-full justify-center items-center"/>
    </main>;
}
 
export default Loader;