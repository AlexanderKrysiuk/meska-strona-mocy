"use client"; // Kliencki komponent, bo używa useContext

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes"; // Przykładowy provider dla trybu ciemnego
import { ReactNode, useEffect, useState } from "react";

export default function RootWrapper({ 
    children
} : {
    children: ReactNode
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <>{children}</>; // Unikamy błędu hydracji, renderując dzieci dopiero po mountowaniu
    }

    return (
        <HeroUIProvider>
            <ThemeProvider 
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <ToastProvider
                    placement="top-center"
                />
            </ThemeProvider>
        </HeroUIProvider>
    );
}