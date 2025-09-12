"use client"
import { Avatar, Button, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/react";
import { ThemeSwitcher } from "./theme-switcher";
import { clientAuth } from "@/hooks/auth";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { AllItems, ModeratorItems, userItems } from "./user-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faArrowRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { signOut } from "next-auth/react";
import { PermissionGate } from "@/utils/gate";
import { useQuery } from "@tanstack/react-query";
import { UserQueries } from "@/utils/query";
import { QueryGetUserByID } from "@/actions/user";

const Header = () => {
    const auth = clientAuth()
    const pathname = usePathname()

    const { data: user } = useQuery({
        queryKey: [UserQueries.User, auth?.id],
        queryFn: () => QueryGetUserByID(auth!.id),
        enabled: !!auth?.id
    })

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
            <NavbarContent className="hidden lg:flex items-center">
                {AllItems.map((item)=>(
                <NavbarItem 
                    isActive={pathname.startsWith(item.href)}
                    key={item.title}
                >
                        <Link
                            color={pathname.startsWith(item.href) ? "primary" : "foreground"}
                            href={item.href}
                        >
                            {item.title}
                        </Link>
                </NavbarItem>
                ))}
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    <ThemeSwitcher/>
                </NavbarItem>
                <NavbarItem className="hidden lg:block">
                    {auth ? 
                        <Dropdown
                            placement="bottom-end"
                            radius="none"
                        >
                            <DropdownTrigger>
                                <Avatar
                                    showFallback
                                    src={user?.image || undefined}
                                    className="cursor-pointer hover:ring-2 hover:ring-primary transition-all duration-400"
                                />
                            </DropdownTrigger>
                            <DropdownMenu>
                                {auth && <DropdownSection
                                    title={"Użytkownik"}
                                    showDivider
                                    items={userItems}
                                >
                                    {(item) => <DropdownItem
                                        key={item.title}
                                        href={item.href}
                                        title={item.title}
                                        variant="light"
                                        color="primary"
                                        startContent={item.icon}
                                        className={`${pathname.startsWith(item.href) && "text-primary"}`}
                                    />}
                                </DropdownSection>}
                                {PermissionGate(auth?.roles, [Role.Moderator, Role.Admin]) ? (
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
                <NavbarMenuToggle className="lg:hidden"/>
            </NavbarContent>
            <NavbarMenu>
                {auth && (
                    <NavbarMenuItem>
                        <div className="flex justify-between items-center mb-1">
                            Witaj {user?.name}
                            <Avatar
                                size="sm"
                                showFallback
                                src={user?.image || undefined}
                            />
                        </div>
                        <Divider/>
                    </NavbarMenuItem>
                )}
                {auth && <div>
                    <span className="text-sm text-foreground-500">
                        Użytkownik    
                    </span>
                    <div className="space-y-4">
                        {userItems.map((item)=><NavbarMenuItem
                            key={item.title}
                        >
                            <Link
                                href={item.href}
                                color={pathname.startsWith(item.href) ? "primary" : "foreground"}
                                className="flex gap-2 hover:primary transition-colors duration-400"
                            >
                                {item.icon} {item.title}
                            </Link>
                        </NavbarMenuItem>)}
                    </div>
                </div>}
                {PermissionGate(auth?.roles, [Role.Moderator, Role.Admin]) && (
                    <div>
                        <span className="text-sm text-foreground-500">
                            Moderator
                        </span>
                        <div className="space-y-4">
                            {ModeratorItems.map((item)=>(
                                <NavbarMenuItem
                                    key={item.title}
                                >
                                    <Link
                                        href={item.href}
                                        color={pathname.startsWith(item.href) ? "primary" : "foreground"}
                                        className="flex gap-2 hover:primary transition-colors duration-400"
                                    >
                                        {item.icon} {item.title}
                                    </Link>
                                </NavbarMenuItem>
                            ))}
                        </div>
                        <Divider/>
                    </div>
                )}
                {AllItems.map((item)=>(
                    <NavbarMenuItem
                        isActive={pathname.startsWith(item.href)}
                        key={item.title}
                    >
                        <Link
                            color={pathname.startsWith(item.href) ? "primary" : "foreground"}
                            href={item.href}
                        >
                            {item.title}
                        </Link>
                    </NavbarMenuItem>
                ))}
                <NavbarMenuItem>
                    {auth ? 
                        <Link
                            onPress={()=>{signOut()}}
                            color="danger"
                            className="cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2"/> Wyloguj
                        </Link>
                        :
                        <Link
                            href="/auth/start"
                        >
                            <FontAwesomeIcon icon={faArrowRightToBracket} className="mr-2"/> Start
                        </Link>
                    }
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
     );
}
 
export default Header;