import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

// ── Timer Bar ─────────────────────────────────────────────────
const TimerBar: React.FC<{ seconds: number; total: number }> = ({ seconds, total }) => {
  const pct = Math.max(0, (seconds / total) * 100)
  const color = pct > 50 ? '#6BCB77' : pct > 25 ? '#FFE66D' : '#FF4D6D'
  return (
    <div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div className="h-full rounded-full timer-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-right font-nunito text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {seconds}s
      </div>
    </div>
  )
}

// ── Combo Badge ───────────────────────────────────────────────
const ComboBadge: React.FC<{ combo: number }> = ({ combo }) => {
  if (combo === 0) return null
  const bg = combo >= 10 ? '#FFE66D' : combo >= 5 ? '#FF6B35' : '#FF6B35'
  const textColor = combo >= 10 ? '#5a3e00' : 'white'
  return (
    <div className="flex items-center gap-1 rounded-full px-3 py-1 font-fredoka text-sm"
      style={{ background: bg, color: textColor }}>
      {combo >= 10 ? '⚡' : '🔥'} Combo ×{combo}
      {combo >= 10 && <span className="animate-flame ml-1">!</span>}
    </div>
  )
}

// ── Answer Button ─────────────────────────────────────────────
interface AnsProps {
  text: string
  index: number
  selected: number | null
  correctIndex: number
  disabled: boolean
  onClick: () => void
}
const AnswerButton: React.FC<AnsProps> = ({ text, index, selected, correctIndex, disabled, onClick }) => {
  if (text === '') return <div className="rounded-2xl opacity-20" style={{ background: 'rgba(255,255,255,0.08)', minHeight: 56 }} />

  const isSelected = selected === index
  const isCorrect  = index === correctIndex
  const revealed   = selected !== null

  let bg     = 'rgba(255,255,255,0.1)'
  let border = 'rgba(255,255,255,0.2)'
  let color  = 'white'
  let icon   = ''

  if (revealed) {
    if (isCorrect)          { bg = 'rgba(107,203,119,0.25)'; border = '#6BCB77'; color = '#a8ffb4'; icon = ' ✓' }
    else if (isSelected)    { bg = 'rgba(255,77,109,0.25)';  border = '#FF4D6D'; color = '#ffb3c2'; icon = ' ✗' }
    else                    { bg = 'rgba(255,255,255,0.04)'; border = 'rgba(255,255,255,0.08)'; color = 'rgba(255,255,255,0.35)' }
  }

  return (
    <button onClick={onClick} disabled={disabled || text === ''}
      className="rounded-2xl py-3.5 px-3 font-fredoka text-base text-center active:scale-95 transition-all duration-150 w-full"
      style={{ background: bg, border: `1.5px solid ${border}`, color }}>
      {text}{icon}
    </button>
  )
}

