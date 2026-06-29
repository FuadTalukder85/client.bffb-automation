import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRoles } from "@/hooks/useRoles";
import { useUpdateUserRole } from "@/hooks/mutations";
import { getApiErrorMessage } from "@/utils/apiError";
import { DEPARTMENT_OPTIONS } from "@/constants/departmentOptions";

export function UpdateRoleModal({ open, onOpenChange, user, onSuccess, className }) {
  const [department, setDepartment] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState(null);
  const { mutateAsync: updateUserRole, isPending: isSubmitting } = useUpdateUserRole();

  // Fetch roles from API (only active roles)
  const { data: rolesQueryData, isLoading: isLoadingRoles } = useRoles({ 
    isActive: true,
    limit: 100,
    scope: "global,application"
  });
  const rolesData = rolesQueryData?.data ?? [];

  // Transform roles data into options for select
  const roleOptions = useMemo(() => {
    return rolesData?.map((role) => ({
      value: role._id || role.id,
      label: role.name,
    }));
  }, [rolesData]);

  console.log(rolesData);

  // Pre-fill data when user or modal opens
  useEffect(() => {
    if (user && open) {
      setDepartment(user.department || "");
      // Find role ID from user's current role name if available
      if (user.roleId) {
        setRoleId(user.roleId);
      } else if (user.role && roleOptions.length > 0) {
        const matchedRole = roleOptions.find(
          (opt) => opt.label.toLowerCase() === user.role?.toLowerCase()
        );
        setRoleId(matchedRole?.value || "");
      } else {
        setRoleId("");
      }
      setError(null);
    }
  }, [user, open, roleOptions]);

  const handleSubmit = async () => {
    if (!user?._id && !user?.id) return;
    
    const userId = user._id || user.id;
    setError(null);

    try {
      const payload = {};
      
      // Only include department if it changed
      if (department !== (user.department || "")) {
        payload.department = department;
      }
      
      // Only include roleId if it changed
      if (roleId && roleId !== user.roleId) {
        payload.roleId = roleId;
      }

      // Only make API call if there are changes
      if (Object.keys(payload).length === 0) {
        onOpenChange(false);
        return;
      }

      await updateUserRole({ id: userId, data: payload });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update user role. Please try again."));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setDepartment("");
      setRoleId("");
      onOpenChange(false);
    }
  };

  const userName = user?.name || user?.email || "User";

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
            Update Role
          </ModalTitle>
          <ModalDescription className="text-center lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text mt-1">
            Update department and role for <span className="font-medium text-primary">{userName}</span>
          </ModalDescription>
        </ModalHeader>

        {error && (
          <div className="px-4 py-2 mb-4 lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-center text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-5 lg:gap-2.5 xl:gap-3 2xl:gap-3.5 3xl:gap-5 py-2">
          {/* Department */}
          <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label
              htmlFor="department"
              className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text"
            >
              Select Department
            </label>
            <AccordionSelect
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              maxHeight="max-h-[150px]"
              options={DEPARTMENT_OPTIONS}
              placeholder="Select Department"
              className="text-base-color bg-primary-shade-2/20"
              disabled={isSubmitting}
            />
          </div>

          {/* Role */}
          <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label
              htmlFor="role"
              className="text-xs lg:text-[7px] xl:text-[8px] 2xl:text-[10px] 3xl:text-xs font-normal text-lighter-text"
            >
              Select Role
            </label>
            {isLoadingRoles ? (
              <div className="flex items-center justify-center h-10 bg-primary-shade-2/20 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="ml-2 lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text">Loading roles...</span>
              </div>
            ) : (
              <AccordionSelect
                id="role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                maxHeight="max-h-[150px]"
                options={roleOptions}
                placeholder="Select Role"
                className="text-base-color bg-primary-shade-2/20"
                disabled={isSubmitting}
              />
            )}
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
            disabled={isSubmitting || isLoadingRoles}
            className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
