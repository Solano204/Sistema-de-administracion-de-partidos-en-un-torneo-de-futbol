import clsx from "clsx";
import React from "react";
import { ContainerCard } from "./Team.ContainerTeams";

type Props = {
  className?: string;
  categoryId: string; // Now only need categoryId
};



export async function Contenedor({ className, categoryId }: Props) {
 

  return (
    // <HydrationBoundary state={dehydratedState}>
      <div className={clsx(
        "text-sm font-semibold flex flex-col items-center justify-center",
        className
      )}>
        <div className="relative flex items-center w-full h-full md:mx-20 overflow-hidden  rounded-3xl">
          <ContainerCard categoryId={categoryId} />
        </div>
      </div>
    // </HydrationBoundary>
  );
}