import { z } from "zod";

/**
 * Schema for Login form validation
 */
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"), // Backend handles strength
});

/**
 * Schema for Register form validation
 * Note: email and department are populated from invitation data (read-only)
 * Username defaults to email on the backend
 */
export const registerSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // This .refine check ensures passwords match
    message: "Passwords do not match",
    path: ["confirmPassword"], // This will attach the error to the confirmPassword field
  });

/**
 * Schema for Forgot Password form validation
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * Schema for Reset Password form validation
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
