import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/organization/access";

export const statement = {
    ...defaultStatements,
    circle: ["view","create", "update"],
    payment: ["view","connect"],
    earnings: ["view", "connect"]
} as const

export const ac = createAccessControl(statement)

export const moderator = ac.newRole({
    circle: ["view","create", "update"],
    payment: ["view","connect"],
    earnings: ["view", "connect"]
})

export const admin = ac.newRole({
    circle: ["create", "update"],
    ...adminAc.statements
})