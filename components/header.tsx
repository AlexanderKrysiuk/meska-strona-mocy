import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
import {Link} from "@heroui/link";

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