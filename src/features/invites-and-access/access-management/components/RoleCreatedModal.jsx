import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FaFileMedical } from "react-icons/fa";

const RoleCreatedModal = ({ isOpen, onClose, roleName }) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-[425px] rounded-2xl flex flex-col items-center justify-center text-center p-8 gap-6">
        <ModalHeader className="flex flex-col items-center gap-2">
          <ModalTitle className="text-xl font-bold text-base-color">
            New Role Added
          </ModalTitle>
        </ModalHeader>

        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#552e8e] text-white">
          <FaFileMedical className="w-8 h-8" />
        </div>

        <ModalDescription className="text-base text-center text-base-color">
          <span className="font-bold text-base-color">{roleName}</span> Role was
          created successfully.
        </ModalDescription>

        <ModalFooter className="w-full sm:justify-center">
          <Button
            onClick={onClose}
            className="w-full sm:w-40 bg-[#552e8e] hover:bg-[#4a287a] text-white rounded-lg py-2"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoleCreatedModal;
