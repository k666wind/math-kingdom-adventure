// ─── accountManager.ts (2H-0) ───────────────────────────────
// Manages the top-level accounts list in localStorage,
// separate from the per-account game save.

import type { AccountMeta } from '../types'

const ACCOUNTS_KEY    = 'mk_accounts'
const ACTIVE_KEY      = 'mk_active_account'
const LEGACY_SAVE_KEY = 'math-kingdom-save'  // v12 key name
const SAVE_PREFIX     = 'mk_save_'

// ── Helpers ──────────────────────────────────────────────────

const hashPin = (pin: string): string => {
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    hash = ((hash << 5) - hash) + pin.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(16)
}

// ── Public API ───────────────────────────────────────────────

export function getAccounts(): AccountMeta[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function saveAccounts(accounts: AccountMeta[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function getActiveAccountId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveAccountId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function getSaveKey(accountId: string): string {
  return `${SAVE_PREFIX}${accountId}`
}

/** Read raw save JSON for an account (returns null if not found) */
export function loadAccountSave(accountId: string): object | null {
  try {
    const raw = localStorage.getItem(getSaveKey(accountId))
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

/** Write raw Zustand partial state as save for an account */
export function persistAccountSave(accountId: string, state: object): void {
  localStorage.setItem(getSaveKey(accountId), JSON.stringify({ state }))
}

/** Delete all data for an account */
export function deleteAccount(accountId: string): void {
  localStorage.removeItem(getSaveKey(accountId))
  const accounts = getAccounts().filter(a => a.id !== accountId)
  saveAccounts(accounts)
  // If deleted account was active, clear active
  if (getActiveAccountId() === accountId) {
    localStorage.removeItem(ACTIVE_KEY)
  }
}

/** Create a new AccountMeta and persist it */
export function createAccountMeta(name: string, avatarEmoji: string): AccountMeta {
  const id = `account_${Date.now()}`
  const now = new Date().toISOString()
  const meta: AccountMeta = {
    id, name,
    pinHash: '', hasPIN: false,
    createdAt: now, lastPlayedAt: now,
    avatarEmoji, level: 1,
  }
  const accounts = getAccounts()
  accounts.push(meta)
  saveAccounts(accounts)
  return meta
}

/** Update one account's meta (level, lastPlayedAt, avatarEmoji) */
export function updateAccountMeta(id: string, patch: Partial<AccountMeta>): void {
  const accounts = getAccounts().map(a =>
    a.id === id ? { ...a, ...patch } : a
  )
  saveAccounts(accounts)
}

/** Set/clear account PIN */
export function setAccountPIN(id: string, pin: string | null): void {
  const accounts = getAccounts().map(a =>
    a.id === id
      ? { ...a, pinHash: pin ? hashPin(pin) : '', hasPIN: !!pin }
      : a
  )
  saveAccounts(accounts)
}

export function checkAccountPIN(id: string, pin: string): boolean {
  const account = getAccounts().find(a => a.id === id)
  if (!account || !account.hasPIN) return true // no PIN = always ok
  return account.pinHash === hashPin(pin)
}

/**
 * One-time migration: if legacy save exists and no accounts yet,
 * wrap it as the default account.
 * Returns the migrated accountId, or null if no migration needed.
 */
export function migrateLegacySaveIfNeeded(): string | null {
  const accounts = getAccounts()
  if (accounts.length > 0) return null // already migrated

  const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY)
  if (!legacyRaw) return null  // fresh install

  try {
    const legacyParsed = JSON.parse(legacyRaw)
    const playerName: string = legacyParsed?.state?.player?.name ?? 'Player 1'
    const playerEmoji: string = legacyParsed?.state?.player?.activeSkin ?? '🧙'
    const playerLevel: number = legacyParsed?.state?.player?.level ?? 1

    const id = 'account_default'
    const now = new Date().toISOString()
    const meta: AccountMeta = {
      id, name: playerName,
      pinHash: '', hasPIN: false,
      createdAt: now, lastPlayedAt: now,
      avatarEmoji: playerEmoji, level: playerLevel,
    }
    // Copy legacy save to new key
    localStorage.setItem(getSaveKey(id), legacyRaw)
    saveAccounts([meta])
    setActiveAccountId(id)
    return id
  } catch { return null }
}
