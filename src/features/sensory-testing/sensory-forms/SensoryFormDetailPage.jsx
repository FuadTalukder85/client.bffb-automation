/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { useSensoryFormBySample, useCreateSensoryForm, useSensoryFormSampleDetails, useUpdateSensoryForm } from "@/hooks/useSensoryForm";
import { useAuthStore } from "@/store/useAuthStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileSensoryFormDetailPage from "./components/MobileSensoryFormDetailPage";
import DesktopSensoryFormDetailPage from "./components/DesktopSensoryFormDetailPage";

export default function SensoryFormDetailPage() {
  const { sampleId } = useParams();
  const isMobile = useIsMobile();
  const { user } = useAuthStore();
  const currentUserId = user?.userId || user?._id || user?.id || null;
  
  const [formData, setFormData] = useState({
    appearance: 0, aroma: 0, taste: 0, flavour: 0,
    sweet: 0, sour: 0, salty: 0, spicy: 0,
    bitter: 0, texture: 0, overAll: 0,
    panelistComment: "", panelistRemark: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: existingForm, isLoading: formLoading, error: formError } = useSensoryFormBySample(sampleId, currentUserId);
  const createSensoryForm = useCreateSensoryForm();
  const updateSensoryForm = useUpdateSensoryForm();

  useEffect(() => {
    if (existingForm) {
      setFormData({
        appearance: existingForm.appearance ?? 0,
        aroma: existingForm.aroma ?? 0,
        taste: existingForm.taste ?? 0,
        flavour: existingForm.flavour ?? 0,
        sweet: existingForm.sweet ?? 0,
        sour: existingForm.sour ?? 0,
        salty: existingForm.salty ?? 0,
        spicy: existingForm.spicy ?? 0,
        bitter: existingForm.bitter ?? 0,
        texture: existingForm.texture ?? 0,
        overAll: existingForm.overAll ?? 0,
        panelistComment: existingForm.panelistComment || "",
        panelistRemark: existingForm.panelistRemark || "",
      });
    }
  }, [existingForm]);

  const { data: sampleDetailsData, isLoading: sampleDetailsLoading, error: sampleDetailsError } = useSensoryFormSampleDetails(sampleId);

  const isLoading = formLoading || sampleDetailsLoading;
  const error = sampleDetailsError || formError;

  const getErrorMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Failed to load sensory form details";

  const errorMessage = error ? getErrorMessage(error) : "";
  const hasError = Boolean(errorMessage);

  const productionDate = existingForm?.createdAt || sampleDetailsData?.createdAt || sampleDetailsData?.productionDate;

  const sampleDetails = sampleDetailsData ? {
    projectBrief: sampleDetailsData.project?.brief,
    bdCroBrief: sampleDetailsData.project?.bdOrCROBrief,
    targetCost: sampleDetailsData.project?.targetCost,
    actualCostPerKg: sampleDetailsData.actualCostPerKg,
    benchmark: sampleDetailsData.project?.benchmark,
    link: sampleDetailsData.project?.link,
    recipeCode: sampleDetailsData.recipe?.recipeCode,
    recipeName: sampleDetailsData.recipe?.recipeName,
    ingredients: sampleDetailsData.recipe?.ingredientsList || [],
  } : null;

  const handleRatingChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      if (existingForm && existingForm._id) {
        await updateSensoryForm.mutateAsync({
          id: existingForm._id,
          data: {
            sampleID: sampleId,
            ...formData,
            // Keep submitted forms submitted when users edit after submit.
            isSubmitted: Boolean(existingForm?.isSubmitted),
          },
        });
      } else {
        await createSensoryForm.mutateAsync({
          sampleID: sampleId,
          ...formData,
          isSubmitted: false,
        });
      }
    } catch (error) {
       console.error("Failed to save draft", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const required = ["appearance", "taste", "flavour"];
    const missing = required.filter((f) => formData[f] === null || formData[f] === undefined);
    if (missing.length > 0) {
      alert(`Please fill in required ratings: ${missing.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingForm && existingForm._id) {
        await updateSensoryForm.mutateAsync({
          id: existingForm._id,
          data: { sampleID: sampleId, ...formData, isSubmitted: true },
        });
      } else {
        await createSensoryForm.mutateAsync({
          sampleID: sampleId,
          ...formData,
          isSubmitted: true,
        });
      }
    } catch (error) {
       console.error("Failed to submit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = useMemo(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), []);
  
  const productCodeTable = useMemo(() => {
    if (!sampleDetails?.ingredients || sampleDetails.ingredients.length === 0) return null;
    return (
      <div className="w-full border rounded-xl overflow-hidden border-border/60">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border/60">
              <th className="px-4 py-3 text-left font-bold text-foreground border-r border-border/60 w-1/2">BFF Product Code</th>
              <th className="px-4 py-3 text-left font-bold text-foreground w-1/2">Dosage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sampleDetails.ingredients.map((p, i) => (
              <tr key={i} className="last:border-0">
                <td className="px-4 py-3 text-foreground/80 border-r border-border/60">{p.code}</td>
                <td className="px-4 py-3 text-foreground/80">
                  <div className="flex justify-between items-center">
                    <span>{p.quantity}</span>
                    <span className="opacity-50 text-[12px] font-normal">g</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [sampleDetails]);

  const isFormSubmitted = existingForm?.isSubmitted;

  const props = {
    sampleDetails,
    productionDate,
    formData,
    handleRatingChange,
    handleTextChange,
    handleSaveDraft,
    handleSubmit,
    isFormSubmitted,
    isSubmitting,
    isLoading,
    today,
    productCodeTable,
    user,
    hasError,
    errorMessage,
  };

  return isMobile ? (
    <MobileSensoryFormDetailPage {...props} />
  ) : (
    <DesktopSensoryFormDetailPage {...props} />
  );
}
