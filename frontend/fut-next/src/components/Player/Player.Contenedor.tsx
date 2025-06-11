"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/Redux/store";
import {
  setBeginninState,
  setBeginnninTeam,
  setForms,
  setNumberOfCards,
  setTeamData,
} from "@/app/Redux/feature/Card/cardSlice";
import { CardPlayer } from "./Player.CardPlayer";
import { FormCard } from "./Player.FormCard";
// import { DataContainer } from "./Player.DataContainer";
import {  useEffect, useState } from "react";
import { Loadin } from "../common";
// import { useQuery } from "@tanstack/react-query";
// import { fetchTeamWithPlayers } from "@/app/ReactQuery/Team/team-api";
import { useParams } from "next/navigation";
// import { TeamWithPlayersRecord } from "@/app/ReactQuery/Team/team-types";
import { dataTeam } from "@/components/PlayerManagment/index";
import { useRevealer } from "../common/hooks/hookNavigation";
import { useTeamWithPlayers } from "../TeamManagment/index";

export const Team = ({ newTeam }: { newTeam: boolean }) => {

  useRevealer();
 
  const dispatch = useDispatch();
  const { numberOfCards, dataTeam, forms } = useSelector(
    (state: RootState) => state.cards
  );
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const teamId = params.idTeam as string;
  const categoryId = params.id as string;
  
  // Only use the hook if it's not a new team
  const { 
    teamWithPlayers, 
    isLoading, 
    isError, 
  } = useTeamWithPlayers(categoryId, teamId, newTeam);

  useEffect(() => {
    if (newTeam &&  numberOfCards === 0) {
      // For new team mode, initialize empty state

        const dataIniTeam: dataTeam = {
             id: "newTeam",
            name: "",
            categoryId: categoryId,
            logo: "",
            numMembers: 0,
            goals: 0,
            goalsReceived: 0,
            points: 0,
            matches: 0,
            matchesWon: 0,
            matchesDrawn: 0,
            matchesLost: 0,
            qualified: false,
        }
        dispatch(
          setTeamData(  dataIniTeam)
        );
        dispatch(setForms([]));
        dispatch(setNumberOfCards(0));
        dispatch(setBeginninState([]));
        dispatch(setBeginnninTeam(dataIniTeam));
      setLoading(false);
    }
    else if(newTeam && numberOfCards  > 0 ){
      console.log("newTeam && numberOfCards  > 0 ");
      setLoading(false)
    }
     else if (teamWithPlayers) {
      // Only update Redux if we don't have existing form data
      const { info, players } = teamWithPlayers;
      if (info.id !== dataTeam.id) {

       
        dispatch(
          setTeamData({
            id: info.id,
            name: info.name,
            categoryId: info.category.id,
            logo: info.logo,
            numMembers: info.numberOfPlayers,
            goals: info.goalsWin.value,
            goalsReceived: info.goalsAgainst.value,
            points: info.points.value,
            matches: info.matchesPlayed,
            matchesWon: info.matchesWon,
            matchesDrawn: info.matchesDrawn,
            matchesLost: info.matchesLost,
            qualified: info.qualified,
            category: info.category,
          })
        );

        // Create the dataTeam object with proper mapping
        const teamData: dataTeam = {
          id: info.id,
          name: info.name,
          categoryId: info.category.id,
          logo: info.logo,
          numMembers: info.numberOfPlayers,
          goals: info.goalsWin.value, // Assuming goalsWin has a 'value' property
          goalsReceived: info.goalsAgainst.value, // Assuming goalsAgainst has a 'value' property
          points: info.points.value, // Assuming points has a 'value' property
          matches: info.matchesPlayed,
          matchesWon: info.matchesWon,
          matchesDrawn: info.matchesDrawn,
          matchesLost: info.matchesLost,
          qualified: info.qualified,
          category: info.category, // Including full category object
        };


        console.log("teamData");
        dispatch(setTeamData(teamData));
        dispatch(setBeginninState(players));
        dispatch(setBeginnninTeam(teamData));
        dispatch(setNumberOfCards(players.length));
        dispatch(setForms(players));
      }
      setLoading(false);
    }
  }, [newTeam, teamWithPlayers, dispatch]);
  if (isLoading || loading) {
    return (
      <div className="h-full w-full">
        <Loadin />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-red-500">Error loading team data</p>
      </div>
    );
  }

  // If we're in "newTeam" mode...
  if (newTeam) {
    if (numberOfCards === 0) {
      // Show the FormCard if there are no cards yet
      return (
        <div className="flex justify-center items-center">
          <div className="relative w-[315px] h-[420px] rounded-[24px] shadow-[0_4px_8px_rgba(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.2),0_0_8px_rgba(255,255,255,0.1),0_0_16px_rgba(255,255,255,0.08)] overflow-hidden">
            {/* Animated Gradient Border */}
            {/* <div className="absolute inset-[-50px] z-[-2] bg-[conic-gradient(from_45deg,transparent_75%,#fff,transparent_100%)] animate-spin" /> */}
            <div>
            <FormCard />
          </div>
        </div>
        </div>
      );
    } else {
      // Otherwise, render DataContainer and an empty CardPlayer (or adjust as needed)
      return (
        <div className="flex items-center justify-center w-full p-4 px-2 flex-wrap">
        
          <CardPlayer infoTeam={forms} newTeam={newTeam} />
        </div>
      );
    }
  }

  // When newTeam is false, use the current Redux state (or generate data if necessary)
  // If you want to always use stored data, consider reading it from Redux as well.

  return (
    <>
    {/* <div className="revealer"></div> */}
    <div className="w-full h-full">

      <div className="h-full w-full items-center justify-center sm:py-20 sm:px-2 px-2">
        <CardPlayer
          newTeam={newTeam}
          infoTeam={
            numberOfCards > 0 && !newTeam && dataTeam.id === teamWithPlayers?.info.id
            ? forms
              : teamWithPlayers?.players || []
            }
            />
      </div>
    </div>
            </>
  );
};
