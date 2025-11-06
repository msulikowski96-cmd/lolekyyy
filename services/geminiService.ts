import { GoogleGenAI } from "@google/genai";
import { type SummonerData } from '../types';

const formatStatsForPrompt = (stats: SummonerData): string => {
  const matchDetails = stats.recentMatches.map(match => 
    `- Champion: ${match.championName}, KDA: ${match.kills}/${match.deaths}/${match.assists}, CS: ${match.cs}, Result: ${match.win ? 'Win' : 'Loss'}`
  ).join('\n');

  return `
    Act as a professional and encouraging League of Legends coach. Your task is to analyze the following player's performance based on their recent match history and overall stats.

    **Player Profile:**
    - Game Name: ${stats.gameName}
    - Rank: ${stats.rank}
    - Overall Win Rate (last 5 games): ${stats.winRate.toFixed(1)}%
    - Overall KDA (last 5 games): ${stats.kda.toFixed(2)}
    - Average CS per Minute: ${stats.avgCsPerMinute.toFixed(1)}

    **Recent Matches:**
    ${matchDetails}

    **Your Analysis (Use Markdown):**
    Based on this data, provide a concise and actionable analysis. Structure your response in three distinct sections using markdown headings:
    
    ### Strengths
    Identify 2-3 positive patterns or standout performances using a bulleted list. Be specific and encouraging, and use bold markdown for emphasis on key stats or actions.
    
    ### Areas for Improvement
    Pinpoint 2-3 key weaknesses or inconsistent areas using a bulleted list. Be constructive and avoid overly negative language. Use bold markdown for emphasis.
    
    ### Actionable Tips
    Give 3 concrete, specific, and easy-to-understand tips as a numbered list. These tips should directly address the identified areas for improvement.
  `;
}

export const analyzePlayerStats = async (stats: SummonerData): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const prompt = formatStatsForPrompt(stats);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing player stats with Gemini:", error);
    throw new Error("Failed to get analysis from AI.");
  }
};