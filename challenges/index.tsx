import React, { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import type { DailyChallenge, WeeklyChallenge } from '../../types'

const CHALLENGE_EMOJI: Record<string, string> = {
  questions_correct: '📝',
  monsters_defeated: '⚔️',
  combo_reached:     '🔥',
  perfect_battle:    '⭐',
  accuracy_streak:   '🎯',
  topic_specific:    '📚',
  boss_defeated:     '👑',
}

const rewardLabel = (reward: { gold?: number; crystals?: number; exp?: number }): string => {
  const parts: string[] = []
  if (reward.gold)     parts.push(`🪙 ${reward.gold} gold`)
  if (reward.crystals) parts.push(`💎 ${reward.crystals} crystal`)
  if (reward.exp)      parts.push(`⭐ ${reward.exp} EXP`)
  return parts.join(' + ') || '🎁 Reward'
}

// ── Weekly Challenge Card ─────────────────────────────────────
const WeeklyChallengeCard: React.FC<{ challenge: WeeklyChallenge; onClaim: () => void }> = ({ challenge, onClaim }) => {
  const pct = Math.min(100, (challenge.currentProgress / challenge.targetValue) * 100)
  return (
    <div className="rounded-2xl p-4 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(45,27,105,0.08) 0%, rgba(255,107,53,0.06) 100%)',
        border: challenge.isCompleted && !challenge.isClaimed ? '2px solid #FF6B35' : '1px solid rgba(45,27,105,0.15)',
      }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📅</span>
        <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>Weekly Challenge</div>
        {challenge.isClaimed && <span className="ml-auto text-lg">🏅</span>}
        {challenge.isCompleted && !challenge.isClaimed && <span className="ml-auto text-lg animate-bounce">✅</span>}
      </div>
      <div className="font-nunito text-sm mb-3" style={{ color: '#444' }}>{challenge.description}</div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="font-nunito text-xs" style={{ color: '#aaa' }}>Progress</span>
          <span className="font-nunito text-xs font-bold" style={{ color: '#2D1B69' }}>
            {Math.min(challenge.currentProgress, challenge.targetValue)}/{challenge.targetValue}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#eee' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: challenge.isClaimed ? '#aaa' : challenge.isCompleted ? '#FF6B35' : '#2D1B69' }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="rounded-full px-3 py-1 font-nunito text-xs"
          style={{ background: 'rgba(255,230,109,0.25)', border: '1px solid rgba(255,230,109,0.5)', color: '#7a5c00' }}>
          {rewardLabel(challenge.reward)}
        </div>
        {challenge.isCompleted && !challenge.isClaimed && (
          <button onClick={onClaim}
            className="px-4 py-1.5 rounded-full font-nunito text-sm font-bold text-white active:scale-95 transition-transform"
            style={{ background: '#FF6B35' }}>
            Claim! 🎁
          </button>
        )}
      </div>
    </div>
  )
}

