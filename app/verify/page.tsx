"use client"

import { VerifyToken } from "@/actions/token"
import VerificationForm from "@/components/auth/verification-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { TriangleAlert } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"


const VerifyPage = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const identifier = searchParams.get("identifier")

    const [result, setResult] = useState<Awaited<ReturnType<typeof VerifyToken>> | null>(null)

    useEffect(() => {
        if (!token || !identifier) {
            setResult({
                success: false,
                data: "Brak tokenu"
            })
        } else {
            const run = async () => {
                const result = await VerifyToken(identifier, token)
                setResult(result)
            }

            run()
        }

        return 

    }, [token])

    console.log(identifier)

    if (!result) return

    if (result.success) {
        return <Card>
            <CardHeader>🔐 Weryfikacja</CardHeader>
                <CardContent>
                    <VerificationForm 
                        email={result.data}    
                    />
                </CardContent>
        </Card>
    } else {
        return (
            <Button
                size="lg"
                variant="destructive"
            >
                <TriangleAlert/> {result.data}
            </Button>
        )
    }
}

const VerifyPageSuspense = () => {
    return <main className="w-full flex items-center justify-center">
        <Suspense
            fallback={
                <Button
                    size="lg"
                    variant="secondary"
                >
                    <Spinner/>
                    Trwa Weryfikacja, proszę czekać...
                </Button>
            }
        >
            <VerifyPage/>
        </Suspense>
    </main>
}

export default VerifyPageSuspense
