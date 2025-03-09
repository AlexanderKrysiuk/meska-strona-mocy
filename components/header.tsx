"use client"
import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { ThemeSwitcher } from "./theme-switcher";
import { useCurrentUser } from "@/hooks/user";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { ModeratorItems } from "./user-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "next-auth/react";

const Header = () => {
    const user = useCurrentUser()
    const pathname = usePathname()

    return ( 
        <Navbar
            isBlurred
            isBordered
        >
            <NavbarContent>
                <NavbarBrand>
                    <Link
                        href="/"
                        color="foreground"
                    >
                        Męska Strona Mocy
                    </Link>
                </NavbarBrand>
            </NavbarContent>
            <NavbarContent className="lg:hidden">

            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    <ThemeSwitcher/>
                </NavbarItem>
                <NavbarItem className="hidden lg:block">
                    {user ? 
                        <Dropdown
                            placement="bottom-end"
                            radius="none"
                        >
                            <DropdownTrigger>
                                <Avatar
                                    showFallback
                                    src={user.image!}
                                    className="cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-300"
                                />
                            </DropdownTrigger>
                            <DropdownMenu>
                                {user.role === Role.Moderator || user.role === Role.Admin ? (
                                    <DropdownSection
                                        title="Moderator"
                                        showDivider
                                        items={ModeratorItems}
                                    >
                                        {(item)=>(
                                            <DropdownItem
                                                key={item.title}
                                                href={item.href}
                                                title={item.title}
                                                variant="light"
                                                color="primary"
                                                startContent={item.icon}
                                                className={`${pathname.startsWith(item.href) && "text-primary"}`}
                                            />
                                        )}
                                    </DropdownSection>
                                ) : null}
                                <DropdownItem
                                    key="Logout"
                                    color="danger"
                                    variant="light"
                                    startContent={<FontAwesomeIcon icon={faArrowRightFromBracket}/>}
                                    onPress={()=>{signOut()}}
                                    className="rounded-none"
                                >
                                    Wyloguj
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        : 
                        <Button
                            as={Link}
                            href="/auth/start"
                            size="sm"
                            variant="bordered"
                        >
                            Start
                        </Button>
                    } 
                </NavbarItem>
            </NavbarContent>
        </Navbar>
     );
}
 
export default Header;