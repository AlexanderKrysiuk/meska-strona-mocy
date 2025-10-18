"use client"

import { RespondToMembershipInvitation } from "@/actions/membership";
import { clientAuth } from "@/hooks/auth";
import { CircleQueries } from "@/utils/query";
import { faCheck, faX, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, CardBody, CardFooter, CardHeader, Form, addToast } from "@heroui/react";
import { Circle, Membership, MembershipStatus } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const MembershipCardInside = ({
    circle,
    membership
} : {
    circle: Pick<Circle, "name">
    membership: Pick<Membership, "id" | "status">
}) => {
    const auth = clientAuth()
    const queryClient = useQueryClient()

    // lokalne stany dla dwóch przycisków
    const [loadingAccept, setLoadingAccept] = useState(false);
    const [loadingReject, setLoadingReject] = useState(false);

    const InviteRepsond = useMutation({
        mutationFn: async (accept: boolean) => {
            await RespondToMembershipInvitation(membership.id, accept)
        },
        onSuccess: () => {
            addToast({
                color: "success",
                title: "Operacja przebiegła pomyślnie"
            })
            queryClient.invalidateQueries({
                queryKey: [CircleQueries.MyCircles, auth?.id]
            })
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : "Wystąpił nieznany błąd"
            addToast({
                color: "danger",
                title: message
            })
        },
        onSettled: () => {
            setLoadingAccept(false)
            setLoadingReject(false)
        }
    })

    let content
    switch (membership.status) {
        case MembershipStatus.Pending:
            content = <div>
                <CardBody>
                    Masz oczekujące zaproszenie do tego kręgu
                </CardBody>
                <CardFooter className="space-x-4">
                    <Button
                        fullWidth
                        size="lg"
                        color="success"
                        className="text-white"
                        isDisabled={InviteRepsond.isPending}
                        isLoading={loadingAccept}
                        startContent={loadingAccept ? undefined : <FontAwesomeIcon icon={faCheck}/>}
                        onPress={() => {
                            setLoadingAccept(true)
                            InviteRepsond.mutate(true)
                        }}
                    >
                        {loadingAccept ? `Przyjmowanie....` : `Przyjmij`}
                    </Button>
                    <Button
                        fullWidth
                        size="lg"
                        color="danger"
                        isDisabled={InviteRepsond.isPending}
                        isLoading={loadingReject}
                        startContent={loadingReject ? undefined : <FontAwesomeIcon icon={faXmark}/>}
                        onPress={() => {
                            setLoadingReject(true)
                            InviteRepsond.mutate(false)
                        }}
                    >
                        {loadingReject ? `Odrzucanie...` : `Odrzuć` }
                    </Button>
                </CardFooter>
            </div>
            break;
        case MembershipStatus.Left || MembershipStatus.Removed:
            content = <CardBody>
                <strong className="text-danger">Nie należysz do tego kręgu</strong>
            </CardBody>
            
    }

    return <main>
        <CardHeader>
            <strong>
                {circle.name}
            </strong>
        </CardHeader>
        {content}
    </main>;
}
 
export default MembershipCardInside;