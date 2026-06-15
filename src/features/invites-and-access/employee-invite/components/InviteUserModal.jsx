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
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { User, Mail, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { GrMail } from "react-icons/gr";
import { InviteSuccess } from "./InviteSuccess";
import { useRoles } from "@/hooks/useRoles";
import { useCreateInvitation } from "@/hooks/mutations";
import { DEPARTMENT_OPTIONS } from "@/constants/departmentOptions";
export function InviteUserModal({ open, onOpenChange, onSuccess, className }) {
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    role: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const { mutateAsync: createInvitation, isPending: isSubmitting } = useCreateInvitation();
  const { data: rolesQueryData, isLoading: isRolesLoading } = useRoles({
    page: 1,
    limit: 100,
    isActive: true,
  });
  const rolesData = rolesQueryData?.data ?? [];
  const roleOptions = Array.isArray(rolesData)
    ? rolesData.map((role) => ({
        value: role.id,
        label: role.name,
      }))
    : [];
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.email || !formData.role) {
      setError("Email and Role are required");
      return;
    }

    setError(null);

    try {
      await createInvitation({
        email: formData.email,
        roleId: formData.role,
        department: formData.department || null,
        name: formData.fullName || null,
      });
      
      setIsSuccess(true);
      // Callback to refresh invitations list if provided
      onSuccess?.();
    } catch (err) {
      const rawMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to send invitation";
      const errorMessage =
        typeof rawMessage === "object"
          ? rawMessage.message || JSON.stringify(rawMessage)
          : rawMessage;
      setError(errorMessage);
    }
  };
  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    setFormData({
      fullName: "",
      email: "",
      department: "",
      role: "",
    });
    onOpenChange(false);
  };
  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent
        className={cn(
          "max-w-[500px] lg:max-w-[320px] xl:max-w-[355px] 2xl:max-w-[400px] 3xl:max-w-[500px] gap-0 p-5 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-5 rounded-2xl",
          className
        )}
      >
        {!isSuccess ? (
          <>
            <ModalHeader className="mb-5 lg:mb-2.5 xl:mb-3 2xl:mb-3.5 3xl:mb-5">
              <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
                Send Invite
              </ModalTitle>
              <ModalDescription className="sr-only">
                Fill in the details to invite a new team member.
              </ModalDescription>
            </ModalHeader>
            <div className="grid gap-5 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-5 py-2">
              {/* Full Name */}
              <div className="space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  leftIcon={
                    <User
                      fill={theme === "dark" ? "#FFFFFF" : "#111"}
                      strokeWidth={0}
                      className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4 "
                    />
                  }
                  variant="default"
                  className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
                  inputClassName="placeholder:text-xs lg:placeholder:text-[7px] xl:placeholder:text-[8px] 2xl:placeholder:text-[10px] 3xl:placeholder:text-xs"
                />
              </div>
              {/* Email Address */}
              <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  leftIcon={
                    <GrMail
                      fill={theme === "dark" ? "#FFFFFF" : "#111"}
                      strokeWidth={0}
                      className="w-4 lg:w-2 xl:w-2.5 2xl:w-3.5 3xl:w-4 h-4 lg:h-2 xl:h-2.5 2xl:h-3.5 3xl:h-4"
                    />
                  }
                  variant="default"
                  className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs"
                  inputClassName="placeholder:text-xs lg:placeholder:text-[7px] xl:placeholder:text-[8px] 2xl:placeholder:text-[10px] 3xl:placeholder:text-xs"
                />
              </div>
              {/* Department */}
              <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
                <label
                  htmlFor="department"
                  className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text"
                >
                  Department
                </label>
                <AccordionSelect
                  id="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  maxHeight="max-h-[90px]"
                  options={DEPARTMENT_OPTIONS}
                  placeholder="Select Department"
                  className="text-base-color "
                />
              </div>
              {/* Role */}
              <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
                <label
                  htmlFor="role"
                  className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text"
                >
                  Role
                </label>
                <AccordionSelect
                  id="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  maxHeight="max-h-[90px]"
                  options={roleOptions}
                  placeholder={
                    isRolesLoading ? "Loading roles..." : "Select Role"
                  }
                  className="text-base-color "
                />
              </div>
            </div>
            {error && (
              <div className="px-3 py-2 text-sm text-red-600 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            <ModalFooter className="flex-row gap-5 lg:gap-2 xl:gap-3 2xl:gap-4 3xl:gap-5 mt-6 lg:mt-3 xl:mt-4 2xl:mt-5 3xl:mt-6 text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs sm:justify-between h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
              <Button
                intent="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full border-table-stroke sm:w-1/2 text-base-color "
              >
                Cancel
              </Button>
              <Button
                intent="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.email || !formData.role}
                className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </ModalFooter>
          </>
        ) : (
          <InviteSuccess email={formData.email} onClose={handleClose} />
        )}
      </ModalContent>
    </Modal>
  );
}