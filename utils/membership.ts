import { MembershipStatus } from "@prisma/client";

export enum MembershipAction {
    Remove,
    Restore
}

export const moderatorMembershipActions: Record<MembershipStatus, MembershipAction[]> = {
    [MembershipStatus.Active] : [MembershipAction.Remove],
    [MembershipStatus.Pending] : [MembershipAction.Remove],
    [MembershipStatus.Left] : [],
    [MembershipStatus.Removed] : [MembershipAction.Restore]
}

export function isMembershipActionAllowed(
    status: MembershipStatus,
    action: MembershipAction
) {
    return moderatorMembershipActions[status]?.includes(action) ?? false;
}

