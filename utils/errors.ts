export class FormError extends Error {
    fieldErrors: Record<string, string>;
  
    constructor(fieldErrors: Record<string, string>, message?: string) {
        super(message);
        this.name = "FormError";
        this.fieldErrors = fieldErrors;
    }
}
  