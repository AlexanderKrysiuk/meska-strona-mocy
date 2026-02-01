//app/auth/new-password/page.tsx
"use client"

import { NewPasswordForm } from "@/components/auth/new-password-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

const NewPasswordPage = () => {
    return <Suspense
        fallback={<div className="flex items-center">
            <Spinner className="mr-2"/>Ładowanie...
        </div>}
    >
        <Card className="self-start max-w-xs w-full">
            <CardHeader className="justify-center">🔐 Podaj nowe hasło</CardHeader>
            <CardContent>
                <NewPasswordForm/>
            </CardContent>
        </Card>
    </Suspense> 
}

export default NewPasswordPage;