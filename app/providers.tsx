// app/providers.tsx
"use client";

import {HeroUIProvider, ToastProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from 'react';

export function Providers({
  children, 
} : { 
  children: React.ReactNode 
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    // <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
          <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={true}>
            <main>
              {children}
            </main>
            <div className='absolute z-[9999999999999]'>
              <ToastProvider 
                placement="top-center"
                toastProps={{
                  variant: "bordered"        
                }}
              />
            </div>
          </NextThemesProvider>
        </HeroUIProvider>
      </QueryClientProvider>
    //</SessionProvider>
  )
}