import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const ROW_CARD_CLASSES = [
    "[background:linear-gradient(#EFE4FF,#EFE4FF)_padding-box,linear-gradient(309.15deg,_#D9BFFF_-7.71%,_#E5D3FF_22.38%)_border-box] dark:[background:linear-gradient(#1A1125,#1A1125)_padding-box,linear-gradient(309.15deg,_#5D3294_-7.71%,_#6D3FBC_22.38%)_border-box]",
    "[background:linear-gradient(#F6F0FF,#F6F0FF)_padding-box,linear-gradient(309.15deg,_#D9BFFF_-7.71%,_#E5D3FF_22.38%)_border-box] dark:[background:linear-gradient(#1E142B,#1E142B)_padding-box,linear-gradient(309.15deg,_#5D3294_-7.71%,_#6D3FBC_22.38%)_border-box]",
    "[background:linear-gradient(#F6F0FC,#F6F0FC)_padding-box,linear-gradient(309.15deg,_#D9BFFF_-7.71%,_#E5D3FF_22.38%)_border-box] dark:[background:linear-gradient(#211731,#211731)_padding-box,linear-gradient(309.15deg,_#5D3294_-7.71%,_#6D3FBC_22.38%)_border-box]",
    "[background:linear-gradient(#F6F0FC,#F6F0FC)_padding-box,linear-gradient(309.15deg,_#D9BFFF_-7.71%,_#E5D3FF_22.38%)_border-box] dark:[background:linear-gradient(#211731,#211731)_padding-box,linear-gradient(309.15deg,_#5D3294_-7.71%,_#6D3FBC_22.38%)_border-box]",
    "[background:linear-gradient(#FCFAFF,#FCFAFF)_padding-box,linear-gradient(309.15deg,_#D9BFFF_-7.71%,_#E5D3FF_22.38%)_border-box] dark:[background:linear-gradient(#241A37,#241A37)_padding-box,linear-gradient(309.15deg,_#5D3294_-7.71%,_#6D3FBC_22.38%)_border-box]",
    "[background:linear-gradient(#FDFBFF,#FDFBFF)_padding-box,linear-gradient(309.15deg,_#D9BFFF_-7.71%,_#E5D3FF_22.38%)_border-box] dark:[background:linear-gradient(#271D3D,#271D3D)_padding-box,linear-gradient(309.15deg,_#5D3294_-7.71%,_#6D3FBC_22.38%)_border-box]",
];

function MetricCard({ title, value, icon: Icon, description, isLoading, colorClass, patternIndex = 0 }) {
    const rowCardClass = ROW_CARD_CLASSES[patternIndex % ROW_CARD_CLASSES.length];

    return (
        <div
            className={cn(
                "relative flex 3xl:min-h-22.5 2xl:min-h-20 xl:min-h-18 lg:min-h-16 min-h-14 w-full flex-col gap-2 rounded-md border-[0.8px] border-transparent bg-no-repeat px-3.5 3xl:py-3 2xl:py-2.5 xl:py-2 lg:py-1.5 py-1",
                rowCardClass
            )}
        >
            <div className="flex items-center">
                {isLoading ? (
                    <Skeleton className="h-3 w-2/3" />
                ) : (
                    <span className="line-clamp-1 3xl:pr-10 2xl:pr-8 xl:pr-6 lg:pr-4 pr-3 3xl:text-[11.25px] 2xl:text-[9px] xl:text-[8px] lg:text-[7px] font-semibold 3xl:leading-[14.46px] 2xl:leading-3 xl:leading-2.5 lg:leading-2 tracking-normal text-base-color dark:text-gray-400">{title}</span>
                )}
            </div>

            <div
                className={cn(
                    "absolute right-4 top-3 flex 3xl:h-10 2xl:h-8 xl:h-6.5 lg:h-5 h-6 3xl:w-10 2xl:w-8 xl:w-6.5 lg:w-5 w-6 items-center justify-center 3xl:rounded-lg 2xl:rounded-md xl:rounded-sm lg:rounded-sm rounded-[5px] bg-[#D0C2E5]! dark:bg-[#5D3294]!",
                    colorClass
                )}
            >
                {isLoading ? (
                    <Skeleton className="h-full w-full rounded-lg" />
                ) : (
                    <Icon className="h-3 w-3 3xl:h-4 2xl:h-3.5 xl:h-2.5 lg:h-2 3xl:w-4 2xl:w-3.5 xl:w-2.5 lg:w-2 text-white" />
                )}
            </div>

            <div className="flex flex-col">
                {isLoading ? (
                    <Skeleton className="mt-2 h-7 md:h-10 w-20 md:w-24" />
                ) : (
                    <span className="text-[18.93px] 3xl:text-[28.93px] 2xl:text-[22px] xl:text-[20px] lg:text-[15px] font-semibold 3xl:leading-[48.21px] 2xl:leading-[38px] xl:leading-[35px] lg:leading-[25px] leading-5 tracking-normal text-dark:text-white">{value}</span>
                )}
                {description ? <span className="hidden">{description}</span> : null}
            </div>
        </div>
    );
}

export default MetricCard;