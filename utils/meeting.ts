import { MeetingStatus } from "@prisma/client";

export enum MeetingAction {
    Edit,
    Complete
}

export const moderatorMeetingActions: Record<MeetingStatus, MeetingAction[]> = {
    [MeetingStatus.Archived] : [],
    [MeetingStatus.Completed] : [],
    [MeetingStatus.Scheduled] : [MeetingAction.Edit, MeetingAction.Complete]
}