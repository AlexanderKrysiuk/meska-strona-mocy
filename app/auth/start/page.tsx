//app/auth/start/page.tsx
"use client"

import LoginForm from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const StartPage = () => {

    return <Card className="self-start max-w-xs w-full m-4">            
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
}

export default StartPage