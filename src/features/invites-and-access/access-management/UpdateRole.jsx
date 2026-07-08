import React, { useState, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import { Loader2, AlertCircle } from "lucide-react";
import RoleForm from "./RoleForm";
import { useRole, useRolePermissions } from "@/hooks/useRole";
import { useUpdateRole, useUpdateRolePermissions } from "@/hooks/mutations";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils";

const UpdateRole = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roleId: roleIdFromParams } = useParams();
  
  const roleFromState = location.state?.role;
  const roleId = roleFromState?.id || roleIdFromParams;

  const [searchPermissionTerm, setSearchPermissionTerm] = useState("");
  const [submitError, setSubmitError] = useState(null);

  // Mutations
  const { 
    mutateAsync: updateRole, 
    isPending: isUpdatingRole,
    error: updateRoleError 
  } = useUpdateRole();
  const { 
    mutateAsync: updatePermissions, 
    isPending: isUpdatingPermissions,
    error: updatePermissionsError 
  } = useUpdateRolePermissions();

  // Fetch role data only if not passed via state
  const { 
    data: fetchedRole, 
    isLoading: isLoadingRole, 
    error: roleError 
  } = useRole(roleId, { enabled: !roleFromState && !!roleId });
  
  // Fetch role permissions
  const { 
    data: rolePermissionsData, 
    isLoading: isLoadingPermissions, 
    error: permissionsError 
  } = useRolePermissions(roleId, { enabled: !!roleId });
  const rolePermissions = Array.isArray(rolePermissionsData) ? rolePermissionsData : [];

  // Fetch all available permissions
  const { 
    data: permissionsData, 
    isLoading: isLoadingAvailablePermissions,
    error: availablePermissionsError 
  } = usePermissions({
    search: searchPermissionTerm,
    isActive: true,
    limit: 100,
  });
  const permissions = permissionsData?.data ?? [];

  // Combined loading state
  const isLoading = isLoadingRole || isLoadingPermissions || isLoadingAvailablePermissions;
  
  // Combined error state
  const error = roleError || permissionsError || availablePermissionsError;

  // Mutation loading state
  const isSubmitting = isUpdatingRole || isUpdatingPermissions;
  
  // Mutation error state
  const mutationError = updateRoleError || updatePermissionsError || submitError;
  
  // Clear all error states
  const clearErrors = () => {
    setSubmitError(null);
  };

  const initialRoleName = roleFromState?.name || fetchedRole?.name || "";

  const formattedAvailablePermissions = permissions?.map((p) => ({
    id: p.id,
    name: p.category ? `${p.category}: ${p.description || p.key}` : (p.description || p.key),
  }));

  const initialSelectedPermissions = useMemo(() => {
    return rolePermissions.map((p) => ({
      id: p.id || p._id,
      name: p.category ? `${p.category}: ${p.description || p.key}` : (p.description || p.key),
    }));
  }, [rolePermissions]);

  const handleUpdate = async ({ roleName, scope, selectedPermissions }) => {
    if (!roleId) return;
    
    setSubmitError(null);

    try {
      // Update basic info (including scope)
      const updateData = {};
      if (roleName !== initialRoleName) {
        updateData.name = roleName;
      }
      const initialScope = roleFromState?.scope || fetchedRole?.scope;
      if (scope !== initialScope) {
        updateData.scope = scope;
      }

      if (Object.keys(updateData).length > 0) {
        await updateRole({ id: roleId, data: updateData });
      }

      // Update permissions (Replace all)
      const permissionIds = selectedPermissions.map((p) => p.id);
      await updatePermissions({ id: roleId, permissionIds });

      navigate(-1);
    } catch (error) {
      console.error("Failed to update role:", error);
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to update role. Please try again."
      );
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-lighter-text">Loading role data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    const errorMessage = getApiErrorMessage(
      error,
      "Failed to load role data. Please try again."
    );
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-5">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-base-color mb-2">Error Loading Role</h3>
          <p className="text-sm text-lighter-text mb-4">{errorMessage}</p>
          <Button
            onClick={() => navigate(-1)}
            intent="outline"
            className="px-6"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* {mutationError && (
        <div className="mx-5 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                Update Failed
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                {typeof submitError === "string"
                  ? submitError
                  : getApiErrorMessage(
                      mutationError,
                      "An error occurred while updating the role. Please try again."
                    )}
              </p>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )} */}
      <RoleForm
        title={`Update Role: ${initialRoleName}`}
        initialRoleName={initialRoleName}
        initialScope={roleFromState?.scope || fetchedRole?.scope || ""}
        initialSelectedPermissions={initialSelectedPermissions}
        availablePermissions={formattedAvailablePermissions}
        onAvailableSearchChange={setSearchPermissionTerm}
        onSubmit={handleUpdate}
        submitButtonText="Update Role"
        isEditMode={true}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default UpdateRole;
