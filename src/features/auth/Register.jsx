import { useNavigate, useSearchParams, Link } from "react-router";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { registerSchema } from "./authSchemas";
import { useQueryClient } from "@tanstack/react-query";

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

function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();

  // Get token from URL
  const urlToken = searchParams.get("token");

  // State for invitation data
  const [invitationData, setInvitationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenError, setTokenError] = useState(
    !urlToken ? "Invalid or missing invitation token." : null
  );

  // Fetch invitation data on mount
  useEffect(() => {
    async function fetchInvitationData() {
      if (!urlToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get(`/auth/validate-invitation/${urlToken}`);
        const data = response.data.data;
        setInvitationData(data);
        setTokenError(null);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Invalid or expired invitation token.";
        setTokenError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvitationData();
  }, [urlToken]);

  // Submit handler receives validated data
  const onSubmit = async (data) => {
    const response = await api.post("/auth/register", {
      token: urlToken,
      name: data.name.trim(),
      password: data.password,
    });

    const { accessToken, user } = response.data.data;
    login(accessToken, user);
    queryClient.clear();
    navigate("/profile");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-start w-full mt-24 md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
        <div className="items-start flex-1 w-full pt-0 mt-4 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-32 md:mb-0 md:mt-0">
          <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-semibold leading-tight text-white mt-4 md:mt-0">
            Create your
            <br />
            account.
          </h1>
        </div>
        <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
          <div className="p-6 bg-white shadow-lg lg:p-6 xl:p-7.5 2xl:p-8.5 3xl:p-11 rounded-2xl">
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
              <span className="ml-3 text-gray-600">
                Validating invitation...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - invalid/expired token
  if (tokenError && !invitationData) {
    return (
      <div className="flex flex-col items-start w-full mt-24 md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
        <div className="items-start flex-1 w-full pt-0 mt-4 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-32 md:mb-0 md:mt-0">
          <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-semibold leading-tight text-white mt-4 md:mt-0">
            Create your
            <br />
            account.
          </h1>
        </div>
        <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
          <div className="p-6 bg-white shadow-lg lg:p-6 xl:p-7.5 2xl:p-8.5 3xl:p-11 rounded-2xl">
            <div className="py-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Invalid Invitation
              </h3>
              <p className="mb-6 text-gray-600">{tokenError}</p>
              <Button asChild intent="primary">
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start w-full mt-24 md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
      <div className="items-start flex-1 w-full pt-0 mt-4 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-32 md:mb-0 md:mt-0">
        <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-semibold leading-tight text-white mt-4 md:mt-0">
          Create your
          <br />
          account.
        </h1>
      </div>
      <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[480px] xl:max-w-[540px] 2xl:max-w-[583px]">
        <div className="p-6 bg-white shadow-lg lg:p-6 xl:p-7.5 2xl:p-8.5 3xl:p-11 rounded-2xl">
          <h3 className="mb-4 font-semibold text-center text-gray-800 text-md lg:text-md xl:text-lg 2xl:text-xl 3xl:text-2xl">
            Create account
          </h3>

          <Form
            schema={registerSchema}
            onSubmit={onSubmit}
            defaultValues={{
              name: invitationData?.name || "",
              password: "",
              confirmPassword: "",
            }}
            className="space-y-4 lg:space-y-2 xl:space-y-2.5 2xl:space-y-3 3xl:space-y-4"
          >
            <FormField name="name">
              <FormItem>
                <FormLabel className="">Full Name</FormLabel>
                <FormControl>
                  <AuthInput
                    type="text"
                    placeholder="Jackson Graham"
                    leftIcon={<img src="/form/user-icon.png" alt="" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            {/* Email - Read Only from Invitation */}
            <div className="space-y-2">
              <label className="block text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[12px] font-normal text-[#A0A0A1]">
                Email address
              </label>
              <AuthInput
                type="email"
                value={invitationData?.email || ""}
                readOnly
                disabled
                leftIcon={<img src="/form/message-icon.png" alt="" />}
                className="bg-gray-50"
              />
            </div>

            {/* Department - Read Only from Invitation */}
            <div className="space-y-2">
              <label className="block text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-[12px] font-normal text-[#A0A0A1]">
                Department
              </label>
              <AuthInput
                type="text"
                value={invitationData?.department || "Not assigned"}
                readOnly
                disabled
                leftIcon={<img src="/form/department-icon.png" alt="" />}
                className="bg-gray-50"
              />
            </div>

            <FormField name="password">
              <FormItem>
                <FormLabel className="">New Password</FormLabel>
                <FormControl>
                  <AuthPasswordInput
                    placeholder="••••••••"
                    leftIcon={<img src="/form/password-icon.png" alt="" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="confirmPassword">
              <FormItem>
                <FormLabel className="">Confirm Password</FormLabel>
                <FormControl>
                  <AuthPasswordInput
                    placeholder="••••••••"
                    leftIcon={<img src="/form/password-icon.png" alt="" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormServerError />

            <div>
              <SubmitButton />
            </div>
          </Form>

          <p className="mt-4 text-xs text-center lg:mt-2 xl:mt-3 2xl:mt-4 3xl:mt-5 lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
            Already have an account?{" "}
            <Button asChild intent="link" className="h-auto p-0 text-[#000000] text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm">
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
      className="w-full text-[#FFFFFF] font-medium py-3 lg:py-2 xl:py-2.5 2xl:py-3.5 3xl:py-4 text-xs lg:text-xs! xl:text-sm! 2xl:text-md! 3xl:text-lg!"
      intent="primary"
    >
      {formState.isSubmitting ? "Creating account..." : "Create Account"}
    </Button>
  );
}

export default Register;

