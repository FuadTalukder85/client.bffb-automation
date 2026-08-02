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

const ProfileTextField = ({
  value,
  onChange,
  isEditing,
  className = "",
  editClassName = "",
  placeholder = "",
}) => {
  if (!isEditing) {
    return <p className={className}>{value || "-"}</p>;
  }

  return (
    <input
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={`h-6 block rounded-md border border-table-stroke bg-primary/15 px-2 text-sm text-foreground outline-none focus:border-nav-highlight/40 ${editClassName}`}
    />
  );
};

const ProfileInfoDesktop = () => {
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
      console.debug("[ProfileInfoDesktop]", {
        user,
        profileDraft,
        roleLabel,
        joinedDate,
      });
    }
  }, [user, profileDraft, roleLabel, joinedDate]);

  const updateProfileMeCache = (nextProfile) => {
    if (!userId || !nextProfile || typeof nextProfile !== "object") return;
    queryClient.setQueryData(["profile", "me", userId], (previous) => {
      // simplified cache update logic
      return { ...previous, data: nextProfile };
    });
  };

  const handleAvatarPick = () => {
    // if (!isEditingAvatar || isSavingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event) => {
    if (!isEditingAvatar || isSavingAvatar) return;
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      event.target.value = "";
      return;
    }
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

  const handleAvatarEditStart = () => {
    if (isSavingAvatar) return;
    setIsEditingAvatar(true);
  };

  const handleAvatarEditCancel = () => {
    if (isSavingAvatar) return;
    if (avatarDraftPreviewUrl) URL.revokeObjectURL(avatarDraftPreviewUrl);
    setAvatarDraftFile(null);
    setAvatarDraftPreviewUrl(null);
    setRemoveAvatarOnSave(false);
    setIsEditingAvatar(false);
  };

  const handleAvatarSave = async () => {
    if (isSavingAvatar) return;
    const shouldUploadNewAvatar = Boolean(avatarDraftFile);
    const shouldRemoveAvatar = Boolean(removeAvatarOnSave && user?.avatar);
    if (!shouldUploadNewAvatar && !shouldRemoveAvatar) {
      setIsEditingAvatar(false);
      return;
    }
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
      updateProfileMeCache(nextUser);
      if (avatarDraftPreviewUrl) URL.revokeObjectURL(avatarDraftPreviewUrl);
      setAvatarDraftFile(null);
      setAvatarDraftPreviewUrl(null);
      setRemoveAvatarOnSave(false);
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

  const handleProfileInputChange = (key, value) => {
    setProfileDraft((previous) => ({ ...previous, [key]: value }));
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
      updateProfileMeCache(nextUser);
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
      role: user?.role || "",
    });
    setIsEditingProfile(false);
  };

  const displayAvatar =
    avatarDraftPreviewUrl || (removeAvatarOnSave ? null : user?.avatar || null);
  const displayAvatarUrl = resolveAvatarUrl(displayAvatar);

  return (
    <div className="3xl:p-3 2xl:p-2 xl:p-1.5 lg:p-1 p-1 3xl:rounded-2xl 2xl:rounded-xl xl:rounded-lg lg:rounded-md rounded-md border border-table-stroke bg-[#F6F2FF] dark:bg-[#252130]">
      {/* <Toaster position="top-right" richColors /> */}
      <div className="flex flex-col 3xl:gap-3 2xl:gap-2 xl:gap-2 lg:gap-1.5 gap-1 md:flex-row md:items-stretch">
        <div className="flex items-center justify-center 3xl:rounded-2xl 2xl:rounded-xl xl:rounded-lg lg:rounded-md rounded-md bg-white dark:bg-background 3xl:w-44 2xl:w-35 xl:w-31 lg:w-24 w-20">
          <div className="relative 3xl:my-3 2xl:my-2.5 xl:my-2 lg:my-1.5 my-1.5 3xl:border-4 2xl:border-4 lg:border-2 border-primary/20 rounded-full">
            <button
              type="button"
              onClick={handleAvatarPick}
              disabled={!isEditingAvatar || isSavingAvatar}
              className={`3xl:size-24 2xl:size-[76px] xl:size-[68px] lg:size-[52px] size-[42px] rounded-full border-2 border-primary overflow-hidden bg-primary-shade-2 flex items-center justify-center ${isEditingAvatar ? "cursor-pointer" : "cursor-default"
                }`}
            >
              {displayAvatarUrl ? (
                <img
                  src={displayAvatarUrl}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs lg:text-sm xl:text-lg 2xl:text-xl 3xl:text-2xl font-semibold text-nav-highlight">
                  {getInitials(profileDraft.name || user?.name)}
                </span>
              )}
            </button>

            {isEditingAvatar ? (
              <button
                type="button"
                onClick={handleAvatarSave}
                disabled={isSavingAvatar}
                className="absolute -right-1 top-1 3xl:size-7 2xl:size-5.5 xl:size-5 lg:size-4 size-4 rounded-full bg-nav-highlight text-white inline-flex items-center justify-center shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {isSavingAvatar ? (
                  <Loader2 className="3xl:w-3.5 2xl:w-3 xl:w-3 lg:w-2.5 3xl:h-3.5 2xl:h-3 xl:h-3 lg:h-2.5 animate-spin" />
                ) : (
                  <Save className="3xl:w-3.5 2xl:w-3 xl:w-3 lg:w-2.5 3xl:h-3.5 2xl:h-3 xl:h-3 lg:h-2.5" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleAvatarEditStart();
                  handleAvatarPick();
                }}
                className="absolute -right-1 top-1 3xl:size-7 2xl:size-5.5 xl:size-5 lg:size-4 size-4 rounded-full bg-nav-highlight text-white inline-flex items-center justify-center shadow-sm hover:opacity-90"
              >
                <Pencil className="3xl:w-3.5 2xl:w-3 xl:w-3 lg:w-2.5 w-2 3xl:h-3.5 2xl:h-3 xl:h-3 lg:h-2.5 h-2 " />
              </button>
            )}

            {isEditingAvatar ? (
              <button
                type="button"
                onClick={handleAvatarEditCancel}
                disabled={isSavingAvatar}
                className="absolute -left-1 top-1 3xl:size-7 2xl:size-6 xl:size-6 lg:size-5 rounded-full border border-table-stroke bg-background text-muted-foreground inline-flex items-center justify-center shadow-sm hover:text-foreground disabled:opacity-60"
              >
                <X className="3xl:w-3.5 2xl:w-3 xl:w-2.5 lg:w-2 3xl:h-3.5 2xl:h-3 xl:h-2.5 lg:h-2" />
              </button>
            ) : null}

            {isEditingAvatar && displayAvatar ? (
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={isSavingAvatar}
                className="absolute -right-1 bottom-1 3xl:size-8 2xl:size-7 xl:size-7 lg:size-6 rounded-full border-2 border-white bg-red-600 text-white inline-flex items-center justify-center shadow-lg hover:bg-red-700 disabled:opacity-60"
              >
                <Trash2 className="3xl:w-3.5 2xl:w-3 xl:w-3 lg:w-2.5 3xl:h-3.5 2xl:h-3 xl:h-3 lg:h-2.5" />
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
        </div>

        <div
          // className="flex-1 rounded-xl p-3 bg-[url('/profile-bg.png')] bg-cover bg-center"
          className="relative overflow-hidden flex-1 3xl:rounded-xl 2xl:rounded-lg xl:rounded-md lg:rounded-md 3xl:p-3 2xl:p-2 xl:p-1.5 lg:p-1 p-1 bg-white dark:bg-background"
        >
          <div className="absolute right-0 3xl:top-20 2xl:top-16 xl:top-14 lg:top-12 h-[160px] 3xl:w-[160px] 2xl:w-[140px] xl:w-[120px] lg:w-[100px] rounded-full 3xl:border-14 2xl:border-12 xl:border-10 lg:border-8 border-[#F6F2FF] dark:border-[#252130]"></div>
          <div className="absolute -right-16 3xl:top-14 2xl:top-12 xl:top-10 lg:top-8 h-[160px] 3xl:w-[160px] 2xl:w-[140px] xl:w-[120px] lg:w-[100px] rounded-full 3xl:border-14 2xl:border-12 xl:border-10 lg:border-8 border-[#F6F2FF] dark:border-[#252130]"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <ProfileTextField
                  value={profileDraft.name}
                  isEditing={isEditingProfile}
                  onChange={(event) =>
                    handleProfileInputChange("name", event.target.value)
                  }
                  className="3xl:text-[18px] 2xl:text-[14px] xl:text-[13px] lg:text-[10px] text-[8px] font-semibold text-foreground/75 dark:text-white truncate 3xl:rounded-full 2xl:rounded-lg xl:rounded-md lg:rounded-sm"
                  editClassName="3xl:text-[18px] 2xl:text-[14px] xl:text-[13px] lg:text-[10px] font-semibold text-foreground/75 dark:text-white truncate 3xl:h-7 2xl:h-6 xl:h-5 lg:h-4.5 3xl:rounded-full 2xl:rounded-lg xl:rounded-md lg:rounded-sm"
                  placeholder="Name"
                />
                <div className="3xl:mt-1 2xl:mt-1 xl:mt-0.5 lg:mt-0 inline-flex flex-wrap items-center gap-0.5 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2 rounded-full bg-[#F9F6FF] dark:bg-primary-shade-2 px-2 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-0.5 lg:py-0.5 xl:py-0.5 2xl:py-1 3xl:py-1.5 text-[6.5px] lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-foreground">
                  <span>{roleLabel || "Role not assigned"}</span>
                  <span className="rounded-full w-0.5 h-0.5 lg:w-0.5 xl:w-1 2xl:w-1.5 3xl:w-2 lg:h-0.5 xl:h-1 2xl:h-1.5 3xl:h-2 bg-primary inline-block"></span>
                  <span>{profileDraft.department || "Department not assigned"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-0.5 xl:gap-1 2xl:gap-1.5 3xl:gap-2">
                {isEditingProfile && (
                  <button
                    onClick={handleCancelProfileEdit}
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-1 rounded-full border border-table-stroke px-3 3xl:py-1 2xl:py-[3px] xl:py-[2px] lg:py-[2px] py-[1px] 3xl:text-xs 2xl:text-[10px] xl:text-[9px] lg:text-[7px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    <X className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5" />
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleProfileEditToggle}
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-1 rounded-full border border-nav-highlight/50 3xl:px-3 2xl:px-2.5 xl:px-2 lg:px-1.5 px-1 3xl:py-1 2xl:py-[3px] xl:py-[2px] lg:py-[2px] py-[1px] 3xl:text-xs 2xl:text-[10px] xl:text-[9px] lg:text-[7px] text-[6px] font-semibold text-nav-highlight hover:bg-primary-shade-2"
                >
                  {isEditingProfile ? "Save" : "Edit"}
                  {isSavingProfile ? (
                    <Loader2 className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 w-1 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5 h-1.5 animate-spin" />
                  ) : isEditingProfile ? (
                    <Save className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 w-1 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5 h-1.5" />
                  ) : (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 w-1 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5 h-1"
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
                <button
                  type="button"
                  onClick={() => setIsChangePassOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-nav-highlight/50 3xl:px-3 2xl:px-2.5 xl:px-2 lg:px-1.5 px-1 3xl:py-1 2xl:py-[3px] xl:py-[2px] lg:py-[2px] py-[1px] 3xl:text-xs 2xl:text-[10px] xl:text-[9px] lg:text-[7px] text-[6px] font-semibold text-nav-highlight hover:bg-primary-shade-2"
                >
                  Change password
                  <MdLockReset className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5" />
                </button>
                {notificationStatus !== "granted" && (
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    className="inline-flex items-center gap-1 rounded-full border border-nav-highlight/50 3xl:px-3 2xl:px-2.5 xl:px-2 lg:px-1.5 px-1 3xl:py-1 2xl:py-[3px] xl:py-[2px] lg:py-[2px] py-[1px] 3xl:text-xs 2xl:text-[10px] xl:text-[9px] lg:text-[7px] text-[6px] font-semibold text-nav-highlight hover:bg-primary-shade-2 transition-colors"
                  >
                    Enable Notifications
                    <MdNotificationsOff className="3xl:w-3 2xl:w-2.5 xl:w-2 lg:w-1.5 3xl:h-3 2xl:h-2.5 xl:h-2 lg:h-1.5" />
                  </button>
                )}
              </div>

            </div>

            <div className="3xl:mt-3 2xl:mt-2.5 xl:mt-2 lg:mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 3xl:text-xs 2xl:text-[10px] xl:text-[8px] lg:text-[6px] text-[#A0A0A1]">
              <p className="inline-flex items-center gap-1">
                <CalendarDays className="3xl:w-3.5 2xl:w-3 xl:w-2.5 lg:w-2 3xl:h-3.5 2xl:h-3 xl:h-2.5 lg:h-2 text-nav-highlight" />
                Joined {formatDate(joinedDate, DATE_FORMATS.DEFAULT, "-")}
              </p>
              <p className="inline-flex items-center gap-1 min-w-0">
                <Mail className="3xl:w-3.5 2xl:w-3 xl:w-2.5 lg:w-2 3xl:h-3.5 2xl:h-3 xl:h-2.5 lg:h-2 text-nav-highlight shrink-0" />
                <span className="truncate">{profileDraft.email || "-"}</span>
              </p>
            </div>
          </div>
        </div>
        <ChangePassModal
          open={isChangePassOpen}
          onOpenChange={setIsChangePassOpen}
        />
      </div>
    </div>
  );
};

export default ProfileInfoDesktop;
