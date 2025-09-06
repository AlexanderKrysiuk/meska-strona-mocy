import * as z from 'zod'

const balanceID = z.string().uuid()
const participationID = z.string().uuid()
const amout = z.number({
    invalid_type_error: "Pole nie może być puste"
}).positive({message: "Kwota musi być większa niż 0"})

export const OwnBalancePaymentSchema = z.object({
    balanceID,
    participationID,
    amout
})