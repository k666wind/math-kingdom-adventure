import React, { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { EQUIPMENT_DATA, PETS_DATA } from '../../data/gameData'
import type { Equipment, EquipmentSlot } from '../../types'

const rarityColor: Record<string,string> = {
  common: '#888', uncommon: '#4a9a4a', rare: '#4a6aaa', legendary: '#9a4aaa', epic: '#cc44aa'
}
const rarityBg: Record<string,string> = {
  common: 'rgba(136,136,136,0.1)', uncommon: 'rgba(74,154,74,0.1)',
  rare: 'rgba(74,106,170,0.1)', legendary: 'rgba(154,74,170,0.15)', epic: 'rgba(204,68,170,0.12)'
}

// ─── 2D-2: Live stat labels ────────────────────────────────────────────────
const STAT_LABELS: Record<string, { icon: string; label: string }> = {
  hp:                   { icon: '❤️', label: 'HP' },
  attack:               { icon: '⚔️', label: 'ATK' },
  defence:              { icon: '🛡️', label: 'DEF' },
  speedBonus:           { icon: '⚡', label: 'SPD bonus' },
  luckBonus:            { icon: '🍀', label: 'LCK bonus' },
  expBonus:             { icon: '✨', label: 'EXP bonus' },
  comboMultiplierBonus: { icon: '🔥', label: 'Combo boost' },
}

export const CollectionEquipment: React.FC = () => {
  const player      = useGameStore(s => s.player)
  const navigate    = useGameStore(s => s.navigate)
  const equipItem   = useGameStore(s => s.equipItem)
  const unequipSlot = useGameStore(s => s.unequipSlot)
  const upgradeItem = useGameStore(s => s.upgradeItem)   // 2E-7
  const [detail, setDetail] = useState<Equipment | null>(null)
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null)
  if (!player) return null

  const owned = EQUIPMENT_DATA.filter(e => player.ownedEquipment.includes(e.id))
  const slotIcon: Record<EquipmentSlot, string> = { weapon: '⚔️', armour: '🛡️', accessory: '💍', hat: '🎩' }

  // ── 2D-2: compute stat diff when detail item would be equipped ─────────
  const getStatDiff = (item: Equipment): Record<string, number> => {
    const existingId = player.equippedItems[item.slot]
    const existing   = existingId ? EQUIPMENT_DATA.find(e => e.id === existingId) : null
    const diff: Record<string, number> = {}
    // New item's stats
    for (const [k, v] of Object.entries(item.stats)) {
      if (v) diff[k] = (diff[k] ?? 0) + v
    }
    // Subtract existing item's stats
    if (existing) {
      for (const [k, v] of Object.entries(existing.stats)) {
        if (v) diff[k] = (diff[k] ?? 0) - v
      }
    }
    return diff
  }

  const isDetailEquipped = detail ? Object.values(player.equippedItems).includes(detail.id) : false
  const statDiff         = detail && !isDetailEquipped ? getStatDiff(detail) : null

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ background: '#2D1B69' }}>
        <button onClick={() => navigate('main_menu')} className="text-2xl text-white">←</button>
        <h1 className="font-fredoka text-xl text-white flex-1">🎒 Equipment</h1>
        <div className="font-nunito text-sm font-bold" style={{ color: '#FFE66D' }}>
          🪙 {player.gold}
        </div>
      </div>

      {/* Equipped slots */}
      <div className="px-4 py-3" style={{ background: '#2D1B69', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="font-nunito text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>EQUIPPED</p>
        <div className="grid grid-cols-4 gap-2">
          {(['weapon','armour','accessory','hat'] as EquipmentSlot[]).map(slot => {
            const eqId = player.equippedItems[slot]
            const eq   = eqId ? EQUIPMENT_DATA.find(e => e.id === eqId) : null
            return (
              <div key={slot} className="rounded-xl p-2 text-center cursor-pointer active:scale-95"
                style={{ background: eq ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.1)',
                         border: eq ? '1.5px solid #FF6B35' : '1.5px dashed rgba(255,255,255,0.2)' }}
                onClick={() => eq && unequipSlot(slot)}>
                <div className="text-xl">{eq ? eq.emoji : slotIcon[slot]}</div>
                <div className="font-nunito text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {slot}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2D-2: Live Stats Panel ─────────────────────────────────────── */}
      <div className="mx-4 mt-3 rounded-2xl px-4 py-3"
        style={{ background: 'rgba(45,27,105,0.06)', border: '1px solid rgba(45,27,105,0.1)' }}>
        <p className="font-nunito text-xs font-bold mb-2" style={{ color: '#2D1B69' }}>
          Character Stats
        </p>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1">
          {[
            { icon: '❤️', label: 'HP',  val: `${player.hp}/${player.maxHp}` },
            { icon: '⚔️', label: 'ATK', val: player.attack },
            { icon: '🛡️', label: 'DEF', val: player.defence },
            { icon: '⚡', label: 'SPD', val: `+${player.speedBonus}s` },
            { icon: '🍀', label: 'LCK', val: `+${player.luckBonus}%` },
            { icon: '🪙', label: 'Gold', val: player.gold },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-1">
              <span className="text-xs">{stat.icon}</span>
              <span className="font-nunito text-xs" style={{ color: '#888' }}>{stat.label}</span>
              <span className="font-nunito text-xs font-bold ml-auto" style={{ color: '#2D1B69' }}>{stat.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Item grid */}
      <div className="flex-1 scroll-y px-4 py-4">
        {owned.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-4xl">🎒</span>
            <p className="font-nunito text-sm" style={{ color: '#aaa' }}>No equipment yet. Win battles to earn items!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {owned.map(eq => {
              const isEquipped = Object.values(player.equippedItems).includes(eq.id)
              return (
                <button key={eq.id} onClick={() => setDetail(eq)}
                  className="rounded-2xl p-4 text-left active:scale-95 transition-transform"
                  style={{ background: isEquipped ? rarityBg[eq.rarity] : 'white',
                           border: isEquipped ? `2px solid ${rarityColor[eq.rarity]}` : '1px solid rgba(45,27,105,0.08)' }}>
                  <div className="text-3xl mb-1">{eq.emoji}</div>
                  <div className="font-fredoka text-sm" style={{ color: '#2D1B69' }}>{eq.name}</div>
                  <div className="font-nunito text-xs capitalize mt-0.5" style={{ color: rarityColor[eq.rarity] }}>
                    {eq.rarity}
                  </div>
                  {isEquipped && <div className="font-nunito text-xs mt-1" style={{ color: '#FF6B35' }}>✓ Equipped</div>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-[480px] mx-auto rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
            style={{ background: '#FFF8F0' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{detail.emoji}</span>
              <div className="flex-1">
                <h3 className="font-fredoka text-xl" style={{ color: '#2D1B69' }}>{detail.name}</h3>
                <span className="font-nunito text-xs capitalize px-2 py-0.5 rounded-full"
                  style={{ background: rarityBg[detail.rarity], color: rarityColor[detail.rarity] }}>
                  {detail.rarity}
                </span>
              </div>
              <button onClick={() => setDetail(null)} className="text-2xl text-gray-400">✕</button>
            </div>
            <p className="font-nunito text-sm mb-2" style={{ color: '#555' }}>{detail.description}</p>
            <p className="font-nunito text-xs italic mb-4" style={{ color: '#999' }}>{detail.loreText}</p>

            {/* Item stats */}
            <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(45,27,105,0.06)' }}>
              <p className="font-nunito text-xs font-bold mb-2" style={{ color: '#555' }}>Item Stats</p>
              {Object.entries(detail.stats).map(([k, v]) => v ? (
                <div key={k} className="flex justify-between py-1">
                  <span className="font-nunito text-sm" style={{ color: '#666' }}>
                    {STAT_LABELS[k]?.icon ?? ''} {STAT_LABELS[k]?.label ?? k}
                  </span>
                  <span className="font-nunito text-sm font-bold" style={{ color: '#2D1B69' }}>+{v}</span>
                </div>
              ) : null)}
            </div>

            {/* 2D-2: Stat diff preview — only for unequipped items */}
            {statDiff && Object.values(statDiff).some(v => v !== 0) && (
              <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)' }}>
                <p className="font-nunito text-xs font-bold mb-2" style={{ color: '#FF6B35' }}>
                  {player.equippedItems[detail.slot] ? 'Stat Change if Equipped' : 'Stats You\'ll Gain'}
                </p>
                {Object.entries(statDiff).filter(([,v]) => v !== 0).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5">
                    <span className="font-nunito text-sm" style={{ color: '#666' }}>
                      {STAT_LABELS[k]?.icon ?? ''} {STAT_LABELS[k]?.label ?? k}
                    </span>
                    <span className="font-nunito text-sm font-bold"
                      style={{ color: v > 0 ? '#6BCB77' : '#FF4D6D' }}>
                      {v > 0 ? `+${v}` : v}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              {isDetailEquipped ? (
                <button onClick={() => { unequipSlot(detail.slot); setDetail(null) }}
                  className="flex-1 py-3 rounded-2xl font-fredoka text-base active:scale-95"
                  style={{ background: 'rgba(255,77,109,0.15)', color: '#FF4D6D', border: '1px solid #FF4D6D' }}>
                  Unequip
                </button>
              ) : (
                <button onClick={() => { equipItem(detail.id, detail.slot); setDetail(null) }}
                  className="flex-1 py-3 rounded-2xl font-fredoka text-base text-white active:scale-95"
                  style={{ background: '#FF6B35' }}>
                  Equip ✓
                </button>
              )}
            </div>

            {/* 2E-7: Upgrade UI */}
            {(() => {
              const upgrades = (player as any).itemUpgrades as Record<string,number> ?? {}
              const curUpgrade = upgrades[detail.id] ?? 0
              const maxed = curUpgrade >= 5
              const cost = 50 * (curUpgrade + 1)
              const canAfford = player.gold >= cost
              return (
                <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(255,230,109,0.08)', border: '1px solid rgba(255,230,109,0.3)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-nunito text-xs font-bold" style={{ color: '#7a5c00' }}>⬆️ Upgrade</span>
                    <span className="font-fredoka text-sm" style={{ color: '#FFE66D' }}>
                      {[1,2,3,4,5].map(i => i <= curUpgrade ? '★' : '☆').join('')}
                    </span>
                  </div>
                  {maxed ? (
                    <p className="font-nunito text-xs text-center" style={{ color: '#6BCB77' }}>✓ Fully Upgraded!</p>
                  ) : (
                    <>
                      <p className="font-nunito text-xs mb-2" style={{ color: '#888' }}>
                        Cost: 🪙{cost} gold · +2 to all stats per level
                      </p>
                      {upgradeMsg && (
                        <p className="font-nunito text-xs text-center mb-1" style={{ color: upgradeMsg.startsWith('✓') ? '#6BCB77' : '#FF4D6D' }}>{upgradeMsg}</p>
                      )}
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          const ok = upgradeItem(detail.id)
                          setUpgradeMsg(ok ? `✓ Upgraded to ★${ (upgrades[detail.id] ?? 0) + 1}!` : '✗ Not enough gold')
                          setTimeout(() => setUpgradeMsg(null), 2000)
                        }}
                        className="w-full py-2.5 rounded-xl font-fredoka text-sm active:scale-95 transition-all disabled:opacity-40"
                        style={{ background: canAfford ? '#FF6B35' : '#ddd', color: canAfford ? 'white' : '#888' }}>
                        Upgrade 🪙{cost}
                      </button>
                    </>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export const CollectionPets: React.FC = () => {
  const player       = useGameStore(s => s.player)
  const navigate     = useGameStore(s => s.navigate)
  const activatePet  = useGameStore(s => s.activatePet)
  const deactivatePet = useGameStore(s => s.deactivatePet)
  if (!player) return null

  const ownedPetIds = player.ownedPets

  return (
    <div className="h-full flex flex-col" style={{ background: '#FFF8F0' }}>
      <div className="px-4 pt-5 pb-4 flex items-center gap-3" style={{ background: '#2D1B69' }}>
        <button onClick={() => navigate('main_menu')} className="text-2xl text-white">←</button>
        <h1 className="font-fredoka text-xl text-white flex-1">🐾 Pets</h1>
        <div className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Active: {player.activePets.length}/3
        </div>
      </div>

      {/* Active slots */}
      <div className="px-4 py-3 flex gap-3" style={{ background: '#2D1B69', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {[0,1,2].map(i => {
          const petId = player.activePets[i]
          const pet   = petId ? PETS_DATA.find(p => p.id === petId) : null
          return (
            <div key={i} className="flex-1 rounded-xl p-2 text-center"
              style={{ background: pet ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.1)',
                       border: pet ? '1.5px solid #FF6B35' : '1.5px dashed rgba(255,255,255,0.2)' }}>
              <div className="text-xl">{pet ? pet.emoji : '➕'}</div>
              <div className="font-nunito text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {pet ? pet.name : 'Empty'}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex-1 scroll-y px-4 py-4">
        {ownedPetIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-4xl">🐾</span>
            <p className="font-nunito text-sm text-center" style={{ color: '#aaa' }}>
              No pets yet. Level up and defeat bosses to find pets!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ownedPetIds.map(petId => {
              const pet    = PETS_DATA.find(p => p.id === petId)
              if (!pet) return null
              const active = player.activePets.includes(petId)
              return (
                <div key={petId} className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: 'white', border: active ? '2px solid #FF6B35' : '1px solid rgba(45,27,105,0.08)' }}>
                  <span className="text-4xl">{pet.emoji}</span>
                  <div className="flex-1">
                    <div className="font-fredoka text-base" style={{ color: '#2D1B69' }}>{pet.name}</div>
                    <div className="font-nunito text-xs mt-0.5" style={{ color: '#888' }}>
                      {pet.passiveAbility.description}
                    </div>
                  </div>
                  <button
                    onClick={() => active ? deactivatePet(petId) : activatePet(petId)}
                    className="px-3 py-2 rounded-xl font-nunito text-sm font-bold active:scale-95"
                    style={active
                      ? { background: 'rgba(255,77,109,0.12)', color: '#FF4D6D' }
                      : { background: '#FF6B35', color: 'white' }}>
                    {active ? 'Remove' : 'Activate'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
