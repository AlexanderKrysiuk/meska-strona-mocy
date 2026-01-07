//components/header/header.tsx
"use client"

import Link from "next/link";
import { ModeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
    const [open, setOpen] = useState(false)

    return <main>
        <header className="sticky z-50 inset-0 flex items-center justify-between lg:px-[20vw] p-4 border-b">
            <div>
               <Link
                    href="/"
                    className="text-xl"
                >
                    Męska Strona Mocy
                </Link>
            </div>
            <div className="flex items-center space-x-1">
                <ModeToggle/>
                <Button
                    variant="outline"
                    className="hidden lg:block"
                >
                    Start
                </Button>
                <Button
                    size="icon-lg"
                    variant="ghost"
                    onClick={() => setOpen(!open)}
                    className="lg:hidden rounded-full"
                >
                    <Menu className={`transition-all duration-300 ease-in-out absolute ${open ? "opacity-0 scale-75 rotate-45" : "opacity-100 scale-100 rotate-0"}`}/>
                    <X className={`transition-all duration-300 ease-in-out absolute ${open ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-45"}`}/>
                </Button>
            </div>
        </header>
        <div className={`fixed z-40 lg:hidden h-full w-full bg-background/60 backdrop-blur-sm p-4 transition-all duration-300 ease-out ${open ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none overflow-hidden"}`}>
            Jakiś kontentąć
        </div>
    </main>

}
 
export default Header;