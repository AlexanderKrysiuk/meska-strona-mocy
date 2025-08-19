//export { auth as middleware } from "@/auth"

import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { Role } from "@prisma/client";
import { PermissionGate } from "./utils/gate";

export async function middleware(req: NextRequest) {
    const session = await auth()
    const path = req.nextUrl.pathname
    //console.log("SESSION", session)
    // Jeśli użytkownik jest zalogowany i próbuje wejść na stronę logowania
    if (session && path.includes("/auth/start")) return NextResponse.redirect(new URL("/", req.url))

    // ✅ Jeśli użytkownik jest Adminem, ma dostęp do wszystkiego
    if (PermissionGate(session?.user.roles, [Role.Admin])) return NextResponse.next();

    // // Sprawdzamy, czy użytkownik próbuje uzyskać dostęp do strony /moderator
    if (path.startsWith("/moderator") && !PermissionGate(session?.user.roles, [Role.Moderator])) return NextResponse.redirect(new URL("/auth/start", req.url)); 

    return NextResponse.next();
}