import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'

export const SplashScreen: React.FC = () => {
  const navigate = useGameStore(s => s.navigate)
  const player = useGameStore(s => s.player)
  useEffect(() => {
    const t = setTimeout(() => navigate(player ? 'main_menu' : 'onboarding_welcome'), 1800)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{background:'linear-gradient(180deg,#1a0a4a 0%,#2D1B69 50%,#3d2a7a 100%)'}}>
      {[...Array(12)].map((_,i) => (
        <div key={i} className="absolute w-1.5 h-1.5 rounded-full animate-twinkle"
          style={{background:'#FFE66D',top:`${8+Math.random()*55}%`,left:`${Math.random()*100}%`,animationDelay:`${i*0.2}s`}}/>
      ))}
      <div className="animate-pop-in text-center z-10 px-8">
        <div className="text-7xl mb-4">👑</div>
        <h1 className="font-fredoka text-4xl leading-tight mb-2" style={{color:'#FFE66D'}}>Math Kingdom<br/>Adventure</h1>
        <p className="font-nunito text-sm" style={{color:'rgba(255,255,255,0.6)'}}>Save Numeria. Master maths.</p>
      </div>
      <div className="absolute bottom-14 w-2/3">
        <div className="rounded-full h-2 overflow-hidden" style={{background:'rgba(255,255,255,0.15)'}}>
          <div className="h-full rounded-full" style={{width:'75%',background:'#FFE66D'}}/>
        </div>
        <p className="text-center text-xs font-nunito mt-2" style={{color:'rgba(255,255,255,0.4)'}}>Loading your kingdom...</p>
      </div>
    </div>
  )
}

export const WelcomeScreen: React.FC = () => {
  const navigate = useGameStore(s => s.navigate)
  return (
    <div className="h-full flex flex-col px-6 py-10 relative overflow-hidden"
      style={{background:'linear-gradient(180deg,#1a0a4a 0%,#2D1B69 60%,#3d2a7a 100%)'}}>
      {[...Array(8)].map((_,i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full animate-twinkle"
          style={{background:'#FFE66D',top:`${5+Math.random()*50}%`,left:`${Math.random()*100}%`,animationDelay:`${i*0.3}s`}}/>
      ))}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 z-10">
        <div className="text-7xl animate-float">🏰</div>
        <div>
          <h1 className="font-fredoka text-3xl mb-3" style={{color:'#FFE66D'}}>Welcome, Hero!</h1>
          <p className="font-nunito text-base leading-relaxed" style={{color:'rgba(255,255,255,0.8)'}}>
            The Kingdom of Numeria needs you.<br/>
            Shadow monsters have stolen the{' '}
            <span className="font-bold" style={{color:'#FFE66D'}}>Number Crystals</span>.<br/>
            Only a master of maths can save the land!
          </p>
        </div>
        <div className="rounded-2xl p-4 border w-full text-left"
          style={{background:'rgba(255,255,255,0.08)',borderColor:'rgba(255,255,255,0.15)'}}>
          <p className="font-fredoka text-sm mb-2 text-white">Your mission:</p>
          {['Answer maths questions to attack monsters','Level up and unlock new regions','Collect equipment and magical pets','Defeat the Shadow Mathematician!'].map((t,i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span>⚔️</span>
              <span className="font-nunito text-sm" style={{color:'rgba(255,255,255,0.8)'}}>{t}</span>
            </div>
          ))}
        </div>

        {/* 2E-10: Crystal slide */}
        <div className="rounded-2xl p-4 w-full text-center"
          style={{background:'rgba(78,205,196,0.1)',border:'1px solid rgba(78,205,196,0.3)'}}>
          <div className="text-3xl mb-1">💎</div>
          <p className="font-fredoka text-sm text-white mb-0.5">Number Crystals</p>
          <p className="font-nunito text-xs" style={{color:'rgba(255,255,255,0.6)'}}>
            Rare crystals drop from bosses. Spend them in the Crystal Shop for exclusive gear!
          </p>
        </div>

        {/* 2E-10: Skin slide */}
        <div className="rounded-2xl p-4 w-full text-center"
          style={{background:'rgba(255,107,53,0.1)',border:'1px solid rgba(255,107,53,0.3)'}}>
          <div className="text-3xl mb-1">🎭</div>
          <p className="font-fredoka text-sm text-white mb-0.5">Change Your Look</p>
          <p className="font-nunito text-xs" style={{color:'rgba(255,255,255,0.6)'}}>
            Visit the Skin Wardrobe in the Shop to change your hero's appearance. Unlock new skins as you level up!
          </p>
        </div>
      </div>
      <button onClick={() => navigate('onboarding_name')}
        className="w-full text-white font-fredoka text-xl py-4 rounded-2xl active:scale-95 transition-transform"
        style={{background:'#FF6B35'}}>
        Begin Adventure! 🗡️
      </button>
    </div>
  )
}

export const NameEntryScreen: React.FC = () => {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🧙')
  const createPlayer = useGameStore(s => s.createPlayer)
  const avatars = ['🧙','⚔️','🛡️','🏹','🪄','👑']
  return (
    <div className="h-full flex flex-col px-6 py-10"
      style={{background:'linear-gradient(180deg,#1a0a4a 0%,#2D1B69 100%)'}}>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <h1 className="font-fredoka text-3xl text-center" style={{color:'#FFE66D'}}>Create Your Hero</h1>
        <div className="text-6xl animate-float">{avatar}</div>
        <div className="flex gap-3">
          {avatars.map(a => (
            <button key={a} onClick={() => setAvatar(a)}
              className="text-2xl p-2 rounded-xl transition-all active:scale-90"
              style={{background: a===avatar ? '#FF6B35' : 'rgba(255,255,255,0.1)',
                      transform: a===avatar ? 'scale(1.1)' : 'scale(1)'}}>
              {a}
            </button>
          ))}
        </div>
        <div className="w-full">
          <label className="font-fredoka text-sm mb-2 block" style={{color:'rgba(255,255,255,0.8)'}}>
            Your hero's name:
          </label>
          <input value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key==='Enter' && name.trim().length>=2 && createPlayer(name.trim())}
            maxLength={16} placeholder="Enter your name..."
            className="w-full rounded-xl px-4 py-3 font-nunito text-lg outline-none"
            style={{background:'rgba(255,255,255,0.12)',border:'2px solid rgba(255,255,255,0.25)',
                    color:'white'}}/>
        </div>
      </div>
      <button onClick={() => name.trim().length>=2 && createPlayer(name.trim())}
        disabled={name.trim().length < 2}
        className="w-full text-white font-fredoka text-xl py-4 rounded-2xl active:scale-95 transition-transform disabled:opacity-40"
        style={{background:'#FF6B35'}}>
        Start Quest! ⚔️
      </button>
    </div>
  )
}
