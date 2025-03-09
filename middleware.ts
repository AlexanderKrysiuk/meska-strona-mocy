//export { auth as middleware } from "@/auth"

import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { Role } from "@prisma/client";

export async function middleware(req: NextRequest) {
    const session = await auth()
    const path = req.nextUrl.pathname
    // Jeśli użytkownik jest zalogowany i próbuje wejść na stronę logowania
    if (session && path.includes("/auth/start")) {
        // Przekierowanie na stronę główną lub inną
        return NextResponse.redirect(new URL("/", req.url))
    }

    // ✅ Jeśli użytkownik jest Adminem, ma dostęp do wszystkiego
    if (session?.user.role === Role.Admin) {
        return NextResponse.next();
    }

    // Sprawdzamy, czy użytkownik próbuje uzyskać dostęp do strony /moderator
    if (path.startsWith("/moderator")) {
        // Sprawdzamy, czy użytkownik jest zalogowany i ma odpowiednią rolę
        if (session && session.user.role !== Role.Moderator) {
            // Przekierowanie na stronę logowania
            return NextResponse.redirect(new URL("/auth/start", req.url)); 
        }
    }
    return NextResponse.next();
}