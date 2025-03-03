"use client"

import RegisterForm from "@/components/auth/register-form";
import { Card, CardBody, Tab, Tabs } from "@heroui/react";

const StartPage = () => {
    return ( 
        <main className="absolute flex w-full justify-center mt-64">
            <Card className="m-4 w-full max-w-xs">
                <CardBody>
                    <Tabs fullWidth>
                        <Tab title="Logowanie">
                            Formularz do logowania
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