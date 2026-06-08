import React, { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { SplashScreen, WelcomeScreen, NameEntryScreen } from './components/onboarding'
import { MainMenu } from './components/menu'
import { WorldMap } from './components/map'
import { BattleScreen } from './components/battle'
import { LevelUpScreen } from './components/levelup'
import { CollectionEquipment, CollectionPets } from './components/collection'
import { ShopScreen } from './components/shop'
import { DailyChallengesScreen } from './components/challenges'
import { AchievementsScreen } from './components/achievements'
import { ParentPinScreen, ParentDashboard } from './components/parent'
import { ExamSetupScreen, ExamActiveScreen, ExamResultsScreen } from './components/exam'
import { AccountSelectScreen } from './components/accounts'
import { migrateLegacySaveIfNeeded, getAccounts, getActiveAccountId, setActiveAccountId } from './store/accountManager'


// ── 2I-6: Print Report Component ────────────────────────────
function PrintReport() {
  const player        = useGameStore(s => s.player)
  const topicProgress = useGameStore(s => s.topicProgress)
  if (!player) return null

  const topics = Object.values(topicProgress)
    .filter(tp => tp.totalAnswered > 0)
    .map(tp => ({
      name: tp.type.replace(/_/g, ' '),
      year: tp.tier,
      acc:  Math.round((tp.totalCorrect / tp.totalAnswered) * 100),
      box:  tp.srsBox ?? 1,
    }))
    .sort((a, b) => a.acc - b.acc)

  const recentExams = (player.examHistory ?? []).slice(-5)
  const overallAcc  = topics.length
    ? Math.round(topics.reduce((s, t) => s + t.acc, 0) / topics.length)
    : 0

  return (
    <div id="print-report-overlay">
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
        Math Kingdom Adventure — Progress Report
      </h1>
      <p style={{ color: '#666', marginBottom: '16px' }}>
        {player.name} · Level {player.level} · Generated {new Date().toLocaleDateString()}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Current Level', value: `Lv ${player.level}` },
          { label: 'Overall Accuracy', value: `${overallAcc}%` },
          { label: 'Topics Practised', value: `${topics.length}` },
        ].map(c => (
          <div key={c.label} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{c.value}</div>
            <div style={{ color: '#6b7280', fontSize: '11px' }}>{c.label}</div>
          </div>
        ))}
      </div>
      {topics.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Topic Accuracy</h2>
          {topics.map(t => (
            <div key={`${t.name}-${t.year}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '140px', fontSize: '11px', textTransform: 'capitalize' }}>{t.name} ({t.year})</span>
              <div style={{ flex: 1, height: '10px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${t.acc}%`, background: t.acc >= 80 ? '#10b981' : t.acc >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '4px' }} />
              </div>
              <span style={{ width: '35px', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>{t.acc}%</span>
              <span style={{ width: '40px', fontSize: '10px', color: '#6b7280' }}>Box {t.box}</span>
            </div>
          ))}
        </div>
      )}
      {recentExams.length > 0 && (
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Recent Mock Exams</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {['Date','Year Group','Exam Board','Score','Accuracy','Time'].map(h => (
                  <th key={h} style={{ padding: '4px 8px', textAlign: 'left', color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...recentExams].reverse().map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '4px 8px' }}>{r.date}</td>
                  <td style={{ padding: '4px 8px' }}>{r.config.yearGroup}</td>
                  <td style={{ padding: '4px 8px' }}>{r.config.examBoard}</td>
                  <td style={{ padding: '4px 8px' }}>{r.correctAnswers}/{r.totalQuestions}</td>
                  <td style={{ padding: '4px 8px', fontWeight: 'bold', color: r.accuracy >= 80 ? '#065f46' : r.accuracy >= 60 ? '#78350f' : '#991b1b' }}>{r.accuracy}%</td>
                  <td style={{ padding: '4px 8px' }}>{Math.floor(r.timeTakenSeconds/60)}m {r.timeTakenSeconds%60}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ marginTop: '24px', color: '#9ca3af', fontSize: '10px' }}>
        Math Kingdom Adventure · {new Date().toLocaleString()}
      </p>
    </div>
  )
}

export default function App() {
  const screen = useGameStore(s => s.nav.screen)
  const refreshDailyChallenges = useGameStore(s => s.refreshDailyChallenges)
  const player = useGameStore(s => s.player)
  const parentSettings = useGameStore(s => s.parentSettings)
  const navigate = useGameStore(s => s.navigate)

  // 2F-11: Offline warning
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // 2H-0: Account migration — run once on startup
  useEffect(() => {
    const accounts = getAccounts()
    if (accounts.length === 0) {
      // Fresh install or first run with new system
      const migratedId = migrateLegacySaveIfNeeded()
      if (migratedId) {
        // Legacy save migrated — reload to use new persist key
        setActiveAccountId(migratedId)
      }
    } else if (!getActiveAccountId() && accounts.length > 0) {
      // Accounts exist but none active — show account select
      navigate('account_select')
    }
  }, [])

  useEffect(() => { refreshDailyChallenges() }, [])

  // BUG-6: Enforce daily time limit — redirect away from battle if over limit
  useEffect(() => {
    if (screen === 'battle' && player && parentSettings.dailyTimeLimitMinutes) {
      const playMinutes = (player.totalPlayTimeSeconds ?? 0) / 60
      if (playMinutes >= parentSettings.dailyTimeLimitMinutes) {
        navigate('main_menu')
      }
    }
  }, [screen, player?.totalPlayTimeSeconds, parentSettings.dailyTimeLimitMinutes])

  // 2G-7: Font scale class
  const fontScale    = parentSettings.accessibility?.fontScale ?? 'normal'
  const highContrast = parentSettings.accessibility?.highContrast ?? false

  const screens: Record<string, React.ReactNode> = {
    splash:               <SplashScreen />,
    onboarding_welcome:   <WelcomeScreen />,
    onboarding_name:      <NameEntryScreen />,
    main_menu:            <MainMenu />,
    world_map:            <WorldMap />,
    region_detail:        <WorldMap />,   // handled inside WorldMap
    battle:               <BattleScreen />,
    level_up:             <LevelUpScreen />,
    collection_equipment: <CollectionEquipment />,
    collection_pets:      <CollectionPets />,
    shop:                 <ShopScreen />,
    daily_challenges:     <DailyChallengesScreen />,
    achievements:         <AchievementsScreen />,
    parent_pin:           <ParentPinScreen />,
    parent_dashboard:     <ParentDashboard />,
    // 2H-0: Account select
    account_select:       <AccountSelectScreen />,
    // 2G-1: Exam screens
    exam_setup:           <ExamSetupScreen />,
    exam_active:          <ExamActiveScreen />,
    exam_results:         <ExamResultsScreen />,
  }

  // 2F-6: Time limit reached screen
  const isTimeLimitReached = player && parentSettings.dailyTimeLimitMinutes &&
    (player.totalPlayTimeSeconds ?? 0) / 60 >= parentSettings.dailyTimeLimitMinutes &&
    ['battle', 'world_map', 'region_detail'].includes(screen)

  return (
    <div className={`w-full h-full overflow-hidden relative font-scale-${fontScale}${highContrast ? ' high-contrast' : ''}`}>
      {/* 2F-11: Offline banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 text-center py-1 font-nunito text-xs"
          style={{ background: '#FF6B35', color: 'white' }}>
          📵 Offline — progress saves locally
        </div>
      )}
      {/* 2F-6: Daily time limit reached overlay */}
      {isTimeLimitReached ? (
        <div className="h-full flex flex-col items-center justify-center px-6"
          style={{ background: 'linear-gradient(180deg,#1a0e3a 0%,#2D1B69 100%)' }}>
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="font-fredoka text-3xl text-white mb-2">Time's Up!</h1>
          <p className="font-nunito text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
            You've reached today's play limit of {parentSettings.dailyTimeLimitMinutes} minutes.
            Come back tomorrow!
          </p>
          <button onClick={() => navigate('main_menu')}
            className="w-full font-fredoka text-lg py-4 rounded-2xl text-white"
            style={{ background: '#FF6B35' }}>
            Go to Menu
          </button>
        </div>
      ) : (
        screens[screen] ?? <SplashScreen />
      )}
      {/* 2I-6: Print report overlay — invisible until window.print() */}
      <PrintReport />
    </div>
  )
}
