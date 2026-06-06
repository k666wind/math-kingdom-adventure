import React, { useState } from 'react'
import { APP_FULL } from '../../version'
import { useGameStore } from '../../store/gameStore'

type Tab = 'overview' | 'topics' | 'settings'

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
  const navigate       = useGameStore(s => s.navigate)
  const player         = useGameStore(s => s.player)
  const topicProgress  = useGameStore(s => s.topicProgress)
  const parentSettings = useGameStore(s => s.parentSettings)
  const updateParent   = useGameStore(s => s.updateParentSettings)
  const exportSave     = useGameStore(s => s.exportSave)
  const importSave     = useGameStore(s => s.importSave)
  const setPlayerLevel = useGameStore(s => s.setPlayerLevel)
  const [tab, setTab]  = useState<Tab>('overview')
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [devLevel, setDevLevel] = useState<string>("")
  const [devOpen, setDevOpen] = useState(false)
  if (!player) return null

  const topics = Object.values(topicProgress)
  const totalQ = topics.reduce((s,t) => s + t.totalAnswered, 0)
  const totalC = topics.reduce((s,t) => s + t.totalCorrect, 0)
  const accuracy = totalQ > 0 ? Math.round((totalC/totalQ)*100) : 0

  const topicItems = topics.map(t => ({
    name: t.type.replace(/_/g,' '),
    pct: t.totalAnswered > 0 ? Math.round((t.totalCorrect/t.totalAnswered)*100) : 0,
  })).sort((a,b) => a.pct - b.pct)

  const getColor = (pct: number) =>
    pct >= 80 ? { bg:'rgba(107,203,119,0.12)', border:'rgba(107,203,119,0.4)', text:'#2d7a3f' }
    : pct >= 50 ? { bg:'rgba(255,230,109,0.12)', border:'rgba(255,230,109,0.5)', text:'#7a5c00' }
    : { bg:'rgba(255,77,109,0.1)', border:'rgba(255,77,109,0.3)', text:'#cc2244' }

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
      <div className="flex bg-white" style={{ borderBottom: '1px solid #e0e0e0' }}>
        {(['overview','topics','settings'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 font-nunito text-sm capitalize transition-colors"
            style={{ color: tab===t ? '#2D1B69' : '#aaa',
                     borderBottom: tab===t ? '2px solid #2D1B69' : '2px solid transparent',
                     fontWeight: tab===t ? 700 : 400 }}>
            {t}
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

            {/* Weak topics */}
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
                    <div key={t.name} className="rounded-xl px-3 py-2.5 flex justify-between items-center"
                      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                      <span className="font-nunito text-xs capitalize" style={{ color: '#444' }}>{t.name}</span>
                      <span className="font-nunito text-xs font-bold" style={{ color: c.text }}>{t.pct}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div className="flex flex-col gap-4">
            {/* Timer mode */}
            <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
              <div className="font-fredoka text-sm mb-3" style={{ color: '#2D1B69' }}>⏱️ Timer Mode</div>
              <div className="flex gap-2">
                {(['relaxed','normal','challenge'] as const).map(m => (
                  <button key={m} onClick={() => updateParent({ timerMode: m })}
                    className="flex-1 py-2.5 rounded-xl font-nunito text-xs font-bold capitalize active:scale-95"
                    style={{
                      background: parentSettings.timerMode===m ? '#2D1B69' : '#f0eeff',
                      color: parentSettings.timerMode===m ? 'white' : '#2D1B69',
                    }}>
                    {m==='relaxed' ? '+5s' : m==='challenge' ? '-3s' : 'Normal'}
                  </button>
                ))}
              </div>
              <p className="font-nunito text-xs mt-2" style={{ color: '#aaa' }}>
                Relaxed adds 5 seconds per question. Challenge removes 3 seconds (like the real 11+).
              </p>
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

            {/* ── 2E-1: Dev Tools ── */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,150,0,0.3)' }}>
              <button onClick={() => setDevOpen(!devOpen)}
                className="w-full py-3 px-4 flex justify-between items-center font-nunito text-sm"
                style={{ background: 'rgba(255,150,0,0.08)', color: '#b85c00' }}>
                🛠️ Dev Tools (Testing)
                <span>{devOpen ? '▲' : '▼'}</span>
              </button>
              {devOpen && (
                <div className="px-4 pb-4 pt-3" style={{ background: 'rgba(255,150,0,0.04)' }}>
                  <div className="font-nunito text-xs mb-2" style={{ color: '#888' }}>
                    Current level: <strong>{player.level}</strong>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number" min="1" max="50"
                      value={devLevel}
                      onChange={e => setDevLevel(e.target.value)}
                      placeholder="1–50"
                      className="flex-1 rounded-xl px-3 py-2 font-nunito text-sm outline-none"
                      style={{ border: '1px solid rgba(45,27,105,0.2)', background: 'white' }}
                    />
                    <button
                      onClick={() => {
                        const lvl = parseInt(devLevel)
                        if (lvl >= 1 && lvl <= 50) { setPlayerLevel(lvl); setDevLevel('') }
                      }}
                      className="px-4 py-2 rounded-xl font-fredoka text-sm text-white active:scale-95"
                      style={{ background: '#FF6B35' }}>
                      Set Level
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset game */}
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
