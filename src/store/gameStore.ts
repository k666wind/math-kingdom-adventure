import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Player, BattleState, NavigationState, AppScreen,
  TopicProgress, RegionId, DifficultyLevel,
  ParentSettings, QuestionResult,
  EquipmentSlot, OwnedPet,
} from '../types'
import { REGIONS, MONSTERS, EQUIPMENT_DATA, LEVEL_REWARDS } from '../data/gameData'
import { generateQuestion } from '../engine/questionGenerators'

// ─── Helpers ─────────────────────────────────────────────────

const expForLevel = (level: number) => level * 100

const createDefaultPlayer = (name: string): Player => ({
  id: `player_${Date.now()}`,
  name,
  level: 1,
  exp: 0,
  expToNextLevel: expForLevel(1),
  hp: 80,
  maxHp: 80,
  gold: 0,
  crystals: 0,
  attack: 10,
  defence: 0,
  speedBonus: 0,
  luckBonus: 0,
  createdAt: new Date().toISOString(),
  lastPlayedAt: new Date().toISOString(),
  totalPlayTimeSeconds: 0,
  equippedItems: { weapon: null, armour: null, accessory: null, hat: null },
  activePets: [],
  unlockedRegions: ['greenleaf_forest'],
  completedBattles: [],
  ownedEquipment: [],
  ownedPets: [],
})

const defaultParentSettings = (): ParentSettings => ({
  pinHash: '',
  isPinSet: false,
  difficultyOverride: null,
  enabledTopics: [],
  disabledTopics: [],
  dailyTimeLimitMinutes: null,
  dailyQuestionGoal: null,
  timerMode: 'normal',
  lastUpdated: new Date().toISOString(),
})

const hashPin = (pin: string): string => {
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    hash = ((hash << 5) - hash) + pin.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(16)
}

// ─── Level-up processor ──────────────────────────────────────

interface LevelUpResult {
  newLevel: number
  rewards: Array<{ type: string; id: string; label: string }>
}

const processLevelUp = (player: Player): { player: Player; levelUps: LevelUpResult[] } => {
  let p = { ...player }
  const levelUps: LevelUpResult[] = []
  while (p.exp >= p.expToNextLevel) {
    p.exp -= p.expToNextLevel
    p.level += 1
    p.expToNextLevel = expForLevel(p.level)
    p.maxHp += 10
    p.hp = p.maxHp
    p.attack += 3
    p.defence += 1
    const rewards = LEVEL_REWARDS[p.level] ?? []
    for (const r of rewards) {
      if (r.type === 'equipment' && !p.ownedEquipment.includes(r.id))
        p.ownedEquipment = [...p.ownedEquipment, r.id]
      if (r.type === 'pet' && !p.ownedPets.includes(r.id))
        p.ownedPets = [...p.ownedPets, r.id]
      if (r.type === 'region_unlock' && !p.unlockedRegions.includes(r.id as RegionId))
        p.unlockedRegions = [...p.unlockedRegions, r.id as RegionId]
    }
    levelUps.push({ newLevel: p.level, rewards })
  }
  return { player: p, levelUps }
}

// ─── Store interface ──────────────────────────────────────────

interface GameStore {
  player: Player | null
  nav: NavigationState
  battle: BattleState | null
  topicProgress: Record<string, TopicProgress>
  ownedPets: Record<string, OwnedPet>
  parentSettings: ParentSettings
  pendingLevelUps: LevelUpResult[]
  streak: { count: number; lastDate: string }

  navigate: (screen: AppScreen, extra?: Partial<NavigationState>) => void
  createPlayer: (name: string) => void
  resetGame: () => void
  startBattle: (regionId: RegionId, battleId: string) => void
  submitAnswer: (selectedIndex: number) => { correct: boolean; expGained: number; goldGained: number }
  nextQuestion: () => void
  endBattle: (outcome: 'victory' | 'defeat') => void
  useFiftyFifty: () => void
  equipItem: (itemId: string, slot: EquipmentSlot) => void
  unequipSlot: (slot: EquipmentSlot) => void
  buyEquipment: (itemId: string) => boolean
  activatePet: (petId: string) => void
  deactivatePet: (petId: string) => void
  setParentPin: (pin: string) => void
  checkParentPin: (pin: string) => boolean
  updateParentSettings: (s: Partial<ParentSettings>) => void
  clearPendingLevelUps: () => void
  addGold: (amount: number) => void
}

