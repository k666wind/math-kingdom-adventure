import React, { useState } from 'react'
import { sfx } from '../../engine/audioEngine'
import { useGameStore } from '../../store/gameStore'
import { REGIONS, SKINS_DATA } from '../../data/gameData'
import { APP_VERSION } from '../../version'

export const MainMenu: React.FC = () => {
  const player           = useGameStore(s => s.player)
  const parentSettings   = useGameStore(s => s.parentSettings)
  const navigate         = useGameStore(s => s.navigate)
  const startBattle      = useGameStore(s => s.startBattle)
  const streak           = useGameStore(s => s.streak)
  const [soundOn, setSoundOn] = useState(sfx.isEnabled())
  const dailyChallenges  = useGameStore(s => s.dailyChallenges)
  if (!player) return null

  const expPct = Math.min(100, (player.exp / player.expToNextLevel) * 100)
  const activeSkin = SKINS_DATA.find(s => s.emoji === player.activeSkin) ?? SKINS_DATA[0]  // 2E-4
  const hasClaimable = dailyChallenges.some(c => c.isCompleted && !c.isClaimed)

  const handleQuickBattle = () => {
    // Gather all battles from unlocked regions that have content
    const available = REGIONS
      .filter(r => player.unlockedRegions.includes(r.id) && r.battles.length > 0)
      .flatMap(r => r.battles.map(b => ({ regionId: r.id, battleId: b.id })))
    if (available.length === 0) { navigate('world_map'); return }
    const pick = available[Math.floor(Math.random() * available.length)]
    startBattle(pick.regionId as any, pick.battleId)
  }

  const navCards = [
    { emoji:'🗺️', label:'World Map',        onClick: () => navigate('world_map') },
    { emoji:'⚡', label:'Quick Battle',     onClick: handleQuickBattle },
    { emoji:'📝', label:'Mock Exam',        onClick: () => navigate('exam_setup') },
    { emoji:'🎯', label:'Daily Challenges', onClick: () => navigate('daily_challenges'), badge: hasClaimable },
    { emoji:'🏆', label:'Achievements',     onClick: () => navigate('achievements') },
    { emoji:'🎒', label:'Equipment',        onClick: () => navigate('collection_equipment') },
    { emoji:'🐾', label:'Pets',             onClick: () => navigate('collection_pets') },
    { emoji:'🛒', label:'Shop',             onClick: () => navigate('shop') },
    { emoji:'⚙️', label:'Settings',        onClick: () => navigate('parent_pin') },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{background:'#FFF8F0'}}>
      {/* Player header */}
      <div className="px-4 pt-5 pb-4" style={{background:'#2D1B69'}}>
        <div className="flex items-center gap-3 mb-3">
          {/* 2E-4: Skin-styled avatar */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: activeSkin.bgColor,
              boxShadow: `0 0 12px ${activeSkin.glowColor}66`,
              border: `2px solid ${activeSkin.glowColor}44`,
            }}>
            {activeSkin.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-fredoka text-white text-base">{player.name}</div>
            <div className="font-nunito text-xs" style={{color:'rgba(255,255,255,0.7)'}}>
              Level {player.level} · {player.exp} / {player.expToNextLevel} EXP
            </div>
            <div className="mt-1 h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.2)'}}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{width:`${expPct}%`,background:'#FFE66D'}}/>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full px-3 py-1.5 flex-shrink-0"
            style={{background:'#FFE66D'}}>
            <span className="text-sm">🪙</span>
            <span className="font-nunito font-bold text-sm" style={{color:'#5a3e00'}}>{player.gold}</span>
          </div>
        </div>
          <button
            onClick={() => { const next = !soundOn; setSoundOn(next); sfx.setEnabled(next); if (next) sfx.tap() }}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
            style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",fontSize:"1rem"}}>
            {soundOn ? "🔊" : "🔇"}
          </button>
      </div>

      {/* Content */}
      <div className="flex-1 scroll-y px-4 py-4">
        {/* Big play button */}
        <button onClick={() => navigate('world_map')}
          className="w-full text-white font-fredoka text-2xl py-4 rounded-2xl mb-4 active:scale-95 transition-transform shadow-lg"
          style={{background:'#FF6B35'}}>
          ⚔️  Continue Quest
        </button>

        {/* Streak */}
        <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
          style={{background:'#e8f0ff',border:'1px solid #c0d0ff'}}>
          <span className="text-2xl">🔥</span>
          <div>
            <div className="font-fredoka text-sm" style={{color:'#2D1B69'}}>
              {streak.count > 0 ? `${streak.count} Day Streak! Keep it up!` : 'Start your streak today!'}
            </div>
            <div className="font-nunito text-xs" style={{color:'#4a5fa0'}}>Play every day for bonus rewards</div>
          </div>
        </div>

        {/* 2H-D: Daily time remaining chip */}
        {parentSettings.dailyTimeLimitMinutes && (() => {
          const usedMins = Math.floor((player.totalPlayTimeSeconds ?? 0) / 60)
          const remaining = Math.max(0, parentSettings.dailyTimeLimitMinutes - usedMins)
          const pct = Math.max(0, remaining / parentSettings.dailyTimeLimitMinutes)
          return (
            <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
              style={{background: pct > 0.3 ? '#e8ffe8' : '#fff0e8', border: `1px solid ${pct > 0.3 ? '#a0dfa0' : '#ffb088'}`}}>
              <span className="text-2xl">⏰</span>
              <div className="flex-1">
                <div className="font-fredoka text-sm" style={{color: pct > 0.3 ? '#1a6b1a' : '#a03000'}}>
                  {remaining > 0 ? `${remaining} min left today` : "Time's up for today!"}
                </div>
                <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{background:'rgba(0,0,0,0.1)'}}>
                  <div className="h-full rounded-full transition-all" style={{width:`${pct*100}%`, background: pct > 0.3 ? '#6BCB77' : '#FF6B35'}}/>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Nav grid */}
        <div className="grid grid-cols-2 gap-3">
          {navCards.map(card => (
            <button key={card.label} onClick={card.onClick}
              className="relative bg-white rounded-2xl p-4 text-center active:scale-95 transition-transform"
              style={{border:'1px solid rgba(45,27,105,0.08)'}}>
              {card.badge && (
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white"
                  style={{background:'#FF4D6D'}}/>
              )}
              <div className="text-3xl mb-1">{card.emoji}</div>
              <div className="font-fredoka text-sm" style={{color:'#2D1B69'}}>{card.label}</div>
            </button>
          ))}
        </div>

        {/* Version */}
        <div className="mt-4 text-center font-nunito text-xs"
          style={{color:"rgba(45,27,105,0.25)"}}>
          v{APP_VERSION}
        </div>
      </div>
    </div>
  )
}
