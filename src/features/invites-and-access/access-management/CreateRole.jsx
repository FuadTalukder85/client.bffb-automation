import React, { useState } from "react";
import { useNavigate } from "react-router";
import RoleForm from "./RoleForm";
import RoleCreatedModal from "./components/RoleCreatedModal";
import { useCreateRoleWithPermissions } from "@/hooks/mutations";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils";

const CreateRole = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdRoleName, setCreatedRoleName] = useState("");
  const [searchPermissionTerm, setSearchPermissionTerm] = useState("");

  const { mutateAsync: createRole } = useCreateRoleWithPermissions();
  const { data: permissionsData } = usePermissions({
    search: searchPermissionTerm,
    isActive: true,
    limit: 100, // Adjust limit as needed
  });
  const permissions = permissionsData?.data ?? [];

  const formattedPermissions = permissions?.map((p) => ({
    id: p.id,
    name: p.category ? `${p.category}: ${p.description || p.key}` : (p.description || p.key), // Use friendly name
    // Adjust property names based on API response structure
    // The API returns: id, key, description, category.
    // Let's construct a display name.
  }));

  const handleCreate = async ({ roleName, selectedPermissions }) => {
    try {
      const payload = {
        name: roleName,
        permissionIds: selectedPermissions.map((p) => p.id),
      };
      
      await createRole(payload);
      
      setCreatedRoleName(roleName);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to create role:", error);
      toast.error(getApiErrorMessage(error, "Failed to create role. Please try again."));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  return (
    <>
      <RoleForm
        title="Create New Role"
        availablePermissions={formattedPermissions}
        onAvailableSearchChange={setSearchPermissionTerm}
        onSubmit={handleCreate}
      />
      <RoleCreatedModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        roleName={createdRoleName}
      />
    </>
  );
};

export default CreateRole;
