import React from "react";
import { recipeAPI } from "@/services/recipeService";
import { Download, Eye, FileSearchCorner } from "lucide-react";
import { AiFillThunderbolt } from "react-icons/ai";
import { formatDate } from "@/utils/dateFormatter";
import { PaginatedTable, EditableCell, getResponsiveSize } from '@/components/ui/PaginatedTable/PaginatedTable';
import { useNavigate } from "react-router";

export default function DesktopFinalRecipeTable({
  recipes,
  onCellEdit,
  refetch,
  currentPage = 1,
  itemsPerPage = 20,
  totalPages = 1,
  onPageChange,
  onItemsPerPageChange,
  onArchive,
  onRestore,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  columnPinning,
  onColumnPinningChange,
  columnSizing,
  onColumnSizingChange,
  noDataMessage,
  noDataDescription,
  errorMessage,
  hasError,
  isArchived = false,
  selectedRowIds = [],
  onSelectionChange,
  onBulkArchiveClick,
}) {
  const navigate = useNavigate();
  const serialOffset = (currentPage - 1) * itemsPerPage;

  const handleViewRecipe = (recipe) => {
    const projectId = recipe?.project?._id || recipe?.projectId;
    if (!recipe?._id) return;

    navigate(`/application-lab/application-recipes/version/${recipe._id}`, {
      state: {
        projectId: projectId || null,
        recipeId: recipe._id,
        format: recipe?.recipeType,
        returnTo: "/application-recipes/final-recipes",
      },
    });
  };

  const handleCellEdit = async (rowIndex, columnId, value) => {
    try {
      const recipe = recipes[rowIndex];
      await recipeAPI.updateRecipe(recipe._id, { [columnId]: value });
      if (refetch) {
        refetch();
      }
      if (onCellEdit) {
        onCellEdit(rowIndex, columnId, value);
      }
    } catch (error) {
      console.error("Failed to update recipe:", error);
    }
  };

  const columns = [
    {
      id: "serial",
      header: "SL",
      headerClassName: "table-head-cell",
      cell: ({ row }) => (
        <div className="flex items-center justify-center size-6 p-2 2xl:size-8 2xl:p-3 3xl:size-10 3xl:p-4 bg-primary/10 rounded-full">
          <span className="text-nav-highlight">{serialOffset + row.index + 1}</span>
        </div>
      ),
      size: getResponsiveSize({ lg: 32, xl: 43, '2xl': 48, '3xl': 60 }),
      enableSorting: false,
      enableHiding: false,
      enablePinning: true,
    },
    {
      accessorKey: "recipeCode",
      header: "Recipe Code",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => <span className="font-medium text-nav-highlight">{getValue() || "N/A"}</span>,
      size: getResponsiveSize({ lg: 96, xl: 128, '2xl': 144, '3xl': 180 }),
    },
    {
      accessorKey: "name",
      header: "Recipe Name",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => (
        <div className="truncate">{getValue() || "N/A"}</div>
      ),
      size: getResponsiveSize({ lg: 133, xl: 178, '2xl': 200, '3xl': 250 }),
    },
    {
      id: "projectCode",
      header: "Project Code",
      headerClassName: "table-head-cell",
      cell: ({ row }) => (
        <span className="">{row.original.project?.masterProject?.code}</span>
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "project.name",
      header: "Project Name",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => (
        <div className="">{row.original.project?.masterProject?.title || "N/A"}</div>
      ),
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
    },
    {
      accessorKey: "category.name",
      header: "Category",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => (
        <span className="">{row.original.category?.name || "N/A"}</span>
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "subCategory.name",
      header: "Sub Category",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ row }) => (
        <span className="">{row.original.subCategory?.name || "N/A"}</span>
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "subSubCategory.name",
      header: "Sub Subcategory",
      headerClassName: "table-head-cell",
      className: " ",
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      cell: ({ row }) => (
        <span className="">{row.original.subSubCategory?.name || "N/A"}</span>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => {
        const tags = getValue();
        return tags && tags.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-sm px-1 rounded bg-primary-shade-2 text-primary">
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        ) : (
          "N/A"
        );
      },
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      headerClassName: "table-head-cell",
      className: " ",
      cell: ({ getValue }) => (
        <span className="">{formatDate(getValue())}</span>
      ),
      size: getResponsiveSize({ lg: 80, xl: 107, '2xl': 120, '3xl': 150 }),
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "table-head-cell text-center",
      className: " ",
      cell: ({ row }) => {
        const recipe = row.original;
        const isActive = recipe.isActive;

        return (
          <div className="flex items-center justify-end gap-0">
            {isActive ? (
              <>
                <button
                  onClick={() => handleViewRecipe(recipe)}
                  title="View"
                  aria-label="View"
                  className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-l-md text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <Eye className="action-button-icon" />
                </button>
                <button
                  onClick={() => onArchive?.(recipe)}
                  title="Archive"
                  aria-label="Archive"
                  className="action-button flex items-center justify-center gap-1.5 text-sm font-semibold rounded-r-md rounded-l-none text-base-color hover:text-red-600 hover:bg-red-50 bg-background border border-nav-highlight/15 border-l-table-stroke transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <svg className="action-button-icon" xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z"/></svg>
                </button>
              </>
            ) : (
              <button
                onClick={() => onRestore?.(recipe)}
                title="Restore"
                aria-label="Restore"
                className="action-button flex items-center justify-center gap-1.5 w-auto text-sm font-semibold rounded-md text-base-color hover:text-nav-highlight hover:bg-purple-200 bg-primary-shade-2 border border-primary-shade-2 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer"
              >
                <AiFillThunderbolt className="action-button-icon" />
              </button>
            )}
          </div>
        );
      },
      size: getResponsiveSize({ lg: 107, xl: 142, '2xl': 160, '3xl': 200 }),
      enableSorting: false,
      enableHiding: false,
      enablePinning: true,
    },
  ];

  return (
    <div className="w-full md:flex-1 md:flex md:flex-col md:min-h-0">
      <PaginatedTable
        data={recipes}
        columns={columns}
        enableSelection={!isArchived}
        selectedRowIds={selectedRowIds}
        onSelectionChange={onSelectionChange}
        canSelectRow={(item) => item.isActive ?? true}
        onBulkArchiveClick={onBulkArchiveClick}
        className="scroll-smooth transition-all duration-300 md:flex-1 md:min-h-0"
        rowGap={{ '3xl': '16px', '2xl': '13px', xl: '11.5px', lg: '8.5px', normal: '8px' }}
        enableSorting={true}
        enableColumnResizing={true}
        enablePinning={true}
        enableHiding={true}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnPinning={
          columnPinning && (columnPinning.left || columnPinning.right)
            ? columnPinning
            : { left: ["serial"], right: ["actions"] }
        }
        onColumnPinningChange={onColumnPinningChange}
        columnSizing={columnSizing}
        onColumnSizingChange={onColumnSizingChange}
        bodyRowClassName="border-0"
        bodyCellClassName="first:pl-6 last:pr-6 py-0.5"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        noDataMessage={noDataMessage}
        noDataDescription={noDataDescription}
        emptyState={
          hasError ? (
            <div className="py-10 text-center text-red-500">
              {errorMessage}
            </div>
          ) : null
        }
      />
    </div>
  );
}


