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
      <HeroUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          {children}
          <ToastProvider 
            placement="top-center"
            toastProps={{
              variant: "bordered",
              classNames: {
                closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
              },            
            }}
          />
        </NextThemesProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  )
}