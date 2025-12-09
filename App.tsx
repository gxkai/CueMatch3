import React, { useState, useEffect, useMemo } from 'react';
import { Player, Match, MatchStatus, PlayerStats, ViewState } from './types';
import PlayerManager from './components/PlayerManager';
import MatchManager from './components/MatchManager';
import Leaderboard from './components/Leaderboard';
import { getTournamentCommentary } from './services/geminiService';
import { LayoutDashboard, Users, Trophy, Swords, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  // AI State
  const [aiCommentary, setAiCommentary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Stats Calculation
  const stats: PlayerStats[] = useMemo(() => {
    const initialStats: Record<string, PlayerStats> = {};
    
    players.forEach(p => {
      initialStats[p.id] = {
        id: p.id,
        name: p.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    });

    matches.forEach(m => {
      if (m.status === MatchStatus.COMPLETED && m.score1 !== null && m.score2 !== null) {
        const p1 = initialStats[m.player1Id];
        const p2 = initialStats[m.player2Id];

        if (p1 && p2) {
          p1.played++;
          p2.played++;
          
          p1.goalsFor += m.score1;
          p1.goalsAgainst += m.score2;
          p1.goalDifference = p1.goalsFor - p1.goalsAgainst;

          p2.goalsFor += m.score2;
          p2.goalsAgainst += m.score1;
          p2.goalDifference = p2.goalsFor - p2.goalsAgainst;

          if (m.score1 > m.score2) {
            p1.wins++;
            p1.points += 3;
            p2.losses++;
          } else if (m.score2 > m.score1) {
            p2.wins++;
            p2.points += 3;
            p1.losses++;
          } else {
            p1.draws++;
            p1.points += 1;
            p2.draws++;
            p2.points += 1;
          }
        }
      }
    });

    return Object.values(initialStats);
  }, [players, matches]);

  // Handlers
  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      joinedAt: Date.now()
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    // Also remove pending matches involving this player
    setMatches(prev => prev.filter(m => m.status === MatchStatus.COMPLETED || (m.player1Id !== id && m.player2Id !== id)));
  };

  const handleAddMatch = (p1Id: string, p2Id: string) => {
    const newMatch: Match = {
      id: crypto.randomUUID(),
      player1Id: p1Id,
      player2Id: p2Id,
      score1: null,
      score2: null,
      status: MatchStatus.PENDING,
      timestamp: Date.now()
    };
    setMatches(prev => [newMatch, ...prev]);
  };

  const handleUpdateMatchResult = (id: string, s1: number, s2: number) => {
    setMatches(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, score1: s1, score2: s2, status: MatchStatus.COMPLETED };
      }
      return m;
    }));
  };

  const handleDeleteMatch = (id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  const handleGenerateCommentary = async () => {
    if (players.length === 0) {
      setAiCommentary("Add some players to get the tournament started!");
      return;
    }
    setIsAiLoading(true);
    const recentMatches = matches.filter(m => m.status === MatchStatus.COMPLETED).sort((a,b) => b.timestamp - a.timestamp);
    const text = await getTournamentCommentary(stats, recentMatches, players);
    setAiCommentary(text);
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Mobile Nav Overlay could go here, but doing simple layout for SPA */}
      
      <div className="flex flex-col md:flex-row min-h-screen">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">ArenaMatch</h1>
          </div>

          <nav className="space-y-2 flex-1">
            <NavButton 
              active={view === 'dashboard'} 
              onClick={() => setView('dashboard')} 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
            />
            <NavButton 
              active={view === 'players'} 
              onClick={() => setView('players')} 
              icon={<Users size={20} />} 
              label="Players" 
            />
            <NavButton 
              active={view === 'matches'} 
              onClick={() => setView('matches')} 
              icon={<Swords size={20} />} 
              label="Matches" 
              badge={matches.filter(m => m.status === MatchStatus.PENDING).length}
            />
            <NavButton 
              active={view === 'rankings'} 
              onClick={() => setView('rankings')} 
              icon={<Trophy size={20} />} 
              label="Rankings" 
            />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
             <div className="text-xs text-slate-500 text-center">
               ArenaMatch v1.0 <br/> Powered by Gemini
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            
            {/* Header Area */}
            <div className="flex justify-between items-end mb-8">
              <div>
                 <h2 className="text-3xl font-bold text-white mb-2 capitalize">{view}</h2>
                 <p className="text-slate-400">
                   {view === 'dashboard' && 'Tournament overview and insights.'}
                   {view === 'players' && 'Manage your tournament roster.'}
                   {view === 'matches' && 'Schedule and record match results.'}
                   {view === 'rankings' && 'Current standings and statistics.'}
                 </p>
              </div>
              
              {/* Global Actions (e.g. AI Button) */}
              <button 
                onClick={handleGenerateCommentary}
                disabled={isAiLoading}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-full shadow-lg shadow-indigo-500/20 transition-all font-medium text-sm"
              >
                {isAiLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isAiLoading ? 'Analyzing...' : 'AI Commentary'}
              </button>
            </div>

            {/* AI Banner for Mobile or Desktop */}
            {(aiCommentary || isAiLoading) && (
              <div className="mb-8 p-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                   <div className="bg-indigo-500/20 p-2 rounded-lg shrink-0">
                     <Sparkles className="w-6 h-6 text-indigo-400" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-indigo-300 font-bold text-sm uppercase tracking-wider mb-2">Tournament Caster AI</h3>
                     {isAiLoading ? (
                       <div className="h-4 w-3/4 bg-indigo-500/20 animate-pulse rounded"></div>
                     ) : (
                       <div className="text-slate-200 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
                         <div dangerouslySetInnerHTML={{ __html: aiCommentary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                       </div>
                     )}
                   </div>
                   <button onClick={() => setAiCommentary('')} className="text-slate-400 hover:text-white">
                     <span className="sr-only">Dismiss</span>
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
              </div>
            )}

            {/* Views */}
            {view === 'dashboard' && (
              <DashboardView 
                stats={stats} 
                matchCount={matches.length} 
                playerCount={players.length}
                onQuickMatch={() => setView('matches')}
                onAddPlayer={() => setView('players')}
              />
            )}

            {view === 'players' && (
              <PlayerManager 
                players={players} 
                onAddPlayer={handleAddPlayer} 
                onRemovePlayer={handleRemovePlayer} 
              />
            )}

            {view === 'matches' && (
              <MatchManager 
                players={players} 
                matches={matches} 
                onAddMatch={handleAddMatch}
                onUpdateMatchResult={handleUpdateMatchResult}
                onDeleteMatch={handleDeleteMatch}
              />
            )}

            {view === 'rankings' && (
              <Leaderboard stats={stats} />
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

// Sub-components for cleaner App.tsx

const NavButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  badge?: number;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge ? (
      <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    ) : null}
  </button>
);

const DashboardView: React.FC<{
  stats: PlayerStats[];
  matchCount: number;
  playerCount: number;
  onQuickMatch: () => void;
  onAddPlayer: () => void;
}> = ({ stats, matchCount, playerCount, onQuickMatch, onAddPlayer }) => {
  const topPlayer = stats.sort((a,b) => b.points - a.points)[0];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stat Cards */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
         <div>
           <p className="text-slate-400 text-sm font-medium uppercase">Total Players</p>
           <h3 className="text-4xl font-bold text-white mt-2">{playerCount}</h3>
         </div>
         <div className="mt-4">
           <button onClick={onAddPlayer} className="text-indigo-400 text-sm font-medium hover:text-indigo-300 flex items-center gap-1">
             Manage Roster &rarr;
           </button>
         </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
         <div>
           <p className="text-slate-400 text-sm font-medium uppercase">Matches Played</p>
           <h3 className="text-4xl font-bold text-white mt-2">{matchCount}</h3>
         </div>
         <div className="mt-4">
           <button onClick={onQuickMatch} className="text-indigo-400 text-sm font-medium hover:text-indigo-300 flex items-center gap-1">
             Go to Matchmaking &rarr;
           </button>
         </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
         <div>
           <p className="text-indigo-100 text-sm font-medium uppercase flex items-center gap-2">
             <Trophy className="w-4 h-4" /> Current Leader
           </p>
           <h3 className="text-3xl font-bold mt-2 truncate">{topPlayer?.name || 'N/A'}</h3>
           {topPlayer && (
             <p className="text-indigo-100 mt-1 text-sm">{topPlayer.points} pts / {topPlayer.wins} wins</p>
           )}
         </div>
      </div>

      {/* Mini Leaderboard Preview */}
      <div className="md:col-span-2 lg:col-span-3 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mt-4">
        <h3 className="text-lg font-bold text-white mb-4">Top Performers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stats.slice(0, 3).map((p, i) => (
             <div key={p.id} className="bg-slate-700/50 p-4 rounded-lg flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                 ${i===0 ? 'bg-yellow-500 text-yellow-950' : i===1 ? 'bg-slate-400 text-slate-900' : 'bg-amber-600 text-amber-950'}
               `}>
                 {i+1}
               </div>
               <div>
                 <div className="text-white font-medium">{p.name}</div>
                 <div className="text-slate-400 text-xs">{p.points} Pts • {p.wins} W</div>
               </div>
             </div>
          ))}
          {stats.length === 0 && (
             <div className="text-slate-500 italic text-sm">No rankings yet. Complete a match to see stats!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
