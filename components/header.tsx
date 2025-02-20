"use client"
import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { ThemeSwitcher } from "./theme-switcher";

const Header = () => {
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
            <NavbarContent justify="end">
                <NavbarItem>
                    <ThemeSwitcher/>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
     );
}
 
export default Header;