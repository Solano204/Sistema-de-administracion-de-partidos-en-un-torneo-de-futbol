"use client";

import { useRevealer } from "@/components/common/hooks/hookNavigation";
import { TeamStatsContent } from "@/components/PositionManagment/components/TableStatsScore";
import React, { useState, useEffect } from "react";

export default function Page() {
  
  useRevealer();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Extract categoryId directly from URL
  useEffect(() => {
    // Get the current URL path
    const pathname = window.location.pathname;
    
    // URL format: /Categories/[categoryId]/positions
    const pathParts = pathname.split('/');
    
    // Find the part that comes after "Categories" and before "positions"
    if (pathParts.length >= 3 && pathParts[1].toLowerCase() === 'categories') {
      // The categoryId should be the 3rd part (index 2)
      const id = pathParts[2];
      
      // Validate that it looks like a UUID (basic check)
      if (id && id.length > 30 && id.includes('-')) {
        setCategoryId(id);
        console.log("Extracted categoryId:", id);
      } else {
        console.error("Could not extract valid categoryId from URL");
      }
    }
  }, []);

  return (
        <>
    <div className="revealer z-[100]  "></div>
    <div className="w-full h-full p-2 relative z-20 flex flex-col items-center justify-center">
      <div className="w-full h-[10%] z-[23] cursor-pointer flex items-center justify-center md:text-3xl" >
        <h3>Positions</h3>
      </div>
      
      {/* Pass the extracted categoryId to the TeamStatsPage component */}
      {categoryId ? (
        <TeamStatsContent categoryId={categoryId} />
      ) : (
        <div className="text-center p-4 text-amber-600">
          Loading category data...
        </div>
      )}
    </div>
      </>
  );
}