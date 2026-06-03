import React from 'react'
import { useGameStore } from '../../store/gameStore'

export const MainMenu: React.FC = () => {
  const player           = useGameStore(s => s.player)
  const navigate         = useGameStore(s => s.navigate)
  const streak           = useGameStore(s => s.streak)
  const dailyChallenges  = useGameStore(s => s.dailyChallenges)
  if (!player) return null

  const expPct = Math.min(100, (player.exp / player.expToNextLevel) * 100)
  const hasClaimable = dailyChallenges.some(c => c.isCompleted && !c.isClaimed)

  const navCards = [
    { emoji:'🗺️', label:'World Map',        screen:'world_map'           as const },
    { emoji:'⚔️', label:'Quick Battle',     screen:'world_map'           as const },
    { emoji:'🎯', label:'Daily Challenges', screen:'daily_challenges'    as const, badge: hasClaimable },
    { emoji:'🏆', label:'Achievements',     screen:'achievements'        as const },
    { emoji:'🎒', label:'Equipment',        screen:'collection_equipment' as const },
    { emoji:'🐾', label:'Pets',             screen:'collection_pets'     as const },
    { emoji:'🛒', label:'Shop',             screen:'shop'                as const },
    { emoji:'⚙️', label:'Settings',        screen:'parent_pin'          as const },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{background:'#FFF8F0'}}>
      {/* Player header */}
      <div className="px-4 pt-5 pb-4" style={{background:'#2D1B69'}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{background:'#FF6B35'}}>
            🧙
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

        {/* Nav grid */}
        <div className="grid grid-cols-2 gap-3">
          {navCards.map(card => (
            <button key={card.label} onClick={() => navigate(card.screen)}
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
      </div>
    </div>
  )
}
