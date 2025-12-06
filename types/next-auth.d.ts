// // // // types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: Role[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    roles: Role[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: Role[];
  }
}

// // types/next-auth.d.ts
// import { Role } from "@prisma/client";
// import { AdapterUser as DefaultAdapterUser } from "@auth/core/adapters";

// declare module "@auth/core/adapters" {
//   interface AdapterUser extends DefaultAdapterUser {
//     roles: Role[]; // teraz każdy AdapterUser ma roles
//   }
// }

// declare module "@auth/core" {
//   interface Session {
//     user: {
//       id: string;
//       roles: Role[];
//     };
//   }

//   interface User extends AdapterUser {} // User dziedziczy AdapterUser
// }

// declare module "@auth/core/jwt" {
//   interface JWT {
//     id: string;
//     roles: Role[];
//   }
// }



// // // types/next-auth.d.ts
// // import { Role } from "@prisma/client";
// // import { DefaultSession, DefaultUser } from "@auth/core/types";

// // declare module "@auth/core" {
// //   interface Session {
// //     user: {
// //       id: string;
// //       roles: Role[];
// //     } & DefaultSession["user"];
// //   }

// //   interface User extends DefaultUser {
// //     roles: Role[];
// //   }
// // }

// // declare module "@auth/core/jwt" {
// //   interface JWT {
// //     id: string;
// //     roles: Role[];
// //     name?: string | null;
// //     email?: string | null;
// //     image?: string | null;
// //   }
// // }


// // // import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
// // // import { Role } from "@prisma/client";

// // // declare module "next-auth" {
// // //   interface Session {
// // //     user: {
// // //       id: string;
// // //       roles: Role[];
// // //     } & DefaultSession["user"];
// // //   }

// // //   interface User extends DefaultUser {
// // //     roles: Role[];
// // //   }
// // // }

// // // declare module "next-auth/jwt" {
// // //   interface JWT {
// // //     id: string;
// // //     roles: Role[];
// // //   }
// // // }






// // // // import { Role } from '@prisma/client'
// // // // import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

// // // // // Rozszerzamy typy NextAuth
// // // // declare module 'next-auth' {
// // // //   interface Session {
// // // //     user: {
// // // //       id: string
// // // //       email: string
// // // //       roles: Role[] // Dodajemy rolę, która będzie typem 'Role' z Prisma
// // // //       name?: string | null
// // // //       image?: string | null
// // // //       title?: string | null
// // // //     } & DefaultSession['user']
// // // //   }

// // // //   interface User extends DefaultUser {
// // // //     roles?: Role[] // Dodajemy opcjonalne pole 'role', które będzie typu 'Role' z Prisma
// // // //     name?: string | null
// // // //     image?: string | null
// // // //     title?: string | null
// // // //   }

// // // //   interface JWT {
// // // //     roles: Role[] // Dodajemy rolę do JWT
// // // //     name?: string | null
// // // //     image?: string | null
// // // //     title?: string | null
// // // //   }
// // // // }