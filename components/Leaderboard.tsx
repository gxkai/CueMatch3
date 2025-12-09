import React from 'react';
import { PlayerStats } from '../types';
import { Trophy, Medal, TrendingUp, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LeaderboardProps {
  stats: PlayerStats[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ stats }) => {
  // Sort stats by points desc, then GD desc
  const sortedStats = [...stats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDifference - a.goalDifference;
  });

  const chartData = sortedStats.map(s => ({
    name: s.name,
    points: s.points
  }));

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          Points Overview
        </h2>
        <div className="h-48 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                  itemStyle={{ color: '#818cf8' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#6366f1' : '#475569'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              Not enough data to display chart.
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-medium tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4 text-center">MP</th>
                <th className="px-6 py-4 text-center">W</th>
                <th className="px-6 py-4 text-center">D</th>
                <th className="px-6 py-4 text-center">L</th>
                <th className="px-6 py-4 text-center">GF</th>
                <th className="px-6 py-4 text-center">GA</th>
                <th className="px-6 py-4 text-center">GD</th>
                <th className="px-6 py-4 text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedStats.map((player, index) => (
                <tr key={player.id} className="hover:bg-slate-700/50 transition-colors text-sm">
                  <td className="px-6 py-4 text-center font-bold text-slate-500">
                    {index === 0 && <Trophy className="w-5 h-5 text-yellow-400 inline" />}
                    {index === 1 && <Medal className="w-5 h-5 text-slate-300 inline" />}
                    {index === 2 && <Medal className="w-5 h-5 text-amber-600 inline" />}
                    {index > 2 && index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{player.name}</td>
                  <td className="px-6 py-4 text-center text-slate-300">{player.played}</td>
                  <td className="px-6 py-4 text-center text-emerald-400">{player.wins}</td>
                  <td className="px-6 py-4 text-center text-slate-400">{player.draws}</td>
                  <td className="px-6 py-4 text-center text-red-400">{player.losses}</td>
                  <td className="px-6 py-4 text-center text-slate-400 hidden sm:table-cell">{player.goalsFor}</td>
                  <td className="px-6 py-4 text-center text-slate-400 hidden sm:table-cell">{player.goalsAgainst}</td>
                  <td className="px-6 py-4 text-center font-mono">
                     <span className={player.goalDifference > 0 ? 'text-green-400' : player.goalDifference < 0 ? 'text-red-400' : 'text-slate-500'}>
                        {player.goalDifference > 0 ? '+' : ''}{player.goalDifference}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-xl text-indigo-400">{player.points}</td>
                </tr>
              ))}
              {sortedStats.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-slate-500">
                    No stats available. Matches must be completed to see rankings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
