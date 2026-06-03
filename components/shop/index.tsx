import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { EQUIPMENT_DATA } from '../../data/gameData'

export const ShopScreen: React.FC = () => {
  const player      = useGameStore(s => s.player)
  const navigate    = useGameStore(s => s.navigate)
  const buyEquipment = useGameStore(s => s.buyEquipment)
  const [confirm, setConfirm]   = useState<string | null>(null)
  const [message, setMessage]   = useState<string | null>(null)
  if (!player) return null

  const forSale = EQUIPMENT_DATA.filter(e =>
    e.shopPrice !== null && e.requiredLevel <= player.level
  )

  const handleBuy = (itemId: string) => {
    const success = buyEquipment(itemId)
    setConfirm(null)
    setMessage(success ? '✓ Purchased!' : '✗ Not enough gold!')
    setTimeout(() => setMessage(null), 2000)
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ background: '#2D1B69' }}>
        <button onClick={() => navigate('main_menu')} className="text-2xl text-white">←</button>
        <h1 className="font-fredoka text-xl text-white flex-1">🛒 Shop</h1>
        <div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: '#FFE66D' }}>
          <span className="text-sm">🪙</span>
          <span className="font-nunito font-bold text-sm" style={{ color: '#5a3e00' }}>{player.gold}</span>
        </div>
      </div>

      {message && (
        <div className="mx-4 mt-3 py-2 rounded-xl text-center font-nunito text-sm font-bold animate-slide-down"
          style={{ background: message.startsWith('✓') ? 'rgba(107,203,119,0.2)' : 'rgba(255,77,109,0.2)',
                   color: message.startsWith('✓') ? '#2d7a3f' : '#cc2244' }}>
          {message}
        </div>
      )}

      <div className="flex-1 scroll-y px-4 py-4">
        <p className="font-nunito text-xs mb-3" style={{ color: '#aaa' }}>
          Equipment available for your level ({player.level}):
        </p>
        <div className="flex flex-col gap-3">
          {forSale.map(item => {
            const owned     = player.ownedEquipment.includes(item.id)
            const canAfford = player.gold >= (item.shopPrice ?? 0)
            return (
              <div key={item.id} className="rounded-2xl p-4 bg-white flex items-center gap-4"
                style={{ border: '1px solid rgba(45,27,105,0.08)', opacity: owned ? 0.6 : 1 }}>
                <span className="text-4xl">{item.emoji}</span>
                <div className="flex-1">
                  <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>{item.name}</div>
                  <div className="font-nunito text-xs mt-0.5" style={{ color: '#888' }}>{item.description}</div>
                  <div className="font-nunito text-xs mt-1" style={{ color: '#666' }}>
                    {Object.entries(item.stats).filter(([,v])=>v).map(([k,v])=>`+${v} ${k.replace(/([A-Z])/g,' $1').toLowerCase()}`).join(' · ')}
                  </div>
                </div>
                {owned ? (
                  <span className="font-nunito text-xs font-bold" style={{ color: '#6BCB77' }}>Owned ✓</span>
                ) : (
                  <button onClick={() => setConfirm(item.id)}
                    disabled={!canAfford}
                    className="flex flex-col items-center px-3 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-40"
                    style={{ background: canAfford ? '#FF6B35' : '#ddd', color: canAfford ? 'white' : '#888' }}>
                    <span className="font-fredoka text-sm">Buy</span>
                    <span className="font-nunito text-xs">🪙{item.shopPrice}</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (() => {
        const item = EQUIPMENT_DATA.find(e => e.id === confirm)
        if (!item) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: '#FFF8F0' }}>
              <div className="text-4xl mb-2">{item.emoji}</div>
              <h3 className="font-fredoka text-xl mb-1" style={{ color: '#2D1B69' }}>{item.name}</h3>
              <p className="font-nunito text-sm mb-4" style={{ color: '#666' }}>
                Buy for <strong>🪙{item.shopPrice}</strong> gold?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirm(null)}
                  className="flex-1 py-3 rounded-2xl font-nunito text-sm"
                  style={{ background: 'rgba(0,0,0,0.08)', color: '#666' }}>
                  Cancel
                </button>
                <button onClick={() => handleBuy(confirm)}
                  className="flex-1 py-3 rounded-2xl font-fredoka text-base text-white active:scale-95"
                  style={{ background: '#FF6B35' }}>
                  Buy! 🪙
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