export const DailyChallengesScreen: React.FC = () => {
  const player                = useGameStore(s => s.player)
  const navigate              = useGameStore(s => s.navigate)
  const dailyChallenges       = useGameStore(s => s.dailyChallenges)
  const weeklyChallenge       = useGameStore(s => s.weeklyChallenge)
  const streak                = useGameStore(s => s.streak)
  const todayStats            = useGameStore(s => s.todayStats)
  const claimChallenge        = useGameStore(s => s.claimChallenge)
  const claimWeeklyChallenge  = useGameStore(s => s.claimWeeklyChallenge)
  const refreshDailyChallenges = useGameStore(s => s.refreshDailyChallenges)
  const refreshWeeklyChallenge = useGameStore(s => s.refreshWeeklyChallenge)

  useEffect(() => { refreshDailyChallenges(); refreshWeeklyChallenge() }, [])

  if (!player) return null

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const claimable = dailyChallenges.filter(c => c.isCompleted && !c.isClaimed).length
  const allDone   = dailyChallenges.length > 0 && dailyChallenges.every(c => c.isClaimed)

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ background: '#2D1B69' }}>
        <button onClick={() => navigate('main_menu')} className="text-2xl text-white">←</button>
        <h1 className="font-fredoka text-xl text-white flex-1">🎯 Daily Challenges</h1>
        {claimable > 0 && (
          <div className="rounded-full px-2.5 py-0.5 font-fredoka text-sm"
            style={{ background: '#FF4D6D', color: 'white' }}>
            {claimable} ready!
          </div>
        )}
      </div>

      <div className="flex-1 scroll-y px-4 py-4">
        {/* Date & streak row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>{today}</div>
            <div className="font-nunito text-xs" style={{ color: '#888' }}>Resets at midnight</div>
          </div>
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)' }}>
            <span>🔥</span>
            <span className="font-fredoka text-sm" style={{ color: '#FF6B35' }}>
              {streak.count} Day{streak.count !== 1 ? 's' : ''} Streak
            </span>
          </div>
        </div>

        {/* Today's stats mini-bar */}
        <div className="rounded-2xl p-3 mb-4 grid grid-cols-4 gap-2"
          style={{ background: 'rgba(45,27,105,0.06)', border: '1px solid rgba(45,27,105,0.1)' }}>
          {[
            { label: '✅ Correct',  val: todayStats.questionsCorrect },
            { label: '⚔️ Defeated', val: todayStats.monstersDefeated },
            { label: '🔥 Best Combo',val: todayStats.highestCombo },
            { label: '⭐ Perfect',   val: todayStats.perfectBattles },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-fredoka text-lg" style={{ color: '#2D1B69' }}>{s.val}</div>
              <div className="font-nunito text-xs leading-tight" style={{ color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* All-done banner with streak bonus info */}
        {allDone && (
          <div className="rounded-2xl p-4 mb-4 text-center"
            style={{ background: 'rgba(107,203,119,0.15)', border: '2px solid #6BCB77' }}>
            <div className="text-3xl mb-1">🎉</div>
            <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>
              All challenges complete!
            </div>
            <div className="font-nunito text-xs mt-1" style={{ color: '#555' }}>
              +1 💎 bonus crystal awarded! New challenges reset at midnight.
            </div>
          </div>
        )}

        {/* 2F-2: Weekly challenge */}
        {weeklyChallenge && (
          <WeeklyChallengeCard challenge={weeklyChallenge} onClaim={claimWeeklyChallenge} />
        )}

        {/* Daily Challenge cards */}
        <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>Today's Challenges</div>
        <div className="flex flex-col gap-4">
          {dailyChallenges.map(c => {
            const pct  = Math.min(100, (c.currentProgress / c.targetValue) * 100)
            const done = c.isCompleted
            const claimed = c.isClaimed
            return (
              <div key={c.id} className="rounded-2xl p-4 bg-white"
                style={{
                  border: claimed
                    ? '1px solid rgba(45,27,105,0.1)'
                    : done
                      ? '2px solid #6BCB77'
                      : '1px solid rgba(45,27,105,0.08)',
                  opacity: claimed ? 0.6 : 1,
                }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{CHALLENGE_EMOJI[c.type] ?? '🎯'}</span>
                  <div className="flex-1">
                    <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>
                      {c.description}
                    </div>
                    {claimed && (
                      <div className="font-nunito text-xs mt-0.5" style={{ color: '#6BCB77' }}>
                        ✓ Claimed!
                      </div>
                    )}
                  </div>
                  {done && !claimed && <span className="text-2xl animate-bounce">✅</span>}
                  {claimed && <span className="text-2xl">🏅</span>}
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="font-nunito text-xs" style={{ color: '#aaa' }}>Progress</span>
                    <span className="font-nunito text-xs font-bold" style={{ color: '#2D1B69' }}>
                      {Math.min(c.currentProgress, c.targetValue)}/{c.targetValue}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#eee' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: claimed ? '#aaa' : done ? '#6BCB77' : '#FF6B35',
                      }} />
                  </div>
                </div>

                {/* Reward + claim */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ background: 'rgba(255,230,109,0.2)', border: '1px solid rgba(255,230,109,0.4)' }}>
                    <span className="font-nunito text-xs" style={{ color: '#7a5c00' }}>
                      {rewardLabel(c.reward)}
                    </span>
                  </div>
                  {done && !claimed && (
                    <button
                      onClick={() => claimChallenge(c.id)}
                      className="px-4 py-1.5 rounded-full font-nunito text-sm font-bold text-white active:scale-95 transition-transform"
                      style={{ background: '#6BCB77' }}>
                      Claim! 🎁
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 11+ Tip */}
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

