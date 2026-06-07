import React, { useState, useEffect } from 'react'
import type { AccountMeta } from '../../types'
import {
  getAccounts, setActiveAccountId, deleteAccount,
  checkAccountPIN, createAccountMeta, setAccountPIN,
} from '../../store/accountManager'
import { useGameStore } from '../../store/gameStore'

type View = 'list' | 'pin_entry' | 'new_account' | 'manage_pin'

export const AccountSelectScreen: React.FC = () => {
  const navigate = useGameStore(s => s.navigate)
  const player   = useGameStore(s => s.player)
  const [accounts, setAccounts]     = useState<AccountMeta[]>([])
  const [view, setView]             = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pin, setPin]               = useState('')
  const [pinError, setPinError]     = useState(false)
  const [newName, setNewName]       = useState('')
  const [deleteId, setDeleteId]     = useState<string | null>(null)


  useEffect(() => {
    setAccounts(getAccounts())
  }, [])

  const reload = () => setAccounts(getAccounts())

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    } catch { return '' }
  }

  const loadAccount = (id: string) => {
    setActiveAccountId(id)
    // Reload page so Zustand persist picks up the new key
    window.location.reload()
  }

  const handleTapAccount = (acc: AccountMeta) => {
    if (acc.hasPIN) {
      setSelectedId(acc.id)
      setPin('')
      setPinError(false)
      setView('pin_entry')
    } else {
      loadAccount(acc.id)
    }
  }

  const handleCreateAccount = () => {
    if (!newName.trim()) return
    const meta = createAccountMeta(newName.trim(), '🧙')
    setActiveAccountId(meta.id)
    // Navigate to onboarding with new account active
    window.location.reload()
  }

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id)
    reload()
    setDeleteId(null)
  }

  const selectedAccount = accounts.find(a => a.id === selectedId)

  // ── PIN entry view ──────────────────────────────────────────
  if (view === 'pin_entry' && selectedAccount) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6"
        style={{ background: 'linear-gradient(180deg,#1a0e3a 0%,#2D1B69 100%)' }}>
        <div className="text-5xl mb-2">{selectedAccount.avatarEmoji}</div>
        <h2 className="font-fredoka text-white text-2xl mb-1">{selectedAccount.name}</h2>
        <p className="font-nunito text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>Enter your PIN</p>

        <div className="flex gap-3 mb-6">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <span className="font-fredoka text-2xl text-white">{pin[i] ? '●' : ''}</span>
            </div>
          ))}
        </div>

        {pinError && (
          <p className="font-nunito text-sm mb-4" style={{ color: '#FF4D6D' }}>Incorrect PIN. Try again.</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, idx) => (
            <button key={idx}
              onClick={() => {
                if (k === '⌫') { setPin(p => p.slice(0,-1)); setPinError(false) }
                else if (k !== '' && pin.length < 4) {
                  const next = pin + String(k)
                  setPin(next)
                  setPinError(false)
                  if (next.length === 4) {
                    if (checkAccountPIN(selectedId!, next)) { loadAccount(selectedId!) }
                    else { setPinError(true); setPin('') }
                  }
                }
              }}
              className="w-16 h-16 rounded-2xl font-fredoka text-2xl text-white flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: k === '' ? 'transparent' : 'rgba(255,255,255,0.15)', border: k === '' ? 'none' : '1px solid rgba(255,255,255,0.2)' }}>
              {k}
            </button>
          ))}
        </div>

        <button onClick={() => setView('list')}
          className="font-nunito text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          ← Back
        </button>
      </div>
    )
  }

  // ── New account view ────────────────────────────────────────
  if (view === 'new_account') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6"
        style={{ background: 'linear-gradient(180deg,#1a0e3a 0%,#2D1B69 100%)' }}>
        <div className="text-5xl mb-4">🧙</div>
        <h2 className="font-fredoka text-white text-2xl mb-2">New Adventure</h2>
        <p className="font-nunito text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>What is your name, adventurer?</p>

        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
          className="w-full max-w-xs rounded-2xl px-4 py-3 font-nunito text-lg text-center mb-6"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', outline: 'none' }}
          onKeyDown={e => e.key === 'Enter' && handleCreateAccount()}
        />

        <button onClick={handleCreateAccount}
          disabled={!newName.trim()}
          className="w-full max-w-xs font-fredoka text-xl py-4 rounded-2xl mb-4 active:scale-95 transition-transform"
          style={{ background: newName.trim() ? '#FF6B35' : '#666', color: 'white' }}>
          Start Adventure!
        </button>

        <button onClick={() => setView('list')}
          className="font-nunito text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          ← Back
        </button>
      </div>
    )
  }

  // ── Account list view ───────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#1a0e3a 0%,#2D1B69 100%)' }}>

      {/* Header */}
      <div className="pt-10 pb-6 px-6 text-center">
        <div className="text-4xl mb-2">👑</div>
        <h1 className="font-fredoka text-3xl text-white">Math Kingdom</h1>
        <p className="font-nunito text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {accounts.length > 0 ? 'Choose your adventurer' : 'Begin your adventure!'}
        </p>
      </div>

      {/* Account cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {accounts.map(acc => (
          <div key={acc.id} className="relative mb-3">
            {deleteId === acc.id ? (
              <div className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(255,77,109,0.2)', border: '1px solid #FF4D6D' }}>
                <span className="font-nunito text-white text-sm flex-1">Delete {acc.name}? This cannot be undone.</span>
                <button onClick={() => handleDeleteAccount(acc.id)}
                  className="px-3 py-1.5 rounded-xl font-nunito text-xs font-bold text-white"
                  style={{ background: '#FF4D6D' }}>Delete</button>
                <button onClick={() => setDeleteId(null)}
                  className="px-3 py-1.5 rounded-xl font-nunito text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => handleTapAccount(acc)}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left active:scale-95 transition-transform"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  {acc.avatarEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-fredoka text-white text-lg">{acc.name}</div>
                  <div className="font-nunito text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Level {acc.level} · Last played {formatDate(acc.lastPlayedAt)}
                  </div>
                  {acc.hasPIN && (
                    <div className="font-nunito text-xs mt-0.5" style={{ color: '#FFE66D' }}>🔒 PIN protected</div>
                  )}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem' }}>›</span>
              </button>
            )}

            {/* Long-press delete button */}
            {deleteId !== acc.id && (
              <button
                onClick={() => setDeleteId(acc.id)}
                className="absolute right-2 top-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,77,109,0.3)', fontSize: '0.6rem', color: '#FF4D6D' }}>
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add new account */}
        <button onClick={() => setView('new_account')}
          className="w-full rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform mb-3"
          style={{ background: 'rgba(255,255,255,0.07)', border: '2px dashed rgba(255,255,255,0.3)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'rgba(255,255,255,0.1)' }}>+</div>
          <div className="font-fredoka text-white text-lg">Add New Adventurer</div>
        </button>

        {/* If already logged in, continue button */}
        {player && (
          <button
            onClick={() => navigate('main_menu')}
            className="w-full font-nunito text-sm py-3 text-center"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            Continue as {player.name} →
          </button>
        )}
      </div>
    </div>
  )
}

// ── Switch Account button component (shown in parent dashboard) ──
export const SwitchAccountButton: React.FC = () => {
  const navigate = useGameStore(s => s.navigate)
  return (
    <button
      onClick={() => navigate('account_select')}
      className="w-full rounded-2xl p-3 flex items-center gap-3 active:scale-95 transition-transform"
      style={{ background: 'rgba(45,27,105,0.06)', border: '1px solid rgba(45,27,105,0.12)' }}>
      <span className="text-xl">👥</span>
      <span className="font-nunito text-sm font-bold" style={{ color: '#2D1B69' }}>Switch Account</span>
      <span className="ml-auto" style={{ color: 'rgba(45,27,105,0.4)' }}>›</span>
    </button>
  )
}

// ── AccountPINManager — shown in parent dashboard settings ────
export const AccountPINManager: React.FC<{ accountId: string }> = ({ accountId }) => {
  const [showSetPin, setShowSetPin] = useState(false)
  const [pin, setPin]               = useState('')
  const [saved, setSaved]           = useState(false)
  const accounts                    = getAccounts()
  const acc                         = accounts.find(a => a.id === accountId)
  const hasPin                      = acc?.hasPIN ?? false

  const handleSave = () => {
    if (pin.length === 4) {
      setAccountPIN(accountId, pin)
      setSaved(true)
      setPin('')
      setShowSetPin(false)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleClear = () => {
    setAccountPIN(accountId, null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid rgba(45,27,105,0.08)' }}>
      <div className="font-fredoka text-sm mb-2" style={{ color: '#2D1B69' }}>🔒 Account PIN</div>
      {saved && <p className="font-nunito text-xs mb-2" style={{ color: '#6BCB77' }}>Saved!</p>}
      {!showSetPin ? (
        <div className="flex gap-2">
          <button onClick={() => setShowSetPin(true)}
            className="flex-1 py-2 rounded-xl font-nunito text-xs font-bold"
            style={{ background: '#f0eeff', color: '#2D1B69' }}>
            {hasPin ? 'Change PIN' : 'Set PIN'}
          </button>
          {hasPin && (
            <button onClick={handleClear}
              className="flex-1 py-2 rounded-xl font-nunito text-xs font-bold"
              style={{ background: '#fff0f0', color: '#FF4D6D' }}>
              Remove PIN
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="font-nunito text-xs mb-2" style={{ color: '#666' }}>Enter 4-digit PIN:</p>
          <div className="flex gap-2 mb-2">
            <input
              type="number" inputMode="numeric" maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.slice(0,4))}
              placeholder="----"
              className="flex-1 rounded-xl px-3 py-2 font-fredoka text-lg text-center"
              style={{ border: '1px solid #ddd', outline: 'none' }}
            />
            <button onClick={handleSave}
              disabled={pin.length !== 4}
              className="px-4 rounded-xl font-nunito text-xs font-bold text-white"
              style={{ background: pin.length === 4 ? '#2D1B69' : '#ccc' }}>
              Save
            </button>
            <button onClick={() => { setShowSetPin(false); setPin('') }}
              className="px-3 rounded-xl font-nunito text-xs"
              style={{ background: '#f0eeff', color: '#2D1B69' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
