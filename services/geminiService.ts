import { GoogleGenAI } from "@google/genai";
import { PlayerStats, Match, Player } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getTournamentCommentary = async (
  stats: PlayerStats[],
  recentMatches: Match[],
  allPlayers: Player[]
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Enrich match data with player names for the context
    const enrichedMatches = recentMatches.slice(0, 5).map(m => {
      const p1 = allPlayers.find(p => p.id === m.player1Id)?.name || 'Unknown';
      const p2 = allPlayers.find(p => p.id === m.player2Id)?.name || 'Unknown';
      return `${p1} vs ${p2}: ${m.score1}-${m.score2}`;
    });

    const top3 = stats.slice(0, 3).map(s => `${s.name} (${s.points}pts)`);

    const prompt = `
      You are an excited e-sports shoutcaster or sports commentator. 
      Analyze the current state of this tournament.
      
      Top Players: ${top3.join(', ')}
      Recent Results: ${enrichedMatches.join(' | ')}
      Total Players: ${allPlayers.length}
      
      Give me a short, hype paragraph (max 100 words) summarizing the action, mentioning who is dominating, and any potential upsets. 
      Keep it energetic and fun. Use markdown for bolding key names.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "The tournament is heating up! Keep playing to generate more insights.";
  } catch (error) {
    console.error("Error generating commentary:", error);
    return "The AI commentator is currently on a coffee break. (Check API Key)";
  }
};
