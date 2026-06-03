import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Player, BattleState, NavigationState, AppScreen,
  TopicProgress, RegionId, DifficultyLevel,
  ParentSettings, QuestionResult,
  EquipmentSlot, OwnedPet, DailyChallenge, Reward,
} from '../types'
import { REGIONS, MONSTERS, EQUIPMENT_DATA, LEVEL_REWARDS } from '../data/gameData'
import { generateQuestion } from '../engine/questionGenerators'

// ─── Helpers ─────────────────────────────────────────────────

const expForLevel = (level: number) => level * 100

const todayISO = () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD

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
  battleRecords: {},
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

// ─── Daily challenge generator ────────────────────────────────

const buildDailyChallenges = (level: number): DailyChallenge[] => {
  const date = todayISO()
  const comboTarget = level >= 10 ? 10 : 5
  return [
    {
      id: `${date}_c1`,
      date,
      type: 'questions_correct',
      description: 'Answer 20 questions correctly today',
      targetValue: 20,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      reward: { gold: 50 },
    },
    {
      id: `${date}_c2`,
      date,
      type: 'monsters_defeated',
      description: 'Defeat 3 monsters today',
      targetValue: 3,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      reward: { crystals: 1 },
    },
    {
      id: `${date}_c3`,
      date,
      type: 'combo_reached',
      description: `Keep a combo of ${comboTarget} or more`,
      targetValue: comboTarget,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
      reward: { exp: 100 },
    },
  ]
}

// ─── TodayStats default ───────────────────────────────────────

const defaultTodayStats = () => ({
  date: todayISO(),
  questionsCorrect: 0,
  monstersDefeated: 0,
  highestCombo: 0,
  perfectBattles: 0,
})

// ─── Star rating calculator ───────────────────────────────────