// ─── Store ───────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      player: null,
      nav: { screen: 'splash' },
      battle: null,
      topicProgress: {},
      ownedPets: {},
      parentSettings: defaultParentSettings(),
      pendingLevelUps: [],
      streak: { count: 0, lastDate: '' },

      navigate: (screen, extra = {}) =>
        set(s => ({ nav: { ...s.nav, screen, ...extra } })),

      createPlayer: (name) =>
        set({ player: createDefaultPlayer(name), nav: { screen: 'main_menu' } }),

      resetGame: () =>
        set({ player: null, battle: null, topicProgress: {}, ownedPets: {}, nav: { screen: 'onboarding_welcome' } }),

      startBattle: (regionId, battleId) => {
        const { player, parentSettings } = get()
        if (!player) return
        const region = REGIONS.find(r => r.id === regionId)
        const battleCfg = region?.battles.find(b => b.id === battleId)
        if (!battleCfg) return
        const monster = MONSTERS[battleCfg.monsterId]
        if (!monster) return

        const qType = battleCfg.questionTypes[Math.floor(Math.random() * battleCfg.questionTypes.length)]
        const qTier = parentSettings.difficultyOverride
          ?? battleCfg.questionTiers[Math.floor(Math.random() * battleCfg.questionTiers.length)]
        const tpKey = `${qType}_${qTier}`
        const tp = get().topicProgress[tpKey]
        const diff: DifficultyLevel = tp
          ? tp.consecutiveCorrect >= 6 ? 'gold' : tp.consecutiveCorrect >= 3 ? 'silver' : 'bronze'
          : 'bronze'
        const question = generateQuestion(qType, diff)
        const speedBonus = parentSettings.timerMode === 'relaxed' ? 5 : parentSettings.timerMode === 'challenge' ? -3 : 0

        const battle: BattleState = {
          sessionId: `s_${Date.now()}`,
          regionId, battleId, monster,
          monsterCurrentHp: monster.maxHp,
          playerCurrentHp: player.maxHp,
          currentQuestion: question,
          questionsAnswered: [],
          comboCount: 0,
          maxComboReached: 0,
          expGained: 0,
          goldGained: 0,
          phase: 1,
          status: 'question',
          lastAnswerCorrect: null,
          timerBonus: speedBonus + player.speedBonus,
        }
        set({ battle, nav: { screen: 'battle', regionId, battleId } })
      },

      submitAnswer: (selectedIndex) => {
        const { battle, player, topicProgress } = get()
        if (!battle || !battle.currentQuestion || !player)
          return { correct: false, expGained: 0, goldGained: 0 }

        const q = battle.currentQuestion
        const correct = selectedIndex === q.correctIndex
        const newCombo = correct ? battle.comboCount + 1 : 0
        const comboMult = newCombo >= 10 ? 2.0 : newCombo >= 5 ? 1.5 : newCombo >= 3 ? 1.2 : 1.0

        const weaponId = player.equippedItems.weapon
        const weaponData = weaponId ? EQUIPMENT_DATA.find(e => e.id === weaponId) : null
        const atkBonus   = weaponData?.stats.attack ?? 0
        const comboBonus = weaponData?.stats.comboMultiplierBonus ?? 0

        let expGained  = 0
        let goldGained = 0
        let newMonsterHp = battle.monsterCurrentHp
        let newPlayerHp  = battle.playerCurrentHp

        if (correct) {
          const baseDmg = player.attack + atkBonus
          const dmg = Math.floor(baseDmg * (comboMult + comboBonus))
          newMonsterHp = Math.max(0, battle.monsterCurrentHp - dmg)
          const tierBonus = ['Y3','Y4','Y5','Y6','Y7','Y8'].indexOf(q.tier) * 5
          const expEquipBonus = EQUIPMENT_DATA.find(e => e.id === player.equippedItems.accessory)?.stats.expBonus ?? 0
          const petExpBoost   = player.activePets.includes('baby_dragon') ? 0.1 : 0
          expGained = Math.floor((10 + tierBonus) * (1 + expEquipBonus / 100 + petExpBoost))
          if (newCombo >= 10) {
            const luckMult = 1 + (player.luckBonus + (player.activePets.includes('lucky_fox') ? 15 : 0)) / 100
            goldGained = Math.floor(20 * luckMult)
          }
        } else {
          const def = player.equippedItems.armour
            ? (EQUIPMENT_DATA.find(e => e.id === player.equippedItems.armour)?.stats.defence ?? 0) : 0
          newPlayerHp = Math.max(0, battle.playerCurrentHp - Math.max(1, battle.monster.attackDamage - def))
        }

        const tpKey = `${q.type}_${q.tier}`
        const prevTp = topicProgress[tpKey] ?? {
          type: q.type, tier: q.tier, difficulty: q.difficulty,
          totalAnswered: 0, totalCorrect: 0,
          consecutiveCorrect: 0, lastAttemptedAt: null, masteryScore: 0,
        }
        const newConsec = correct ? prevTp.consecutiveCorrect + 1 : 0
        const newTp: TopicProgress = {
          ...prevTp,
          totalAnswered: prevTp.totalAnswered + 1,
          totalCorrect:  prevTp.totalCorrect + (correct ? 1 : 0),
          consecutiveCorrect: newConsec,
          lastAttemptedAt: new Date().toISOString(),
          masteryScore: Math.min(100, prevTp.masteryScore + (correct ? 5 : -3)),
          difficulty: newConsec >= 6 ? 'gold' : newConsec >= 3 ? 'silver' : 'bronze',
        }

        const result: QuestionResult = {
          questionId: q.id, questionType: q.type,
          selectedAnswer: q.answers[selectedIndex] ?? '',
          correctAnswer:  q.answers[q.correctIndex],
          isCorrect: correct, timeRemaining: 0,
          timestamp: new Date().toISOString(),
        }

        set(s => ({
          battle: s.battle ? {
            ...s.battle,
            monsterCurrentHp: newMonsterHp,
            playerCurrentHp:  newPlayerHp,
            comboCount:        newCombo,
            maxComboReached:   Math.max(s.battle.maxComboReached, newCombo),
            expGained:   s.battle.expGained + expGained,
            goldGained:  s.battle.goldGained + goldGained,
            questionsAnswered: [...s.battle.questionsAnswered, result],
            status: correct ? 'feedback_correct' : 'feedback_wrong',
            lastAnswerCorrect: correct,
            currentQuestion: null,
          } : null,
          topicProgress: { ...s.topicProgress, [tpKey]: newTp },
        }))

        return { correct, expGained, goldGained }
      },

      nextQuestion: () => {
        const { battle, parentSettings } = get()
        if (!battle) return
        const region    = REGIONS.find(r => r.id === battle.regionId)
        const battleCfg = region?.battles.find(b => b.id === battle.battleId)
        if (!battleCfg) return
        const qType = battleCfg.questionTypes[Math.floor(Math.random() * battleCfg.questionTypes.length)]
        const qTier = parentSettings.difficultyOverride
          ?? battleCfg.questionTiers[Math.floor(Math.random() * battleCfg.questionTiers.length)]
        const tpKey = `${qType}_${qTier}`
        const tp    = get().topicProgress[tpKey]
        const diff: DifficultyLevel = tp
          ? tp.consecutiveCorrect >= 6 ? 'gold' : tp.consecutiveCorrect >= 3 ? 'silver' : 'bronze'
          : 'bronze'
        const question = generateQuestion(qType, diff)
        set(s => ({
          battle: s.battle
            ? { ...s.battle, currentQuestion: question, status: 'question', lastAnswerCorrect: null }
            : null,
        }))
      },

      endBattle: (outcome) => {
        const { battle, player } = get()
        if (!battle || !player) return
        if (outcome === 'victory') {
          const baseGold = Math.floor(
            Math.random() * (battle.monster.goldRewardMax - battle.monster.goldRewardMin + 1)
            + battle.monster.goldRewardMin
          )
          let newPlayer = {
            ...player,
            exp:   player.exp + battle.expGained + battle.monster.expReward,
            gold:  player.gold + battle.goldGained + baseGold,
            completedBattles: player.completedBattles.includes(battle.battleId)
              ? player.completedBattles
              : [...player.completedBattles, battle.battleId],
            lastPlayedAt: new Date().toISOString(),
          }
          const { player: levelled, levelUps } = processLevelUp(newPlayer)
          set(s => ({
            player: levelled,
            battle: s.battle ? { ...s.battle, status: 'victory' } : null,
            pendingLevelUps: [...s.pendingLevelUps, ...levelUps],
          }))
        } else {
          set(s => ({ battle: s.battle ? { ...s.battle, status: 'defeat' } : null }))
        }
      },

      useFiftyFifty: () => {
        const { battle } = get()
        if (!battle?.currentQuestion) return
        const q = battle.currentQuestion
        const wrongIndices = q.answers.map((_,i) => i).filter(i => i !== q.correctIndex)
        const toRemove = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2)
        const newAnswers = q.answers.map((a, i) => toRemove.includes(i) ? '' : a)
        set(s => ({
          battle: s.battle ? {
            ...s.battle,
            currentQuestion: s.battle.currentQuestion
              ? { ...s.battle.currentQuestion, answers: newAnswers }
              : null,
          } : null,
        }))
      },

      equipItem: (itemId, slot) => {
        set(s => {
          if (!s.player) return s
          const item    = EQUIPMENT_DATA.find(e => e.id === itemId)
          if (!item || item.slot !== slot) return s
          const oldId   = s.player.equippedItems[slot]
          const oldItem = oldId ? EQUIPMENT_DATA.find(e => e.id === oldId) : null
          let p = { ...s.player, equippedItems: { ...s.player.equippedItems, [slot]: itemId } }
          if (oldItem?.stats.hp)         { p.maxHp   -= oldItem.stats.hp }
          if (oldItem?.stats.attack)       p.attack   -= oldItem.stats.attack
          if (oldItem?.stats.defence)      p.defence  -= oldItem.stats.defence
          if (oldItem?.stats.speedBonus)   p.speedBonus -= oldItem.stats.speedBonus
          if (oldItem?.stats.luckBonus)    p.luckBonus  -= oldItem.stats.luckBonus
          if (item.stats.hp)  { p.maxHp += item.stats.hp; p.hp = Math.min(p.hp + item.stats.hp, p.maxHp) }
          if (item.stats.attack)     p.attack     += item.stats.attack
          if (item.stats.defence)    p.defence    += item.stats.defence
          if (item.stats.speedBonus) p.speedBonus += item.stats.speedBonus
          if (item.stats.luckBonus)  p.luckBonus  += item.stats.luckBonus
          return { player: p }
        })
      },

      unequipSlot: (slot) => {
        set(s => {
          if (!s.player) return s
          const oldId   = s.player.equippedItems[slot]
          const oldItem = oldId ? EQUIPMENT_DATA.find(e => e.id === oldId) : null
          let p = { ...s.player, equippedItems: { ...s.player.equippedItems, [slot]: null } }
          if (oldItem?.stats.hp)         p.maxHp      -= oldItem.stats.hp
          if (oldItem?.stats.attack)     p.attack      -= oldItem.stats.attack
          if (oldItem?.stats.defence)    p.defence     -= oldItem.stats.defence
          if (oldItem?.stats.speedBonus) p.speedBonus  -= oldItem.stats.speedBonus
          if (oldItem?.stats.luckBonus)  p.luckBonus   -= oldItem.stats.luckBonus
          return { player: p }
        })
      },

      buyEquipment: (itemId) => {
        const { player } = get()
        if (!player) return false
        const item = EQUIPMENT_DATA.find(e => e.id === itemId)
        if (!item || item.shopPrice === null) return false
        if (player.gold < item.shopPrice)     return false
        if (player.ownedEquipment.includes(itemId)) return false
        set(s => ({
          player: s.player ? {
            ...s.player,
            gold: s.player.gold - (item.shopPrice as number),
            ownedEquipment: [...s.player.ownedEquipment, itemId],
          } : null,
        }))
        return true
      },

      activatePet: (petId) => {
        set(s => {
          if (!s.player || s.player.activePets.length >= 3) return s
          if (s.player.activePets.includes(petId)) return s
          return { player: { ...s.player, activePets: [...s.player.activePets, petId] } }
        })
      },

      deactivatePet: (petId) => {
        set(s => ({
          player: s.player
            ? { ...s.player, activePets: s.player.activePets.filter(id => id !== petId) }
            : null,
        }))
      },

      setParentPin: (pin) =>
        set(s => ({ parentSettings: { ...s.parentSettings, pinHash: hashPin(pin), isPinSet: true } })),

      checkParentPin: (pin) => get().parentSettings.pinHash === hashPin(pin),

      updateParentSettings: (s) =>
        set(prev => ({ parentSettings: { ...prev.parentSettings, ...s, lastUpdated: new Date().toISOString() } })),

      clearPendingLevelUps: () => set({ pendingLevelUps: [] }),

      addGold: (amount) =>
        set(s => ({ player: s.player ? { ...s.player, gold: s.player.gold + amount } : null })),
    }),
    {
      name: 'math-kingdom-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        player:         s.player,
        topicProgress:  s.topicProgress,
        ownedPets:      s.ownedPets,
        parentSettings: s.parentSettings,
        streak:         s.streak,
      }),
    }
  )
)
