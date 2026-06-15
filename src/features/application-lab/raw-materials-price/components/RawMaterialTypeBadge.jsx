import React from "react";
import StatusBadge from "@/components/ui/StatusBadge";

export const RawMaterialTypeBadge = ({ type }) => {
  // Define colors for raw material types to match the system's aesthetic
  const typeConfigs = {
    Solid: {
      bgColor: "#F1F5F9",
      textColor: "#475569",
    },
    Liquid: {
      bgColor: "#E0F2FE",
      textColor: "#0369A1",
    },
  };

  const config = typeConfigs[type] || typeConfigs.Solid;

  return (
    <StatusBadge
      status={type}
      bgColor={config.bgColor}
      textColor={config.textColor}
      size="sm"
    />
  );
};

export default RawMaterialTypeBadge;
