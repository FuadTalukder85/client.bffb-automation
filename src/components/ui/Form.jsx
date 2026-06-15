import * as React from "react";
import { createContext, forwardRef, useId, useContext } from "react";
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

// --- 1. The Main Form Provider ---
// This component initializes react-hook-form with all your config
// and passes it down via React's Context.

function Form({ schema, defaultValues, onSubmit, children, className }) {
  const methods = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaultValues || {},
  });

  const { handleSubmit, setError } = methods;

  const onFormSubmit = async (data) => {
    try {
      // Your actual submission logic
      await onSubmit(data);
    } catch (err) {
      // This automatically sets server-side errors
      const errorMsg =
        err.response?.data?.message || "An unexpected error occurred.";
      setError("root.serverError", { message: errorMsg });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

// --- 2. Form Field Context ---
// These small contexts are the magic. They allow
// <FormLabel>, <FormControl>, and <FormMessage>
// to automatically know which field they belong to.
const FormFieldContext = createContext({});
const FormItemContext = createContext({});

// --- 3. The FormField Component ---
// This connects a field to the form state.
function FormField({ name, ...props }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormFieldContext.Provider value={{ ...field, ...fieldState }}>
          {props.children}
        </FormFieldContext.Provider>
      )}
    />
  );
}

// --- 4. The FormItem Component ---
// This is a simple wrapper to group a field's parts.
const FormItem = forwardRef(({ className, ...props }, ref) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

// --- 5. The FormLabel Component ---
// It automatically gets the field's ID for accessibility.
const FormLabel = forwardRef(({ className, ...props }, ref) => {
  const { id } = useContext(FormItemContext);
  const { error } = useContext(FormFieldContext);

  return (
    <label
      ref={ref}
      htmlFor={id}
      className={cn(
        "block text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[12px] font-normal text-[#A0A0A1]",
        error && "text-red-600", // Style label differently on error
        className
      )}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

// --- 6. The FormControl Component ---
// This cleverly "slots" all the form props (onChange, value, blur)
// onto the <Input /> component you place inside it.
const FormControl = forwardRef(({ ...props }, ref) => {
  const { id } = useContext(FormItemContext);
  const { onChange, onBlur, value, name, disabled } =
    useContext(FormFieldContext);

  return (
    <Slot
      ref={ref}
      id={id}
      name={name}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      disabled={disabled}
      aria-describedby={`${id}-message`} // Points to the error message
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// --- 7. The FormMessage Component ---
// This automatically finds and displays the error for its field.
const FormMessage = forwardRef(({ className, ...props }, ref) => {
  const { id } = useContext(FormItemContext);
  const { error } = useContext(FormFieldContext);
  const message = error ? String(error.message) : null;

  if (!message) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={`${id}-message`}
      className={cn("text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-red-600", className)}
      {...props}
    >
      {message}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// --- 8. The FormServerError Component ---

function FormServerError() {
  const {
    formState: { errors },
  } = useFormContext();
  const serverError = errors.root?.serverError;

  if (!serverError) return null;

  return (
    <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-medium text-red-600">{serverError.message}</p>
  );
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormServerError,
};
