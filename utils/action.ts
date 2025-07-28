export type ActionErrors = Record<string, string[]>

export enum ActionStatus {
    Success = "success",
    Partial = "warning",
    Error = "danger"
}

export interface ActionResult {
    status: ActionStatus,
    message: string,
    fieldErrors?: ActionErrors
}

export function addActionError(errors: ActionErrors, field: string, message: string) {
    if (!errors[field]) {
        errors[field] = []
    } 
    errors[field].push(message)
}