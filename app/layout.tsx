import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import RootWrapper from "@/components/root-wraper";
import Footer from "@/components/footer";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meska Strona Mocy",
  description: "Meska Strona Mocy",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <RootWrapper>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
            <main className="flex-grow">
              <Header/>
              {children}
            </main>
            <Footer/>
          </body>
        </RootWrapper>
      </html>
    </SessionProvider>
  );
}
