"use client"

import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import { Card, CardBody, Tab, Tabs } from "@heroui/react"

const StartPage = () => {
    return <main className="flex flex-col flex-1 justify-center items-center">
        <Card className="w-full max-w-xs absolute top-1/4">
            <CardBody>
                <Tabs fullWidth>
                    <Tab title="Logowanie">
                        <LoginForm/>
                    </Tab>
                    <Tab title="Rejestracja">
                        <RegisterForm/>
                    </Tab>
                </Tabs>
            </CardBody>
        </Card>
    </main>
}
export default StartPage