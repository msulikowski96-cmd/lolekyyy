
import React, { useState, useCallback } from 'react';
import { SummonerSearchForm } from './components/SummonerSearchForm';
import { StatsDisplay } from './components/StatsDisplay';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Card } from './components/Card';
import { fetchPlayerStats, type RegionKey } from './services/riotService';
import { analyzePlayerStats } from './services/geminiService';
import { type SummonerData } from './types';

// Component to handle API Key input, shown on first load.
interface ApiKeyInputProps {
  onApiKeySubmit: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="flex items-center justify-center w-full max-w-lg">
      <Card className="w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-sky-300">Riot Games API Key Required</h2>
        <p className="text-gray-400 text-center mb-6">
          To analyze player stats, you need to provide a development API key from the 
          <a href="https://developer.riotgames.com/" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline ml-1">Riot Games Developer Portal</a>. 
          These keys expire every 24 hours.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Riot API Key (RGAPI-...)"
            className="bg-gray-900 border border-slate-600 rounded-md p-3 text-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            required
            aria-label="Riot API Key Input"
          />
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-all duration-300 text-lg"
          >
            Save and Continue
          </button>
        </form>
      </Card>
    </div>
  );
};


const App: React.FC = () => {
  const [riotApiKey, setRiotApiKey] = useState<string | null>(() => sessionStorage.getItem('RIOT_API_KEY'));
  const [summonerData, setSummonerData] = useState<SummonerData | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiKeySubmit = (key: string) => {
    sessionStorage.setItem('RIOT_API_KEY', key);
    setRiotApiKey(key);
  };

  const handleSearch = useCallback(async (gameName: string, tagLine: string, region: RegionKey) => {
    if (!riotApiKey) {
      setError("Riot API Key is missing. Please provide it to continue.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummonerData(null);
    setAnalysis(null);

    try {
      // Pass the API key from state to the service
      const stats = await fetchPlayerStats(gameName, tagLine, region, riotApiKey);
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
  }, [riotApiKey]);

  // If the Riot API key is not set, render the input form.
  if (!riotApiKey) {
    return (
      <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
      </div>
    );
  }

  // Once the key is set, render the main application.
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
