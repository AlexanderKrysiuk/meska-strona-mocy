// app/providers.tsx
"use client";

import {HeroUIProvider, ToastProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from 'react';

export function Providers({children}: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider className='h-full'>
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <main className='h-full'>
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
  )
}