import { type SummonerData, type Match } from '../types';

const RIOT_API_KEY = process.env.RIOT_API_KEY as string;
const DDRAGON_VERSION = '14.14.1'; // Use a recent, fixed version for stability

if (!RIOT_API_KEY) {
    console.error("Riot API Key is missing. Please set the RIOT_API_KEY environment variable.");
}

// FIX: Export REGIONS and RegionKey to be used across the application for type safety.
export const REGIONS = {
    NA: { platform: 'na1', regional: 'americas' },
    EUW: { platform: 'euw1', regional: 'europe' },
    EUNE: { platform: 'eun1', regional: 'europe' },
    KR: { platform: 'kr', regional: 'asia' },
    JP: { platform: 'jp1', regional: 'asia' },
    BR: { platform: 'br1', regional: 'americas' },
    LAN: { platform: 'la1', regional: 'americas' },
    LAS: { platform: 'la2', regional: 'americas' },
    OCE: { platform: 'oc1', regional: 'sea' },
    TR: { platform: 'tr1', regional: 'europe' },
    RU: { platform: 'ru', regional: 'europe' },
};

export type RegionKey = keyof typeof REGIONS;

const apiFetch = async (url: string) => {
    const response = await fetch(url, {
        headers: { 'X-Riot-Token': RIOT_API_KEY }
    });
    if (!response.ok) {
        if (response.status === 403) throw new Error("Invalid or expired Riot API Key.");
        if (response.status === 404) throw new Error("Player not found.");
        throw new Error(`Riot API request failed with status: ${response.status}`);
    }
    return response.json();
};

export const fetchPlayerStats = async (gameName: string, tagLine: string, region: RegionKey): Promise<SummonerData> => {
    if (!RIOT_API_KEY) {
        throw new Error("Riot API key is not configured. The application administrator needs to set it up.");
    }
    
    const { platform, regional } = REGIONS[region];

    // 1. Get Account PUUID
    const accountUrl = `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const account = await apiFetch(accountUrl);
    const puuid = account.puuid;

    // 2. Get Summoner Data (ID, Level, Icon)
    const summonerUrl = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summoner = await apiFetch(summonerUrl);
    const { id: summonerId, profileIconId, summonerLevel } = summoner;

    // 3. Get Ranked Data
    const leagueUrl = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
    const leagueEntries = await apiFetch(leagueUrl);
    const soloQueue = leagueEntries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5');
    const rank = soloQueue ? `${soloQueue.tier} ${soloQueue.rank}` : 'Unranked';
    const totalGames = soloQueue ? soloQueue.wins + soloQueue.losses : 0;
    const overallWinRate = totalGames > 0 ? (soloQueue.wins / totalGames) * 100 : 0;

    // 4. Get Match History (last 5 games)
    const matchIdsUrl = `https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=5`;
    const matchIds = await apiFetch(matchIdsUrl);

    // 5. Get Match Details for each match
    const matchPromises = matchIds.map((matchId: string) => 
        apiFetch(`https://${regional}.api.riotgames.com/lol/match/v5/matches/${matchId}`)
    );
    const matchDetailsList = await Promise.all(matchPromises);
    
    const recentMatches: Match[] = matchDetailsList.map((match: any, index: number) => {
        const participant = match.info.participants.find((p: any) => p.puuid === puuid);
        return {
            id: index,
            championName: participant.championName,
            championIconUrl: `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${participant.championName}.png`,
            win: participant.win,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
            gold: participant.goldEarned,
            durationMinutes: Math.floor(match.info.gameDuration / 60),
        };
    });

    // 6. Calculate aggregate stats from recent matches
    const totalKills = recentMatches.reduce((sum, m) => sum + m.kills, 0);
    const totalDeaths = recentMatches.reduce((sum, m) => sum + m.deaths, 1); // Avoid division by zero
    const totalAssists = recentMatches.reduce((sum, m) => sum + m.assists, 0);
    const totalCs = recentMatches.reduce((sum, m) => sum + m.cs, 0);
    const totalDuration = recentMatches.reduce((sum, m) => sum + m.durationMinutes, 0);
    const recentWinCount = recentMatches.filter(m => m.win).length;

    return {
        gameName: account.gameName,
        tagLine: account.tagLine,
        iconUrl: `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${profileIconId}.png`,
        level: summonerLevel,
        rank,
        winRate: (recentWinCount / recentMatches.length) * 100,
        kda: (totalKills + totalAssists) / totalDeaths,
        avgCsPerMinute: totalDuration > 0 ? totalCs / totalDuration : 0,
        recentMatches,
    };
};