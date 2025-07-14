export type ValidationErrors = Record<string, string[]>

export function addError(errors: ValidationErrors, field: string, message: string) {
    if (!errors[field]) {
        errors[field] = []
    } 
    errors[field].push(message)
}