"use client";

import React, { useEffect, useState } from 'react';
import {TeamScoreTable, PlayerStatsTable	} from "../";
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client

interface TeamStatsPageProps {
  categoryId: string;
}

export const TeamStatsContent: React.FC<TeamStatsPageProps> = ({ categoryId }) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'players'>('teams');

  useEffect(() => {
        
    console.log("activeTab", activeTab);
  }, );
 
  return (
    <div className="z-[20] container mx-auto px-4 py-8 transition-colors duration-300">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'teams'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300'
          }`}
          onClick={() => setActiveTab('teams')}
        >
                  Posiciones
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'players'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300'
          }`}
          onClick={() => setActiveTab('players')}
        >
              Estadísticas de los jugadores
        </button>
      </div>
      
      {/* Content based on active tab */}
      <div className="bg-transparent">
        {activeTab === 'teams' ? (
          <TeamScoreTable categoryId={categoryId} pageSize={10} />
        ) : (
          <PlayerStatsTable categoryId={categoryId} pageSize={10} />
        )}
      </div>
    </div>
  );
};