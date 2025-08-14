"use client"

import { faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "@heroui/react"

const AddCircleMemberModal = () => {
    return (
        <main>
            <Button
                color="primary"
                startContent={<FontAwesomeIcon icon={faUserPlus}/>}
            >
                Dodaj nowego kręgowca
            </Button>
        </main>
    )
}

export default AddCircleMemberModal;