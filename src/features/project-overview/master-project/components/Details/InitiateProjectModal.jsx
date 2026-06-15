import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select/Select";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const INITIATION_OPTIONS = [
    { value: "proposed", label: "Proposed" },
    { value: "send_to_product_development", label: "Send to Product Development" },
    { value: "send_to_application_lab", label: "Send to Application Lab" },
    { value: "not_feasible", label: "Not Feasible" },
];

export function InitiateProjectModal({ open, onOpenChange, onUpdate, projectData }) {
  const getDefaultAction = () => {
    const { common } = projectData || {};
    
    if (common?.isFeasible === false) {
      return "not_feasible";
    }
    if (common?.sentToApplication === true) {
      return "send_to_application_lab";
    }
    if (common?.sentToPD === true) {
      return "send_to_product_development";
    }
    return "proposed";
  };

  const [formData, setFormData] = useState({
    action: getDefaultAction(),
    brief: projectData?.masterProject?.brief || "",
  });

  useEffect(() => {
    if (open && projectData) {
      const defaultAction = getDefaultAction();
      let defaultBrief = "";
      
      switch (defaultAction) {
        case "proposed":
          defaultBrief = projectData?.masterProject?.brief || "";
          break;
        case "send_to_product_development":
          defaultBrief = projectData?.productDevelopment?.brief || "";
          break;
        case "send_to_application_lab":
          defaultBrief = projectData?.applicationLab?.brief || "";
          break;
        case "not_feasible":
          defaultBrief = projectData?.masterProject?.brief || "";
          break;
        default:
          defaultBrief = "";
      }
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({ action: defaultAction, brief: defaultBrief });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectData]);

  const handleActionChange = (value) => {
    setFormData((prev) => {
      const newData = { ...prev, action: value };

      switch (value) {
        case 'proposed':
          newData.brief = projectData?.masterProject?.brief || "";
          break;
        case 'send_to_product_development':
          newData.brief = projectData?.productDevelopment?.brief || "";
          break;
        case 'send_to_application_lab':
          newData.brief = projectData?.applicationLab?.brief || "";
          break;
        case 'not_feasible':
          newData.brief = projectData?.masterProject?.brief || "";
          break;
        default:
          newData.brief = "";
      }

      return newData;
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    onUpdate?.(formData);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className={cn(
          "max-w-[380px] lg:max-w-[320px] xl:max-w-[355px] 2xl:max-w-[400px] 3xl:max-w-[500px] gap-0 p-5 lg:p-2 xl:p-3 2xl:p-4 3xl:p-5 rounded-2xl 3xl:rounded-2xl 2xl:rounded-xl xl:rounded-lg lg:rounded-md"
        )}
      >
        <ModalHeader className="mb-4 lg:mb-1.5 xl:mb-2 2xl:mb-3 3xl:mb-4">
          <ModalTitle className="text-lg lg:text-[9.5px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-center">
            Initiate Project
          </ModalTitle>
        </ModalHeader>

        <div className="grid gap-5 lg:gap-2 xl:gap-3 2xl:gap-4 3xl:gap-5 py-2">
          {/* Action */}
          <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label
              htmlFor="action"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              Action
            </label>
            <Select
              options={INITIATION_OPTIONS}
              placeholder="Select action"
              className="w-full rounded-md bg-primary-shade-2 lg:py-[3px] xl:py-[2px] 2xl:py-[2px] 3xl:py-0 text-base-color text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs h-10 lg:h-6 xl:h-7.5 2xl:h-8.5"
              value={formData.action}
              onChange={(e) => handleActionChange(e.target.value)}
            />
          </div>

          {/* Brief */}
          <div className="flex flex-col space-y-2 lg:space-y-0.5 xl:space-y-1 2xl:space-y-1.5 3xl:space-y-2">
            <label
              htmlFor="brief"
              className="text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs font-normal text-lighter-text"
            >
              Brief
            </label>
            <Input
              type="textarea"
              id="brief"
              value={formData.brief}
              onChange={handleInputChange}
              placeholder="Make low cost Peanut Butter Cake Bar..."
              className="bg-primary-shade-2/20 border-none rounded-md text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs"
              inputClassName="text-base-color h-[150px] lg:h-[80px] xl:h-[105px] 2xl:h-[120px] 3xl:h-[150px] placeholder:text-xs lg:placeholder:text-[8px] xl:placeholder:text-[10px] 2xl:placeholder:text-xs"
            />
          </div>
        </div>

        <ModalFooter className="flex-row gap-5 lg:gap-2 xl:gap-3 2xl:gap-4 3xl:gap-5 mt-4 text-xs lg:text-[6.5px] xl:text-[8.5px] 2xl:text-[9.5px] 3xl:text-xs sm:justify-between h-9 lg:h-5 xl:h-6 2xl:h-7 3xl:h-9">
          <Button
            intent="outline"
            onClick={() => onOpenChange(false)}
            className="w-full border-table-stroke sm:w-1/2 text-base-color"
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={handleSubmit}
            className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
