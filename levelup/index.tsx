import React, { useEffect } from 'react'
import { sfx } from '../../engine/audioEngine'
import { useGameStore } from '../../store/gameStore'

export const LevelUpScreen: React.FC = () => {
  const pendingLevelUps    = useGameStore(s => s.pendingLevelUps)
  const clearPendingLevelUps = useGameStore(s => s.clearPendingLevelUps)
  const navigate           = useGameStore(s => s.navigate)
  const player             = useGameStore(s => s.player)

  // 2C-5: Play level-up sound when screen mounts
  useEffect(() => { sfx.levelUp() }, [])

  if (!pendingLevelUps.length || !player) {
    navigate('main_menu')
    return null
  }

  const top = pendingLevelUps[0]

  const handleContinue = () => {
    clearPendingLevelUps()
    navigate('main_menu')
  }

  return (
    <div className="h-full flex flex-col items-center px-5 py-8 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg,#1a0a4a 0%,#2D1B69 100%)' }}>

      {/* Stars burst */}
      <div className="text-6xl mb-2 animate-stars-burst">✨</div>
      <h1 className="font-fredoka text-4xl mb-1" style={{ color: '#FFE66D' }}>
        Level {top.newLevel}!
      </h1>
      <p className="font-nunito text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
        You're getting stronger!
      </p>

      {/* Stat bumps */}
      <div className="grid grid-cols-2 gap-3 w-full mb-5">
        {[
          { label: 'Max HP', val: `+10 → ${player.maxHp}` },
          { label: 'Attack', val: `+3 → ${player.attack}` },
          { label: 'Defence', val: `+1 → ${player.defence}` },
          { label: 'EXP Bonus', val: '+5 per answer' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="font-fredoka text-lg" style={{ color: '#6BCB77' }}>{s.val}</div>
            <div className="font-nunito text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rewards unlocked */}
      {top.rewards.length > 0 && (
        <div className="w-full mb-5">
          {top.rewards.map(r => (
            <div key={r.id} className="rounded-2xl p-4 mb-3 text-center animate-pop-in"
              style={{ background: 'rgba(255,107,53,0.15)', border: '1.5px solid #FF6B35' }}>
              <div className="text-3xl mb-1">
                {r.type === 'equipment' ? '🎒' : r.type === 'pet' ? '🐾' : '🗺️'}
              </div>
              <div className="font-fredoka text-lg text-white">
                {r.type === 'region_unlock' ? '🗺️ New Region Unlocked!' : '🎁 New Item!'}
              </div>
              <div className="font-nunito text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {r.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleContinue}
        className="w-full text-white font-fredoka text-xl py-4 rounded-2xl active:scale-95 transition-transform mt-auto"
        style={{ background: '#FF6B35' }}>
        Awesome! 🎉
      </button>
    </div>
  )
}
