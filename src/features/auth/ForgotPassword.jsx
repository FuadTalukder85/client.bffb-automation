import { useState } from "react";
import { Link } from "react-router";
import api from "@/lib/api";
import { forgotPasswordSchema } from "./authSchemas";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormServerError,
} from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { AuthInput } from "./AuthInput";
import { useFormContext } from "react-hook-form";

function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data) => {
    await api.post("/auth/forgot-password", {
      email: data.email,
    });

    // Show success message
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-start w-full mt-4 md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
        <div className="flex-1 w-full pt-0 mt-4 mb-10 md:pt-4 lg:pt-6 xl:pt-8 2xl:pt-10 md:mb-0 md:mt-0">
          <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-bold leading-tight text-white ">
            Request to reset
            <br />
            your password.
          </h1>
        </div>
        <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
          <div className="p-6 bg-white shadow-lg lg:p-10 xl:p-12 2xl:p-14 rounded-2xl">
            <h3 className="mb-6 text-xl font-semibold text-center text-gray-800 md:text-2xl lg:text-xl xl:text-2xl 2xl:text-2xl">
              Check Your Email
            </h3>
            <p className="mb-6 text-sm text-center text-gray-600 md:text-base">
              If an account exists for this email, a password reset link has
              been sent. Please check your inbox.
            </p>
            <Button
              asChild
              intent="primary"
              className="w-full py-6 text-base font-medium md:py-7 lg:py-5 xl:py-6 2xl:py-7 md:text-lg lg:text-base xl:text-lg 2xl:text-lg"
            >
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start w-full mt-4 md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
      <div className="flex-1 w-full pt-0 mt-4 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-5 md:mb-0 md:mt-0">
        <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-bold leading-tight text-white ">
          Request to reset
          <br />
          your password.
        </h1>
      </div>
      <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
        <div className="p-6 bg-white shadow-lg lg:p-7.5 xl:p-10 2xl:p-11.5 3xl:p-14 rounded-2xl">
          <h3 className="mb-4 font-semibold text-center text-gray-800 text-md lg:text-md xl:text-lg 2xl:text-xl 2xl:text-2xl">
            Request Password Reset
          </h3>

          <Form
            schema={forgotPasswordSchema}
            onSubmit={onSubmit}
            className="space-y-4"
          >
            <FormField name="email">
              <FormItem>
                <FormLabel className="">Enter Your Email Address</FormLabel>
                <FormControl>
                  <AuthInput
                    type="email"
                    placeholder="jackson.graham@example.com"
                    leftIcon={
                      <img
                        src="/form/message-icon.png"
                        alt=""
                        className="w-5 h-5"
                      />
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormServerError />

            <div className="">
              <SubmitButton />
            </div>
          </Form>

          {/* <p className="mt-5 text-xs text-center md:text-sm lg:text-xs xl:text-sm 2xl:text-sm md:mt-10 lg:mt-8 xl:mt-9 2xl:mt-10">
            Don't have an account?{" "}
            <Button asChild intent="link" className="h-auto p-0 text-[#000000]">
              <Link to="/register">Sign up</Link>
            </Button>
          </p> */}
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { formState } = useFormContext();
  return (
    <Button
      type="submit"
      disabled={formState.isSubmitting}
      className="w-full text-[#FFFFFF] font-medium py-3 lg:py-2 xl:py-2.5 2xl:py-3.5 3xl:py-4 text-xs lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg!"
      intent="primary"
    >
      {formState.isSubmitting ? "Sending..." : "Request Reset"}
    </Button>
  );
}

export default ForgotPassword;
