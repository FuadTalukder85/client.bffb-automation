import React, { useState } from "react";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { Button } from "@/components/ui/Button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import {
  Eye,
  Trash2,
  Download,
} from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { formatDate } from "@/utils/dateFormatter";
import { ArchiveInDevelopmentRecipeModal } from "./ArchiveInDevelopmentRecipeModal";
import { RestoreInDevelopmentRecipeModal } from "./RestoreInDevelopmentRecipeModal";
import { recipeAPI } from "@/services/recipeService";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { useMobileSelection } from "@/hooks/useMobileSelection";

const MobileInDevelopmentRecipeCard = ({
  recipe,
  serialNumber,
  onRefresh,
  selectedRowIds = [],
  onSelectChange,
}) => {
  const navigate = useNavigate();
  const isArchived = recipe.isActive === false;
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const { isSelected, isSelectionMode, pressHandlers } = useMobileSelection({
    itemId: recipe._id || recipe.id,
    selectedIds: selectedRowIds,
    onSelectChange,
    canSelect: !isArchived,
  });

  const handleViewRecipe = () => {
    const projectId = recipe?.project?._id || recipe?.projectId;
    if (!projectId || !recipe?._id) return;

    navigate(`/application-lab/application-recipes/version/${recipe._id}`, {
      state: {
        projectId,
        recipeId: recipe._id,
        format: recipe?.recipeType,
        returnTo: "/application-recipes/in-development-recipes",
      },
    });
  };

  const handleArchiveClick = () => {
    setIsArchiveModalOpen(true);
  };

  const handleRestoreClick = () => {
    setIsRestoreModalOpen(true);
  };

  const handleArchiveConfirm = async (recipeToArchive) => {
    try {
      await recipeAPI.archiveRecipe(recipeToArchive._id);
      setIsArchiveModalOpen(false);
      onRefresh?.();
    } catch (error) {
      console.error("Failed to archive recipe:", error);
    }
  };

  const handleRestoreConfirm = async (recipeToRestore) => {
    try {
      await recipeAPI.restoreRecipe(recipeToRestore._id);
      setIsRestoreModalOpen(false);
      onRefresh?.();
    } catch (error) {
      console.error("Failed to restore recipe:", error);
    }
  };

  return (
    <div
      {...pressHandlers}
      className={cn(
        "relative w-full my-4 select-none cursor-pointer rounded-xl transition-all duration-200",
        isSelected ? "scale-[0.99] shadow-lg" : ""
      )}
    >
      {isSelected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none border border-primary bg-primary/[0.06] z-10 animate-in fade-in duration-200" />
      )}
      <ExpandableCard className="p-3 rounded-xl bg-background w-full">
        {/* Content */}
        <ExpandableCard.Content initialHeight={140}>
          {/* Header Section with Serial and Title */}
          <div className="flex items-center gap-3 mb-3">
            {isSelectionMode ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary-shade-2 text-nav-highlight">
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary-shade-2 text-nav-highlight">
                <span className="text-sm font-semibold">{serialNumber}</span>
              </div>
            )}

            {/* Recipe Name - Right aligned with line clamp */}
            <div className="flex">
              <h3 className="text-sm font-semibold text-lighter-text line-clamp-1">
                {recipe.recipeCode}
              </h3>
            </div>

            <div className="flex-1 text-right">
              <h3 className="text-sm font-semibold line-clamp-1">
                {formatDate(recipe.createdAt)}
              </h3>
            </div>
          </div>

          {/* Recipe Info */}
          <InfoTable>
            <InfoTable.Row label="Recipe Name">
              <div className="font-semibold text-right text-base-color">
                <span className="">{recipe.name}</span>
              </div>
            </InfoTable.Row>

            <InfoTable.Row label="Project Details">
              <div className="flex flex-col gap-1 py-1">
                <div className="font-semibold text-right text-base-color">
                  {recipe.project?.masterProject?.title || "N/A"}
                </div>
                <div className="text-sm font-semibold text-right text-lighter-text">
                  {recipe.project?.masterProject?.code || "N/A"}
                </div>
              </div>
            </InfoTable.Row>

            <InfoTable.Row label="Categories">
              <div className="flex gap-1 text-xs text-right text-base-color">
                <span className="p-1 border rounded-3xl">
                  {recipe.category?.name || "N/A"}
                </span>
                <span className="p-1 border rounded-3xl">
                  {recipe.subCategory?.name || "N/A"}
                </span>
                {(() => {
                  const sscs = Array.isArray(recipe.subSubCategories) && recipe.subSubCategories.length > 0
                    ? recipe.subSubCategories
                    : (recipe.subSubCategory ? [recipe.subSubCategory] : []);
                  return sscs.length > 0 ? (
                    sscs.map((ssc, idx) => (
                      <span key={idx} className="p-1 border rounded-3xl">
                        {ssc.name}
                      </span>
                    ))
                  ) : (
                    <span className="p-1 border rounded-3xl">N/A</span>
                  );
                })()}
              </div>
            </InfoTable.Row>

            <InfoTable.Row label="Tags">
              <div className="font-semibold text-right text-base-color">
                {recipe.tags && recipe.tags.length > 0 ? (
                  <div className="flex flex-wrap justify-end gap-1">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-primary-shade-2 text-primary rounded-3xl"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  "N/A"
                )}
              </div>
            </InfoTable.Row>
          </InfoTable>
        </ExpandableCard.Content>

        {/* Footer */}
        {!isSelectionMode && (
          <ExpandableCard.Footer className="pt-2">
            <ExpandableCard.FooterLeft>
              {isArchived ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRestoreClick}
                  className="w-10 border rounded-md text-nav-highlight h-9 border-primary-shade-2 bg-primary-shade-2 hover:bg-primary-shade-2/80"
                >
                  <AiFillThunderbolt className="w-5 h-5" />
                </Button>
              ) : (
                <ButtonGroup
                  buttons={[
                    {
                      key: "view",
                      icon: (props) => <Eye {...props} className={cn("action-button-icon", props.className)} />,
                      onClick: handleViewRecipe,
                      title: "View",
                      className:
                        "rounded-r-none flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
                      iconSize: "w-5 h-5",
                    },
                    {
                      key: "delete",
                      icon: (props) => <svg {...props} className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>,
                      onClick: handleArchiveClick,
                      title: "Delete",
                      className:
                        "rounded-l-none flex-1 text-base-color hover:bg-gray-50 bg-background border border-nav-highlight/15 border-l-table-stroke",
                      iconSize: "w-5 h-5",
                    },
                  ]}
                  gap="gap-0"
                  fullWidth
                />
              )}
            </ExpandableCard.FooterLeft>
            <ExpandableCard.FooterRight>
              <ExpandableCard.ToggleButton />
            </ExpandableCard.FooterRight>
          </ExpandableCard.Footer>
        )}
      </ExpandableCard>

      <ArchiveInDevelopmentRecipeModal
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        recipe={recipe}
        onConfirm={handleArchiveConfirm}
      />

      <RestoreInDevelopmentRecipeModal
        open={isRestoreModalOpen}
        onOpenChange={setIsRestoreModalOpen}
        recipe={recipe}
        onConfirm={handleRestoreConfirm}
      />
    </div>
  );
};

export default MobileInDevelopmentRecipeCard;
