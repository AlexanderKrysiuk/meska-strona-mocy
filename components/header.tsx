"use client"
import { Link, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";

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
        </Navbar>
     );
}
 
export default Header;