import React, { useState } from 'react'
import { APP_FULL } from '../../version'
import { useGameStore } from '../../store/gameStore'
import { setSfxVolume, setBgmEnabled } from '../../engine/audioEngine'
import { SwitchAccountButton, AccountPINManager } from '../accounts'
import { getActiveAccountId } from '../../store/accountManager'

type Tab = 'overview' | 'topics' | 'settings' | 'progress'

const PIN_LENGTH = 4

export const ParentPinScreen: React.FC = () => {
  const navigate         = useGameStore(s => s.navigate)
  const checkPin         = useGameStore(s => s.checkParentPin)
  const setPin           = useGameStore(s => s.setParentPin)
  const parentSettings   = useGameStore(s => s.parentSettings)
  const [input, setInput]   = useState('')
  const [error, setError]   = useState(false)
  const [setting, setSetting] = useState(false)

  const handleDigit = (d: string) => {
    if (input.length >= PIN_LENGTH) return
    const next = input + d
    setInput(next)
    setError(false)
    if (next.length === PIN_LENGTH) {
      if (!parentSettings.isPinSet || setting) {
        setPin(next)
        navigate('parent_dashboard')
      } else {
        if (checkPin(next)) {
          navigate('parent_dashboard')
        } else {
          setError(true)
          setTimeout(() => { setInput(''); setError(false) }, 600)
        }
      }
    }
  }

  const handleBack = () => setInput(prev => prev.slice(0,-1))

  return (
    <div className="h-full flex flex-col items-center justify-center px-8"
      style={{ background: '#2D1B69' }}>
      <button onClick={() => navigate('main_menu')}
        className="absolute top-5 left-4 text-white/60 text-2xl">←</button>

      <div className="text-5xl mb-4">🔒</div>
      <h2 className="font-fredoka text-2xl text-white mb-1">Parent Mode</h2>
      <p className="font-nunito text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {!parentSettings.isPinSet || setting ? 'Set a 4-digit PIN' : 'Enter your PIN'}
      </p>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-5 h-5 rounded-full"
            style={{ background: i < input.length
              ? (error ? '#FF4D6D' : '#FFE66D')
              : 'rgba(255,255,255,0.2)' }}/>
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 w-64">
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d,i) => (
          d === '' ? <div key={i}/> :
          <button key={d} onClick={() => d==='⌫' ? handleBack() : handleDigit(d)}
            className="h-14 rounded-2xl font-fredoka text-xl text-white active:scale-90 transition-transform"
            style={{ background: d==='⌫' ? 'rgba(255,77,109,0.3)' : 'rgba(255,255,255,0.12)' }}>
            {d}
          </button>
        ))}
      </div>

      {parentSettings.isPinSet && !setting && (
        <button onClick={() => setSetting(true)}
          className="mt-6 font-nunito text-sm"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          Change PIN
        </button>
      )}
    </div>
  )
}

