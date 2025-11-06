import React from 'react';
import { type SummonerData, type Match } from '../types';
import { Card } from './Card';

interface StatsDisplayProps {
  data: SummonerData;
}

const StatCard: React.FC<{ label: string; value: string | number, className?: string }> = ({ label, value, className }) => (
    <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
    </div>
);


const MatchDetails: React.FC<{ match: Match }> = ({ match }) => {
    const kda = ((match.kills + match.assists) / (match.deaths || 1)).toFixed(2);
    // Refined backgrounds and borders for clearer win/loss distinction
    const resultBg = match.win ? 'bg-sky-900/30' : 'bg-rose-900/30';
    const resultBorder = match.win ? 'border-sky-600' : 'border-rose-600';
    const goldInK = (match.gold / 1000).toFixed(1);

    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${resultBg} ${resultBorder}`}>
            {/* Champion Icon */}
            <div className="flex-shrink-0">
                <img src={match.championIconUrl} alt={match.championName} className="w-14 h-14 rounded-md" />
            </div>
            
            {/* Match Info */}
            <div className="flex-grow">
                <p className={`font-bold text-lg ${match.win ? 'text-sky-300' : 'text-rose-300'}`}>{match.win ? 'Victory' : 'Defeat'}</p>
                <p className="text-sm text-gray-200">{match.championName}</p>
            </div>
            
            {/* KDA Stats */}
            <div className="flex-shrink-0 text-center w-28">
                <p className="font-bold text-base tracking-wide whitespace-nowrap">
                    {match.kills} / <span className="text-red-400">{match.deaths}</span> / {match.assists}
                </p>
                <p className="text-xs text-gray-400 mt-1">{kda} KDA</p>
            </div>

            {/* CS & Gold Stats */}
            <div className="flex-shrink-0 text-center w-20">
                <p className="font-medium text-base text-white">{match.cs} CS</p>
                <p className="text-xs text-yellow-400/80 mt-1">{goldInK}k Gold</p>
            </div>

            {/* Match Duration */}
            <div className="flex-shrink-0 text-center w-16 text-sm text-gray-400">
                <p>{match.durationMinutes} min</p>
            </div>
        </div>
    );
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ data }) => {
  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img src={data.iconUrl} alt="Summoner Icon" className="w-24 h-24 rounded-full border-4 border-sky-400" />
          <span className="absolute -bottom-1 right-0 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-sky-500">{data.level}</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold">{data.gameName} <span className="text-gray-400 font-normal">#{data.tagLine}</span></h2>
          <p className="text-xl text-emerald-400 font-semibold">{data.rank}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-md">
        <StatCard label="Win Rate" value={`${data.winRate.toFixed(1)}%`} />
        <StatCard label="KDA" value={data.kda.toFixed(2)} />
        <StatCard label="CS/min" value={data.avgCsPerMinute.toFixed(1)} />
        <StatCard label="Wins" value={data.recentMatches.filter(m => m.win).length} />

      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 text-gray-300">Recent Matches</h3>
        <div className="flex flex-col gap-3">
            {data.recentMatches.map(match => (
                <MatchDetails key={match.id} match={match} />
            ))}
        </div>
      </div>
    </Card>
  );
};