"use client"

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query"
import { ReactNode } from "react"

export const ClientWrapper = ({
    children
} : {
    children: ReactNode
}) => {
    const queryClient = new QueryClient()

    return (
        <QueryClientProvider
          client={queryClient}
        >
            {children}
        </QueryClientProvider>
    )
}