const calcStars = (questionsAnswered: QuestionResult[], monsterDefeated: boolean): 0 | 1 | 2 | 3 => {
  if (!monsterDefeated) return 0
  const total   = questionsAnswered.length
  const correct = questionsAnswered.filter(r => r.isCorrect).length
  const accuracy = total > 0 ? correct / total : 0
  const perfect  = questionsAnswered.every(r => r.isCorrect)
  if (perfect)          return 3
  if (accuracy >= 0.75) return 2
  return 1
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
  dailyChallenges: DailyChallenge[]
  todayStats: ReturnType<typeof defaultTodayStats>

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
  claimChallenge: (challengeId: string) => void
  refreshDailyChallenges: () => void
  exportSave: () => string
  importSave: (json: string) => boolean
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
      dailyChallenges: [],
      todayStats: defaultTodayStats(),

      // ── Navigation ──────────────────────────────────────────
      navigate: (screen, extra = {}) =>
        set(s => ({ nav: { ...s.nav, screen, ...extra } })),

      // ── Player creation ─────────────────────────────────────
      createPlayer: (name) => {
        const player = createDefaultPlayer(name)
        set({
          player,
          nav: { screen: 'main_menu' },
          dailyChallenges: buildDailyChallenges(player.level),
          todayStats: defaultTodayStats(),
        })
      },

      // ── Reset ───────────────────────────────────────────────
      resetGame: () =>
        set({
          player: null, battle: null, topicProgress: {}, ownedPets: {},
          nav: { screen: 'onboarding_welcome' },
          dailyChallenges: [], todayStats: defaultTodayStats(),
        }),

      // ── Refresh daily challenges (call on app load) ─────────
      refreshDailyChallenges: () => {
        const { player, dailyChallenges } = get()
        if (!player) return
        const today = todayISO()
        // Reset if it's a new day
        if (!dailyChallenges.length || dailyChallenges[0]?.date !== today) {
          // Update streak
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().slice(0, 10)
          set(s => ({
            dailyChallenges: buildDailyChallenges(s.player?.level ?? 1),
            todayStats: defaultTodayStats(),
            streak: {
              count: s.streak.lastDate === yesterdayStr ? s.streak.count + 1 : 1,
              lastDate: today,
            },
          }))
        }
      },

      // ── Start battle ────────────────────────────────────────
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

      // ── Submit answer ────────────────────────────────────────
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

        // Update daily challenge progress for questions_correct
        set(s => {
          const updatedChallenges = s.dailyChallenges.map(c => {
            if (c.date !== todayISO() || c.isCompleted) return c
            if (c.type === 'questions_correct' && correct) {
              const newProg = c.currentProgress + 1
              return { ...c, currentProgress: newProg, isCompleted: newProg >= c.targetValue }
            }
            if (c.type === 'combo_reached') {
              const newProg = Math.max(c.currentProgress, newCombo)
              return { ...c, currentProgress: newProg, isCompleted: newProg >= c.targetValue }
            }
            return c
          })
          const updatedStats = {
            ...s.todayStats,
            questionsCorrect: s.todayStats.questionsCorrect + (correct ? 1 : 0),
            highestCombo: Math.max(s.todayStats.highestCombo, newCombo),
          }
          return {
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
            dailyChallenges: updatedChallenges,
            todayStats: updatedStats,
          }
        })

        return { correct, expGained, goldGained }
      },

      // ── Next question ────────────────────────────────────────
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

      // ── End battle ───────────────────────────────────────────
      endBattle: (outcome) => {
        const { battle, player } = get()
        if (!battle || !player) return

        if (outcome === 'victory') {
          const baseGold = Math.floor(
            Math.random() * (battle.monster.goldRewardMax - battle.monster.goldRewardMin + 1)
            + battle.monster.goldRewardMin
          )

          // Calculate stars
          const stars = calcStars(battle.questionsAnswered, true)
          const isPerfect = stars === 3

          let newPlayer = {
            ...player,
            exp:   player.exp + battle.expGained + battle.monster.expReward + (isPerfect ? 30 : 0),
            gold:  player.gold + battle.goldGained + baseGold + (isPerfect ? 30 : 0),
            completedBattles: player.completedBattles.includes(battle.battleId)
              ? player.completedBattles
              : [...player.completedBattles, battle.battleId],
            lastPlayedAt: new Date().toISOString(),
            // Save battle record with best stars
            battleRecords: {
              ...(player.battleRecords ?? {}),
              [battle.battleId]: {
                battleId: battle.battleId,
                bestStars: Math.max(
                  stars,
                  (player.battleRecords ?? {})[battle.battleId]?.bestStars ?? 0
                ) as 0 | 1 | 2 | 3,
                completedAt: new Date().toISOString(),
              },
            },
          }
          const { player: levelled, levelUps } = processLevelUp(newPlayer)

          // Update daily challenge: monsters_defeated + perfect_battle
          set(s => {
            const updatedChallenges = s.dailyChallenges.map(c => {
              if (c.date !== todayISO() || c.isCompleted) return c
              if (c.type === 'monsters_defeated') {
                const newProg = c.currentProgress + 1
                return { ...c, currentProgress: newProg, isCompleted: newProg >= c.targetValue }
              }
              return c
            })
            return {
              player: levelled,
              battle: s.battle ? { ...s.battle, status: 'victory' } : null,
              pendingLevelUps: [...s.pendingLevelUps, ...levelUps],
              dailyChallenges: updatedChallenges,
              todayStats: {
                ...s.todayStats,
                monstersDefeated: s.todayStats.monstersDefeated + 1,
                perfectBattles: s.todayStats.perfectBattles + (isPerfect ? 1 : 0),
              },
            }
          })
        } else {
          set(s => ({ battle: s.battle ? { ...s.battle, status: 'defeat' } : null }))
        }
      },

      // ── Claim daily challenge reward ─────────────────────────
      claimChallenge: (challengeId) => {
        const { dailyChallenges, player } = get()
        const challenge = dailyChallenges.find(c => c.id === challengeId)
        if (!challenge || !challenge.isCompleted || challenge.isClaimed || !player) return

        const r: Reward = challenge.reward
        set(s => ({
          player: s.player ? {
            ...s.player,
            gold:     s.player.gold     + (r.gold ?? 0),
            crystals: s.player.crystals + (r.crystals ?? 0),
            exp:      s.player.exp      + (r.exp ?? 0),
          } : null,
          dailyChallenges: s.dailyChallenges.map(c =>
            c.id === challengeId ? { ...c, isClaimed: true } : c
          ),
        }))
      },

      // ── 50/50 ────────────────────────────────────────────────
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

      // ── Equipment ────────────────────────────────────────────
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

      // ── Pets ─────────────────────────────────────────────────
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

      // ── Parent ───────────────────────────────────────────────
      setParentPin: (pin) =>
        set(s => ({ parentSettings: { ...s.parentSettings, pinHash: hashPin(pin), isPinSet: true } })),

      checkParentPin: (pin) => get().parentSettings.pinHash === hashPin(pin),

      updateParentSettings: (s) =>
        set(prev => ({ parentSettings: { ...prev.parentSettings, ...s, lastUpdated: new Date().toISOString() } })),

      clearPendingLevelUps: () => set({ pendingLevelUps: [] }),

      addGold: (amount) =>
        set(s => ({ player: s.player ? { ...s.player, gold: s.player.gold + amount } : null })),

      // ── Save export / import ─────────────────────────────────
      exportSave: () => {
        const s = get()
        const saveData = {
          version: 5,
          exportedAt: new Date().toISOString(),
          player:         s.player,
          topicProgress:  s.topicProgress,
          ownedPets:      s.ownedPets,
          parentSettings: s.parentSettings,
          streak:         s.streak,
          dailyChallenges: s.dailyChallenges,
          todayStats:     s.todayStats,
        }
        return JSON.stringify(saveData, null, 2)
      },

      importSave: (json) => {
        try {
          const data = JSON.parse(json)
          if (!data.player || !data.player.name) return false
          set({
            player:          data.player,
            topicProgress:   data.topicProgress  ?? {},
            ownedPets:       data.ownedPets       ?? {},
            parentSettings:  data.parentSettings  ?? defaultParentSettings(),
            streak:          data.streak          ?? { count: 0, lastDate: '' },
            dailyChallenges: data.dailyChallenges ?? [],
            todayStats:      data.todayStats      ?? defaultTodayStats(),
            nav: { screen: 'main_menu' },
          })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'math-kingdom-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        player:          s.player,
        topicProgress:   s.topicProgress,
        ownedPets:       s.ownedPets,
        parentSettings:  s.parentSettings,
        streak:          s.streak,
        dailyChallenges: s.dailyChallenges,
        todayStats:      s.todayStats,
      }),
    }
  )
)
