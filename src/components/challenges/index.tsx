import React, { useMemo } from 'react'
import { useGameStore } from '../../store/gameStore'

interface Challenge { id: string; emoji: string; title: string; desc: string; reward: string; progress: number; target: number }

const getTodayChallenges = (level: number): Challenge[] => [
  {
    id: 'c1', emoji: '📝', title: 'Question Warrior',
    desc: 'Answer 20 questions correctly today',
    reward: '🪙 50 gold', progress: 0, target: 20,
  },
  {
    id: 'c2', emoji: '⚔️', title: 'Monster Hunter',
    desc: 'Defeat 3 monsters without losing HP',
    reward: '💎 1 crystal', progress: 0, target: 3,
  },
  {
    id: 'c3', emoji: '🔥', title: 'Combo King',
    desc: `Keep a combo of ${level >= 10 ? 10 : 5} or more`,
    reward: '🥚 Pet Egg', progress: 0, target: level >= 10 ? 10 : 5,
  },
]

export const DailyChallengesScreen: React.FC = () => {
  const player   = useGameStore(s => s.player)
  const navigate = useGameStore(s => s.navigate)
  if (!player) return null

  const challenges = useMemo(() => getTodayChallenges(player.level), [player.level])
  const today = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' })

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ background: '#2D1B69' }}>
        <button onClick={() => navigate('main_menu')} className="text-2xl text-white">←</button>
        <h1 className="font-fredoka text-xl text-white flex-1">🎯 Daily Challenges</h1>
      </div>

      <div className="flex-1 scroll-y px-4 py-4">
        {/* Date & streak */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>{today}</div>
            <div className="font-nunito text-xs" style={{ color: '#888' }}>Resets at midnight</div>
          </div>
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)' }}>
            <span>🔥</span>
            <span className="font-fredoka text-sm" style={{ color: '#FF6B35' }}>
              Day {player.level} Streak
            </span>
          </div>
        </div>

        {/* Challenge cards */}
        <div className="flex flex-col gap-4">
          {challenges.map(c => {
            const pct  = Math.min(100, (c.progress / c.target) * 100)
            const done = c.progress >= c.target
            return (
              <div key={c.id} className="rounded-2xl p-4 bg-white"
                style={{ border: done ? '2px solid #6BCB77' : '1px solid rgba(45,27,105,0.08)' }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{c.emoji}</span>
                  <div className="flex-1">
                    <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>{c.title}</div>
                    <div className="font-nunito text-xs mt-0.5" style={{ color: '#888' }}>{c.desc}</div>
                  </div>
                  {done && <span className="text-2xl">✅</span>}
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="font-nunito text-xs" style={{ color: '#aaa' }}>Progress</span>
                    <span className="font-nunito text-xs font-bold" style={{ color: '#2D1B69' }}>
                      {c.progress}/{c.target}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#eee' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: done ? '#6BCB77' : '#FF6B35' }}/>
                  </div>
                </div>

                {/* Reward */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ background: 'rgba(255,230,109,0.2)', border: '1px solid rgba(255,230,109,0.4)' }}>
                    <span className="font-nunito text-xs" style={{ color: '#7a5c00' }}>Reward: {c.reward}</span>
                  </div>
                  {done && (
                    <button className="px-4 py-1.5 rounded-full font-nunito text-sm font-bold text-white active:scale-95"
                      style={{ background: '#6BCB77' }}>
                      Claim!
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tip */}
        <div className="mt-5 rounded-2xl p-4"
          style={{ background: 'rgba(45,27,105,0.06)', border: '1px solid rgba(45,27,105,0.1)' }}>
          <div className="font-fredoka text-sm mb-1" style={{ color: '#2D1B69' }}>💡 11+ Tip of the Day</div>
          <div className="font-nunito text-xs leading-relaxed" style={{ color: '#555' }}>
            In Grammar School entrance exams, <strong>worded problems</strong> are the most common reason
            children lose marks. Practise reading questions carefully and identifying what is being asked
            before you calculate.
          </div>
        </div>
      </div>
    </div>
  )
}
