import React from 'react'
import { useGameStore } from '../../store/gameStore'

const ACHIEVEMENTS = [
  { id:'first_win', emoji:'⚔️', name:'First Victory',  desc:'Win your first battle' },
  { id:'combo5',    emoji:'🔥', name:'Combo 5',         desc:'Reach a combo of 5' },
  { id:'combo10',   emoji:'⚡', name:'Math Legend',     desc:'Reach a combo of 10' },
  { id:'level5',    emoji:'🌟', name:'Rising Hero',     desc:'Reach level 5' },
  { id:'level10',   emoji:'💫', name:'Number Knight',   desc:'Reach level 10' },
  { id:'level20',   emoji:'✨', name:'Crystal Mage',    desc:'Reach level 20' },
  { id:'perfect',   emoji:'🎯', name:'Perfect Battle',  desc:'Win with no wrong answers' },
  { id:'100q',      emoji:'📚', name:'Scholar',         desc:'Answer 100 questions correctly' },
  { id:'pet1',      emoji:'🐾', name:'Pet Friend',      desc:'Obtain your first pet' },
  { id:'equip1',    emoji:'🗡️', name:'Geared Up',      desc:'Equip your first item' },
  { id:'shop1',     emoji:'🛒', name:'Shopper',         desc:'Buy an item from the shop' },
  { id:'streak7',   emoji:'📅', name:'Week Warrior',    desc:'Play 7 days in a row' },
]

export const AchievementsScreen: React.FC = () => {
  const navigate             = useGameStore(s => s.navigate)
  const player               = useGameStore(s => s.player)
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements)
  if (!player) return null

  const unlocked = new Set(unlockedAchievements)
  const count    = unlocked.size

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ background: '#2D1B69' }}>
        <button onClick={() => navigate('main_menu')} className="text-2xl text-white">←</button>
        <h1 className="font-fredoka text-xl text-white flex-1">🏆 Achievements</h1>
        <div className="font-nunito text-sm" style={{ color: '#FFE66D' }}>
          {count}/{ACHIEVEMENTS.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-3" style={{ background: '#2D1B69', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(count / ACHIEVEMENTS.length) * 100}%`, background: '#FFE66D' }} />
        </div>
        <p className="font-nunito text-xs mt-1 text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {count} unlocked
        </p>
      </div>

      {/* Achievement list */}
      <div className="flex-1 scroll-y px-4 py-4 flex flex-col gap-3">
        {ACHIEVEMENTS.map(a => {
          const done = unlocked.has(a.id)
          return (
            <div key={a.id} className="rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: done ? 'white' : 'rgba(255,255,255,0.5)',
                border:     done ? '1px solid rgba(45,27,105,0.1)' : '1px dashed rgba(45,27,105,0.15)',
                opacity:    done ? 1 : 0.5,
              }}>
              <span className="text-3xl" style={{ filter: done ? 'none' : 'grayscale(1)' }}>
                {a.emoji}
              </span>
              <div className="flex-1">
                <div className="font-fredoka text-base" style={{ color: done ? '#2D1B69' : '#aaa' }}>
                  {a.name}
                </div>
                <div className="font-nunito text-xs mt-0.5" style={{ color: '#aaa' }}>
                  {a.desc}
                </div>
              </div>
              {done && <span className="text-xl">✅</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
