import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { REGIONS } from '../../data/gameData'
import type { Region } from '../../types'

const RegionCard: React.FC<{region: Region; unlocked: boolean; onSelect: ()=>void}> = ({region, unlocked, onSelect}) => {
  return (
    <button onClick={unlocked ? onSelect : undefined}
      className="relative rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1 min-h-[90px] active:scale-95 transition-transform"
      style={{background: unlocked ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.35)',
              border: unlocked ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid rgba(255,255,255,0.08)'}}>
      {!unlocked && (
        <div className="absolute top-2 right-2 text-xs" style={{color:'rgba(255,255,255,0.4)'}}>🔒</div>
      )}
      <span className="text-3xl" style={{opacity: unlocked ? 1 : 0.3}}>{region.emoji}</span>
      <div className="font-fredoka text-xs leading-tight" style={{color: unlocked ? 'white' : 'rgba(255,255,255,0.3)'}}>
        {region.name}
      </div>
      {!unlocked && (
        <div className="font-nunito text-xs" style={{color:'rgba(255,255,255,0.3)'}}>
          Lv.{region.requiredLevel}
        </div>
      )}
    </button>
  )
}

const RegionDetail: React.FC<{region: Region; onClose: ()=>void}> = ({region, onClose}) => {
  const startBattle = useGameStore(s => s.startBattle)
  const completed   = useGameStore(s => s.player?.completedBattles ?? [])

  const handleBattle = (battleId: string) => {
    startBattle(region.id, battleId)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end" style={{background:'rgba(0,0,0,0.6)'}}>
      <div className="w-full max-w-[480px] mx-auto rounded-t-3xl p-5 pb-8 max-h-[80vh] overflow-y-auto"
        style={{background:'#FFF8F0'}}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{region.emoji}</span>
          <div className="flex-1">
            <h2 className="font-fredoka text-xl" style={{color:'#2D1B69'}}>{region.name}</h2>
            <p className="font-nunito text-xs" style={{color:'#888'}}>{region.description}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400 ml-2">✕</button>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-2 mb-4">
          {region.topicFocus.slice(0,4).map(t => (
            <span key={t} className="rounded-full px-3 py-1 text-xs font-nunito font-bold capitalize"
              style={{background:'#ede8ff',color:'#3d2090'}}>
              {t.replace(/_/g,' ')}
            </span>
          ))}
        </div>

        {/* Battle list */}
        <div className="flex flex-col gap-2 mb-5">
          {region.battles.map(b => {
            const done = completed.includes(b.id)
            const isBoss = b.isBoss
            const isMini = b.isMiniBoss
            return (
              <button key={b.id} onClick={() => handleBattle(b.id)}
                className="flex items-center gap-3 rounded-xl p-3 active:scale-95 transition-transform text-left"
                style={{
                  background: isBoss ? 'rgba(255,77,109,0.08)' : isMini ? 'rgba(255,107,53,0.08)' : 'white',
                  border: isBoss ? '1px solid rgba(255,77,109,0.3)' : isMini ? '1px solid rgba(255,107,53,0.3)' : '1px solid rgba(45,27,105,0.08)',
                }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-fredoka flex-shrink-0"
                  style={{background: isBoss ? '#FF4D6D' : isMini ? '#FF6B35' : '#2D1B69', color:'white'}}>
                  {isBoss ? 'B' : isMini ? 'M' : b.battleNumber}
                </div>
                <div className="flex-1">
                  <div className="font-nunito text-sm font-bold" style={{
                    color: isBoss ? '#cc2244' : isMini ? '#cc5500' : '#333'}}>
                    {isBoss ? '👑 Boss: ' : isMini ? '⚡ Mini-Boss: ' : ''}{b.monsterId.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                  </div>
                  <div className="font-nunito text-xs" style={{color:'#888'}}>
                    {b.questionTypes.slice(0,2).map(t=>t.replace(/_/g,' ')).join(' · ')}
                  </div>
                </div>
                {done ? <span className="text-xs font-bold" style={{color:'#6BCB77'}}>✓</span>
                      : <span className="text-xs" style={{color:'#aaa'}}>▶</span>}
              </button>
            )
          })}
        </div>

        <button onClick={() => region.battles[0] && handleBattle(region.battles[0].id)}
          className="w-full text-white font-fredoka text-lg py-4 rounded-2xl active:scale-95 transition-transform"
          style={{background:'#FF6B35'}}>
          Enter Region ⚔️
        </button>
      </div>
    </div>
  )
}

export const WorldMap: React.FC = () => {
  const player   = useGameStore(s => s.player)
  const navigate = useGameStore(s => s.navigate)
  const [selected, setSelected] = useState<Region|null>(null)
  if (!player) return null

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{background:'linear-gradient(160deg,#1a3a28 0%,#2a5c3a 40%,#1a3020 100%)'}}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('main_menu')} className="text-2xl">←</button>
          <h1 className="font-fredoka text-xl" style={{color:'#FFE66D'}}>🗺️ Numeria</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{background:'rgba(255,255,255,0.15)'}}>
          <span className="text-sm">🧙</span>
          <span className="font-nunito text-white text-sm">Lv.{player.level}</span>
          <span className="text-sm ml-1">🪙</span>
          <span className="font-nunito text-white text-sm">{player.gold}</span>
        </div>
      </div>

      {/* Map grid */}
      <div className="flex-1 scroll-y px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {REGIONS.map(region => (
            <RegionCard key={region.id} region={region}
              unlocked={player.unlockedRegions.includes(region.id)}
              onSelect={() => setSelected(region)}/>
          ))}
        </div>
      </div>

      {selected && (
        <RegionDetail region={selected} onClose={() => setSelected(null)}/>
      )}
    </div>
  )
}
