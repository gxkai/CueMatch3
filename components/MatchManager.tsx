import React, { useState, useMemo } from 'react';
import { Player, Match, MatchStatus } from '../types';
import { Swords, Shuffle, Save, RotateCcw, CheckCircle2, Users } from 'lucide-react';

interface MatchManagerProps {
  players: Player[];
  matches: Match[];
  onAddMatch: (p1Id: string, p2Id: string) => void;
  onUpdateMatchResult: (matchId: string, s1: number, s2: number) => void;
  onDeleteMatch: (id: string) => void;
}

const MatchManager: React.FC<MatchManagerProps> = ({
  players,
  matches,
  onAddMatch,
  onUpdateMatchResult,
  onDeleteMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'history'>('create');
  
  // Manual Match State
  const [manualP1, setManualP1] = useState<string>('');
  const [manualP2, setManualP2] = useState<string>('');

  const activeMatches = matches.filter(m => m.status === MatchStatus.PENDING);
  const historyMatches = matches.filter(m => m.status === MatchStatus.COMPLETED).sort((a, b) => b.timestamp - a.timestamp);

  const handleManualCreate = () => {
    if (manualP1 && manualP2 && manualP1 !== manualP2) {
      onAddMatch(manualP1, manualP2);
      setManualP1('');
      setManualP2('');
    }
  };

  const handleRandomMatch = () => {
    if (players.length < 2) return;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    // Just pair the first two for a simple "Quick Match"
    onAddMatch(shuffled[0].id, shuffled[1].id);
  };

  const handleRandomRound = () => {
    // Generate matches for everyone
    if (players.length < 2) return;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    
    // Pair up
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      onAddMatch(shuffled[i].id, shuffled[i + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex p-1 bg-slate-800 rounded-lg w-full md:w-fit">
        {(['create', 'active', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'active' && activeMatches.length > 0 && `(${activeMatches.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Match */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5 text-emerald-400" />
              Manual Pairing
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Player 1</label>
                <select
                  value={manualP1}
                  onChange={(e) => setManualP1(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Player</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id} disabled={p.id === manualP2}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center">
                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">VS</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Player 2</label>
                <select
                  value={manualP2}
                  onChange={(e) => setManualP2(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Player</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id} disabled={p.id === manualP1}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleManualCreate}
                disabled={!manualP1 || !manualP2}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors"
              >
                Create Match
              </button>
            </div>
          </div>

          {/* Random Match */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-purple-400" />
              Random Pairing
            </h3>
            <div className="space-y-4 h-full flex flex-col justify-center">
              <p className="text-slate-400 text-sm mb-4">
                Let the system decide fate. Ensure at least 2 players are available in the roster.
              </p>
              <button
                onClick={handleRandomMatch}
                disabled={players.length < 2}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Shuffle className="w-5 h-5" />
                Quick Random Match
              </button>
              <button
                onClick={handleRandomRound}
                disabled={players.length < 2}
                className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Generate Round (All Players)
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMatches.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No active matches. Create one to get started!
            </div>
          )}
          {activeMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              players={players}
              onUpdate={onUpdateMatchResult}
              onDelete={onDeleteMatch}
            />
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
           {historyMatches.length === 0 ? (
             <div className="p-8 text-center text-slate-500">No match history available yet.</div>
           ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Player 1</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4">Player 2</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {historyMatches.map((m) => {
                  const p1 = players.find(p => p.id === m.player1Id);
                  const p2 = players.find(p => p.id === m.player2Id);
                  const p1Win = (m.score1 || 0) > (m.score2 || 0);
                  const p2Win = (m.score2 || 0) > (m.score1 || 0);
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${p1Win ? 'text-indigo-400' : 'text-slate-300'}`}>
                        {p1?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-slate-900 px-3 py-1 rounded text-slate-200 font-mono">
                          {m.score1} - {m.score2}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-medium ${p2Win ? 'text-indigo-400' : 'text-slate-300'}`}>
                        {p2?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => onDeleteMatch(m.id)} className="text-red-400 hover:text-red-300 text-xs hover:underline">
                           Delete
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
           )}
        </div>
      )}
    </div>
  );
};

// Helper sub-component for Active Match
const MatchCard: React.FC<{
  match: Match;
  players: Player[];
  onUpdate: (id: string, s1: number, s2: number) => void;
  onDelete: (id: string) => void;
}> = ({ match, players, onUpdate, onDelete }) => {
  const [s1, setS1] = useState<string>('');
  const [s2, setS2] = useState<string>('');
  
  const p1 = players.find(p => p.id === match.player1Id);
  const p2 = players.find(p => p.id === match.player2Id);

  const handleSubmit = () => {
    if (s1 !== '' && s2 !== '') {
      onUpdate(match.id, parseInt(s1), parseInt(s2));
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-4 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      
      <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-bold tracking-wider">
        <span>Match #{match.id.slice(0, 4)}</span>
        <button onClick={() => onDelete(match.id)} className="hover:text-red-400 transition-colors">Cancel</button>
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Player 1 */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-white mb-2 truncate">{p1?.name || '???'}</div>
          <input
            type="number"
            min="0"
            value={s1}
            onChange={(e) => setS1(e.target.value)}
            className="w-16 h-12 bg-slate-900 border border-slate-600 text-center text-xl font-bold rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
          />
        </div>

        <div className="text-slate-500 font-bold text-xl">vs</div>

        {/* Player 2 */}
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-white mb-2 truncate">{p2?.name || '???'}</div>
          <input
            type="number"
            min="0"
            value={s2}
            onChange={(e) => setS2(e.target.value)}
            className="w-16 h-12 bg-slate-900 border border-slate-600 text-center text-xl font-bold rounded-lg focus:ring-2 focus:ring-indigo-500 text-white"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={s1 === '' || s2 === ''}
        className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        Finish Match
      </button>
    </div>
  );
};

export default MatchManager;