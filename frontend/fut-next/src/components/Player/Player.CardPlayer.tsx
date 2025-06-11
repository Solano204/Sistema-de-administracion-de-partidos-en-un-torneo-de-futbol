"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { redirect, useParams } from "next/navigation";
import { TbCancel } from "react-icons/tb";
import { v4 as uuidv4 } from "uuid";

import {
  setNumberOfCards,
  addForm,
  setForms,
  clearState,
  setChages,
  setTeamData,
  setCurrentModalKey,
  setCurrentTempData,
} from "@/app/Redux/feature/Card/cardSlice";
import { RootState } from "@/app/Redux/store";
import {
  dataTeam,
  InfoPlayerForm,
  PropsTeam,
  StateType,
} from "@/components/PlayerManagment/types/TypesPlayer";
import { differenceWith, find, isEqual } from "lodash";
import { Modal } from "../TeamManagment/Components/Team.PopUp";
import { MultiStepLoaderForm } from "./Player.MultiForm";
import { FormInput } from "../common";

import {
  buildRedirectUrl,
  mapPlayerToCreateRecord,
  mapPlayerToUpdateRecord,
  mapTeamToDetailsRecord
} from "@/components/TeamManagment/api/Mapper";
import {
  SupabaseFolder,
  uploadImage,
} from "@/app/utils/Actions/SupaBase/ActionsImages";
import { ImageUploadWithRef } from "../common/Common.ImageUploadField";
import {
  getExtensionFromUrl,
  urlToFile,
} from "../CategoryManagment/components/actionsImages";
import {
  getAuthUser,
  getAuthUserAdmin,
} from "@/app/utils/Domain/AuthenticationActions/AuthUser";
import { useCategoryMutations } from "../CategoryManagment/components";

import { inputBaseStyles } from "../common/Common.FormStyles";
import { MdOutlineDeleteForever, MdPlusOne } from "react-icons/md";
import { GiCancel } from "react-icons/gi";
import { useTeamsByCategory, useTeamWithPlayers } from "../TeamManagment";
import { validateTeamData } from "../TeamManagment/Validation/validation";
import { Card } from "../TeamManagment/Components/Team.Card";
import SwitchComponent from "../ui/Form/Plus";
import { FaSave } from "react-icons/fa";

