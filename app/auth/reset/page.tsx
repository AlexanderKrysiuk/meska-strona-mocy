//app/reset/page.tsx
"use client"

import { PasswordResetForm } from "@/components/auth/password-reset-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const ResetPasswordPage = () => {
    return <Card className="self-start max-w-xs w-full">
        <CardHeader className="justify-center">
            🔐 Resetowania hasła
        </CardHeader>
        <CardContent>
            <PasswordResetForm/>
        </CardContent>
    </Card>
}

export default ResetPasswordPage