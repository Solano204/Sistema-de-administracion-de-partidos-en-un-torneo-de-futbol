"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import clsx from "clsx";
import dynamic from "next/dynamic";

import { PaymentValidationErrors } from "@/components/PaymentRefereeManagament/types/payment-types";
import {
  Match,
  MatchStatus,
  PlayerMatchStats,
  InfoTeamMatchWithoutPlayers,
  MatchResults,
} from "@/components/MatchManagment/types/match-types";
import { useQuery } from "@tanstack/react-query";
import { NeonSelect, SelectOption } from "@/components/common/Common.Select";
import {
  updateMatchStats,
  updateMatchStatusPlayed,
} from "@/components/MatchManagment/api/match-api";
import { UserDetailsRecordFull } from "@/components/RefereeManagment/types/referee-types";
import { fetchAllReferees } from "@/components/RefereeManagment/api/referee-api";
import {
  RefereePaymentInput,
  RefereePaymentInputWithMatch,
  validatePaymentCreate,
} from "@/components/PaymentRefereeManagament";
import {
  fetchPaymentByIdWithMacth,
  updateOrInsertRefereePayment,
} from "@/components/PaymentRefereeManagament/api/payment-api";
import { FormInput } from "@/components/common";
import { statusMatch } from "@/app/(HeroSection)/agenda/types/TypesAgend";
import { FiX } from "react-icons/fi";
import { FaMoneyBillWave } from "react-icons/fa";
import { redirect } from "next/navigation";

