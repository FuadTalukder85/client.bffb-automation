import React from "react";
import { UserProfileProvider } from "./UserProfileContext";
import UserProfilePageContent from "./UserProfilePageContent";

const UserProfilePage = () => {
  return (
    <UserProfileProvider>
      <UserProfilePageContent />
    </UserProfileProvider>
  );
};

export default UserProfilePage;
