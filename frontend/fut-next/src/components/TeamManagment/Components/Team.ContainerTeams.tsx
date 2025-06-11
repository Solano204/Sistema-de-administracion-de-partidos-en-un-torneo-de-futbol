"use client";
import React, { useEffect, useState } from "react";
import {  FaSpinner, FaTrash } from "react-icons/fa";

import { redirect, usePathname } from "next/navigation";
import {
  getAuthUser,
  getAuthUserAdmin,
} from "@/app/utils/Domain/AuthenticationActions/AuthUser";
import {
  useCategoryMutations,
} from "../../CategoryManagment/components";

import { ActionButton } from "../../Player/Player.CardPlayer";
import { MdPlusOne } from "react-icons/md";
import { useRevealer } from "../../common/hooks/hookNavigation";
import { useTeamsByCategory } from "..";
import { Card } from "./Team.Card";
import { Slider } from "./Team.Slider";

interface ContainerCardProps {
  categoryId: string;
}

export const ContainerCard: React.FC<ContainerCardProps> = ({ categoryId }) => {
  
  useRevealer();

  const [activeIndex, setActiveIndex] = React.useState(0);
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Use the custom hook for teams data
  const { teams, isLoading, isError, invalidateTeams } =
    useTeamsByCategory(categoryId);

  // Use the custom hook for mutations
  const { deleteAllInTournament } = useCategoryMutations();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getAuthUser();
      const sessionAdmin = await getAuthUserAdmin();
      const permisions = session && sessionAdmin ? true : false;
      setIsAuthenticated(permisions);
    };
    checkAuth();
  });

  const handleAddForm = () => {
    const sanitizedName = "create-new-team";
    console.log("Redirecting to:", `${pathname}/${sanitizedName}`);
    redirect(`${pathname}/${sanitizedName}`);
  };

  async function handleDeleteTournament(): Promise<void> {
    if (!categoryId) {
      setDeleteError("No tournament ID provided");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL teams in this tournament? This action cannot be undone!"
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAllInTournament(categoryId);
      invalidateTeams(); // Use the invalidate function from our hook
      alert("All teams in tournament deleted successfully");
    } catch (error) {
      console.error("Failed to delete teams:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete teams"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <div className="text-white">Loading teams...</div>;
  if (isError) return <div className="text-red-500">Error loading teams</div>;

  // Transform teams data into slides format
  const teamSlides =
    teams?.map((team) => ({
      id: team.teamId,
      name: team.teamName,
      content: `Points: ${team.points} | Goals: ${team.goalsFor}`,
      image: team.logo || "/Images/logo.png",
      stats: {
        points: team.points,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
      },
    })) || [];


  return (
    <>
    <div className="z-[23] flex-col h-full w-full  m-0 flex justify-center items-center font-mono overflow-hidden ">
      <Slider
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        className="h-[80%] w-[90%]"
      >
        {teamSlides.map((slide) => (
          <Card
            shape="square"
            key={slide.id}
            idCategory={categoryId}
            id={slide.id}
            title={slide.name}
            actionType="redirect"
            image={slide.image}
            content={slide.content}
            className="xl:w-[440px] xl:h-[620px] md:h-[400px] md:w-[300px] sm:h-[400px] sm:w-[200px] h-[300px] w-[200px]"
          />
        ))}
      </Slider>

      {isAuthenticated && (
        <div className="flex items-center justify-center h-[20%] overflow-hidden w-full gap-10 ">
          <ActionButton
            color="yellow"
            icon={<MdPlusOne />}
            onClick={() => handleAddForm()}
            />
          <ActionButton
            color="red"
            icon={isDeleting ? <FaSpinner /> : <FaTrash />}
            onClick={handleDeleteTournament}
          />
      
        </div>
      )}

      {deleteError && (
        <div className="text-red-500 mt-2">Error: {deleteError}</div>
      )}
    </div>
            </>
  );
};
