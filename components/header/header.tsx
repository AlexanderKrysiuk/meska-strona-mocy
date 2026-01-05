"use client"

import Link from "next/link";
import { ModeToggle } from "../theme-toggle";

const Header = () => {
    return <header className="sticky top-0 flex justify-between lg:px-[20vw] p-4 border-b">
        <div>
            <Link
                href="/"
                className="text-xl"
            >
                Męska Strona Mocy
            </Link>
        </div>
            <ModeToggle/>
    </header>;
}
 
export default Header;