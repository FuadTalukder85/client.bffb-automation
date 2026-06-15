import React from "react";
import DesktopShelfLifeTestRecordView from "./DesktopShelfLifeTestRecordView";
import MobileShelfLifeTestRecordView from "./MobileShelfLifeTestRecordView";
import { useShelfLifeTestRecordLogic } from "./useShelfLifeTestRecordLogic";

export default function ShelfLifeTestRecord() {
  const {
    sampleId,
    isMobile,
    record,
    mockRecord,
    isLoading,
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    handleBack,
    handleDownload,
    onAddEntry,
    onArchiveEntry,
    onRestoreEntry,
    onUpdateEntry,
    onSaveDraft,
    onSubmit,
    setMockRecord,
    isSubmitted,
    canManage,
  } = useShelfLifeTestRecordLogic();

  const commonProps = {
    sampleId,
    record,
    mockRecord,
    handleBack,
    handleDownload,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    onAddEntry,
    onArchiveEntry,
    onRestoreEntry,
    onUpdateEntry,
    onSaveDraft,
    onSubmit,
    setMockRecord,
    isSubmitted,
    isLoading,
    canManage,
  };

  if (isMobile) {
    return (
      <MobileShelfLifeTestRecordView 
        {...commonProps} 
      />
    );
  }

  return (
    <DesktopShelfLifeTestRecordView 
      {...commonProps} 
    />
  );
}
