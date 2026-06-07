import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { EQUIPMENT_DATA, SKINS_DATA } from '../../data/gameData'
import { sfx } from '../../engine/audioEngine'

type ShopTab = 'gold' | 'crystal' | 'skins'

export const ShopScreen: React.FC = () => {
  const player          = useGameStore(s => s.player)
  const navigate        = useGameStore(s => s.navigate)
  const buyEquipment    = useGameStore(s => s.buyEquipment)
  const buyCrystalItem  = useGameStore(s => s.buyCrystalItem)
  const buySkin         = useGameStore(s => s.buySkin)
  const equipSkin       = useGameStore(s => s.equipSkin)
  const [tab, setTab]         = useState<ShopTab>('gold')
  const [confirm, setConfirm] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  if (!player) return null

  const goldItems    = EQUIPMENT_DATA.filter(e => e.shopPrice !== null && e.requiredLevel <= player.level)
  const crystalItems = EQUIPMENT_DATA.filter(e => e.crystalPrice != null && e.requiredLevel <= player.level)

  const showMsg = (m: string) => { setMessage(m); setTimeout(() => setMessage(null), 2000) }

  const handleBuy = (itemId: string) => {
    const success = buyEquipment(itemId)
    setConfirm(null)
    showMsg(success ? '✓ Purchased!' : '✗ Not enough gold!')
  }
  const handleCrystalBuy = (itemId: string) => {
    const success = buyCrystalItem(itemId)
    setConfirm(null)
    if (success) { sfx.crystal(); showMsg('✓ Crystal item acquired!') }  // 2E-9
    else showMsg('✗ Not enough crystals!')
  }
  const handleSkinBuy = (skinId: string) => {
    const skin = SKINS_DATA.find(s => s.id === skinId)
    if (!skin) return
    const ownedSkins = player.ownedSkins ?? ['wizard']
    if (ownedSkins.includes(skinId)) {
      // Already owned — just equip
      equipSkin(skinId)
      showMsg('✓ Skin equipped!')
      return
    }
    if (skin.unlockMethod === 'crystal_shop') {
      const success = buySkin(skinId)
      if (success) { sfx.crystal(); equipSkin(skinId); showMsg('✓ Skin unlocked & equipped!') }
      else showMsg('✗ Not enough crystals!')
    } else if (skin.unlockMethod === 'level') {
      const success = buySkin(skinId)
      if (success) { equipSkin(skinId); showMsg('✓ Skin equipped!') }
    } else {
      equipSkin(skinId)
      showMsg('✓ Skin equipped!')
    }
  }

  const tabs: { id: ShopTab; label: string; icon: string }[] = [
    { id: 'gold',    label: 'Gold',    icon: '🪙' },
    { id: 'crystal', label: 'Crystal', icon: '💎' },
    { id: 'skins',   label: 'Skins',   icon: '🎭' },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3" style={{ background: '#2D1B69' }}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('main_menu')} className="text-2xl text-white">←</button>
          <h1 className="font-fredoka text-xl text-white flex-1">🛒 Shop</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: '#FFE66D' }}>
              <span className="text-xs">🪙</span>
              <span className="font-nunito font-bold text-xs" style={{ color: '#5a3e00' }}>{player.gold}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: 'rgba(78,205,196,0.25)', border: '1px solid #4ECDC4' }}>
              <span className="text-xs">💎</span>
              <span className="font-nunito font-bold text-xs" style={{ color: '#4ECDC4' }}>{player.crystals}</span>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-1.5 rounded-xl font-fredoka text-sm transition-all"
              style={{
                background: tab === t.id ? '#FF6B35' : 'rgba(255,255,255,0.1)',
                color: tab === t.id ? 'white' : 'rgba(255,255,255,0.6)',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
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

        {/* ── Gold Shop ── */}
        {tab === 'gold' && (
          <div className="flex flex-col gap-3">
            <p className="font-nunito text-xs mb-1" style={{ color: '#aaa' }}>
              Equipment for Level {player.level}:
            </p>
            {goldItems.map(item => {
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
                    <button onClick={() => setConfirm(`gold:${item.id}`)}
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
        )}

        {/* ── Crystal Shop ── */}
        {tab === 'crystal' && (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl p-3 mb-1" style={{ background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.3)' }}>
              <p className="font-nunito text-xs text-center" style={{ color: '#4ECDC4' }}>
                💎 Crystals are rare drops from bosses. Spend them on exclusive gear!
              </p>
            </div>
            {crystalItems.map(item => {
              const owned     = player.ownedEquipment.includes(item.id)
              const canAfford = player.crystals >= (item.crystalPrice ?? 99)
              return (
                <div key={item.id} className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: owned ? 'rgba(107,203,119,0.08)' : 'white',
                           border: `1px solid ${owned ? 'rgba(107,203,119,0.3)' : 'rgba(78,205,196,0.2)'}`,
                           opacity: owned ? 0.7 : 1 }}>
                  <span className="text-4xl">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>{item.name}</div>
                    <div className="font-nunito text-xs mt-0.5" style={{ color: '#888' }}>{item.description}</div>
                    <div className="font-nunito text-xs mt-1 font-bold" style={{ color: '#4ECDC4' }}>
                      {Object.entries(item.stats).filter(([,v])=>v).map(([k,v])=>`+${v} ${k.replace(/([A-Z])/g,' $1').toLowerCase()}`).join(' · ')}
                    </div>
                  </div>
                  {owned ? (
                    <span className="font-nunito text-xs font-bold" style={{ color: '#6BCB77' }}>Owned ✓</span>
                  ) : (
                    <button onClick={() => setConfirm(`crystal:${item.id}`)}
                      disabled={!canAfford}
                      className="flex flex-col items-center px-3 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-40"
                      style={{ background: canAfford ? '#4ECDC4' : '#ddd', color: canAfford ? 'white' : '#888' }}>
                      <span className="font-fredoka text-sm">Buy</span>
                      <span className="font-nunito text-xs">💎{item.crystalPrice}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Skin Wardrobe ── */}
        {tab === 'skins' && (
          <div className="flex flex-col gap-3">
            <p className="font-nunito text-xs mb-1" style={{ color: '#aaa' }}>
              Choose your avatar skin — some need crystals or levels to unlock.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {SKINS_DATA.map(skin => {
                const ownedSkins = player.ownedSkins ?? ['wizard']
                const isOwned    = ownedSkins.includes(skin.id)
                const isEquipped = (player.activeSkin ?? '🧙') === skin.emoji
                const isLevelLocked = skin.unlockMethod === 'level' && (skin.requiredLevel ?? 0) > player.level
                const isDailyLocked = skin.unlockMethod === 'daily_reward' && !isOwned
                const isCrystalShop = skin.unlockMethod === 'crystal_shop'
                const canAfford = isCrystalShop ? player.crystals >= (skin.crystalPrice ?? 99) : true
                const isLocked  = isLevelLocked || isDailyLocked
                return (
                  <button key={skin.id}
                    onClick={() => !isLocked && handleSkinBuy(skin.id)}
                    disabled={isLocked}
                    className="rounded-2xl p-3 flex flex-col items-center gap-1 active:scale-95 transition-all disabled:opacity-40"
                    style={{
                      // 2E-4: use skin's own bgColor when equipped/owned
                      background: isEquipped ? skin.bgColor : isOwned ? `${skin.bgColor}55` : 'white',
                      border: `1.5px solid ${isEquipped ? skin.glowColor : isOwned ? `${skin.glowColor}66` : 'rgba(45,27,105,0.1)'}`,
                      boxShadow: isEquipped ? `0 0 12px ${skin.glowColor}55` : 'none',
                    }}>
                    {/* 2E-4: avatar circle using skin colours */}
                    <div className="rounded-full flex items-center justify-center"
                      style={{
                        width: 48, height: 48,
                        background: skin.bgColor,
                        boxShadow: `0 0 10px ${skin.glowColor}66`,
                        border: `2px solid ${skin.glowColor}55`,
                        fontSize: 28,
                      }}>
                      {skin.emoji}
                    </div>
                    <span className="font-fredoka text-xs text-center" style={{ color: isEquipped || isOwned ? 'white' : '#2D1B69' }}>{skin.name}</span>
                    {isEquipped && <span className="font-nunito text-xs" style={{ color: skin.glowColor }}>✓ Equipped</span>}
                    {!isEquipped && isOwned && <span className="font-nunito text-xs" style={{ color: '#6BCB77' }}>Tap to equip</span>}
                    {!isOwned && skin.unlockMethod === 'default' && <span className="font-nunito text-xs" style={{ color: '#6BCB77' }}>Free</span>}
                    {!isOwned && isCrystalShop && (
                      <span className="font-nunito text-xs font-bold" style={{ color: canAfford ? '#4ECDC4' : '#aaa' }}>
                        💎{skin.crystalPrice}
                      </span>
                    )}
                    {isLevelLocked && (
                      <span className="font-nunito text-xs" style={{ color: '#aaa' }}>Lv.{skin.requiredLevel}</span>
                    )}
                    {isDailyLocked && (
                      <span className="font-nunito text-xs" style={{ color: '#aaa' }}>7-day streak</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirm modals */}
      {confirm && (() => {
        const [type, itemId] = confirm.split(':')
        const item = EQUIPMENT_DATA.find(e => e.id === itemId)
        if (!item) return null
        const isCrystal = type === 'crystal'
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: '#FFF8F0' }}>
              <div className="text-4xl mb-2">{item.emoji}</div>
              <h3 className="font-fredoka text-xl mb-1" style={{ color: '#2D1B69' }}>{item.name}</h3>
              <p className="font-nunito text-sm mb-4" style={{ color: '#666' }}>
                Buy for {isCrystal ? `💎${item.crystalPrice} crystals` : `🪙${item.shopPrice} gold`}?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirm(null)}
                  className="flex-1 py-3 rounded-2xl font-nunito text-sm"
                  style={{ background: 'rgba(0,0,0,0.08)', color: '#666' }}>
                  Cancel
                </button>
                <button onClick={() => isCrystal ? handleCrystalBuy(itemId) : handleBuy(itemId)}
                  className="flex-1 py-3 rounded-2xl font-fredoka text-base text-white active:scale-95"
                  style={{ background: isCrystal ? '#4ECDC4' : '#FF6B35' }}>
                  Buy! {isCrystal ? '💎' : '🪙'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
