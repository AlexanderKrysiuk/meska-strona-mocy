"use client"

import LoginForm from "@/components/auth/login-form"
import RegisterForm from "@/components/auth/register-form"
import { Card, CardBody, Tab, Tabs } from "@heroui/react"

const StartPage = () => {
    return <main className="w-full flex justify-center items-center">
        <Card className="max-w-xs mt-20 mb-20 lg:mt-40">
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