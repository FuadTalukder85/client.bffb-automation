import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { dummyTasks } from "../../data/dummy-data";
import { cn } from "@/lib/utils";
import { ReassignSuccess } from "./ReassignSuccess";

export function ReassignTasksModal({
  open,
  onOpenChange,
  onConfirm,
  oldMember,
  newMember,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredTasks = dummyTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTaskToggle = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleConfirm = () => {
    setIsSuccess(true);
  };

  const handleCloseSuccess = () => {
    onConfirm(selectedTasks);
    onOpenChange(false);
    // Reset state after closing (optional, but good practice if modal is reused without unmounting)
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedTasks([]);
      setSearchTerm("");
    }, 300);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[500px] p-6 gap-6 rounded-2xl">
        {!isSuccess ? (
          <>
            <ModalHeader className="space-y-3">
              <ModalTitle className="text-center text-xl font-semibold">
                Reassign Tasks
              </ModalTitle>
              <ModalDescription className="text-center text-sm text-muted-foreground">
                Please choose which tasks to carry forward to the replacement team
                member.
              </ModalDescription>
            </ModalHeader>

            <div className="flex flex-col gap-4">
              <SearchInput
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border border-table-stroke rounded-lg bg-white dark:bg-transparent"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {task.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 w-fit">
                        {task.status}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded border border-gray-300 flex items-center justify-center cursor-pointer transition-colors",
                        selectedTasks.includes(task.id)
                          ? "bg-primary border-primary"
                          : "hover:border-primary"
                      )}
                      onClick={() => handleTaskToggle(task.id)}
                    >
                      {selectedTasks.includes(task.id) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3.5 h-3.5 text-white"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ModalFooter className="flex-row gap-5 mt-2 text-xs sm:justify-between h-9">
              <Button
                intent="outline"
                onClick={() => onOpenChange(false)}
                className="w-full border-table-stroke sm:w-1/2 text-base-color "
              >
                Cancel
              </Button>
              <Button
                intent="primary"
                onClick={handleConfirm}
                className="w-full text-white sm:w-1/2 bg-primary hover:bg-primary/90"
              >
                Save
              </Button>
            </ModalFooter>
          </>
        ) : (
          <ReassignSuccess
            newMemberName={newMember?.name || "New Member"}
            onClose={handleCloseSuccess}
          />
        )}
      </ModalContent>
    </Modal>
  );
}
