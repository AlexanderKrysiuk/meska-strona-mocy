"use client"

import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Card, CardBody, Tab, Tabs } from "@heroui/react";

const StartPage = () => {
    return ( 
        <main className="absolute flex w-full justify-center mt-[0.2vh] p-4">
            <Card className="w-full max-w-xs">
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
     );
}
 
export default StartPage;