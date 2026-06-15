import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";
import { IoMdLock } from "react-icons/io";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useUpdateUserPassword } from "@/hooks/mutations";

export function UpdatePasswordModal({ open, onOpenChange, user, onSuccess, className }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme } = useTheme();

  const { mutateAsync: updateUserPassword, isPending: isSubmitting } = useUpdateUserPassword();

  const handleClose = () => {
    if (isSubmitting) return;
    setPassword("");
    setConfirmPassword("");
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!user?._id && !user?.id) return;

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);

    try {
      const userId = user._id || user.id;
      await updateUserPassword({ id: userId, password });
      onSuccess?.();
      handleClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update password";
      setError(errorMessage);
    }
  };

  const userName = user?.name || user?.email || "this user";

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[500px] lg:max-w-[320px] xl:max-w-[355px] 2xl:max-w-[400px] 3xl:max-w-[500px] gap-0 p-5 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-5 rounded-2xl",
          className
        )}
      >
        <ModalHeader className="mb-5 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-5">
          <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
            Update Password
          </ModalTitle>
          <ModalDescription className="text-center lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text mt-1">
            Set a new password for <span className="font-medium text-primary">{userName}</span>
          </ModalDescription>
        </ModalHeader>

        {error && (
          <div className="px-4 py-2 mb-4 lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-center text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-5 py-2">
          <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label
              htmlFor="newPassword"
              className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text"
            >
              New Password
            </label>
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={
                <IoMdLock
                  fill={theme === "dark" ? "#FFFFFF" : "#111"}
                  strokeWidth={0}
                  className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4"
                />
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-base-color"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                  )}
                </button>
              }
              variant="default"
              className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
              inputClassName="placeholder:text-xs lg:placeholder:text-[7px] xl:placeholder:text-[8px] 2xl:placeholder:text-[10px] 3xl:placeholder:text-xs"
            />
          </div>

          <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={
                <IoMdLock
                  fill={theme === "dark" ? "#FFFFFF" : "#111"}
                  strokeWidth={0}
                  className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4"
                />
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-base-color"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <Eye className="w-4 h-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4" />
                  )}
                </button>
              }
              variant="default"
              className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
              inputClassName="placeholder:text-xs lg:placeholder:text-[7px] xl:placeholder:text-[8px] 2xl:placeholder:text-[10px] 3xl:placeholder:text-xs"
            />
          </div>
        </div>

        <ModalFooter className="flex-row gap-5 lg:gap-2 xl:gap-3 2xl:gap-4 3xl:gap-5 mt-6 lg:mt-3 xl:mt-4 2xl:mt-5 3xl:mt-6 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs sm:justify-between h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
          <Button
            intent="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full border-table-stroke sm:w-1/2 text-base-color "
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !password || !confirmPassword}
            className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
