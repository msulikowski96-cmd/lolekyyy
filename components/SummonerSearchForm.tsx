
import React, { useState } from 'react';
// FIX: Import REGIONS and RegionKey for type safety and to dynamically generate region options.
import { REGIONS, type RegionKey } from '../services/riotService';

interface SummonerSearchFormProps {
  // FIX: Update region type from string to RegionKey.
  onSearch: (gameName: string, tagLine: string, region: RegionKey) => void;
  isLoading: boolean;
}

// FIX: Use REGIONS object from service to ensure consistency.
const regions = Object.keys(REGIONS);

export const SummonerSearchForm: React.FC<SummonerSearchFormProps> = ({ onSearch, isLoading }) => {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  // FIX: Explicitly type the region state with RegionKey.
  const [region, setRegion] = useState<RegionKey>('NA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameName && tagLine && region && !isLoading) {
      onSearch(gameName, tagLine, region);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-lg border border-slate-700 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
      <select 
        value={region} 
        // FIX: Cast the select value to RegionKey on change.
        onChange={e => setRegion(e.target.value as RegionKey)}
        disabled={isLoading}
        className="bg-gray-900 border border-slate-600 rounded-md p-3 text-lg h-[58px] focus:ring-2 focus:ring-sky-500 outline-none transition-all"
      >
        {regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <div className="flex-grow w-full sm:w-auto flex items-center bg-gray-900 rounded-md border border-slate-600 focus-within:ring-2 focus-within:ring-sky-500 transition-all">
        <input
          type="text"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          placeholder="Game Name"
          className="bg-transparent p-3 w-full outline-none text-lg"
          disabled={isLoading}
        />
        <span className="text-gray-500 font-bold text-lg">#</span>
        <input
          type="text"
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          placeholder="TAG"
          className="bg-transparent p-3 w-28 outline-none text-lg"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !gameName || !tagLine}
        className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-md transition-all duration-300 text-lg shadow-lg h-[58px]"
      >
        {isLoading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
};