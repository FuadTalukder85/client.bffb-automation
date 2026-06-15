// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalTitle,
//   ModalFooter,
// } from "@/components/ui/Modal";
// import { Button } from "@/components/ui/Button";
// import { AccordionSelect } from "@/components/ui/Select/AccordionSelect";
// import { Input } from "@/components/ui/Input";

// const INITIATION_OPTIONS = [
//     { value: "proposed", label: "Proposed" },
//     { value: "send_to_product_development", label: "Send to Product Development" },
//     { value: "send_to_application_lab", label: "Send to Application Lab" },
//     { value: "not_feasible", label: "Not Feasible" },
// ];

// export function InitiateProjectModal({ open, onOpenChange, onUpdate, projectData }) {
//   const getDefaultAction = () => {
//     const { common } = projectData || {};
//     console.log('[PD InitiateProjectModal] Determining default action...');
//     console.log('[PD InitiateProjectModal] common:', JSON.stringify(common, null, 2));
//     console.log('[PD InitiateProjectModal] isFeasible:', common?.isFeasible);
//     console.log('[PD InitiateProjectModal] sentToApplication:', common?.sentToApplication);
//     console.log('[PD InitiateProjectModal] sentToPD:', common?.sentToPD);
    
//     if (common?.isFeasible === false) {
//       console.log('[PD InitiateProjectModal] ✅ Returning: not_feasible (isFeasible is false)');
//       return "not_feasible";
//     }
//     if (common?.sentToApplication === true) {
//       console.log('[PD InitiateProjectModal] ✅ Returning: send_to_application_lab (sentToApplication is true)');
//       return "send_to_application_lab";
//     }
//     if (common?.sentToPD === true) {
//       console.log('[PD InitiateProjectModal] ✅ Returning: send_to_product_development (sentToPD is true)');
//       return "send_to_product_development";
//     }
//     console.log('[PD InitiateProjectModal] ✅ Returning: proposed (default)');
//     return "proposed";
//   };

//   const [formData, setFormData] = useState({
//     action: getDefaultAction(),
//     brief: projectData?.masterProject?.brief || "",
//   });

//   useEffect(() => {
//     if (open && projectData) {
//       const defaultAction = getDefaultAction();
//       let defaultBrief = "";
      
//       switch (defaultAction) {
//         case "proposed":
//           defaultBrief = projectData?.masterProject?.brief || "";
//           break;
//         case "send_to_product_development":
//           defaultBrief = projectData?.productDevelopment?.brief || "";
//           break;
//         case "send_to_application_lab":
//           defaultBrief = projectData?.applicationLab?.brief || "";
//           break;
//         case "not_feasible":
//           defaultBrief = projectData?.masterProject?.brief || "";
//           break;
//         default:
//           defaultBrief = "";
//       }
      
//       setFormData({ action: defaultAction, brief: defaultBrief });
//     }
//   }, [open, projectData]);

//   const handleActionChange = (event) => {
//     const { id, value } = event.target;
//     setFormData((prev) => {
//       const newData = { ...prev, [id]: value };

//       if (id === 'action') {
//         switch (value) {
//           case 'proposed':
//             newData.brief = projectData?.masterProject?.brief || "";
//             break;
//           case 'send_to_product_development':
//             newData.brief = projectData?.productDevelopment?.brief || "";
//             break;
//           case 'send_to_application_lab':
//             newData.brief = projectData?.applicationLab?.brief || "";
//             break;
//           case 'not_feasible':
//             newData.brief = projectData?.masterProject?.brief || "";
//             break;
//           default:
//             newData.brief = "";
//         }
//       }

//       return newData;
//     });
//   };

//   const handleInputChange = (e) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({ ...prev, [id]: value }));
//   };

//   const handleSubmit = () => {
//     onUpdate?.(formData);
//     onOpenChange(false);
//   };

//   return (
//     <Modal open={open} onOpenChange={onOpenChange}>
//       <ModalContent className="sm:max-w-[500px] gap-0 px-5 py-5 rounded-2xl">
//         <ModalHeader className="mb-4">
//           <ModalTitle className="text-lg font-semibold text-center">
//             Initiate Project
//           </ModalTitle>
//         </ModalHeader>

//         <div className="grid gap-5 py-2">
//           {/* Action */}
//           <div className="flex flex-col space-y-2">
//             <label
//               htmlFor="action"
//               className="text-xs font-normal text-lighter-text"
//             >
//               Action
//             </label>
//             <AccordionSelect
//               id="action"
//               value={formData.action}
//               onChange={handleActionChange}
//               options={INITIATION_OPTIONS}
//               className=" text-base-color"
//             />
//           </div>

//           {/* Brief */}
//           <div className="flex flex-col space-y-2">
//             <label
//               htmlFor="brief"
//               className="text-xs font-normal text-lighter-text"
//             >
//               Brief
//             </label>
//             <Input
//               type="textarea"
//               id="brief"
//               value={formData.brief}
//               onChange={handleInputChange}
//               placeholder="Make low cost Peanut Butter Cake Bar..."
//               rows={6}
//               className="bg-primary-shade-2/20 border-none min-h-[150px] rounded-md"
//               inputClassName="text-base-color"
//             />
//           </div>
//         </div>

//         <ModalFooter className="flex-row gap-5 mt-4 text-xs sm:justify-between h-9">
//           <Button
//             intent="outline"
//             onClick={() => onOpenChange(false)}
//             className="w-full border-table-stroke sm:w-1/2 text-base-color "
//           >
//             Cancel
//           </Button>
//           <Button
//             intent="primary"
//             onClick={handleSubmit}
//             className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
//           >
//             Update
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// }
