import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
} from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { Eye, Search, X, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ViewProductDetailsModalMobile } from "./ViewProductDetailsModalMobile";
import { bffProductCodeService } from "@/services/bffProductCodeService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

// Demo recipe data for the Recipe List section
const DEMO_RECIPES = [
    { id: 1, recipeCode: "REC 012345", recipeName: "Strawberry Jam Cake" },
    { id: 2, recipeCode: "REC 012345", recipeName: "Strawberry Jam Cake" },
    { id: 3, recipeCode: "REC 012345", recipeName: "Strawberry Jam Cake" },
    { id: 4, recipeCode: "REC 012345", recipeName: "Strawberry Jam Cake" },
    { id: 5, recipeCode: "REC 012345", recipeName: "Strawberry Jam Cake" },
];

// Segment display mapping
const segmentDisplayMap = {
    flavours: "Flavours",
    colours: "Colours",
    ingredients: "Ingredients",
    seasonings: "Seasonings",
};

export function ViewProductDetailsModal({
    open,
    onOpenChange,
    productCode,
    className,
}) {
    const handleClose = (isOpen) => {
        onOpenChange(isOpen);
    };

    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!open || !productCode?._id) {
                if (!open) {
                    setRecipes([]);
                    setSearchQuery("");
                }
                return;
            }

            setIsLoading(true);
            try {
                const response = await bffProductCodeService.getRecipesUsingProduct(productCode._id);
                setRecipes(response.data || []);
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipes();
    }, [open, productCode?._id]);

    const isCommercialized = Boolean(productCode?.commercializedProductCode);
    const displayProductCode = productCode?.commercializedProductCode || productCode?.displayProductCode || productCode?.productCode || "N/A";
    const displayName = productCode?.name || "N/A";
    const displaySegment = segmentDisplayMap[productCode?.segment] || productCode?.segment || "N/A";
    const displayStatus = isCommercialized ? "Commercialized" : "Experimental";
    
    const filteredRecipes = recipes.filter(recipe => 
        recipe.recipeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.recipeName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayRecipes = filteredRecipes;

    return (
        <Modal open={open} onOpenChange={handleClose}>
            {isMobile ? (
                <ViewProductDetailsModalMobile
                    displayProductCode={displayProductCode}
                    displayName={displayName}
                    displaySegment={displaySegment}
                    displayStatus={displayStatus}
                    remarks={productCode?.remarks}
                    recipes={displayRecipes}
                    isLoading={isLoading}
                    onClose={handleClose}
                    className={className}
                />
            ) : (
                <ModalContent
                    className={cn(
                        "max-w-[500px] sm:max-w-[600px] lg:max-w-[746px]! xl:max-w-[996px]! 2xl:max-w-[1120px]! 3xl:max-w-[1400px]! gap-0 px-6 py-6 md:px-6 lg:px-6! xl:px-7! 2xl:px-8! 3xl:px-10! md:py-6 lg:py-5! xl:py-6! 2xl:py-7! 3xl:py-8! rounded-2xl md:rounded-lg lg:rounded-xl! xl:rounded-2xl! 2xl:rounded-2xl! 3xl:rounded-3xl!",
                        className,
                    )}
                >
                    {/* Close Button (X) - Top Right */}
                    <button
                        onClick={() => handleClose(false)}
                        className="absolute right-4 top-4 lg:right-3 lg:top-3 xl:right-3.5 xl:top-3.5 2xl:right-4 2xl:top-4 3xl:right-5 3xl:top-5 flex items-center justify-center size-8 lg:size-5 xl:size-7 2xl:size-8 3xl:size-10 rounded-full border border-border dark:border-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer z-10"
                        aria-label="Close"
                    >
                        <X className="w-4 lg:w-2.5 xl:w-3 2xl:w-3.5 3xl:w-4 h-4 lg:h-2.5 xl:h-3 2xl:h-3.5 3xl:h-4 text-nav-highlight" />
                    </button>

                    <div className="md:mt-6 md:mx-4">
                        {/* Header - View Product Details */}
                        <ModalHeader className="pb-2">
                            <ModalTitle className="text-xl lg:text-sm! xl:text-base! 2xl:text-lg! 3xl:text-2xl! font-semibold text-left">
                                View Product Details
                            </ModalTitle>
                            <ModalDescription className="sr-only">
                                View product code details, remarks and recipe list
                            </ModalDescription>
                        </ModalHeader>

                        {/* Product Info Cards Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5 lg:gap-1.5 xl:gap-2 2xl:gap-2.5 3xl:gap-3 mb-5 lg:mb-3 xl:mb-4 2xl:mb-4 3xl:mb-5">
                            {/* Product Code Card */}
                            <div className="flex items-center justify-center gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5 px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-2 lg:py-1 xl:py-1.5 2xl:py-1.5 3xl:py-2 border border-[#EEEBF4] dark:border-primary/50 rounded-[6px] bg-background">
                                <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text whitespace-nowrap">Product Code:</span>
                                <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-foreground">{displayProductCode}</span>
                            </div>

                            {/* Product Name Card */}
                            <div className="flex items-center justify-center gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5 px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-2 lg:py-1 xl:py-1.5 2xl:py-1.5 3xl:py-2 border border-[#EEEBF4] dark:border-primary/50 rounded-[6px] bg-background">
                                <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text whitespace-nowrap">Product Name:</span>
                                <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm font-semibold text-foreground">{displayName}</span>
                            </div>

                            {/* Segment Card */}
                            <div className="flex items-center justify-center gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5 px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-2 lg:py-1 xl:py-1.5 2xl:py-1.5 3xl:py-2 border border-[#EEEBF4] dark:border-primary/50 rounded-[6px] bg-background">
                                <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text whitespace-nowrap">Segment:</span>
                                <span className="px-3 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-3.5 py-0.5 lg:py-px xl:py-0.5 2xl:py-0.5 3xl:py-1 text-xs lg:text-[7px] xl:text-[9px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight  rounded-full whitespace-nowrap border border-primary/30">{displaySegment}</span>
                            </div>

                            {/* Status Card */}
                            <div className="flex items-center justify-center gap-2 lg:gap-1 xl:gap-1.5 2xl:gap-2 3xl:gap-2.5 px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-2 lg:py-1 xl:py-1.5 2xl:py-1.5 3xl:py-2 border border-[#EEEBF4] dark:border-primary/50 rounded-[6px] bg-background">
                                <span className="text-xs lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text whitespace-nowrap">Status</span>
                                <span className="px-3 lg:px-2 xl:px-2.5 2xl:px-3 3xl:px-3.5 py-0.5 lg:py-px xl:py-0.5 2xl:py-0.5 3xl:py-1 text-xs lg:text-[7px] xl:text-[9px] 2xl:text-[10px] 3xl:text-xs font-semibold text-nav-highlight bg-[#E3DFEA] rounded-full whitespace-nowrap">{displayStatus}</span>
                            </div>
                        </div>

                        {/* Remarks Section */}
                        <div className="mb-5 lg:mb-3 xl:mb-4 2xl:mb-4 3xl:mb-5">
                            <h3 className="text-base lg:text-[9px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-foreground mb-0.5 lg:mb-px xl:mb-0.5 2xl:mb-0.5 3xl:mb-1">
                                Remarks
                            </h3>
                            <p className="text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-2 3xl:mb-2.5">
                                <span className="text-lighter-text">Showing remarks for </span> <span className="font-semibold">{productCode?.name || "N/A"}</span>
                            </p>
                            <div className="rounded-xl lg:rounded-md xl:rounded-lg 2xl:rounded-xl 3xl:rounded-xl border border-border bg-background p-4 lg:p-2.5 xl:p-3 2xl:p-3.5 3xl:p-4 min-h-[70px] lg:min-h-[42px] xl:min-h-[55px] 2xl:min-h-[62px] 3xl:min-h-[70px]">
                                <p className="whitespace-pre-wrap text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text">
                                    {productCode?.remarks?.trim().length > 0
                                        ? productCode.remarks
                                        : "No remarks available."}
                                </p>
                            </div>
                        </div>

                        {/* Recipe List Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2 lg:mb-1 xl:mb-1.5 2xl:mb-1.5 3xl:mb-2">
                                <div>
                                    <h3 className="text-base lg:text-[9px] xl:text-xs 2xl:text-sm 3xl:text-lg font-semibold text-foreground">
                                        Recipe List
                                    </h3>
                                    <p className="text-xs lg:text-[7.5px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-lighter-text">
                                        View recipes using the Product Code
                                    </p>
                                </div>
                                {/* Search Input */}
                                <div className="relative w-32 lg:w-22 xl:w-26 2xl:w-30 3xl:w-36">
                                    <input
                                        type="text"
                                        placeholder="Search.."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full font-medium text-foreground placeholder:text-lighter-text h-8 lg:h-5 xl:h-6 2xl:h-7 3xl:h-8 rounded-md lg:rounded-xs xl:rounded-sm 2xl:rounded-md 3xl:rounded-md border border-table-stroke px-2.5 lg:px-1.5 xl:px-2 2xl:px-2.5 3xl:px-3 text-sm lg:text-[7.5px] xl:text-[10px] 2xl:text-xs 3xl:text-sm focus-visible:outline-none pr-7 lg:pr-5 xl:pr-6 2xl:pr-6 3xl:pr-7 bg-transparent"
                                    />
                                    <Search className="absolute w-3.5 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-3.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-3.5 -translate-y-1/2 pointer-events-none right-2.5 lg:right-1.5 xl:right-2 2xl:right-2 3xl:right-2.5 top-1/2 text-nav-highlight" />
                                </div>
                            </div>

                            {/* Recipe Table */}
                            <div className="border border-border rounded-xl overflow-hidden bg-background">
                                {/* Table Header */}
                                <div className="grid grid-cols-[44px_1fr_1.5fr_64px] lg:grid-cols-[28px_1fr_1.5fr_44px] xl:grid-cols-[34px_1fr_1.5fr_52px] 2xl:grid-cols-[40px_1fr_1.5fr_58px] 3xl:grid-cols-[44px_1fr_1.5fr_64px] items-center px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-2.5 lg:py-1.5 xl:py-2 2xl:py-2 3xl:py-3.5 bg-[#F9F8FD] dark:bg-primary/10">
                                    <span></span>
                                    <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-semibold text-foreground">Recipe Code</span>
                                    <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-semibold text-foreground">Recipe Name</span>
                                    <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-semibold text-foreground text-center">Action</span>
                                </div>

                                {/* Table Body with Custom Scrollbar */}
                                <div className="max-h-[220px] lg:max-h-[120px] xl:max-h-[155px] 2xl:max-h-[180px] 3xl:max-h-[260px] overflow-y-auto custom-scrollbar">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 lg:py-6 xl:py-8 2xl:py-10 3xl:py-14">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                            <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">Loading recipes...</p>
                                        </div>
                                    ) : displayRecipes.length > 0 ? (
                                        displayRecipes.map((recipe, index) => (
                                            <div
                                                key={recipe.id || `${recipe.recipeCode}-${index}`}
                                                className="grid grid-cols-[44px_1fr_1.5fr_64px] lg:grid-cols-[28px_1fr_1.5fr_44px] xl:grid-cols-[34px_1fr_1.5fr_52px] 2xl:grid-cols-[40px_1fr_1.5fr_58px] 3xl:grid-cols-[44px_1fr_1.5fr_64px] items-center px-4 lg:px-2.5 xl:px-3 2xl:px-3.5 3xl:px-4 py-3 lg:py-1.5 xl:py-2 2xl:py-2.5 3xl:py-3.5 hover:bg-[#F9F8FD]/50 dark:hover:bg-primary/10 transition-colors"
                                            >
                                                {/* Serial number icon */}
                                                <div className="flex items-center justify-center size-6 lg:size-3.5 xl:size-4.5 2xl:size-5 3xl:size-7 bg-[#F3F0FA] dark:bg-primary/10 dark:border dark:border-primary rounded-full">
                                                    <span className="leading-0 text-[10px] lg:text-[6px] xl:text-[8px] 2xl:text-[9px] 3xl:text-[11px] font-medium text-nav-highlight">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base font-medium text-foreground">{recipe.recipeCode}</span>
                                                <span className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-base text-foreground">{recipe.recipeName}</span>
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        className="flex items-center justify-center size-7 lg:size-4 xl:size-5 2xl:size-6 3xl:size-9 rounded-lg bg-[#F3F0FA] dark:bg-primary/25 text-nav-highlight hover:bg-primary-shade-2 transition-colors cursor-pointer"
                                                        title="View Recipe"
                                                        aria-label="View Recipe"
                                                        onClick={() => {
                                                            onOpenChange(false);
                                                            navigate(`/application-lab/application-recipes/${recipe.id}`);
                                                        }}
                                                    >
                                                        <Eye className="w-3.5 lg:w-2 xl:w-2.5 2xl:w-3 3xl:w-4.5 h-3.5 lg:h-2 xl:h-2.5 2xl:h-3 3xl:h-4.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center py-8 lg:py-4 xl:py-5 2xl:py-6 3xl:py-8">
                                            <p className="text-sm lg:text-[8px] xl:text-[10px] 2xl:text-xs 3xl:text-sm text-muted-foreground">
                                                {searchQuery ? "No recipes match your search." : "No recipes found using this product."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalContent>
            )}
        </Modal>
    );
}
