
import React, { useState, useCallback } from 'react';
import { SummonerSearchForm } from './components/SummonerSearchForm';
import { StatsDisplay } from './components/StatsDisplay';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
// FIX: Import RegionKey to enforce type safety for the region parameter.
import { fetchPlayerStats, type RegionKey } from './services/riotService';
import { analyzePlayerStats } from './services/geminiService';
import { type SummonerData } from './types';

const App: React.FC = () => {
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // FIX: Update the region parameter type from string to RegionKey to match the fetchPlayerStats service.
  const handleSearch = useCallback(async (gameName: string, tagLine: string, region: RegionKey) => {
    setIsLoading(true);
    setError(null);
    setSummonerData(null);
    setAnalysis(null);

    try {
      // Fetch stats from the live Riot API
      const stats = await fetchPlayerStats(gameName, tagLine, region);
      setSummonerData(stats);
      
      // Once stats are fetched, get the AI analysis
      const aiAnalysis = await analyzePlayerStats(stats);
      setAnalysis(aiAnalysis);

    } catch (err) {
      if (err instanceof Error) {
        // Provide more specific error messages based on the error from the service
        setError(err.message);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            LoL Performance Analyst AI
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Get your stats analyzed by Gemini for pro-level insights.
          </p>
        </header>

        <main>
          <SummonerSearchForm onSearch={handleSearch} isLoading={isLoading} />

          {isLoading && <LoadingSpinner />}
          
          {error && (
            <div className="mt-8 bg-rose-900/50 border border-rose-700 text-rose-300 px-4 py-3 rounded-lg text-center">
              <p>{error}</p>
            </div>
          )}

          {summonerData && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2">
                <StatsDisplay data={summonerData} />
              </div>
              <div className="lg:col-span-3">
                {analysis ? (
                   <AnalysisDisplay analysis={analysis} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {/* Placeholder for when stats are loaded but analysis is still coming */}
                  </div>
                )}
              </div>
            </div>
          )}

          {!isLoading && !summonerData && !error && (
            <div className="text-center mt-16 text-gray-500">
                <p>Enter a player's Game Name and Tagline to begin.</p>
                <p className="text-sm mt-2">(e.g., "Tenacity" + "NA1" in North America)</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;