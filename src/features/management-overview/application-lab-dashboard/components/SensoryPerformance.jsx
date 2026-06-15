import React from "react";
import { Activity, BarChart3, Flame } from "lucide-react";

const clampPercentage = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return 0;
    }

    return Math.max(0, Math.min(100, numericValue));
};

const formatScore = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return "0.0/10";
    }

    return `${numericValue.toFixed(1)}/10`;
};

const formatPercent = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return "0%";
    }

    const rounded = Math.round(numericValue * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
};

const getSuccessfulFlavorLabel = (flavor) => {
    const name = flavor?.name || "Unknown Flavor";
    const productCode = flavor?.productCode;
    if (!productCode) {
        return name;
    }

    return `${name} (${productCode})`;
};

const getUsedFlavorLabel = (flavor) => {
    const name = flavor?.name || "Unknown Flavor";
    const productCode = flavor?.productCode;
    if (!productCode) {
        return name;
    }

    return `${name} (${productCode})`;
};

const getSuccessfulFlavorCountsLabel = (flavor) => {
    const recipeCount = Number(flavor?.recipeCount ?? flavor?.approvedRecipeCount) || 0;
    const sampleCount = Number(flavor?.sampleCount ?? flavor?.approvedSampleCount ?? flavor?.approvedCount) || 0;

    return `(${recipeCount}, ${sampleCount})`;
};

