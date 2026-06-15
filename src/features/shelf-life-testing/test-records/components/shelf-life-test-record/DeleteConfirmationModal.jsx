import React from "react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmationModal({ open, onOpenChange, onConfirm, title, description }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md text-center">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">{title || "Delete Item"}</h2>
          <p className="text-gray-500 mb-6 px-4">
            {description || "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
          <div className="flex justify-center gap-4 w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="w-full bg-primary text-white">
              Confirm
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}