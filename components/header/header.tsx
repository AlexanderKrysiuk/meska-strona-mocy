//components/header/header.tsx
"use client"

import Link from "next/link";
import { ModeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { useState } from "react";
import { LogIn, LogOut, Menu, Moon, User, X } from "lucide-react";
import { Separator } from "../ui/separator";
import { routes } from "@/lib/routes";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

const Header = () => {
    const [open, setOpen] = useState(false)
    const { data: session } = useSession()

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
                <div className="hidden lg:block">
                    {session?.user ?
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full cursor-pointer"
                                >
                                    <Avatar>
                                        <AvatarImage src={session.user.image ?? undefined} />
                                        <AvatarFallback className="bg-transparent">
                                            <User className="text-primary"/>
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <Link
                                            href={routes.signOutRedirect}
                                            className="flex text-red-600 hover:text-red-700"
                                            onClick={async () => await signOut()}
                                        >
                                            <LogOut className="mr-1"/> Wyloguj
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    :
                        <Button
                            variant="outline"
                        >
                            <Link href={routes.start}> Start </Link>
                        </Button>
                    }
                </div>
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
        <div className={`fixed z-40 lg:hidden h-full w-full bg-background/80 backdrop-blur-sm p-4  space-y-2 transition-all duration-300 ease-out ${open ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none overflow-hidden"}`}>
            {session?.user && <div className="space-y-2">
                <div className="flex justify-between items-center">
                    Witaj, {session.user.name}
                    <Avatar
                        size="lg"
                    >
                        <AvatarImage src={session.user.image ?? undefined} />
                        <AvatarFallback className="bg-transparent">
                            <User className="text-primary"/>
                        </AvatarFallback>
                    </Avatar>
                </div>
                <Separator/>
            </div>}
            
            {session?.user ?
                <Link
                    href={routes.signOutRedirect}
                    className="flex text-red-600 hover:text-red-700"
                    onClick={async () => {
                        await signOut()
                        setOpen(false)
                    }}
                >
                    <LogOut className="mr-1"/> Wyloguj
                </Link>
                :
                <Link
                    href={routes.start}
                    className="flex text-blue-600 hover:text-blue-700"
                    onClick={() => setOpen(false)}
                >
                    <LogIn className="mr-1"/> Start
                </Link>
            }
            {/* <Link
                href={ROUTES.login}
                className="flex text-blue-600 hover:text-blue-700"
                onClick={() => setOpen(false)}
            >
                <LogIn className="mr-1"/> Start
            </Link> */}
        </div>
    </main>

}
 
export default Header;