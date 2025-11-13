"use client"

import { Spinner } from "@heroui/react";

const Loader = () => {
    return <main className="flex flex-grow items-center justify-center">
        <Spinner label="Ładowanie..."/>
    </main>;
}
 
export default Loader;