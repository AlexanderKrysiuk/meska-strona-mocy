"use client"
import { Link } from "@heroui/react";

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white pt-4 mt-auto pb-16 lg:pb-4">
            <div className="max-w-screen-xl mx-auto text-center">
                <p>© 2025 Męska Strona Mocy. Wszystkie prawa zastrzeżone.</p>
                <Link href="/polityka-prywatnosci" className="text-white">
                    Polityka Prywatności
                </Link>
            </div>
        </footer>    
    );
}
 
export default Footer;