export const CardPlayer = ({
  className,
  infoTeam,
  newTeam,
}: PropsTeam) => {
  // Get the query client
  // Get team mutations from our custom hook
  const {
    createTeam: createTeamMutation,
    updateTeam: updateTeamMutation,
    deleteTeam: deleteTeamMutation,
    createPlayers: createPlayersMutation,
    updatePlayers: updatePlayersMutation,
    deletePlayers: deletePlayersMutation,
    isCreatingTeam,
    isUpdatingTeam,
    isDeletingTeam,
  } = useCategoryMutations();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getAuthUser();
      const sessionAdmin = await getAuthUserAdmin();
      const permisions = session && sessionAdmin ? true : false;
      setIsAuthenticated(permisions); // Set to true if token exists
    };
    checkAuth();
  }, []);

  const [currentModalContent, setCurrentModalContent] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const params = useParams();
  const teamId = params.idTeam as string;
  const categoryId = params.id as string;

  // Use the teams query hook to access invalidation functions
  const { invalidateTeams } = useTeamsByCategory(categoryId);
  const { invalidateTeamWithPlayers } = useTeamWithPlayers(
    categoryId,
    teamId,
    newTeam
  );

  // Here i update the state with the current modal key
  const handleModalOpen = (form: InfoPlayerForm, shouldOpen: boolean) => {
    dispatch(setCurrentModalKey(form.playerId)); // Set the current modal key
    setCurrentModalContent({
      title: form.firstName,
      description: "Player details for " + form.firstName,
    });
    setIsModalOpen(shouldOpen);
  };
  const dispatch = useDispatch();

  // Always call hooks at the top level
  const changes = useSelector((state: RootState) => state.cards.chages);
  const BegginState = useSelector(
    (state: RootState) => state.cards.beggininState
  );
  const currentForms = useSelector((state: RootState) => state.cards.forms);
  const currentDataTeam = useSelector(
    (state: RootState) => state.cards.dataTeam
  );

  const begginDataTeam = useSelector(
    (state: RootState) => state.cards.beggininTeam
  );

  const [realInfo, setRealInfo] = useState(infoTeam);

  const imageUploadRef = useRef<{ selectedFile: File | null }>({
    selectedFile: null,
  });

  // Use useEffect to handle side effects
  useEffect(() => {
    if (changes > 0) {
      if (!isEqual(currentForms, BegginState)) {
        console.log("currentForms", changes);
        setRealInfo(currentForms);
        dispatch(setForms(currentForms || []));
        dispatch(setNumberOfCards(currentForms?.length || 0));
        // dispatch(setBeginninState(infoTeam || []));
        dispatch(setTeamData(currentDataTeam as dataTeam));
        return;
      }
      return;
    }
  }, [changes]);

  // Handle adding a new form
  const handleAddForm = (type: StateType) => {
    console.log("handleAddForm");
    const newForm: InfoPlayerForm = {
      playerId: uuidv4(),
      firstName: "nuevo player",
      lastName: "",
      email: "",
      age: 0,
      photoUrl: "/Images/logo.png",
      birthDate: new Date().toISOString().split("T")[0], // format to YYYY-MM-DD
      jerseyNumber: 0,
      goals: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      playerStatus: "",
      captain: false,
      teamId: dataTeam.id,
      teamName: "",
    };

    dispatch(addForm(newForm));
    dispatch(setChages(1));
  };

  const deleteTeam = async () => {
    try {
      await deleteTeamMutation({
        categoryId,
        teamId: currentDataTeam.id || "",
      });
      // After deletion, invalidate the teams query to refresh the list
      invalidateTeams();
      invalidateTeamWithPlayers();
      const redirectUrl = buildRedirectUrl();
      dispatch(clearState());
      redirect(redirectUrl);
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  const cancelOperation = async () => {
    // No need to call any API, just invalidate the teams query to ensure fresh data
    invalidateTeams();
    invalidateTeamWithPlayers();

    const redirectUrl = buildRedirectUrl();
    dispatch(clearState());
    redirect(redirectUrl);
  };

  const saveForm = async () => {
    try {
      // Handle team logo upload if needed
      let newLogo = currentDataTeam.logo;

      // Check if logo has changed and is a new file (not just a URL string)
      if (currentDataTeam.logo !== begginDataTeam.logo) {
        // Ensure the logo is actually a File object
        if (imageUploadRef.current.selectedFile) {
          const uploadResult = await uploadImage(
            imageUploadRef.current.selectedFile,
            SupabaseFolder.TEAM,
            currentDataTeam.id // Use just the team ID, not a path
          );
          newLogo = uploadResult.url as string;
        } else if (
          currentDataTeam.logo &&
          (currentDataTeam.logo.startsWith("data:") ||
            currentDataTeam.logo.startsWith("blob:"))
        ) {
          // Convert URL to file if it's a data URL or blob URL
          const filename = `team_logo_${
            currentDataTeam.id
          }.${getExtensionFromUrl(currentDataTeam.logo)}`;
          const logoFile = await urlToFile(currentDataTeam.logo, filename);

          if (logoFile) {
            const uploadResult = await uploadImage(
              logoFile,
              SupabaseFolder.TEAM,
              currentDataTeam.id // Use just the team ID, not a path
            );
            newLogo = uploadResult.url as string;
          }
        }
      }

      // Process player images - convert URLs to files and upload
      const processedPlayers = await Promise.all(
        currentForms.map(async (player) => {
          let photoUrl = player.photoUrl;
          const playerBegginPhoto = find(
            BegginState,
            (item) => item.playerId === player.playerId
          )?.photoUrl;

          // Only process if the photo has actually changed and is a data/blob URL
          if (
            photoUrl &&
            photoUrl !== playerBegginPhoto &&
            (photoUrl.startsWith("data:") || photoUrl.startsWith("blob:"))
          ) {
            try {
              // Create a simple filename
              const filename = `player_${player.playerId}.${getExtensionFromUrl(
                photoUrl
              )}`;

              // Convert URL to file
              const photoFile = await urlToFile(photoUrl, filename);

              if (photoFile) {
                // Upload the file - use just the ID for the path, not nested structures
                const uploadResult = await uploadImage(
                  photoFile,
                  SupabaseFolder.PLAYER,
                  player.playerId // Use just the player ID, not a path
                );

                // Update the player's photo URL with the newly uploaded URL
                photoUrl = uploadResult.url as string;
              }
            } catch (error) {
              console.error(
                `Error processing image for player ${player.playerId}:`,
                error
              );
              // Keep the original URL if there was an error
            }
          }

          // Return the player with potentially updated photo URL
          return {
            ...player,
            photoUrl: photoUrl,
          };
        })
      );

      // Process team creation/update
      if (begginDataTeam.id === "") {
        // Create new team using the mutation from our hook
        const teamCreateRecord = {
          ...currentDataTeam,
          logo: newLogo,
          players: processedPlayers.map((p) =>
            mapPlayerToCreateRecord(
              { ...p, photoUrl: p.photoUrl },
              currentDataTeam.id
            )
          ),
        };

        await createTeamMutation(teamCreateRecord);
        console.log("New team created");
      } else {
        // Update existing team with processed players
        const changes = {
          deletedPlayers: differenceWith(
            BegginState,
            processedPlayers,
            (a, b) => a.playerId === b.playerId
          ),
          newPlayers: differenceWith(
            processedPlayers,
            BegginState,
            (a, b) => a.playerId === b.playerId
          ),
          modifiedPlayers: processedPlayers.filter((currentItem) => {
            const begginItem = find(
              BegginState,
              (item) => item.playerId === currentItem.playerId
            );
            return begginItem && !isEqual(begginItem, currentItem);
          }),
          teamChanged: !isEqual(
            { ...currentDataTeam, logo: newLogo },
            begginDataTeam
          ),
        };

        // Process player changes
        if (changes.deletedPlayers.length > 0) {
          console.log("changes.deletedPlayers", changes.deletedPlayers);

          await deletePlayersMutation({
            teamId: currentDataTeam.id,
            playerIds: changes.deletedPlayers.map((p) => p.playerId),
          });

          console.log("Players deleted");
        }

        if (changes.newPlayers.length > 0) {
          await createPlayersMutation({
            players: changes.newPlayers.map((p) =>
              mapPlayerToCreateRecord(
                { ...p, photoUrl: p.photoUrl },
                currentDataTeam.id,
              )
            ),
            teamId: currentDataTeam.id,
          });

          console.log("Players created");
        }

        if (changes.modifiedPlayers.length > 0) {
          await updatePlayersMutation(
            changes.modifiedPlayers.map((p) =>
              mapPlayerToUpdateRecord(
                { ...p, photoUrl: p.photoUrl },
                currentDataTeam.id
              )
            )
          );
          console.log("Players updated");
        }

        // Process team update
        if (changes.teamChanged) {
          const teamUpdateData = mapTeamToDetailsRecord(
            { ...currentDataTeam, logo: newLogo },
            newLogo
          );

          await updateTeamMutation({
            categoryId: currentDataTeam.categoryId,
            teamId: currentDataTeam.id,
            team: teamUpdateData,
          });

          console.log("Team updated");
        }
      }

      // Invalidate the teams query to refresh the list

      invalidateTeams();
      invalidateTeamWithPlayers();
      // 1. First perform the redirect

      // Redirect after successful save
      // redirect(redirectUrl);
    } catch (error) {
      console.error("Save failed:", error);
      // Handle error (show notification, etc.)
    }
    const redirectUrl = buildRedirectUrl();

    dispatch(clearState());
    redirect(redirectUrl);

    // 2. Then clear the state AFTER the navigation occurs
    // Using setTimeout ensures this happens in the next event cycle
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const dataTeam = useSelector((state: RootState) => state.cards.dataTeam);
  const [formErrorsTeam, setFormErrorsTeam] = useState<Record<string, string>>(
    {}
  );

  const captureSelectedFile = (file: File | null) => {
    if (file) {
      const updatedData: dataTeam = {
        ...dataTeam,
        logo: file ? URL.createObjectURL(file) : "",
      };
      dispatch(setCurrentTempData(updatedData));
    }
  };

  // Validate form on initial load
  useEffect(() => {
    if (dataTeam) {
      const errors = validateTeamData(dataTeam);
      setFormErrors(errors);
    }
  }, []);

  const handleInputChange = (
    field: keyof dataTeam,
    value: string | number | boolean
  ) => {
    // Convert string values to numbers for number fields
    let processedValue = value;
    if (
      [
        "numMembers",
        "goals",
        "goalsReceived",
        "points",
        "matches",
        "matchesWon",
        "matchesDrawn",
        "matchesLost",
      ].includes(field) &&
      typeof value === "string"
    ) {
      processedValue = Number(value) || 0;
    }

    // Update the specific field of dataTeam
    const updatedData = {
      ...dataTeam,
      [field]: processedValue,
    };

    // Validate the updated data
    const errors = validateTeamData(updatedData);

    if (Object.keys(errors).length != 0) {
    }
    setFormErrors(errors);

    // Dispatch the updated data
    dispatch(setCurrentTempData(updatedData));
  };
  const actionCloseModal = () => {
    console.log("cerrar modal");
    dispatch(setChages(1));
    setIsModalOpen(false);
  };

  return (
    <div className="w-full h-full">
      <div className="py-8 grid sm:grid-cols-2 gap-8 w-full h-full lg:grid-cols-3 px-5">
        {/* Name Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="name"
            label="Equipo"
            error={formErrors.name}
            type="text"
            name="nameTeam"
            className={inputBaseStyles}
            value={dataTeam.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={!isAuthenticated}
          />
        </div>

        <div className="flex items-center justify-center">
          <div className="relative  size-[100px]">
            <ImageUploadWithRef
              id={dataTeam?.id}
              ref={imageUploadRef}
              imageUrl={
                dataTeam?.logo ||
                "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/ImagesProfilesUsers/logo.png"
              }
              onFileSelect={captureSelectedFile}
              folder={SupabaseFolder.PLAYER}
              disabled={!isAuthenticated}
            />
          </div>
        </div>

        {/* Number of Players Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="numMembers"
            label="Jugadores"
            error={formErrorsTeam.numMembers}
            type="number"
            name="numMembers"
            className={inputBaseStyles}
            value={dataTeam.numMembers}
            onChange={(e) => handleInputChange("numMembers", e.target.value)}
            disabled={true}
          />
        </div>

        {/* Goals Scored Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="goals"
            label="Goles"
            type="number"
            name="goals"
            className={inputBaseStyles}
            value={dataTeam.goals}
            onChange={(e) => handleInputChange("goals", e.target.value)}
            error={formErrorsTeam.goals}
            disabled={true}
          />
        </div>

        {/* Goals Against Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="goalsReceived"
            label="Goles Recibidos"
            type="number"
            name="goalsReceived"
            className={inputBaseStyles}
            value={dataTeam.goalsReceived}
            onChange={(e) => handleInputChange("goalsReceived", e.target.value)}
            error={formErrorsTeam.goalsReceived}
            disabled={true}
          />
        </div>

        {/* Points Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="points"
            type="number"
            label="Puntos"
            name="points"
            className={inputBaseStyles}
            value={dataTeam.points}
            onChange={(e) => handleInputChange("points", e.target.value)}
            error={formErrorsTeam.points}
            disabled={true}
          />
        </div>

        {/* Matches Played Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="matches"
            label="Partidos Jugados"
            error={formErrorsTeam.matches}
            type="number"
            name="matches"
            className={inputBaseStyles}
            value={dataTeam.matches}
            onChange={(e) => handleInputChange("matches", e.target.value)}
            disabled={true}
          />
        </div>

        {/* Matches Won Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="matchesWon"
            label="Partidos Ganados"
            type="number"
            name="matchesWon"
            className={inputBaseStyles}
            value={dataTeam.matchesWon}
            onChange={(e) => handleInputChange("matchesWon", e.target.value)}
            error={formErrorsTeam.matchesWon}
            disabled={true}
          />
        </div>

        {/* Matches Drawn Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="matchesDrawn"
            label="Partidos Empatados"
            type="number"
            name="matchesDrawn"
            className={inputBaseStyles}
            value={dataTeam.matchesDrawn}
            onChange={(e) => handleInputChange("matchesDrawn", e.target.value)}
            error={formErrorsTeam.matchesDrawn}
            disabled={true}
          />
        </div>

        {/* Matches Lost Input */}
        <div className="flex flex-col gap-2 w-full text-center">
          <FormInput
            id="matchesLost"
            label="Partidos Perdidos"
            type="number"
            name="matchesLost"
            className={inputBaseStyles}
            value={dataTeam.matchesLost}
            onChange={(e) => handleInputChange("matchesLost", e.target.value)}
            error={formErrorsTeam.matchesLost}
            disabled={true}
          />
        </div>
      </div>
      {/* Player Cards Section - Always visible but cards may be disabled */}
      <div className="w-[100%] h-auto flex items-center justify-center px-2 ">
        {realInfo && (
          <div className="w-full h-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 py-6 px-2">
            {realInfo.map((form) => (
              <div
                key={form.playerId}
                className={`bg-transparent group 
                  text-black font-bold text-xl ease-in-out hover:scale-105 cursor-pointer mx-auto flex justify-center 
                  items-center transition-all duration-300 z-10 size-50 ${className}`}
              >
                <Card
                  id={form.playerId}
                  content=""
                  idCategory=""
                  title={form.firstName}
                  actionType="modal"
                  shape="circle"
                  onModalOpen={(shouldOpen) =>
                    handleModalOpen(form, shouldOpen)
                  }
                  image={form.photoUrl}
                  disabled={!isAuthenticated}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Action Buttons - Only show when authenticated */}
      {isAuthenticated && (
        <div className="w-full flex items-center justify-center gap-4 z-10  p-4 rounded-lg">
          <ActionButton
            color="yellow"
            icon={<MdPlusOne />}
            onClick={() => handleAddForm("empty")}
            disabled={isCreatingTeam || isUpdatingTeam}
          />

          <ActionButton
            color="green"
            icon={<FaSave />}
            onClick={saveForm}
            disabled={
              Object.keys(formErrors).length !== 0 ||
              isCreatingTeam ||
              isUpdatingTeam
            }
          />

          <ActionButton
            color="red"
            icon={<MdOutlineDeleteForever />}
            onClick={deleteTeam}
            disabled={isDeletingTeam}
          />

          <ActionButton
            color="blue"
            icon={<GiCancel />}
            onClick={cancelOperation}
          />
        </div>
      )}
      {currentModalContent && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Player Details"
          description="View and edit player information"
          width="500px"
          height="auto"
          closeButtonPosition="top-right"
          closeButtonClassName="bg-red-500 hover:bg-red-700"
        >
          <MultiStepLoaderForm onClose={actionCloseModal} />
        </Modal>
      )}
    </div>
  );
};
type ColorVariant = "yellow" | "green" | "red" | "blue";

interface ColorStyles {
  dark: string;
  light: string;
  from: string;
  to: string;
  shadow: string;
}

interface ActionButtonProps {
  color?: ColorVariant;
  icon: React.ReactElement;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  color = "red",
  icon,
  onClick,
  disabled = false,
  className = "",
}) => {
  const colorMap: Record<ColorVariant, ColorStyles> = {
    yellow: {
      dark: "dark:via-[rgba(255,255,255,0.16)]",
      light: "via-[rgba(255,205,5,0.16)]",
      from: "from-yellow-950",
      to: "to-yellow-800",
      shadow: "hover:shadow-yellow-500/30",
    },
    green: {
      dark: "dark:via-[rgba(0,255,42,0.16)]",
      light: "via-[rgba(0,255,26,0.16)]",
      from: "from-green-950",
      to: "to-green-800",
      shadow: "hover:shadow-green-500/30",
    },
    red: {
      dark: "dark:via-[rgba(255,0,0,0.16)]",
      light: "via-[rgba(255,0,0,0.16)]",
      from: "from-red-950",
      to: "to-red-800",
      shadow: "hover:shadow-red-500/30",
    },
    blue: {
      dark: "dark:via-[rgba(0,38,255,0.16)]",
      light: "via-[rgba(0,42,255,0.16)]",
      from: "from-blue-950",
      to: "to-blue-800",
      shadow: "hover:shadow-blue-500/30",
    },
  };

  const colors = colorMap[color];

  return (
    <div className="size-10">
      <button
        disabled={disabled}
        onClick={onClick}
        className={`
          ${className}
          dark:bg-gradient-to-tr dark:from-transparent ${colors.dark} dark:to-transparent  
          text-white rounded-full w-full h-full flex items-center justify-center
          bg-gradient-to-tr ${colors.from} ${colors.light} ${colors.to}
          cursor-pointer ${colors.shadow}
          transform transition-all duration-300 ease-out
          hover:scale-110 active:scale-90
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {React.cloneElement(icon, {
          // className: "text-xl transition-transform duration-150",
        })}
      </button>
    </div>
  );
};