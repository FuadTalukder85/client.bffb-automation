import React from "react";
import { Eye } from "lucide-react";
import { cn, getDaysSince } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { InfoTable } from "@/features/invites-and-access/components/InfoTable";
import { ExpandableCard } from "@/components/ui/ExpandableCard";
import { getStatusColor } from "@/constants/statusColors";
import { GoPlus } from "react-icons/go";

export default function MobileApplicationRecipesCard({ 
    project, 
    serialNumber, 
    onViewDetails,
    onCreateRecipe,
    className 
}) {
    const hasRecipe = project.latestRecipe != null;

    // Map the project data to match the card format (flat API structure)
    const adaptedProject = {
        serialNumber,
        projectCode: project.projectCode || "N/A",
        projectName: project.projectName || "N/A",
        raisedDate: project.raisedDate || null,
        recipeCreatedAt: project.latestRecipe?.createdAt || null,
        recipeCode: project.latestRecipe?.recipeCode || "N/A",
        recipeName: project.latestRecipe?.recipeName || "N/A",
        category: (() => {
            const cat = project.applicationCategory;
            if (typeof cat === 'object' && cat !== null) {
                return cat.name || "N/A";
            }
            return cat || "N/A";
        })(),
        subcategory: (() => {
            const subcat = project.applicationSubCategory;
            if (typeof subcat === 'object' && subcat !== null) {
                return subcat.name || "N/A";
            }
            return subcat || "N/A";
        })(),
        subSubcategory: (() => {
            const subsubcat = project.applicationSubSubCategory;
            if (typeof subsubcat === 'object' && subsubcat !== null) {
                return subsubcat.name || "N/A";
            }
            return subsubcat || "N/A";
        })(),
        tags: project.applicationTags || [],
        productDevelopmentStatus: project.pdStatus || "Not Started",
        applicationDevelopmentStatus: project.applicationDevelopmentStatus || "Not Started",
        sensoryStatus: project.sensoryStatus || "Not Started",
        bdStatus: project.bdStatus || "Not Started",
        projectStatus: project.projectStatus || "Not Started",
        statusChangedAt: project.statusChangedAt || {},
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const actionButton = hasRecipe ? {
        key: "view",
        icon: (props) => <Eye {...props} className={cn("action-button-icon", props.className)} />,
        onClick: () => onViewDetails?.(project),
        title: "View",
        className:
            "flex-1 text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2",
        iconSize: "w-5 h-5",
    } : {
        key: "create",
          icon: (props) => <GoPlus className={cn("action-button-icon", props.className)} />,
        onClick: () => onCreateRecipe?.(project),
        title: "Create Recipe",
        className:
            "flex-1 text-base-color hover:bg-primary-shade-3 bg-background border border-primary-shade-2",
        iconSize: "w-5 h-5",
    };

    return (
        <ExpandableCard
            className={cn("md:hidden p-3 my-4 rounded-xl bg-background", className)}
        >
            <ExpandableCard.Content initialHeight={140}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-primary-shade-2 text-nav-highlight">
                        <span className="text-sm font-semibold">{serialNumber}</span>
                    </div>

                    <div className="flex flex-1">
                        <h3 className="text-sm font-semibold text-lighter-text line-clamp-1">
                            {adaptedProject.projectCode}
                        </h3>
                    </div>
                </div>

                <InfoTable>
                    <InfoTable.Row label="Project Name">
                        <div className="font-medium text-right">
                            {adaptedProject.projectName}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Raised Date">
                        <div className="font-medium text-right">
                            {formatDate(adaptedProject.raisedDate)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Latest Recipe Creation Date">
                        <div className="font-medium text-right">
                            {formatDate(adaptedProject.recipeCreatedAt)}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Recipe Code">
                        <div className="font-medium text-right">
                            {adaptedProject.recipeCode}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Recipe Name">
                        <div className="font-medium text-right">
                            {adaptedProject.recipeName}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Category">
                        <div className="font-medium text-right">
                            {adaptedProject.category}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Subcategory">
                        <div className="font-medium text-right">
                            {adaptedProject.subcategory}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Sub-subcategory">
                        <div className="font-medium text-right">
                            {adaptedProject.subSubcategory}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Tags">
                        <div className="flex flex-wrap justify-end gap-1">
                            {adaptedProject.tags.length > 0 ? (
                                adaptedProject.tags.map((tag, index) => {
                                    const tagName = typeof tag === 'object' && tag !== null 
                                        ? (tag.name || tag.label || tag.value || String(tag))
                                        : String(tag);
                                    return (
                                        <span
                                            key={index}
                                            className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                        >
                                            {tagName}
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-muted-foreground">N/A</span>
                            )}
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Product Development Status">
                        <div className="flex justify-end">
                            <div className="flex flex-col items-center gap-1">
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.productDevelopmentStatus)}
                                >
                                    {adaptedProject.productDevelopmentStatus}
                                </span>
                                {adaptedProject.statusChangedAt?.productDevelopmentStatus && (
                                    <span className="text-[10px] text-muted-foreground opacity-70">
                                        {getDaysSince(adaptedProject.statusChangedAt.productDevelopmentStatus) ?? 0} days
                                    </span>
                                )}
                            </div>
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Application Development Status">
                        <div className="flex justify-end">
                            <div className="flex flex-col items-center gap-1">
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.applicationDevelopmentStatus)}
                                >
                                    {adaptedProject.applicationDevelopmentStatus}
                                </span>
                                {adaptedProject.statusChangedAt?.applicationLabStatus && (
                                    <span className="text-[10px] text-muted-foreground opacity-70">
                                        {getDaysSince(adaptedProject.statusChangedAt.applicationLabStatus) ?? 0} days
                                    </span>
                                )}
                            </div>
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Sensory Status">
                        <div className="flex justify-end">
                            <div className="flex flex-col items-center gap-1">
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.sensoryStatus)}
                                >
                                    {adaptedProject.sensoryStatus}
                                </span>
                                {adaptedProject.statusChangedAt?.sensoryLabStatus && (
                                    <span className="text-[10px] text-muted-foreground opacity-70">
                                        {getDaysSince(adaptedProject.statusChangedAt.sensoryLabStatus) ?? 0} days
                                    </span>
                                )}
                            </div>
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Business Development Status">
                        <div className="flex justify-end">
                            <div className="flex flex-col items-center gap-1">
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.bdStatus)}
                                >
                                    {adaptedProject.bdStatus}
                                </span>
                                {adaptedProject.statusChangedAt?.businessDevelopmentStatus && (
                                    <span className="text-[10px] text-muted-foreground opacity-70">
                                        {getDaysSince(adaptedProject.statusChangedAt.businessDevelopmentStatus) ?? 0} days
                                    </span>
                                )}
                            </div>
                        </div>
                    </InfoTable.Row>

                    <InfoTable.Row label="Project Status">
                        <div className="flex justify-end">
                            <div className="flex flex-col items-center gap-1">
                                <span
                                    className="px-3 py-1 text-xs font-medium rounded-full"
                                    style={getStatusColor(adaptedProject.projectStatus)}
                                >
                                    {adaptedProject.projectStatus}
                                </span>
                                {adaptedProject.statusChangedAt?.masterProjectStatus && (
                                    <span className="text-[10px] text-muted-foreground opacity-70">
                                        {getDaysSince(adaptedProject.statusChangedAt.masterProjectStatus) ?? 0} days
                                    </span>
                                )}
                            </div>
                        </div>
                    </InfoTable.Row>
                </InfoTable>
            </ExpandableCard.Content>

            <ExpandableCard.Footer className="pt-2">
                <ExpandableCard.FooterLeft>
                    <ButtonGroup buttons={[actionButton]} gap="gap-0" fullWidth />
                </ExpandableCard.FooterLeft>
                <ExpandableCard.FooterRight>
                    <ExpandableCard.ToggleButton />
                </ExpandableCard.FooterRight>
            </ExpandableCard.Footer>
        </ExpandableCard>
    );
}
