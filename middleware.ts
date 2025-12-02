import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Możesz tu dodać np. blokadę dla całego /api/trpc jeśli chcesz
  // ale logowanie i role sprawdzamy już na stronie
  return NextResponse.next();
}

// import { auth } from "./auth"

// export default auth((req) => {
//     return
// })

// //export { auth as middleware } from "@/auth"

// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "./auth";
// import { Role } from "@prisma/client";

// export async function middleware(req: NextRequest) {
//     const session = await auth()
//     const path = req.nextUrl.pathname
//     //console.log("SESSION", session)
//     // Jeśli użytkownik jest zalogowany i próbuje wejść na stronę logowania
//     if (path.startsWith("/konto") && !session) return NextResponse.redirect(new URL("/auth/start", req.url));
    
//     if (session && path.includes("/auth/start")) return NextResponse.redirect(new URL("/", req.url))

//     // ✅ Jeśli użytkownik jest Adminem, ma dostęp do wszystkiego
//     if (session?.user.roles.includes(Role.Admin)) return NextResponse.next();

//     // // Sprawdzamy, czy użytkownik próbuje uzyskać dostęp do strony /moderator
//     if (path.startsWith("/moderator") && !session?.user.roles.includes(Role.Moderator)) return NextResponse.redirect(new URL("/auth/start", req.url)); 

//     // ✅ Dostęp do stron płatności / partnerów tylko dla osób z jakąkolwiek rolą
//     if (path.startsWith("/partner")) {
//     if (!session?.user.roles || session.user.roles.length === 0) {
//       return NextResponse.redirect(new URL("/auth/start", req.url));
//     }
//   }

//     return NextResponse.next();
// }

export const config = {
    matcher: [
      // Skip Next.js internals and all static files, unless found in search params
      '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
      // Always run for API routes
      '/(api|trpc)(.*)',
    ],
  }