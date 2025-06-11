"use client";

import React, { useState, useEffect } from 'react';
// import { PlayerOrganizedRecord } from '../';
import { usePlayerStats } from '../';
import Image from 'next/image';

interface PlayerStatsTableProps {
  categoryId: string;
  pageSize?: number;
}

export const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({ 
  categoryId, 
  pageSize = 10 
}) => {
  const {
    players,
    isLoading,
    error,
    setCategoryId,
    refreshPlayers
  } = usePlayerStats(categoryId);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Set the category ID when it changes
  useEffect(() => {
    if (categoryId) {
      setCategoryId(categoryId);
    }
  }, [categoryId, setCategoryId]);

  // Calculate pagination whenever data changes
  useEffect(() => {
    setTotalPages(Math.ceil(players.length / pageSize));
    
    // Reset to page 1 when data changes
    setCurrentPage(1);
  }, [players, pageSize]);

  // Get current page data
  const indexOfLastPlayer = currentPage * pageSize;
  const indexOfFirstPlayer = indexOfLastPlayer - pageSize;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshPlayers();
  };

  if (isLoading) return <div className="text-center p-4 text-gray-700 dark:text-gray-300">Cargando datos de los jugadores...</div>;
  if (error) return (
    <div className="text-center p-4">
      <div className="text-red-500 dark:text-red-400 mb-2">Error al cargar los datos de los jugadores</div>
      <button 
        onClick={handleRefresh}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );

  if (!players || players.length === 0) {
    return (
      <div className="text-center p-4 text-gray-700 dark:text-gray-300">
        <p className="mb-2">No hay datos de jugadores disponibles</p>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded transition-colors"
        >
          Actualizar
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Estadísticas de los jugadores</h2>
        <button 
          onClick={handleRefresh}
          className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Actualizar
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-800 transition-colors">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jugador</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equipo</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jersey</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Goles</th>
              {/* <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th> */}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarjetas amarillas</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarjetas rojas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {currentPlayers.map((player, index) => (
            <tr 
              key={player.playerId}
              className={index % 2 === 0 
                ? 'bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10' 
                : 'bg-white dark:bg-gray-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
              }
            >
              <td className="px-4 py-3 border-b border-gray-200/20 dark:border-gray-700/20 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 relative">
                    {player.photoUrl ? (
                      <Image  
                        src={player.photoUrl} 
                        alt={`${player.firstName} photo`}
                        width={32}
                        height={32}
                        className="rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {player.firstName?.charAt(0) || "P"}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{player.firstName}</span>
                </div>
              </td>
              <td className="px-4 py-3 border-b border-gray-200/20 dark:border-gray-700/20 transition-colors">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 mr-2 relative">
                    {player.teamLogoUrl ? (
                      <Image 
                        src={player.teamLogoUrl} 
                        alt={`${player.teamName} logo`}
                        width={24}
                        height={24}
                        className="rounded-full ring-1 ring-gray-200 dark:ring-gray-700"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    )}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{player.teamName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center border-b border-gray-200/20 dark:border-gray-700/20 transition-colors">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/70 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {player.jerseyNumber}
                </span>
              </td>
              <td className="px-4 py-3 text-center border-b border-gray-200/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 font-medium transition-colors">{player.goals}</td>
              {/* <td className="px-4 py-3 text-center border-b border-gray-200/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 font-medium transition-colors">{player.points}</td> */}
              <td className="px-4 py-3 text-center border-b border-gray-200/20 dark:border-gray-700/20 transition-colors">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  {player.yellowCards}
                </span>
              </td>
              <td className="px-4 py-3 text-center border-b border-gray-200/20 dark:border-gray-700/20 transition-colors">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  {player.redCards}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center p-4 border-t border-gray-200 dark:border-gray-700">
          <nav>
            <ul className="flex list-none">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Prev
                </button>
              </li>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <li key={number}>
                  <button
                    onClick={() => handlePageChange(number)}
                    className={`mx-1 px-3 py-1 rounded transition-colors ${
                      currentPage === number
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {number}
                  </button>
                </li>
              ))}
              
              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-1 rounded transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};