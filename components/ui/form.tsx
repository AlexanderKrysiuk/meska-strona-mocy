"use client"

import * as React from "react"
import type * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { createContext, useContext } from "react"
import { ZodObject, ZodTypeAny } from "zod"

// ===================== CONTEXT SCHEMA =====================
const FormSchemaContext = createContext<ZodObject<any> | null>(null)
export function useFormSchema() {
  return useContext(FormSchemaContext)
}

export function isFieldRequired<T extends ZodObject<any>>(
  schema: T,
  fieldName: keyof T["shape"]
) {
  const field = schema.shape[fieldName] as ZodTypeAny
  if (!field) return false
  return !field.isOptional() && !field.isNullable()
}

// ===================== FORM =====================
interface FormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>
  schema?: ZodObject<any>
  children: React.ReactNode
}

function Form<TFieldValues extends FieldValues>({ form, schema, children }: FormProps<TFieldValues>) {
  return (
    <FormSchemaContext.Provider value={schema ?? null}>
      <FormProvider {...form}>{children}</FormProvider>
    </FormSchemaContext.Provider>
  )
}

// ===================== FORM FIELD =====================
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = { name: TName }

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ ...props }: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) throw new Error("useFormField should be used within <FormField>")

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// ===================== FORM ITEM =====================
type FormItemContextValue = { id: string }
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  )
}

// ===================== FORM LABEL =====================
function FormLabel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId, name } = useFormField()
  const schema = useFormSchema()
  const required = schema ? isFieldRequired(schema, name) : false

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      htmlFor={formItemId}
      className={cn("data-[error=true]:text-destructive", className)}
      {...props}
    >
      <div>
        {children}
        {required && <span className="text-destructive">*</span>}
      </div>
    </Label>
  )
}



// ===================== FORM CONTROL / DESCRIPTION / MESSAGE =====================
function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()
  return <p data-slot="form-description" id={formDescriptionId} className={cn("text-muted-foreground text-sm", className)} {...props} />
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children
  if (!body) return null
  return (
    <p data-slot="form-message" id={formMessageId} className={cn("text-destructive text-sm", className)} {...props}>
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