export const ParentDashboard: React.FC = () => {
  const navigate        = useGameStore(s => s.navigate)
  const player          = useGameStore(s => s.player)
  const topicProgress   = useGameStore(s => s.topicProgress)
  const parentSettings  = useGameStore(s => s.parentSettings)
  const updateParent    = useGameStore(s => s.updateParentSettings)
  const exportSave      = useGameStore(s => s.exportSave)
  const importSave      = useGameStore(s => s.importSave)
  const setPlayerLevel  = useGameStore(s => s.setPlayerLevel)
  const setPlayerGold   = useGameStore(s => s.setPlayerGold)       // BUG-B
  const setPlayerCrystals = useGameStore(s => s.setPlayerCrystals) // BUG-B
  const [tab, setTab]   = useState<Tab>('overview')
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [devLevel, setDevLevel]     = useState<string>('')
  const [devGold, setDevGold]       = useState<string>('')         // BUG-B
  const [devCrystals, setDevCrystals] = useState<string>('')       // BUG-B
  const [devOpen, setDevOpen]       = useState(false)
  if (!player) return null

  const topics    = Object.values(topicProgress)
  const totalQ    = topics.reduce((s,t) => s + t.totalAnswered, 0)
  const totalC    = topics.reduce((s,t) => s + t.totalCorrect, 0)
  const accuracy  = totalQ > 0 ? Math.round((totalC/totalQ)*100) : 0

  const topicItems = topics.map(t => ({
    name: t.type.replace(/_/g,' '),
    pct: t.totalAnswered > 0 ? Math.round((t.totalCorrect/t.totalAnswered)*100) : 0,
    attempted: t.totalAnswered,
  })).sort((a,b) => a.pct - b.pct)

  const getColor = (pct: number) =>
    pct >= 80 ? { bg:'rgba(107,203,119,0.12)', border:'rgba(107,203,119,0.4)', text:'#2d7a3f' }
    : pct >= 50 ? { bg:'rgba(255,230,109,0.12)', border:'rgba(255,230,109,0.5)', text:'#7a5c00' }
    : { bg:'rgba(255,77,109,0.1)', border:'rgba(255,77,109,0.3)', text:'#cc2244' }

  // 2G-3: Weekly stats chart
  const weeklyStats = player.weeklyStats ?? []

  const BarChart = () => {
    const data = weeklyStats.slice(-7)
    if (data.length === 0) return (
      <div className="text-center py-4 font-nunito text-xs" style={{ color: '#bbb' }}>
        No data yet — play daily to see chart
      </div>
    )
    const maxVal = Math.max(...data.map(d => d.attempted || d.correct), 1)
    return (
      <svg viewBox="0 0 280 120" width="100%" style={{ display: 'block' }}>
        {data.map((d, i) => {
          const x = i * 40 + 6
          const correctH = ((d.correct || 0) / maxVal) * 90
          const wrongH   = (((d.attempted || d.correct) - (d.correct || 0)) / maxVal) * 90
          const label    = d.date?.slice(5) ?? ''
          return (
            <g key={d.date}>
              {wrongH > 0 && <rect x={x} y={110 - correctH - wrongH} width={28} height={wrongH} fill="#FF4D6D" rx="2"/>}
              {correctH > 0 && <rect x={x} y={110 - correctH} width={28} height={correctH} fill="#6BCB77" rx="2"/>}
              <text x={x + 14} y={118} textAnchor="middle" fontSize="7" fill="#aaa">{label}</text>
            </g>
          )
        })}
      </svg>
    )
  }

  // Sound settings helpers
  const sound = parentSettings.soundSettings ?? { sfxVolume: 0.8, bgmVolume: 0.3, bgmEnabled: false }
  const access = parentSettings.accessibility ?? { fontScale: 'normal', highContrast: false, readAloud: false }

  return (
    <div className="h-full flex flex-col" style={{ background: '#f4f1ff' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-3" style={{ background: '#2D1B69' }}>
        <button onClick={() => navigate('main_menu')} className="text-white/60 font-nunito text-sm">← Exit</button>
        <div className="flex-1">
          <div className="font-fredoka text-white text-base">🔒 Parent Mode</div>
          <div className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.name}'s progress</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white overflow-x-auto" style={{ borderBottom: '1px solid #e0e0e0' }}>
        {(['overview','topics','progress','settings'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 font-nunito text-xs capitalize transition-colors whitespace-nowrap px-2"
            style={{ color: tab===t ? '#2D1B69' : '#aaa',
                     borderBottom: tab===t ? '2px solid #2D1B69' : '2px solid transparent',
                     fontWeight: tab===t ? 700 : 400 }}>
            {t === 'progress' ? '📊 Charts' : t}
          </button>
        ))}
      </div>

      <div className="flex-1 scroll-y px-4 py-4">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <p className="font-nunito text-xs mb-3 uppercase tracking-wide" style={{ color: '#999' }}>All time</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { val: String(totalQ),       label: 'Questions answered' },
                { val: `${accuracy}%`,       label: 'Accuracy rate' },
                { val: `Lv.${player.level}`, label: 'Current level' },
                { val: String(player.gold),  label: 'Gold earned' },
              ].map(m => (
                <div key={m.label} className="rounded-2xl p-4 bg-white"
                  style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
                  <div className="font-fredoka text-2xl" style={{ color: '#2D1B69' }}>{m.val}</div>
                  <div className="font-nunito text-xs mt-0.5" style={{ color: '#888' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Mock exam history */}
            {player.examHistory && player.examHistory.length > 0 && (
              <div className="rounded-2xl p-4 mb-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
                <div className="font-fredoka text-sm mb-2" style={{ color: '#2D1B69' }}>📝 Recent Mock Exams</div>
                {player.examHistory.slice(0, 3).map(r => (
                  <div key={r.id} className="flex justify-between py-1 border-b last:border-0" style={{ borderColor: 'rgba(45,27,105,0.06)' }}>
                    <span className="font-nunito text-xs" style={{ color: '#555' }}>
                      {r.config.yearGroup} · {r.config.examBoard} · {r.date}
                    </span>
                    <span className="font-nunito text-xs font-bold" style={{ color: r.accuracy >= 80 ? '#2d7a3f' : r.accuracy >= 60 ? '#7a5c00' : '#cc2244' }}>
                      {r.correctAnswers}/{r.totalQuestions} ({r.accuracy}%)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {topicItems.filter(t=>t.pct < 60 && t.pct > 0).length > 0 && (
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: 'rgba(255,244,204,0.8)', border: '1px solid rgba(255,200,0,0.3)' }}>
                <div className="font-fredoka text-sm mb-1" style={{ color: '#7a5c00' }}>💡 Suggested focus areas</div>
                <div className="font-nunito text-xs leading-relaxed" style={{ color: '#5a4000' }}>
                  {topicItems.filter(t=>t.pct<60&&t.pct>0).slice(0,3).map(t=>t.name).join(', ')} — these need more practice. These topics appear in 11+ exams.
                </div>
              </div>
            )}

            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(45,27,105,0.06)', border: '1px solid rgba(45,27,105,0.1)' }}>
              <div className="font-fredoka text-sm mb-1" style={{ color: '#2D1B69' }}>📊 11+ Readiness</div>
              <div className="font-nunito text-xs leading-relaxed" style={{ color: '#555' }}>
                {player.level < 16
                  ? `${player.name} is building foundations (Year 3–5 level). Keep practising daily to reach 11+ preparation level.`
                  : player.level < 23
                  ? `${player.name} is now working on 11+ core topics. Focus on worded problems and ratio.`
                  : `${player.name} is working beyond 11+ level. Excellent preparation for Grammar School entrance!`}
              </div>
            </div>
          </>
        )}

        {/* ── TOPICS ── */}
        {tab === 'topics' && (
          <>
            <p className="font-nunito text-xs mb-3 uppercase tracking-wide" style={{ color: '#999' }}>
              Topic accuracy (green ≥80%, amber ≥50%, red &lt;50%)
            </p>
            {topicItems.length === 0 ? (
              <p className="font-nunito text-sm text-center mt-8" style={{ color: '#aaa' }}>
                No topics attempted yet. Start battling!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {topicItems.map(t => {
                  const c = getColor(t.pct)
                  return (
                    <div key={t.name} className="rounded-xl px-3 py-2.5"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      <div className="flex justify-between items-center">
                        <span className="font-nunito text-xs capitalize" style={{ color: '#444' }}>{t.name}</span>
                        <span className="font-nunito text-xs font-bold" style={{ color: c.text }}>{t.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: c.text }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── PROGRESS CHARTS (2G-3) ── */}
        {tab === 'progress' && (
          <>
            <div className="rounded-2xl p-4 bg-white mb-4" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
              <div className="font-fredoka text-sm mb-1" style={{ color: '#2D1B69' }}>📅 7-Day Activity</div>
              <div className="flex gap-3 mb-2">
                <span className="font-nunito text-xs flex items-center gap-1"><span style={{ color: '#6BCB77' }}>■</span> Correct</span>
                <span className="font-nunito text-xs flex items-center gap-1"><span style={{ color: '#FF4D6D' }}>■</span> Wrong</span>
              </div>
              <BarChart />
            </div>

            <div className="rounded-2xl p-4 bg-white mb-4" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
              <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>📊 Topic Accuracy (Weakest First)</div>
              {topicItems.filter(t => t.attempted > 0).length === 0 ? (
                <p className="font-nunito text-xs text-center" style={{ color: '#aaa' }}>No data yet</p>
              ) : topicItems.filter(t => t.attempted > 0).map(t => (
                <div key={t.name} className="mb-2">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-nunito text-xs capitalize" style={{ color: '#444' }}>{t.name}</span>
                    <span className="font-nunito text-xs font-bold" style={{ color: getColor(t.pct).text }}>
                      {t.pct}% ({t.attempted} attempts)
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(45,27,105,0.08)' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${t.pct}%`,
                      background: t.pct >= 80 ? '#6BCB77' : t.pct >= 50 ? '#FFE66D' : '#FF4D6D',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {player.examHistory && player.examHistory.length > 0 && (
              <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
                <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>📝 Exam History</div>
                {player.examHistory.map(r => (
                  <div key={r.id} className="rounded-xl p-3 mb-2" style={{ background: 'rgba(45,27,105,0.04)' }}>
                    <div className="flex justify-between">
                      <span className="font-nunito text-xs font-bold" style={{ color: '#2D1B69' }}>
                        {r.config.yearGroup} · {r.config.examBoard}
                      </span>
                      <span className="font-nunito text-xs font-bold" style={{ color: r.accuracy >= 80 ? '#2d7a3f' : r.accuracy >= 60 ? '#7a5c00' : '#cc2244' }}>
                        {r.correctAnswers}/{r.totalQuestions} ({r.accuracy}%)
                      </span>
                    </div>
                    <div className="font-nunito text-xs mt-0.5" style={{ color: '#888' }}>
                      {r.date} · {Math.floor(r.timeTakenSeconds / 60)}m {r.timeTakenSeconds % 60}s
                    </div>
                    <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: 'rgba(45,27,105,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: `${r.accuracy}%`, background: r.accuracy >= 80 ? '#6BCB77' : '#FFE66D' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div className="flex flex-col gap-4">

            {/* Timer mode — 2H-E: numeric stepper */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
              <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>⏱️ Timer Adjustment</div>
              <div className="flex items-center gap-3 justify-center">
                <button
                  onClick={() => updateParent({ timerAdjustSeconds: Math.max(-10, ((parentSettings as any).timerAdjustSeconds ?? 0) - 5) })}
                  className="w-10 h-10 rounded-full font-fredoka text-xl flex items-center justify-center active:scale-90"
                  style={{ background: '#f0eeff', color: '#2D1B69' }}>−</button>
                <div className="text-center min-w-16">
                  <div className="font-fredoka text-2xl" style={{ color: '#2D1B69' }}>
                    {((parentSettings as any).timerAdjustSeconds ?? 0) > 0 ? '+' : ''}{(parentSettings as any).timerAdjustSeconds ?? 0}s
                  </div>
                  <div className="font-nunito text-xs" style={{ color: '#aaa' }}>per question</div>
                </div>
                <button
                  onClick={() => updateParent({ timerAdjustSeconds: Math.min(30, ((parentSettings as any).timerAdjustSeconds ?? 0) + 5) })}
                  className="w-10 h-10 rounded-full font-fredoka text-xl flex items-center justify-center active:scale-90"
                  style={{ background: '#f0eeff', color: '#2D1B69' }}>+</button>
              </div>
              <p className="font-nunito text-xs mt-2 text-center" style={{ color: '#aaa' }}>
                −10s = ultra-challenge · 0s = normal · +30s = relaxed
              </p>
            </div>

            {/* 2H-9: Skip battle intro toggle */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-fredoka text-sm" style={{ color: '#2D1B69' }}>⚡ Skip Battle Intro</div>
                  <div className="font-nunito text-xs mt-0.5" style={{ color: '#aaa' }}>Jump straight into questions</div>
                </div>
                <button
                  onClick={() => updateParent({ skipBattleIntro: !parentSettings.skipBattleIntro })}
                  className="w-12 h-6 rounded-full transition-colors relative"
                  style={{ background: parentSettings.skipBattleIntro ? '#6BCB77' : '#ccc' }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                    style={{ left: parentSettings.skipBattleIntro ? '26px' : '2px' }} />
                </button>
              </div>
            </div>

            {/* Daily time limit */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
              <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>⏰ Daily Time Limit</div>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45, 60, null].map(mins => (
                  <button key={String(mins)} onClick={() => updateParent({ dailyTimeLimitMinutes: mins })}
                    className="py-2.5 rounded-xl font-nunito text-xs font-bold active:scale-95"
                    style={{
                      background: parentSettings.dailyTimeLimitMinutes===mins ? '#2D1B69' : '#f0eeff',
                      color: parentSettings.dailyTimeLimitMinutes===mins ? 'white' : '#2D1B69',
                    }}>
                    {mins ? `${mins}m` : '∞'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2G-6: Sound settings */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
              <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>🔊 Sound Settings</div>
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="font-nunito text-xs" style={{ color: '#666' }}>SFX Volume</span>
                  <span className="font-nunito text-xs font-bold" style={{ color: '#2D1B69' }}>{Math.round(sound.sfxVolume * 100)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.1}
                  value={sound.sfxVolume}
                  className="w-full"
                  onChange={e => {
                    const v = Number(e.target.value)
                    setSfxVolume(v)
                    updateParent({ soundSettings: { ...sound, sfxVolume: v } })
                  }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-nunito text-xs" style={{ color: '#666' }}>Background Music</span>
                <button
                  onClick={() => {
                    const next = !sound.bgmEnabled
                    setBgmEnabled(next)
                    updateParent({ soundSettings: { ...sound, bgmEnabled: next } })
                  }}
                  className="px-4 py-1.5 rounded-xl font-nunito text-xs font-bold"
                  style={{
                    background: sound.bgmEnabled ? '#2D1B69' : '#f0eeff',
                    color: sound.bgmEnabled ? 'white' : '#2D1B69',
                  }}>
                  {sound.bgmEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* 2G-7: Accessibility */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
              <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>♿ Accessibility</div>
              <div className="mb-3">
                <div className="font-nunito text-xs mb-2" style={{ color: '#666' }}>Font Size</div>
                <div className="flex gap-2">
                  {(['normal','large','xlarge'] as const).map(fs => (
                    <button key={fs} onClick={() => updateParent({ accessibility: { ...access, fontScale: fs } })}
                      className="flex-1 py-2 rounded-xl font-nunito text-xs font-bold capitalize active:scale-95"
                      style={{
                        background: access.fontScale === fs ? '#2D1B69' : '#f0eeff',
                        color: access.fontScale === fs ? 'white' : '#2D1B69',
                      }}>
                      {fs === 'normal' ? 'A' : fs === 'large' ? 'A+' : 'A++'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-nunito text-xs" style={{ color: '#666' }}>High Contrast</span>
                <button
                  onClick={() => updateParent({ accessibility: { ...access, highContrast: !access.highContrast } })}
                  className="px-4 py-1.5 rounded-xl font-nunito text-xs font-bold"
                  style={{
                    background: access.highContrast ? '#2D1B69' : '#f0eeff',
                    color: access.highContrast ? 'white' : '#2D1B69',
                  }}>
                  {access.highContrast ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-nunito text-xs" style={{ color: '#666' }}>Read Aloud Questions</div>
                  <div className="font-nunito text-xs" style={{ color: '#aaa' }}>Uses device text-to-speech</div>
                </div>
                <button
                  onClick={() => updateParent({ accessibility: { ...access, readAloud: !access.readAloud } })}
                  className="px-4 py-1.5 rounded-xl font-nunito text-xs font-bold"
                  style={{
                    background: access.readAloud ? '#2D1B69' : '#f0eeff',
                    color: access.readAloud ? 'white' : '#2D1B69',
                  }}>
                  {access.readAloud ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Change PIN */}
            <button onClick={() => navigate('parent_pin')}
              className="w-full py-3.5 rounded-2xl font-nunito text-sm font-bold active:scale-95"
              style={{ background: 'rgba(45,27,105,0.08)', color: '#2D1B69' }}>
              🔒 Change PIN
            </button>

            {/* Export save */}
            <button onClick={() => {
              const json = exportSave()
              const blob = new Blob([json], { type: 'application/json' })
              const url  = URL.createObjectURL(blob)
              const a    = document.createElement('a')
              a.href     = url
              a.download = `math-kingdom-save-${player.name}-${new Date().toISOString().slice(0,10)}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
              className="w-full py-3.5 rounded-2xl font-nunito text-sm font-bold active:scale-95"
              style={{ background: 'rgba(78,205,196,0.12)', color: '#1a7a74', border: '1px solid rgba(78,205,196,0.4)' }}>
              💾 Export Save File
            </button>

            {/* Import save */}
            <label className="w-full py-3.5 rounded-2xl font-nunito text-sm font-bold active:scale-95 flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(78,205,196,0.12)', color: '#1a7a74', border: '1px solid rgba(78,205,196,0.4)' }}>
              📂 Import Save File
              <input type="file" accept=".json" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => {
                  const ok = importSave(ev.target?.result as string)
                  setImportMsg(ok ? '✅ Save imported successfully!' : '❌ Import failed — invalid save file.')
                  setTimeout(() => setImportMsg(null), 3000)
                }
                reader.readAsText(file)
                e.target.value = ''
              }} />
            </label>
            {importMsg && (
              <div className="rounded-xl px-4 py-2 text-center font-nunito text-sm"
                style={{ background: importMsg.startsWith('✅') ? 'rgba(107,203,119,0.15)' : 'rgba(255,77,109,0.12)',
                         color: importMsg.startsWith('✅') ? '#2d7a3f' : '#cc2244' }}>
                {importMsg}
              </div>
            )}

            {/* ── Dev Tools (2E-1 + BUG-B) ── */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,150,0,0.3)' }}>
              <button onClick={() => setDevOpen(!devOpen)}
                className="w-full py-3 px-4 flex justify-between items-center font-nunito text-sm"
                style={{ background: 'rgba(255,150,0,0.08)', color: '#b85c00' }}>
                🛠️ Dev Tools (Testing)
                <span>{devOpen ? '▲' : '▼'}</span>
              </button>
              {devOpen && (
                <div className="px-4 pb-4 pt-3 flex flex-col gap-3" style={{ background: 'rgba(255,150,0,0.04)' }}>
                  {/* Set Level */}
                  <div>
                    <div className="font-nunito text-xs mb-2" style={{ color: '#888' }}>
                      Level: <strong>{player.level}</strong>
                    </div>
                    <div className="flex gap-2">
                      <input type="number" min="1" max="50"
                        value={devLevel}
                        onChange={e => setDevLevel(e.target.value)}
                        placeholder="1–50"
                        className="flex-1 rounded-xl px-3 py-2 font-nunito text-sm outline-none"
                        style={{ border: '1px solid rgba(45,27,105,0.2)', background: 'white' }}
                      />
                      <button onClick={() => { const l = parseInt(devLevel); if (l >= 1 && l <= 50) { setPlayerLevel(l); setDevLevel('') } }}
                        className="px-4 py-2 rounded-xl font-fredoka text-sm text-white active:scale-95"
                        style={{ background: '#FF6B35' }}>
                        Set Level
                      </button>
                    </div>
                  </div>
                  {/* Set Gold (BUG-B) */}
                  <div>
                    <div className="font-nunito text-xs mb-2" style={{ color: '#888' }}>
                      Gold: <strong>{player.gold}</strong>
                    </div>
                    <div className="flex gap-2">
                      <input type="number" min="0"
                        value={devGold}
                        onChange={e => setDevGold(e.target.value)}
                        placeholder="amount"
                        className="flex-1 rounded-xl px-3 py-2 font-nunito text-sm outline-none"
                        style={{ border: '1px solid rgba(45,27,105,0.2)', background: 'white' }}
                      />
                      <button onClick={() => { const g = parseInt(devGold); if (!isNaN(g)) { setPlayerGold(g); setDevGold('') } }}
                        className="px-4 py-2 rounded-xl font-fredoka text-sm text-white active:scale-95"
                        style={{ background: '#FFE66D', color: '#5a3e00' }}>
                        Set Gold
                      </button>
                    </div>
                  </div>
                  {/* Set Crystals (BUG-B) */}
                  <div>
                    <div className="font-nunito text-xs mb-2" style={{ color: '#888' }}>
                      Crystals: <strong>{player.crystals}</strong>
                    </div>
                    <div className="flex gap-2">
                      <input type="number" min="0"
                        value={devCrystals}
                        onChange={e => setDevCrystals(e.target.value)}
                        placeholder="amount"
                        className="flex-1 rounded-xl px-3 py-2 font-nunito text-sm outline-none"
                        style={{ border: '1px solid rgba(45,27,105,0.2)', background: 'white' }}
                      />
                      <button onClick={() => { const c = parseInt(devCrystals); if (!isNaN(c)) { setPlayerCrystals(c); setDevCrystals('') } }}
                        className="px-4 py-2 rounded-xl font-fredoka text-sm text-white active:scale-95"
                        style={{ background: '#4ECDC4' }}>
                        Set 💎
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reset game */}
            {/* 2H-0: Account management */}
            <SwitchAccountButton />
            {(() => { const aid = getActiveAccountId(); return aid ? <AccountPINManager accountId={aid} /> : null })()}

            <button onClick={() => { if(window.confirm('Reset ALL game data? This cannot be undone.')) useGameStore.getState().resetGame() }}
              className="w-full py-3.5 rounded-2xl font-nunito text-sm font-bold active:scale-95"
              style={{ background: 'rgba(255,77,109,0.1)', color: '#cc2244', border: '1px solid rgba(255,77,109,0.3)' }}>
              🗑️ Reset Game Data
            </button>
          </div>
        )}

        {/* Version */}
        <div className="mt-4 pb-4 text-center font-nunito text-xs" style={{color:"rgba(45,27,105,0.4)"}}>
          {APP_FULL}
        </div>
      </div>
    </div>
  )
}
