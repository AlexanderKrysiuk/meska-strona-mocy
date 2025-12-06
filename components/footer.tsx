"use client"
import { Link } from "@heroui/react";

const Footer = () => {
    return (
        <footer className="bg-gray-800 pt-4 mt-auto pb-16 lg:pb-4 px-4">
            <div className="max-w-screen-xl mx-auto text-center text-white">
                <div>© 2025 Męska Strona Mocy. Wszystkie prawa zastrzeżone. {" "}
                    <Link href="/regulaminy" className="text-white inline">
                        Regulaminy
                    </Link>
                </div>
            </div>
        </footer>    
    );
}
 
export default Footer;