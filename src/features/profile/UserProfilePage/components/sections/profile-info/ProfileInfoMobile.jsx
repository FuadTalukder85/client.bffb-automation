import React from "react";
import {
  CalendarDays,
  Loader2,
  Mail,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import api from "@/lib/api";
import { formatDate, DATE_FORMATS } from "@/utils/dateFormatter";
import { resolveAvatarUrl } from "@/utils/avatarUrl";
import { useUserProfile } from "../../../UserProfileContext";
import { getInitials, extractPayloadData } from "../../../utils";
import { MdLockReset, MdNotificationsActive, MdNotificationsOff } from "react-icons/md";
import ChangePassModal from "./ChangePassModal";
import { subscribeUserToPush, getNotificationPermissionStatus } from "@/utils/push-notifications";

const getResponseMessage = (response, fallback) =>
  response?.data?.message || response?.message || fallback;

const ProfileInfoMobile = () => {
  const [isChangePassOpen, setIsChangePassOpen] = React.useState(false);
  const {
    user,
    setUser,
    profileDraft,
    setProfileDraft,
    isEditingProfile,
    setIsEditingProfile,
    isSavingProfile,
    setIsSavingProfile,
    isEditingAvatar,
    setIsEditingAvatar,
    isSavingAvatar,
    setIsSavingAvatar,
    avatarDraftFile,
    setAvatarDraftFile,
    avatarDraftPreviewUrl,
    setAvatarDraftPreviewUrl,
    removeAvatarOnSave,
    setRemoveAvatarOnSave,
    fileInputRef,
    queryClient,
    userId,
    authProfileData,
    MAX_AVATAR_SIZE_BYTES,
  } = useUserProfile();

  const joinedDate =
    authProfileData?.createdAt ||
    user?.joinDate ||
    user?.createdAt ||
    user?.joinedAt ||
    user?.created_at;
  const roleLabel =
    authProfileData?.role ||
    user?.activeRole?.roleName ||
    user?.designation ||
    user?.role ||
    user?.jobTitle ||
    profileDraft.role ||
    "";

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[ProfileInfoMobile]", {
        user,
        profileDraft,
        roleLabel,
        joinedDate,
      });
    }
  }, [user, profileDraft, roleLabel, joinedDate]);

  const handleAvatarPick = () => {
    if (!isEditingAvatar || isSavingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event) => {
    if (!isEditingAvatar || isSavingAvatar) return;
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Image size must be 2MB or smaller", {
        position: "top-right",
      });
      event.target.value = "";
      return;
    }
    if (avatarDraftPreviewUrl) URL.revokeObjectURL(avatarDraftPreviewUrl);
    const previewUrl = URL.createObjectURL(selectedFile);
    setAvatarDraftFile(selectedFile);
    setAvatarDraftPreviewUrl(previewUrl);
    setRemoveAvatarOnSave(false);
    event.target.value = "";
  };

  const handleAvatarRemove = () => {
    if (!isEditingAvatar || isSavingAvatar) return;
    if (avatarDraftPreviewUrl) URL.revokeObjectURL(avatarDraftPreviewUrl);
    setAvatarDraftFile(null);
    setAvatarDraftPreviewUrl(null);
    setRemoveAvatarOnSave(true);
  };

  const handleAvatarSave = async () => {
    if (isSavingAvatar) return;
    const shouldUploadNewAvatar = Boolean(avatarDraftFile);
    const shouldRemoveAvatar = Boolean(removeAvatarOnSave && user?.avatar);
    setIsSavingAvatar(true);
    try {
      let updatedProfile = {};
      let actionResponse = null;
      if (shouldUploadNewAvatar) {
        const formData = new FormData();
        formData.append("avatar", avatarDraftFile);
        const avatarResponse = await api.post("/auth/me/avatar", formData);
        actionResponse = avatarResponse?.data;
        updatedProfile = extractPayloadData(avatarResponse.data) || {};
      } else if (shouldRemoveAvatar) {
        const removeResponse = await api.delete("/auth/me/avatar");
        actionResponse = removeResponse?.data;
        updatedProfile = {
          ...(extractPayloadData(removeResponse.data) || {}),
          avatar: null,
        };
      }
      const nextUser = { ...user, ...updatedProfile };
      setUser(nextUser);
      setIsEditingAvatar(false);
      toast.success(
        getResponseMessage(actionResponse, "Profile picture updated successfully")
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile picture",
      );
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleProfileEditToggle = async () => {
    if (!isEditingProfile) {
      setIsEditingProfile(true);
      return;
    }
    setIsSavingProfile(true);
    try {
      const response = await api.patch("/auth/me", {
        name: profileDraft.name?.trim() || user?.name || "",
      });
      const updatedProfile = extractPayloadData(response.data) || {};
      const nextUser = { ...user, ...updatedProfile };
      setUser(nextUser);
      setIsEditingProfile(false);
      toast.success(
        getResponseMessage(response?.data, "Profile updated successfully")
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile"
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const [notificationStatus, setNotificationStatus] = React.useState("default");
  
  React.useEffect(() => {
    const checkStatus = async () => {
      const status = await getNotificationPermissionStatus();
      setNotificationStatus(status);
    };
    checkStatus();
  }, []);

  const handleEnablePush = async () => {
    const sub = await subscribeUserToPush();
    if (sub) {
      toast.success("Push notifications enabled successfully!");
      setNotificationStatus("granted");
    } else {
      toast.error("Failed to enable notifications. Please check your browser settings.");
      const status = await getNotificationPermissionStatus();
      setNotificationStatus(status);
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileDraft({
      name: user?.name || "",
      department: user?.department || "",
      email: user?.email || "",
    });
    setIsEditingProfile(false);
  };

  const displayAvatar =
    avatarDraftPreviewUrl || (removeAvatarOnSave ? null : user?.avatar || null);
  const displayAvatarUrl = resolveAvatarUrl(displayAvatar);
  const departmentLabel =
    profileDraft.department || user?.department || "Department";

  return (
    <div className="relative flex flex-col items-center p-2 rounded-[20px] border border-primary/10 bg-background/95">
      {/* <Toaster position="top-right" richColors /> */}
      <div className="absolute right-4 top-4 flex flex-col items-end">
        <button
          onClick={handleProfileEditToggle}
          disabled={isSavingProfile}
          className="flex items-center justify-center gap-1 rounded-full border border-primary px-2 py-1 text-xs font-semibold text-nav-highlight"
        >
          {isEditingProfile ? "Save" : "Edit"}
          {isSavingProfile ? (
            <Loader2 className="animate-spin" />
          ) : (
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.81007 1.85573L8.49412 3.53977M5.68738 9.71459H10.1782M1.1966 7.4692L0.635254 9.71459L2.88064 9.15324L9.38441 2.64947C9.59489 2.43893 9.71312 2.15342 9.71312 1.85573C9.71312 1.55803 9.59489 1.27252 9.38441 1.06198L9.28786 0.965429C9.07733 0.754956 8.79182 0.636719 8.49412 0.636719C8.19642 0.636719 7.91091 0.754956 7.70037 0.965429L1.1966 7.4692Z"
                stroke="#552E8E"
                stroke-width="1.27012"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          )}
        </button>
        {isEditingProfile && (
          <button
            onClick={handleCancelProfileEdit}
            disabled={isSavingProfile}
            className="mt-2 flex items-center justify-center gap-1 rounded-full border border-table-stroke px-2 py-1 text-xs font-medium text-muted-foreground"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        )}
        {/* <button
          type="button"
          onClick={() => setIsChangePassOpen(true)}
          className="mt-2 flex items-center justify-center gap-1 rounded-full border border-nav-highlight/50 px-2 py-1 text-xs font-semibold text-nav-highlight hover:bg-primary-shade-2"
        >
          Change password
          <MdLockReset className="w-3 h-3" />
        </button> */}
      </div>

      <div className="relative mt-2 border-4 border-primary/15 rounded-full">
        <button
          type="button"
          onClick={
            isEditingAvatar ? handleAvatarPick : () => setIsEditingAvatar(true)
          }
          className="size-28 rounded-full border-2 border-primary overflow-hidden bg-primary-shade-2 flex items-center justify-center"
        >
          {displayAvatarUrl ? (
            <img
              src={displayAvatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-nav-highlight">
              {getInitials(profileDraft.name || user?.name)}
            </span>
          )}
        </button>

        {isEditingAvatar ? (
          <button
            type="button"
            onClick={handleAvatarSave}
            disabled={isSavingAvatar}
            className="absolute -right-1 top-1 size-8 rounded-full bg-nav-highlight text-white inline-flex items-center justify-center shadow-lg hover:opacity-90 disabled:opacity-60"
          >
            {isSavingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingAvatar(true)}
            className="absolute -right-1 top-1 size-8 rounded-full bg-nav-highlight text-white inline-flex items-center justify-center shadow-lg hover:opacity-90"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {isEditingAvatar ? (
          <button
            type="button"
            onClick={() => setIsEditingAvatar(false)}
            className="absolute -left-1 top-1 size-8 rounded-full border border-table-stroke bg-white text-muted-foreground inline-flex items-center justify-center shadow-lg hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}

        {isEditingAvatar && displayAvatar ? (
          <button
            type="button"
            onClick={handleAvatarRemove}
            className="absolute -right-1 bottom-1 size-8 rounded-full border border-white bg-red-600 text-white inline-flex items-center justify-center shadow-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileChange}
        />
      </div>

      <div className="mt-4 text-center w-full">
        {isEditingProfile ? (
          <input
            value={profileDraft.name}
            onChange={(e) =>
              setProfileDraft((p) => ({ ...p, name: e.target.value }))
            }
            className="h-8 border border-table-stroke rounded-xl text-lg font-semibold bg-primary/15 text-center"
          />
        ) : (
          <h2 className="text-[18px] font-semibold text-foreground/75 dark:text-white">
            {user?.name || "-"}
          </h2>
        )}

        <div className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-full bg-[#F9F6FF] dark:bg-primary-shade-2 px-4 py-1.5 text-sm font-semibold text-foreground">
          <span>{roleLabel || "Role not assigned"}</span>
          <span className="rounded-full w-1.5 h-1.5 2xl:w-2 2xl:h-2 bg-primary inline-block"></span>
          <span>{departmentLabel}</span>
        </div>
      </div>

      <div className="mt-3 w-full space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <CalendarDays className="w-4 h-4 text-nav-highlight" />
          <span className="text-sm font-regular text-[#A0A0A1]">
            Joined on {formatDate(joinedDate, DATE_FORMATS.DEFAULT, "-")}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Mail className="w-4 h-4 text-nav-highlight" />
          <span className="text-sm font-regular text-[#A0A0A1]">
            {user?.email || "-"}
          </span>
        </div>
      </div>
       <button
          type="button"
          onClick={() => setIsChangePassOpen(true)}
          className="mt-2 flex items-center justify-center gap-1 rounded-full border border-nav-highlight/50 px-2 py-1 text-xs font-semibold text-nav-highlight hover:bg-primary-shade-2"
        >
          Change password
          <MdLockReset className="w-3 h-3" />
        </button>
        {notificationStatus !== "granted" && (
          <button
            type="button"
            onClick={handleEnablePush}
            className="mt-2 flex items-center justify-center gap-1 rounded-full border border-nav-highlight/50 px-2 py-1 text-xs font-semibold text-nav-highlight hover:bg-primary-shade-2 transition-colors"
          >
            Enable Notifications
            <MdNotificationsOff className="w-3 h-3" />
          </button>
        )}
      <ChangePassModal
        open={isChangePassOpen}
        onOpenChange={setIsChangePassOpen}
      />
    </div>
  );
};

export default ProfileInfoMobile;
