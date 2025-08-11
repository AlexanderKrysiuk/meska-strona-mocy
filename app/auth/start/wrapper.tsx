"use client"

import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Card, CardBody, Tab, Tabs } from "@heroui/react";

const StartPageWrapper = () => {
    return ( 
        <main className="flex w-full justify-center mt-[0.3vh] p-4">
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
 
export default StartPageWrapper;