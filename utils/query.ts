export enum ModeratorQueries {
    Circles = "Moderator-Circles",
    CircleMembers = "Moderator-Circle-Members",
    Membership="Membership",
    MeetingsYears="Meetings-Years",
    Meetings = "Moderator-Meetings",
    AllMeetingsDates = "Moderator-All-Meetings-Dates",
    ScheduledMeetings = "Moderator-Scheduled-Meetings",
    CompletedMeetings = "Moderator-Completed-Meetings",
    ArchivedMeetings = "Moderator-Archived-Meetings",
    MeetingParticipants = "Moderator-Meeting-Participants",
    MemberCircleMembership = "Moderator-Member-CircleMembership"
}

export enum GeneralQueries {
    Cities = "Cities",
    Regions = "Regions",
    Countries = "Countries",
    Currencies = "Currencies"
}

export enum PaymentQueries {
    Participation = "Payment-Participation",
    UnpaidMeetings = "Unpaid-Meetings"
}

export enum CircleQueries {
    MyCircles = "My-Circles",
    LandingPage = "Landing-Page"
}

export enum UserQueries {
    User,
    Balance = "Balance",
    Participations = "Participations"
}

export enum StripeQueries {
    StripeConnect = "Stripe-Connect",
    Charges="Stripe-Charges"
}