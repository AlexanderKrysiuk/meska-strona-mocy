"use client"
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { Card, CardBody, CardHeader } from "@heroui/react";

const ResetPasswordPage = () => {
    return (
        <main className="absolute inset-0 flex items-center justify-center">
            <Card
                className="m-4 w-full max-w-xs"
            >
                <CardHeader
                    className="justify-center"
                >
                    Zresetuj swoje hasło    
                </CardHeader>
                <CardBody>
                    <ResetPasswordForm/>
                </CardBody>
            </Card>            
        </main>
    );
}
 
export default ResetPasswordPage;