// Lazy load heavy components
const TableteamResult = dynamic(() => import("./TableTeamResult").then(mod => ({ default: mod.TableteamResult })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

const PaymentForm = dynamic(() => import("@/components/PaymentRefereeManagament").then(mod => ({ default: mod.PaymentForm })), {
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
});

export type propsMatchStadisctics = {
  className: string;
  match: Match;
};

// Move constants outside component to prevent recreation
const STATUS_OPTIONS: SelectOption<statusMatch>[] = [
  { label: "Pending", value: "PENDIENTE" },
  { label: "Played", value: "JUGADO" },
  { label: "Canceled", value: "CANCELADO" },
  { label: "Postponed", value: "POSPONIDO" },
  { label: "Selected", value: "SELECIONADO" },
];

const CURRENCY_OPTIONS = [
  { value: "MXN", label: "Mexican Peso (MXN)" },
  { value: "USD", label: "US Dollar (USD)" },
];

export const Result = (info: propsMatchStadisctics) => {
  const {
    className,
    match: { id, results, tournament_id, status },
  } = info;

  // State management with proper initialization
  const [errors, setErrors] = useState<PaymentValidationErrors>({});
  const [isValid, setIsValid] = useState(true);
  const [matchDate, setMatchDate] = useState<string>(() => results?.matchDate || "");
  const [statusMatch, setStatusMatch] = useState<statusMatch>(() => status || MatchStatus.PENDIENTE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Referee selection state
  const [selectedReferee, setSelectedReferee] = useState<{
    value: string;
    label: string;
  } | null>(null);

  // Payment form state
  const [formData, setFormData] = useState<Partial<RefereePaymentInput>>(() => ({
    id: "",
    referee: {
      id: "",
      fullName: "",
    },
    paymentDate: new Date().toISOString().split("T")[0],
    hoursWorked: 0,
    hourlyRate: 0,
    totalAmount: 0,
  }));

  const [selectedCurrency, setSelectedCurrency] = useState(() => CURRENCY_OPTIONS[0]);

  // Fetch referees with proper caching
  const { data: referees = [], isLoading: refereesLoading } = useQuery<UserDetailsRecordFull[], Error>({
    queryKey: ["referees"],
    queryFn: fetchAllReferees,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Memoized referee data to prevent recalculations
  const refereeData = useMemo(() => {
    const refereeMap = new Map<string, UserDetailsRecordFull>(
      referees.map((referee) => [referee.id || "", referee])
    );

    const refereeOptions = referees.map((referee) => ({
      label: `${referee.firstName} ${referee.lastName}`,
      value: referee.id || "",
      image: referee.urlPhoto || undefined,
    }));

    return { refereeMap, refereeOptions };
  }, [referees]);

  // Initialize match data once
  const initialMatchData = useMemo(() => {
    const defaultHomeTeam: InfoTeamMatchWithoutPlayers = {
      name: results?.homeTeam?.name || "Home Team",
      id: results?.homeTeam?.id || "",
      goalsWin: { value: 0 },
      goalsAgainst: { value: 0 },
      points: { value: 0 },
    };

    const defaultAwayTeam: InfoTeamMatchWithoutPlayers = {
      name: results?.awayTeam?.name || "Away Team",
      id: results?.awayTeam?.id || "",
      goalsWin: { value: 0 },
      goalsAgainst: { value: 0 },
      points: { value: 0 },
    };

    const homePlayers = (results?.homeTeam?.infoPlayerMatchStats || []).map((player) => ({
      ...player,
      goals: { value: player.goals?.value || 0 },
      points: { value: player.points?.value || 0 },
      jerseyNumber: { value: player.jerseyNumber?.value || 0 },
      cards: {
        yellowCards: player.cards?.yellowCards || 0,
        redCards: player.cards?.redCards || 0,
      },
      attended: player.attended || false,
    }));

    const awayPlayers = (results?.awayTeam?.infoPlayerMatchStats || []).map((player) => ({
      ...player,
      goals: { value: player.goals?.value || 0 },
      points: { value: player.points?.value || 0 },
      jerseyNumber: { value: player.jerseyNumber?.value || 0 },
      cards: {
        yellowCards: player.cards?.yellowCards || 0,
        redCards: player.cards?.redCards || 0,
      },
      attended: player.attended || false,
    }));

    // Calculate goals and points
    const homeGoals = homePlayers.reduce((total, player) => total + (player.goals?.value || 0), 0);
    const awayGoals = awayPlayers.reduce((total, player) => total + (player.goals?.value || 0), 0);

    if (defaultHomeTeam.goalsWin) defaultHomeTeam.goalsWin.value = homeGoals;
    if (defaultHomeTeam.goalsAgainst) defaultHomeTeam.goalsAgainst.value = awayGoals;
    if (defaultAwayTeam.goalsWin) defaultAwayTeam.goalsWin.value = awayGoals;
    if (defaultAwayTeam.goalsAgainst) defaultAwayTeam.goalsAgainst.value = homeGoals;

    // Set points based on goals
    if (homeGoals > awayGoals) {
      if (defaultHomeTeam.points) defaultHomeTeam.points.value = 3;
      if (defaultAwayTeam.points) defaultAwayTeam.points.value = 0;
    } else if (awayGoals > homeGoals) {
      if (defaultHomeTeam.points) defaultHomeTeam.points.value = 0;
      if (defaultAwayTeam.points) defaultAwayTeam.points.value = 3;
    } else {
      if (defaultHomeTeam.points) defaultHomeTeam.points.value = 1;
      if (defaultAwayTeam.points) defaultAwayTeam.points.value = 1;
    }

    return {
      homeTeam: defaultHomeTeam,
      awayTeam: defaultAwayTeam,
      homePlayers,
      awayPlayers,
    };
  }, [results]);

  // Team and player states
  const [homeTeam, setHomeTeam] = useState<InfoTeamMatchWithoutPlayers>(initialMatchData.homeTeam);
  const [awayTeam, setAwayTeam] = useState<InfoTeamMatchWithoutPlayers>(initialMatchData.awayTeam);
  const [homePlayers, setHomePlayers] = useState<PlayerMatchStats[]>(initialMatchData.homePlayers);
  const [awayPlayers, setAwayPlayers] = useState<PlayerMatchStats[]>(initialMatchData.awayPlayers);

  // Initialize payment data only once
  useEffect(() => {
    if (isInitialized || !results?.refereeId) return;

    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        if (!results.refereeId || !id) return;
        const data = await fetchPaymentByIdWithMacth(results.refereeId as string, id as string);

        if (data && isMounted) {
          setFormData({
            id: data.id,
            referee: data.referee,
            paymentDate: data.paymentDate,
            hoursWorked: data.hoursWorked,
            hourlyRate: data.hourlyRate,
            totalAmount: data.totalAmount,
          });

          if (data.referee?.id) {
            const refereeOption = {
              label: data.referee.fullName || "",
              value: data.referee.id,
            };
            setSelectedReferee(refereeOption);
          }

          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Failed to fetch payment data:", error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [results?.refereeId, id, isInitialized]);

  // Optimized input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const newData = { ...prev };

      if (name === "hoursWorked") {
        const hoursWorked = parseFloat(value) || 0;
        const hourlyRate = prev.hourlyRate || 0;
        newData.hoursWorked = hoursWorked;
        newData.totalAmount = hoursWorked * hourlyRate;
      } else if (name === "amount" || name === "hourlyRate") {
        const hourlyRate = parseFloat(value) || 0;
        const hoursWorked = prev.hoursWorked || 0;
        newData.hourlyRate = hourlyRate;
        newData.totalAmount = hourlyRate * hoursWorked;
      } else if (name === "paymentDate") {
        newData.paymentDate = value;
      } else {
        if (name in newData) {
          // @ts-expect-error: Dynamic assignment, types are handled above
          newData[name as keyof RefereePaymentInput] = type === "number" ? parseFloat(value) : value;
        }
      }

      return newData;
    });
  }, []);

  // Optimized referee change handler
  const handleRefereeChange = useCallback((option: { value: string; label: string } | null) => {
    setSelectedReferee(option);
    if (option) {
      setFormData((prev) => ({
        ...prev,
        referee: {
          id: option.value,
          fullName: option.label,
        },
      }));
    }
  }, []);

  // Currency change handler
  const handleCurrencyChange = useCallback((option: { value: string; label: string } | null) => {
    if (option) {
      setSelectedCurrency(option);
    }
  }, []);

  // Status change handler
  const handleStatusSelect = useCallback((option: SelectOption<statusMatch> | null) => {
    if (option) {
      setStatusMatch(option.value);
    }
  }, []);

  // Referee select handler
  const handleRefereeSelect = useCallback((option: SelectOption<string> | null) => {
    handleRefereeChange(option);
  }, [handleRefereeChange]);

  // Modal handlers
  const toggleModal = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  // Team update handlers with memoization
  const handleHomeTeamUpdate = useCallback((updatedTeam: InfoTeamMatchWithoutPlayers) => {
    setHomeTeam(updatedTeam);
    
    const homeGoals = updatedTeam.goalsWin?.value || 0;
    
    setAwayTeam((prev) => {
      const newAwayTeam = {
        ...prev,
        goalsAgainst: { value: homeGoals },
      };
      
      const awayGoals = prev.goalsWin?.value || 0;
      
      // Update points based on goals
      if (homeGoals > awayGoals) {
        updatedTeam.points = { value: 3 };
        newAwayTeam.points = { value: 0 };
      } else if (awayGoals > homeGoals) {
        updatedTeam.points = { value: 0 };
        newAwayTeam.points = { value: 3 };
      } else {
        updatedTeam.points = { value: 1 };
        newAwayTeam.points = { value: 1 };
      }
      
      return newAwayTeam;
    });
  }, []);

  const handleAwayTeamUpdate = useCallback((updatedTeam: InfoTeamMatchWithoutPlayers) => {
    setAwayTeam(updatedTeam);
    
    const awayGoals = updatedTeam.goalsWin?.value || 0;
    
    setHomeTeam((prev) => {
      const newHomeTeam = {
        ...prev,
        goalsAgainst: { value: awayGoals },
      };
      
      const homeGoals = prev.goalsWin?.value || 0;
      
      // Update points based on goals
      if (homeGoals > awayGoals) {
        newHomeTeam.points = { value: 3 };
        updatedTeam.points = { value: 0 };
      } else if (awayGoals > homeGoals) {
        newHomeTeam.points = { value: 0 };
        updatedTeam.points = { value: 3 };
      } else {
        newHomeTeam.points = { value: 1 };
        updatedTeam.points = { value: 1 };
      }
      
      return newHomeTeam;
    });
  }, []);

  // Player update handlers
  const handleHomePlayerUpdate = useCallback((updatedPlayers: PlayerMatchStats[]) => {
    setHomePlayers(updatedPlayers);
    
    const totalHomeGoals = updatedPlayers.reduce(
      (total, player) => total + (player.goals?.value || 0),
      0
    );

    handleHomeTeamUpdate({
      ...homeTeam,
      goalsWin: { value: totalHomeGoals },
    });
  }, [homeTeam, handleHomeTeamUpdate]);

  const handleAwayPlayerUpdate = useCallback((updatedPlayers: PlayerMatchStats[]) => {
    setAwayPlayers(updatedPlayers);
    
    const totalAwayGoals = updatedPlayers.reduce(
      (total, player) => total + (player.goals?.value || 0),
      0
    );

    handleAwayTeamUpdate({
      ...awayTeam,
      goalsWin: { value: totalAwayGoals },
    });
  }, [awayTeam, handleAwayTeamUpdate]);

  // Save handlers
  const handleSave = useCallback(async () => {
    const matchData: MatchResults = {
      idMatch: id,
      matchDate,
      homeTeam: {
        name: homeTeam.name,
        id: homeTeam.id,
        goalsWin: homeTeam.goalsWin,
        goalsAgainst: homeTeam.goalsAgainst,
        points: homeTeam.points,
        infoPlayerMatchStats: homePlayers.map((player) => ({
          idTeam: player.idTeam,
          idPlayer: player.idPlayer,
          namePlayer: player.namePlayer,
          goals: player.goals,
          points: player.points,
          jerseyNumber: player.jerseyNumber,
          cards: player.cards,
          attended: player.attended,
        })),
      },
      awayTeam: {
        name: awayTeam.name,
        id: awayTeam.id,
        goalsWin: awayTeam.goalsWin,
        goalsAgainst: awayTeam.goalsAgainst,
        points: awayTeam.points,
        infoPlayerMatchStats: awayPlayers.map((player) => ({
          idTeam: player.idTeam,
          idPlayer: player.idPlayer,
          namePlayer: player.namePlayer,
          goals: player.goals,
          points: player.points,
          jerseyNumber: player.jerseyNumber,
          cards: player.cards,
          attended: player.attended,
        })),
      },
      refereeId: selectedReferee?.value,
      status: statusMatch,
    };

    if (matchData?.idMatch && matchData.homeTeam && matchData.awayTeam && tournament_id) {
      try {
        await Promise.all([
          updateMatchStats(matchData.idMatch, tournament_id, matchData),
          updateMatchStatusPlayed(matchData.idMatch)
        ]);
        console.log("Match updated successfully");
      } catch (error) {
        console.error("Error updating match stats:", error);
        throw error;
      }
    }
  }, [id, matchDate, homeTeam, awayTeam, homePlayers, awayPlayers, selectedReferee, statusMatch, tournament_id]);

  const handleSubmit = useCallback(async (updatedFormData: Partial<RefereePaymentInput>): Promise<void> => {
    try {
      const validatedData = validatePaymentCreate(updatedFormData);

      const paymentPayload: RefereePaymentInputWithMatch = {
        ...validatedData,
        matchId: id as string,
        referee: {
          id: validatedData.referee.id,
          fullName: validatedData.referee.fullName || "",
        },
        paymentDate: validatedData.paymentDate,
        hoursWorked: validatedData.hoursWorked,
        hourlyRate: validatedData.hourlyRate,
        totalAmount: validatedData.totalAmount,
      };

      await updateOrInsertRefereePayment(paymentPayload);
      await handleSave();
      setIsModalOpen(false);
      
    } catch (error) {
      console.error("Error saving payment:", error);
      throw error;
    }
    redirect("/agenda");
  }, [id, handleSave]);

  if (refereesLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading referees...</span>
      </div>
    );
  }

  return (
    <>
      <div
        className={clsx(
          "flex items-center flex-col gap-6 w-full h-full bg-gradient-to-br from-white/90 to-gray-100/90 dark:from-gray-900/90 dark:to-gray-800/90 p-6 rounded-xl",
          className
        )}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-6 relative">
          {/* Controls Bar */}
          <div className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
            {/* Left side - Referee and Date selection */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search referee
                </label>
                <NeonSelect
                  id="referee-search"
                  options={refereeData.refereeOptions}
                  value={selectedReferee}
                  onChange={handleRefereeSelect}
                  placeholder="Select a referee"
                  searchable={true}
                  className="w-full p-0.5 border border-gray-300 dark:border-gray-600 rounded-md 
                            focus-within:ring-2 focus-within:ring-company-green focus-within:border-company-green 
                            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Match Status
                </label>
                <NeonSelect
                  id="state"
                  options={STATUS_OPTIONS}
                  value={STATUS_OPTIONS.find((option) => option.value === statusMatch) || null}
                  onChange={handleStatusSelect}
                  placeholder="Select status"
                  className="w-full p-0.5 border border-gray-300 dark:border-gray-600 rounded-md 
                            focus-within:ring-2 focus-within:ring-company-green focus-within:border-company-green 
                            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="min-w-[200px]">
                <FormInput
                  id="matchDate"
                  type="date"
                  label="Match Date"
                  name="matchDate"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  error={errors.paymentDate?.[0]}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                            focus:ring-2 focus:ring-company-green focus:border-company-green 
                            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleModal}
                className="text-gray-700 dark:text-gray-300 hover:text-company-green dark:hover:text-company-yellow bg-white/80 dark:bg-gray-700/80 p-2 rounded-full shadow-sm hover:shadow transition-all"
                aria-label="Open payment form"
              >
                <FaMoneyBillWave />
              </button>
            </div>
          </div>
        </div>

        {/* Teams Section */}
        <div className="flex flex-col lg:flex-row w-full gap-6 flex-grow mt-50">
          {/* Home team table */}
          <div className="flex-1 drop-shadow-[0_5px_15px_rgba(60,214,120,0.25)] animate-toggleAnimation">
            <TableteamResult
              players={homePlayers}
              teamInfo={homeTeam}
              onTeamUpdate={handleHomeTeamUpdate}
              onPlayersUpdate={handleHomePlayerUpdate}
              isHomeTeam={true}
            />
          </div>

          {/* Away team table */}
          <div className="flex-1 drop-shadow-[0_5px_15px_rgba(242,242,8,0.25)] animate-toggleAnimation">
            <TableteamResult
              players={awayPlayers}
              teamInfo={awayTeam}
              onTeamUpdate={handleAwayTeamUpdate}
              onPlayersUpdate={handleAwayPlayerUpdate}
              isHomeTeam={false}
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 p-4 sm:p-6 md:p-10 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Referee Payment
              </h3>
              <button
                onClick={toggleModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>
            </div>

            <PaymentForm
              formData={formData}
              refereeOptions={refereeData.refereeOptions}
              selectedReferee={selectedReferee}
              selectedCurrency={selectedCurrency}
              errors={errors}
              isValid={isValid}
              isProcessing={false}
              modalMode={"create"}
              onInputChange={handleInputChange}
              onRefereeChange={handleRefereeChange}
              onCurrencyChange={handleCurrencyChange}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};