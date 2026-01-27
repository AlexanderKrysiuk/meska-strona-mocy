// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const nextAuth = NextAuth(authConfig);

export const handlers = nextAuth.handlers; // ✅ faktyczny eksport
export const auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