// ── Main Battle Screen ────────────────────────────────────────
export const BattleScreen: React.FC = () => {
  const battle       = useGameStore(s => s.battle)
  const player       = useGameStore(s => s.player)
  const submitAnswer = useGameStore(s => s.submitAnswer)
  const nextQuestion = useGameStore(s => s.nextQuestion)
  const endBattle    = useGameStore(s => s.endBattle)
  const navigate     = useGameStore(s => s.navigate)

  const [selected,   setSelected]   = useState<number | null>(null)
  const [timeLeft,   setTimeLeft]   = useState(0)
  const [totalTime,  setTotalTime]  = useState(0)
  const [dmgFloat,   setDmgFloat]   = useState<{ val: string; key: number } | null>(null)
  const [shake,      setShake]      = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const floatKey = useRef(0)

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current) }

  // Reset when new question arrives
  useEffect(() => {
    if (battle?.status === 'question' && battle.currentQuestion) {
      const t = (battle.currentQuestion.timeLimitSeconds ?? 15) + (player?.speedBonus ?? 0)
      setSelected(null)
      setTimeLeft(t)
      setTotalTime(t)
      clearTimer()
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearTimer()
            // Time out = wrong answer (index -1)
            handleAnswer(-1)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return clearTimer
  }, [battle?.currentQuestion?.id, battle?.status])

  const handleAnswer = useCallback((idx: number) => {
    if (selected !== null || !battle) return
    clearTimer()
    setSelected(idx)
    const { correct } = submitAnswer(idx)
    floatKey.current++
    if (correct) {
      setDmgFloat({ val: `⚔️ Hit!`, key: floatKey.current })
    } else {
      setShake(true)
      setDmgFloat({ val: `💥 -HP`, key: floatKey.current })
      setTimeout(() => setShake(false), 500)
    }
    // Auto-advance after feedback
    setTimeout(() => {
      const freshBattle = useGameStore.getState().battle
      if (!freshBattle) return
      if (freshBattle.monsterCurrentHp <= 0) {
        endBattle('victory')
      } else if (freshBattle.playerCurrentHp <= 0) {
        endBattle('defeat')
      } else {
        nextQuestion()
      }
    }, 1600)
  }, [selected, battle, submitAnswer, nextQuestion, endBattle])

  if (!battle || !player) return null

  const q = battle.currentQuestion
  const isVictory = battle.status === 'victory'
  const isDefeat  = battle.status === 'defeat'

  // ── Victory Screen ──────────────────────────────────────────
  if (isVictory) {
    const total    = battle.questionsAnswered.length
    const correct  = battle.questionsAnswered.filter(r => r.isCorrect).length
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100
    const perfect  = battle.questionsAnswered.every(r => r.isCorrect)
    const stars: 0|1|2|3 = perfect ? 3 : accuracy >= 75 ? 2 : 1

    const pendingLevelUps = useGameStore.getState().pendingLevelUps
    const handleContinue = () => {
      if (pendingLevelUps.length > 0) { navigate('level_up'); return }
      navigate('region_detail')
    }
    return (
      <div className="h-full flex flex-col items-center px-5 py-8 animate-slide-up"
        style={{ background: 'linear-gradient(180deg,#0f3a1a 0%,#1a5c28 50%,#1a3010 100%)' }}>
        <div className="text-5xl mb-1 animate-pop-in">🏆</div>
        <h1 className="font-fredoka text-4xl mb-1" style={{ color: '#FFE66D' }}>Victory!</h1>
        <p className="font-nunito text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {battle.monster.name} defeated!
        </p>

        {/* Star rating */}
        <div className="flex gap-2 mb-5">
          {[1,2,3].map(n => (
            <span key={n} className="text-4xl transition-all duration-300"
              style={{ opacity: n <= stars ? 1 : 0.2, filter: n <= stars ? 'drop-shadow(0 0 6px #FFE66D)' : 'none' }}>
              ⭐
            </span>
          ))}
        </div>

        {/* Rewards row */}
        <div className="flex gap-3 w-full mb-4">
          {[
            { val: `+${battle.expGained} ⭐`, label: 'EXP' },
            { val: `+${battle.goldGained} 🪙`, label: 'Gold' },
            { val: `×${battle.maxComboReached} 🔥`, label: 'Best Combo' },
          ].map(r => (
            <div key={r.label} className="flex-1 rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="font-fredoka text-lg" style={{ color: '#FFE66D' }}>{r.val}</div>
              <div className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{r.label}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="w-full rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {[
            { label: 'Questions answered', val: String(total) },
            { label: 'Accuracy', val: `${accuracy}%`, green: accuracy >= 80 },
            { label: 'Perfect battle?', val: perfect ? '✓ Yes! +30 EXP & Gold' : 'No' },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-1.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="font-nunito text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
              <span className="font-nunito text-sm font-bold"
                style={{ color: (row as any).green ? '#6BCB77' : 'white' }}>{row.val}</span>
            </div>
          ))}
        </div>

        {/* Drop rewards */}
        {battle.drops && battle.drops.length > 0 && (
          <div className="w-full rounded-2xl p-4 mb-4 text-center"
            style={{ background: 'rgba(255,230,109,0.15)', border: '1px solid rgba(255,230,109,0.4)' }}>
            <div className="font-fredoka text-sm mb-2" style={{ color: '#FFE66D' }}>✨ Item Drop!</div>
            <div className="flex flex-wrap justify-center gap-2">
              {battle.drops.map((id, i) => (
                <span key={i} className="font-nunito text-xs rounded-full px-3 py-1"
                  style={{ background: 'rgba(255,230,109,0.25)', color: '#FFE66D', border: '1px solid rgba(255,230,109,0.5)' }}>
                  {id === 'crystal' ? '💎 Crystal' : `🎁 ${id.replace(/_/g, ' ')}`}
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleContinue}
          className="w-full text-white font-fredoka text-lg py-4 rounded-2xl mb-3 active:scale-95 transition-transform"
          style={{ background: '#FF6B35' }}>
          Continue ⚔️
        </button>
        <button onClick={() => navigate('world_map')}
          className="w-full font-nunito text-sm py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
          ← Back to Map
        </button>
      </div>
    )
  }

  // ── Defeat Screen ───────────────────────────────────────────
  if (isDefeat) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-5 py-8"
        style={{ background: 'linear-gradient(180deg,#2a0a0a 0%,#3a1010 100%)' }}>
        <div className="text-5xl mb-3">💀</div>
        <h1 className="font-fredoka text-4xl mb-2" style={{ color: '#FF4D6D' }}>Defeated...</h1>
        <p className="font-nunito text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {battle.monster.name} was too strong this time.
        </p>
        <button onClick={() => { navigate('world_map') }}
          className="w-full text-white font-fredoka text-lg py-4 rounded-2xl mb-3 active:scale-95 transition-transform"
          style={{ background: '#FF6B35' }}>
          Try Again 💪
        </button>
        <button onClick={() => navigate('world_map')}
          className="w-full font-nunito text-sm py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
          ← Back to Map
        </button>
      </div>
    )
  }

  // ── Active Battle ───────────────────────────────────────────
  const monsterHpPct = Math.max(0, (battle.monsterCurrentHp / battle.monster.maxHp) * 100)
  const playerHpPct  = Math.max(0, (battle.playerCurrentHp / player.maxHp) * 100)

  return (
    <div className="h-full flex flex-col"
      style={{ background: 'linear-gradient(180deg,#1a0e3a 0%,#2D1B69 60%,#3d2a7a 100%)' }}>

      {/* Top bar: region + combo */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {battle.monster.name}
        </div>
        <ComboBadge combo={battle.comboCount} />
      </div>

      {/* Monster area */}
      <div className={`relative px-4 pb-3 ${shake ? 'animate-shake' : ''}`}>
        <div className="text-center mb-2">
          <span className="text-6xl inline-block animate-float">{battle.monster.emoji}</span>
          <div className="font-fredoka text-white text-lg mt-1">{battle.monster.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>HP</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="h-full rounded-full hp-bar-fill"
              style={{ width: `${monsterHpPct}%`, background: monsterHpPct > 50 ? '#6BCB77' : monsterHpPct > 25 ? '#FFE66D' : '#FF4D6D' }} />
          </div>
          <span className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {battle.monsterCurrentHp}/{battle.monster.maxHp}
          </span>
        </div>
        {dmgFloat && (
          <div key={dmgFloat.key} className="absolute top-0 right-8 font-fredoka text-lg animate-float-up pointer-events-none z-10"
            style={{ color: '#FF6B35' }}>
            {dmgFloat.val}
          </div>
        )}
      </div>

      <div className="mx-4 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

      {/* Question area */}
      <div className="flex-1 flex flex-col px-4 pt-3 gap-3">
        {q ? (
          <>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="font-nunito text-xs uppercase tracking-wide mb-2"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                {q.type.replace(/_/g,' ')} · {q.difficulty}
              </div>
              <div className="font-fredoka text-white text-xl text-center leading-tight">
                {q.questionText}
              </div>
            </div>

            {/* Timer */}
            <TimerBar seconds={timeLeft} total={totalTime} />

            {/* Feedback explanation */}
            {selected !== null && (
              <div className="rounded-xl px-4 py-2 animate-slide-down"
                style={{ background: selected === q.correctIndex ? 'rgba(107,203,119,0.15)' : 'rgba(255,77,109,0.15)',
                         border: `1px solid ${selected === q.correctIndex ? '#6BCB77' : '#FF4D6D'}` }}>
                <p className="font-nunito text-sm text-center" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {q.explanation}
                </p>
              </div>
            )}

            {/* Answer buttons */}
            <div className="grid grid-cols-2 gap-3">
              {q.answers.map((ans, i) => (
                <AnswerButton key={i} text={ans} index={i}
                  selected={selected} correctIndex={q.correctIndex}
                  disabled={selected !== null}
                  onClick={() => handleAnswer(i)} />
              ))}
            </div>

            {/* 50/50 button - only if Wise Owl pet active */}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white/40 font-nunito">Loading question...</div>
          </div>
        )}
      </div>

      {/* Player HP bar */}
      <div className="mx-4 mb-4 mt-2 rounded-2xl px-3 py-2.5 flex items-center gap-3"
        style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: '#FF6B35' }}>🧙</div>
        <div className="flex-1">
          <div className="font-nunito text-xs text-white/70">
            HP {battle.playerCurrentHp}/{player.maxHp}
          </div>
          <div className="mt-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="h-full rounded-full hp-bar-fill"
              style={{ width: `${playerHpPct}%`,
                       background: playerHpPct > 50 ? '#4ECDC4' : playerHpPct > 25 ? '#FFE66D' : '#FF4D6D' }} />
          </div>
        </div>
        <div className="rounded-lg px-2 py-1 flex-shrink-0"
          style={{ background: '#FFE66D', color: '#5a3e00' }}>
          <span className="font-fredoka text-xs">Lv.{player.level}</span>
        </div>
      </div>
    </div>
  )
}
