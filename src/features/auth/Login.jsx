import { useNavigate, Link } from "react-router";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { loginSchema } from "./authSchemas";
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

function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();

  // 2. The submit handler is now just the "success" logic.
  //    The <Form> component handles validation and catches errors.
  const onSubmit = async (data) => {
    const response = await api.post("/auth/login", {
      email: data.email,
      password: data.password,
      appSource: "application",
    });

    // This part only runs if the API call is successful
    const { accessToken, user } = response.data.data;
    login(accessToken, user);
    queryClient.clear();
    navigate("/profile");
  };

  return (
    <div className="flex flex-col items-start w-full mt-4 md:flex-row lg:mt-6 xl:mt-8 2xl:mt-10">
      {/* White card container for the form */}

      <div className="flex-1 w-full pt-0 mt-24 mb-10 md:pt-32 lg:pt-20 xl:pt-28 2xl:pt-20 md:mb-0 md:mt-0">
        <h1 className="text-[clamp(44.5px,calc(36.05px+2.35vw),81.12px)] font-medium leading-tight text-white ">
          Log in to your
          <br />
          account.
        </h1>
      </div>
      <div className="flex-1 w-full px-0 max-w-[583px] lg:max-w-[310px] xl:max-w-[415px] 2xl:max-w-[465px] 3xl:max-w-[583px]">
        <div className="p-6 bg-white shadow-lg lg:p-7.5 xl:p-12 2xl:p-12 3xl:p-14 rounded-2xl">
          <h3 className="mb-4 font-semibold text-center text-gray-800 text-md lg:text-md xl:text-lg 2xl:text-xl 3xl:text-2xl">
            Login
          </h3>

          {/* 3. Use the new Form component. Pass the schema and onSubmit. */}
          <Form
            schema={loginSchema}
            defaultValues={{
              email: "fuadtalukder25@gmail.com",
              password: "Aa@11111111",
            }}
            onSubmit={onSubmit}
            className="space-y-4"
          >
            {/* 4. This is a complete, validated form field. */}
            <FormField name="email">
              <FormItem>
                <FormLabel className="">Email address</FormLabel>
                <FormControl>
                  <AuthInput
                    type="email"
                    placeholder="jackson.graham@example.com"
                    leftIcon={
                      <img
                        src="/form/message-icon.png"
                        alt=""
                        className="w-5 h-5 lg:w-2.5! xl:w-3.5! 2xl:w-4! 3xl:w-5! lg:h-2.5! xl:h-3.5! 2xl:h-4! 3xl:h-5!"
                      />
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="password">
              <FormItem>
                <FormLabel className="">Password</FormLabel>
                <FormControl>
                  <AuthPasswordInput
                    placeholder="••••••••"
                    leftIcon={
                      <img
                        src="/form/password-icon.png"
                        alt=""
                        className="w-5 h-5 lg:w-2.5! xl:w-3.5! 2xl:w-4! 3xl:w-5! lg:h-2.5! xl:h-3.5! 2xl:h-4! 3xl:h-5!"
                      />
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            {/* Forgot Password Link */}
            <div className="flex justify-end my-2 mb-5 lg:my-5 xl:my-6 2xl:my-7 3xl:my-8">
              <Button
                asChild
                intent="link"
                className="h-auto p-0 pb-1 text-xs lg:text-[9px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-normal border-b border-gray-200 rounded-none text-[#000000CC]"
              >
                <Link to="/forgot-password">Forgot Password?</Link>
              </Button>
            </div>

            {/* 6. This shows only server errors (e.g., "Invalid credentials") */}
            <FormServerError />

            <div>
              {/* This helper component gets the loading state from the form */}
              <SubmitButton />
            </div>
          </Form>

          {/* <p className="mt-5 text-xs text-center md:text-sm lg:text-xs xl:text-sm 2xl:text-sm md:mt-10 lg:mt-8 xl:mt-9 2xl:mt-10">
            Don't have an account?{" "}
            <Button asChild intent="link" className="h-auto p-0 text-[#000000]">
              <Link to="/register" className="">
                Sign up
              </Link>
            </Button>
          </p> */}
        </div>
      </div>
    </div>
  );
}

// 7. Helper component to get the form's submitting state
//    This MUST be a separate component to access the context
function SubmitButton() {
  const { formState } = useFormContext();
  return (
    <Button
      type="submit"
      disabled={formState.isSubmitting}
      className="w-full text-[#FFFFFF] font-medium py-3 lg:py-2 xl:py-2.5 2xl:py-3.5 3xl:py-4 text-xs xl:text-sm 2xl:text-md 3xl:text-lg"
      intent="primary"
    >
      {formState.isSubmitting ? "Logging in..." : "Log in"}
    </Button>
  );
}

export default Login;
