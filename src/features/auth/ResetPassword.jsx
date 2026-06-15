import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import api from "@/lib/api";
import { resetPasswordSchema } from "./authSchemas";

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
import { AuthPasswordInput } from "./AuthPasswordInput";
import { useFormContext } from "react-hook-form";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await api.get(
          `/auth/validate-reset-token?token=${token}`
        );
        setEmail(response.data.data.data.email);
        setIsValidToken(true);
      } catch {
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data) => {
    await api.post("/auth/reset-password", {
      token: data.token,
      password: data.password,
    });

    // Show success message
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-start w-full md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
        <div className="flex-1 w-full pt-0 mt-0 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-20 md:mb-0 md:mt-0">
          <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-bold leading-tight text-white ">
            Password Reset
            <br />
            Successful!
          </h1>
        </div>
        <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
          <div className="p-6 bg-white shadow-lg lg:p-10 xl:p-12 2xl:p-14 rounded-2xl">
            <h3 className="mb-6 text-xl font-semibold text-center text-gray-800 md:text-2xl lg:text-xl xl:text-2xl 2xl:text-2xl">
              Password Reset Complete
            </h3>
            <p className="mb-6 text-sm text-center text-gray-600 md:text-base">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <Button
              asChild
              intent="primary"
              className="w-full py-6 text-base font-medium md:py-7 lg:py-5 xl:py-6 2xl:py-7 md:text-lg lg:text-base xl:text-lg 2xl:text-lg"
            >
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!token || (!isValidating && !isValidToken)) {
    return (
      <div className="flex flex-col items-start w-full md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
        <div className="flex-1 w-full pt-0 mt-4 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-20 md:mb-0 md:mt-0">
          <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-bold leading-tight text-white ">
            Invalid Reset
            <br />
            Link
          </h1>
        </div>
        <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
          <div className="p-6 bg-white shadow-lg lg:p-10 xl:p-12 2xl:p-14 rounded-2xl">
            <h3 className="mb-6 text-xl font-semibold text-center text-gray-800 md:text-2xl lg:text-xl xl:text-2xl 2xl:text-2xl">
              Invalid Reset Link
            </h3>
            <p className="mb-6 text-sm text-center text-gray-600 md:text-base">
              The password reset link is invalid or has expired. Please request
              a new password reset.
            </p>
            <Button
              asChild
              intent="primary"
              className="w-full py-6 text-base font-medium md:py-7 lg:py-5 xl:py-6 2xl:py-7 md:text-lg lg:text-base xl:text-lg 2xl:text-lg"
            >
              <Link to="/forgot-password">Request New Reset Link</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="flex flex-col items-start w-full md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
        <div className="flex-1 w-full pt-0 mt-0 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-20 md:mb-0 md:mt-0">
          <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-bold leading-tight text-white ">
            Validating
            <br />
            reset link...
          </h1>
        </div>
        <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
          <div className="p-6 bg-white shadow-lg lg:p-10 xl:p-12 2xl:p-14 rounded-2xl">
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start w-full md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
      <div className="flex-1 w-full pt-0 mt-0 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-20 md:mb-0 md:mt-0">
        <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-bold leading-tight text-white ">
          Reset your
          <br />
          password.
        </h1>
      </div>
      <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
        <div className="p-6 bg-white shadow-lg lg:p-10 xl:p-12 2xl:p-14 rounded-2xl">
          <h3 className="mb-6 text-xl font-semibold text-center text-gray-800 md:text-2xl lg:text-xl xl:text-2xl 2xl:text-2xl">
            Reset Password
          </h3>

          <Form
            schema={resetPasswordSchema}
            onSubmit={onSubmit}
            defaultValues={{ token }}
            className="space-y-4"
          >
            <FormField name="token">
              <FormControl>
                <input type="hidden" />
              </FormControl>
            </FormField>

            <div className="pb-2">
              <FormLabel className="">Email Address</FormLabel>
              <AuthInput
                type="email"
                value={email}
                disabled
                readOnly
                leftIcon={
                  <img
                    src="/form/message-icon.png"
                    alt=""
                    className="w-5 h-5"
                  />
                }
              />
            </div>

            <FormField name="password">
              <FormItem>
                <FormLabel className="">New Password</FormLabel>
                <FormControl>
                  <AuthPasswordInput
                    placeholder="••••••••"
                    leftIcon={
                      <img
                        src="/form/password-icon.png"
                        alt=""
                        className="w-5 h-5"
                      />
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="confirmPassword">
              <FormItem>
                <FormLabel className="">Confirm New Password</FormLabel>
                <FormControl>
                  <AuthPasswordInput
                    placeholder="••••••••"
                    leftIcon={
                      <img
                        src="/form/password-icon.png"
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

            <div className="pt-3">
              <SubmitButton />
            </div>
          </Form>

          <p className="mt-5 text-xs text-center md:text-sm lg:text-xs xl:text-sm 2xl:text-sm md:mt-10 lg:mt-8 xl:mt-9 2xl:mt-10">
            Remember your password?{" "}
            <Button asChild intent="link" className="h-auto p-0 text-[#000000]">
              <Link to="/login">Log in</Link>
            </Button>
          </p>
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
      className="w-full py-3 text-[#FFFFFF] font-medium md:py-4 md:text-lg xl:text-lg 2xl:text-lg"
      intent="primary"
    >
      {formState.isSubmitting ? "Resetting..." : "Reset Password"}
    </Button>
  );
}

export default ResetPassword;
