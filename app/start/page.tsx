//app/start/page.tsx
"use client"

import LoginForm from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/lib/auth-client"
import { ROUTES } from "@/lib/routes"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const StartPage = () => {
    const router = useRouter()
    const { data: session } = useSession()

// 🔹 redirect jeśli user już zalogowany
    useEffect(() => {
        if (session) {
            router.push(ROUTES.signInRoute)
        }
    }, [session, router])

    if (session === undefined) return
    
    return <main className="flex w-full justify-center py-[20vh]">
        <Card className="self-start max-w-xs w-full">            
            <CardHeader className="justify-center">
                🔐 Autentykacja
            </CardHeader>
            <CardContent>
                <Tabs className="space-y-4" defaultValue="Login">
                    <TabsList
                        className="space-x-4 w-full"
                    >
                        <TabsTrigger value="Login">Logowanie</TabsTrigger>
                        <TabsTrigger value="Register">Rejestracja</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Login">
                        <LoginForm/>
                    </TabsContent>
                    <TabsContent value="Register">
                        <RegisterForm/>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </main>
}

export default StartPage