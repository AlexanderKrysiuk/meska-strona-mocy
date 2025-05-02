"use client"
import { Link } from "@heroui/react";

const Footer = () => {
    return (
        <footer className="bg-gray-800 pt-4 mt-auto pb-16 lg:pb-4 px-4">
            <div className="max-w-screen-xl mx-auto text-center">
                <p className="text-white">© 2025 Męska Strona Mocy. Wszystkie prawa zastrzeżone. {" "}
                    <Link href="/regulaminy" className="text-white inline">
                        Regulaminy
                    </Link>
                </p>
            </div>
        </footer>    
    );
}
 
export default Footer;