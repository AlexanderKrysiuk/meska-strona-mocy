//app/start/page.tsx
"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabsContent } from "@radix-ui/react-tabs"

export default function StartPage() {
    return <main className="flex w-full justify-center py-[20vh]">
        <Card className="self-start max-w-xs w-full">            
            <CardHeader className="justify-center">
                🔐 Autentykacja
            </CardHeader>
            <CardContent>
                <Tabs className="space-y-4">
                    <TabsList
                        className="space-x-4 w-full"
                    >
                        <TabsTrigger value="Login">Logowanie</TabsTrigger>
                        <TabsTrigger value="Register">Rejestracja</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Login">
                        
                    </TabsContent>
                    <TabsContent value="Register">
                        <RegisterForm/>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </main>
}