export default function SensoryPerformance({ metrics, isLoading = false }) {
    const sensoryPerformance = metrics?.sensoryPerformance || {};
    const mostSuccessfulFlavors = React.useMemo(
        () =>
            Array.isArray(sensoryPerformance.mostSuccessfulFlavors)
                ? sensoryPerformance.mostSuccessfulFlavors
                : [],
        [sensoryPerformance.mostSuccessfulFlavors]
    );

    const mostUsedFlavors = React.useMemo(
        () =>
            Array.isArray(sensoryPerformance.mostUsedFlavors)
                ? sensoryPerformance.mostUsedFlavors
                : [],
        [sensoryPerformance.mostUsedFlavors]
    );

    const maxUsedCount = React.useMemo(() => {
        if (!mostUsedFlavors.length) {
            return 0;
        }

        return Math.max(...mostUsedFlavors.map((item) => Number(item.usedCount) || 0));
    }, [mostUsedFlavors]);

    const scoreCards = React.useMemo(
        () => [
            {
                id: "avg-score",
                label: "Avg Score",
                value: formatScore(sensoryPerformance.avgScore),
            },
            {
                id: "approval-rate",
                label: "Approval Rate",
                value: formatPercent(sensoryPerformance.approvalRate),
            },
            {
                id: "rejection-rate",
                label: "Rejection Rate",
                value: formatPercent(sensoryPerformance.rejectionRate),
            },
        ],
        [
            sensoryPerformance.approvalRate,
            sensoryPerformance.avgScore,
            sensoryPerformance.rejectionRate,
        ]
    );

    const getScoreValueClass = (scoreId) => {
        if (scoreId === "approval-rate") return "text-emerald-500";
        if (scoreId === "rejection-rate") return "text-red-500";
        return "text-slate-900 dark:text-gray-100";
    };

    const getUsedPercent = (item) => {
        const relativePercent = Number(item?.relativePercent);
        if (Number.isFinite(relativePercent)) {
            return clampPercentage(relativePercent);
        }

        const usedCount = Number(item?.usedCount) || 0;
        if (maxUsedCount <= 0) {
            return 0;
        }

        return clampPercentage((usedCount / maxUsedCount) * 100);
    };

    return (
        <section className="mt-5">
            <h2 className="text-lg md:text-xl 2xl:text-2xl font-bold text-foreground">
                Sensory Performance Summary
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[20fr_45fr_35fr]">
                <div className="flex flex-col gap-4 h-full">
                    {scoreCards.map((score) => (
                        <article
                            key={score.id}
                            className="flex-1 flex flex-col justify-center rounded-2xl border border-violet-200/80 dark:border-violet-900/40 bg-white/90 dark:bg-[#1A142B] p-4 px-8"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm 2xl:text-base font-medium text-gray-500 dark:text-gray-300">
                                    {score.label}
                                </p>
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                                    <Activity className="w-3.5 h-3.5" />
                                </span>
                            </div>

                            {isLoading ? (
                                <div className="mt-4 h-10 w-24 rounded bg-violet-100/80 dark:bg-violet-900/30 animate-pulse" />
                            ) : (
                                <p
                                    className={`mt-2 text-[2.8rem] leading-tight font-bold ${getScoreValueClass(
                                        score.id
                                    )}`}
                                >
                                    {score.value}
                                </p>
                            )}
                        </article>
                    ))}
                </div>

                <article className="rounded-2xl border border-violet-200/80 dark:border-violet-900/40 bg-white/90 dark:bg-[#1A142B] p-4 md:p-6">
                    <div className="flex items-center gap-2 text-foreground">
                        <Flame className="w-5 h-5 text-violet-700 dark:text-violet-300" />
                        <h3 className="text-base md:text-lg font-semibold">Most Successful Flavors</h3>
                    </div>

                    <div className="mt-5 space-y-3 md:space-y-6">
                        {isLoading && (
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={`successful-loading-${index}`} className="h-8 rounded bg-violet-100/80 dark:bg-violet-900/30 animate-pulse" />
                                ))}
                            </div>
                        )}

                        {!isLoading && mostSuccessfulFlavors.length === 0 && (
                            <p className="text-sm text-muted-foreground">No flavor performance data available.</p>
                        )}

                        {!isLoading &&
                            mostSuccessfulFlavors.map((item) => (
                                <div key={`successful-${item.id}`} className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#5B2FA4]" />
                                        <div className="min-w-0">
                                            <p className="text-md font-medium text-foreground truncate">
                                                {getSuccessfulFlavorLabel(item)}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {getSuccessfulFlavorCountsLabel(item)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-[30%]">
                                        <div className="flex-1 h-1.5 rounded-full bg-violet-100 dark:bg-violet-900/20">
                                            <div
                                                className="h-full rounded-full bg-[#5B2FA4] dark:bg-violet-400"
                                                style={{ width: `${clampPercentage(item.approvalRate)}%` }}
                                            />
                                        </div>
                                        <p className="text-base font-semibold text-foreground whitespace-nowrap w-12 text-right">
                                            {formatPercent(item.approvalRate)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </article>

                <article className="rounded-2xl border border-violet-200/80 dark:border-violet-900/40 bg-white/90 dark:bg-[#1A142B] p-4 md:p-6">
                    <div className="flex items-center gap-2 text-foreground">
                        <BarChart3 className="w-4 h-4 text-violet-700 dark:text-violet-300" />
                        <h3 className="text-base md:text-lg font-bold">Most Used Flavors</h3>
                    </div>

                    <div className="mt-5 space-y-4">
                        {isLoading && (
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={`used-loading-${index}`} className="h-8 rounded bg-violet-100/80 dark:bg-violet-900/30 animate-pulse" />
                                ))}
                            </div>
                        )}

                        {!isLoading && mostUsedFlavors.length === 0 && (
                            <p className="text-sm text-muted-foreground">No flavor usage data available.</p>
                        )}

                        {!isLoading &&
                            mostUsedFlavors.map((item) => (
                                <div key={`used-${item.id}`}>
                                    <div className="flex items-center justify-between gap-3 text-foreground">
                                        <p className="text-sm md:text-base font-medium truncate">
                                            {getUsedFlavorLabel(item)}
                                        </p>
                                        <p className="text-sm md:text-base whitespace-nowrap">
                                            {Number(item.usedCount) || 0} samples
                                        </p>
                                    </div>

                                    <div className="mt-2 h-0.5 rounded-full bg-violet-200/70 dark:bg-violet-900/30">
                                        <div
                                            className="h-full rounded-full bg-violet-700 dark:bg-violet-400"
                                            style={{ width: `${getUsedPercent(item)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                </article>
            </div>
        </section>
    );
}
