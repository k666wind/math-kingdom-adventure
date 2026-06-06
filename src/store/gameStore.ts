import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Player, BattleState, NavigationState, AppScreen,
  TopicProgress, RegionId, DifficultyLevel,
  ParentSettings, QuestionResult,
  EquipmentSlot, OwnedPet, DailyChallenge, Reward,
} from '../types'
import { REGIONS, MONSTERS, EQUIPMENT_DATA, LEVEL_REWARDS, SKINS_DATA } from '../data/gameData'
import { generateQuestion } from '../engine/questionGenerators'

// ─── Helpers ─────────────────────────────────────────────────

const expForLevel = (level: number) => level * 100
const todayISO = () => new Date().toISOString().slice(0, 10)

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
  ownedSkins: ['wizard'],    // 2E-13
  battleRecords: {},
  seenRegions: [],
  activeSkin: '🧙',
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
    const rawRewards = LEVEL_REWARDS[p.level] ?? []
    const resolvedRewards: Array<{ type: string; id: string; label: string }> = []
    for (const r of rawRewards) {
      if (r.type === 'equipment' && !p.ownedEquipment.includes(r.id)) {
        p.ownedEquipment = [...p.ownedEquipment, r.id]
        resolvedRewards.push({ type: 'equipment', id: r.id, label: r.label })
      } else if (r.type === 'equipment_pool') {
        // 2E-2: random drop from pool
        const pool = r.pool.filter(id => !p.ownedEquipment.includes(id))
        if (pool.length > 0) {
          const chosen = pool[Math.floor(Math.random() * pool.length)]
          p.ownedEquipment = [...p.ownedEquipment, chosen]
          const item = EQUIPMENT_DATA.find(e => e.id === chosen)
          resolvedRewards.push({ type: 'equipment', id: chosen, label: `${item?.emoji ?? '🎁'} ${item?.name ?? chosen}` })
        }
      } else if (r.type === 'pet' && !p.ownedPets.includes(r.id)) {
        p.ownedPets = [...p.ownedPets, r.id]
        resolvedRewards.push({ type: 'pet', id: r.id, label: r.label })
      } else if (r.type === 'region_unlock' && !p.unlockedRegions.includes(r.id as RegionId)) {
        p.unlockedRegions = [...p.unlockedRegions, r.id as RegionId]
        resolvedRewards.push({ type: 'region_unlock', id: r.id, label: r.label })
      }
    }
    levelUps.push({ newLevel: p.level, rewards: resolvedRewards })
  }
  return { player: p, levelUps }
}

// ─── Daily challenge generator ────────────────────────────────

const buildDailyChallenges = (level: number): DailyChallenge[] => {
  const date = todayISO()
  const comboTarget = level >= 10 ? 10 : 5
  return [
    { id:`${date}_c1`, date, type:'questions_correct', description:'Answer 20 questions correctly today', targetValue:20, currentProgress:0, isCompleted:false, isClaimed:false, reward:{ gold:50 } },
    { id:`${date}_c2`, date, type:'monsters_defeated',  description:'Defeat 3 monsters today',              targetValue:3,  currentProgress:0, isCompleted:false, isClaimed:false, reward:{ crystals:1 } },
    { id:`${date}_c3`, date, type:'combo_reached',      description:`Keep a combo of ${comboTarget} or more`, targetValue:comboTarget, currentProgress:0, isCompleted:false, isClaimed:false, reward:{ exp:100 } },
  ]
}

const defaultTodayStats = () => ({
  date: todayISO(),
  questionsCorrect: 0,
  monstersDefeated: 0,
  highestCombo: 0,
  perfectBattles: 0,
})

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
  unlockedAchievements: string[]

  _unlockAch: (id: string) => void
  navigate: (screen: AppScreen, extra?: Partial<NavigationState>) => void
  markRegionSeen: (regionId: string) => void
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
  buyCrystalItem: (itemId: string) => boolean
  buySkin: (skinId: string) => boolean
  equipSkin: (skinId: string) => void
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
  // 2E-1: Parent dev tools
  setPlayerLevel: (level: number) => void
  // 2E-7: Equipment upgrade
  upgradeItem: (itemId: string) => boolean
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
      unlockedAchievements: [],

      _unlockAch: (id: string) =>
        set(s => s.unlockedAchievements.includes(id) ? {} : { unlockedAchievements: [...s.unlockedAchievements, id] }),

      navigate: (screen, extra = {}) =>
        set(s => ({ nav: { ...s.nav, screen, ...extra } })),

      markRegionSeen: (regionId) =>
        set(s => s.player && !(s.player.seenRegions ?? []).includes(regionId)
          ? { player: { ...s.player, seenRegions: [...(s.player.seenRegions ?? []), regionId] } }
          : {}),

      createPlayer: (name) => {
        const player = createDefaultPlayer(name)
        set({
          player,
          nav: { screen: 'main_menu' },
          dailyChallenges: buildDailyChallenges(player.level),
          todayStats: defaultTodayStats(),
          unlockedAchievements: [],
        })
      },

      resetGame: () =>
        set({ player: null, battle: null, topicProgress: {}, ownedPets: {}, nav: { screen: 'onboarding_welcome' }, dailyChallenges: [], todayStats: defaultTodayStats() }),

      refreshDailyChallenges: () => {
        const { player, dailyChallenges } = get()
        if (!player) return
        const today = todayISO()
        if (!dailyChallenges.length || dailyChallenges[0]?.date !== today) {
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

      // ── 2E-1: Parent dev tool — set player level ─────────────
      setPlayerLevel: (level) => set(s => {
        if (!s.player) return {}
        return {
          player: {
            ...s.player,
            level: Math.max(1, Math.min(50, level)),
            exp: 0,
            expToNextLevel: level * 100,
          }
        }
      }),

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
          drops: [],
          phoenixUsed: false,    // 2E-3
          timerReduction: 0,     // 2E-6
        }
        set({ battle, nav: { screen: 'battle', regionId, battleId } })
      },

      // ── Submit answer ────────────────────────────────────────
      submitAnswer: (selectedIndex) => {
        const { battle, player, topicProgress } = get()
        if (!battle || !battle.currentQuestion || !player)
          return { correct: false, expGained: 0, goldGained: 0 }

        const q = battle.currentQuestion
        const isTimeout = selectedIndex === -1

        // 2E-3: ice_fox — first question always correct
        const isFirstQuestion = battle.questionsAnswered.length === 0
        const iceFoxActive = player.activePets.includes('ice_fox') && isFirstQuestion
        let correct = isTimeout ? false : iceFoxActive ? true : selectedIndex === q.correctIndex

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
        let newBattle = { ...battle }

        if (correct) {
          const baseDmg = player.attack + atkBonus
          // 2E-3: thunder_cat — +20% attack damage
          const thunderBoost = player.activePets.includes('thunder_cat') ? 1.2 : 1.0
          const dmg = Math.floor(baseDmg * (comboMult + comboBonus) * thunderBoost)
          newMonsterHp = Math.max(0, battle.monsterCurrentHp - dmg)
          const tierBonus = ['Y3','Y4','Y5','Y6','Y7','Y8'].indexOf(q.tier) * 5
          const expEquipBonus = EQUIPMENT_DATA.find(e => e.id === player.equippedItems.accessory)?.stats.expBonus ?? 0
          const petExpBoost   = player.activePets.includes('baby_dragon') ? 0.1 : 0
          expGained = Math.floor((10 + tierBonus) * (1 + expEquipBonus / 100 + petExpBoost))
          if (newCombo >= 10) {
            const luckMult = 1 + (player.luckBonus + (player.activePets.includes('lucky_fox') ? 15 : 0)) / 100
            goldGained = Math.floor(20 * luckMult)
          }
          // 2E-3: healing_bunny — restore 10 HP on correct
          if (player.activePets.includes('healing_bunny')) {
            newPlayerHp = Math.min(player.maxHp, newPlayerHp + 10)
          }
        } else {
          const def = player.equippedItems.armour
            ? (EQUIPMENT_DATA.find(e => e.id === player.equippedItems.armour)?.stats.defence ?? 0) : 0
          let baseDamage = Math.max(1, battle.monster.attackDamage - def)

          const ability = battle.monster.specialAbility
          if (ability) {
            const hpPct = (battle.monsterCurrentHp / battle.monster.maxHp) * 100
            if (ability.triggerCondition === 'consecutive_wrong_2') {
              newMonsterHp = Math.min(battle.monster.maxHp, battle.monsterCurrentHp + ability.effectValue)
            }
            if (ability.triggerCondition === 'hp_25' && hpPct <= 25 && ability.effect === 'double_damage') {
              baseDamage = baseDamage * 2
            }
            // 2E-6: timer reduction — set on battle state
            if (ability.triggerCondition === 'hp_50' && hpPct <= 50 && ability.effect === 'reduce_timer' && newBattle.timerReduction === 0) {
              newBattle.timerReduction = ability.effectValue
            }
          }

          newPlayerHp = Math.max(0, battle.playerCurrentHp - baseDamage)

          // 2E-3: star_phoenix — revive once per battle at 30% HP
          if (newPlayerHp <= 0 && player.activePets.includes('star_phoenix') && !battle.phoenixUsed) {
            newPlayerHp = Math.floor(player.maxHp * 0.3)
            newBattle.phoenixUsed = true
          }
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
          selectedAnswer: iceFoxActive ? q.answers[q.correctIndex] : (q.answers[selectedIndex] ?? ''),
          correctAnswer:  q.answers[q.correctIndex],
          isCorrect: correct, timeRemaining: 0,
          timestamp: new Date().toISOString(),
        }

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
              ...newBattle,
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

        // 2E-11 / 2C-4: Achievement triggers
        const { _unlockAch } = get()
        if (newCombo >= 5)  _unlockAch('combo5')
        if (newCombo >= 10) _unlockAch('combo10')
        if (correct) {
          const totalQ = Object.values(get().topicProgress).reduce((s,tp) => s + (tp.totalCorrect ?? 0), 0)
          if (totalQ >= 100) _unlockAch('100q')
          // 2E-11: quadratics streak
          if (q.type === 'quadratics' && newConsec >= 5) _unlockAch('quadratics_streak')
          // 2E-11: trig gold
          if (q.type === 'trigonometry' && newTp.difficulty === 'gold') _unlockAch('trig_first_gold')
        }
        // 2E-11: full pet slots
        if (player.activePets.length >= 3) _unlockAch('full_pet_slots')

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
          const stars = calcStars(battle.questionsAnswered, true)
          const isPerfect = stars === 3

          const luckBonusPct = player.luckBonus + (player.activePets.includes('lucky_fox') ? 15 : 0)
          const goldMult = 1 + (luckBonusPct / 100)
          let totalGold = (battle.goldGained + baseGold + (isPerfect ? 30 : 0)) * goldMult
          // 2E-3: golden_dragon — double gold on perfect
          if (isPerfect && player.activePets.includes('golden_dragon')) totalGold *= 2
          const finalGold = Math.floor(totalGold)

          const goldRingEquipped = Object.values(player.equippedItems).includes('gold_ring')
          const expMult = goldRingEquipped ? 1.15 : 1.0
          const finalExp = Math.floor((battle.expGained + battle.monster.expReward + (isPerfect ? 30 : 0)) * expMult)

          // 2E-5: Crystal drop
          let crystalDrop = 0
          if (battle.monster.isBoss) {
            crystalDrop = Math.random() < 0.6 ? Math.floor(Math.random() * 3) + 1 : 0
          } else {
            crystalDrop = Math.random() < 0.1 ? 1 : 0
          }

          let newPlayer = {
            ...player,
            exp:   player.exp + finalExp,
            gold:  player.gold + finalGold,
            crystals: (player.crystals ?? 0) + crystalDrop,
            completedBattles: player.completedBattles.includes(battle.battleId)
              ? player.completedBattles
              : [...player.completedBattles, battle.battleId],
            lastPlayedAt: new Date().toISOString(),
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

          // Boss drop processing
          const drops: string[] = []
          if (crystalDrop > 0) drops.push(`💎×${crystalDrop}`)
          if (battle.monster.dropTable && battle.monster.dropTable.length > 0) {
            for (const drop of battle.monster.dropTable) {
              if (Math.random() < drop.dropChance) {
                if (drop.itemType === 'equipment') {
                  if (!newPlayer.ownedEquipment.includes(drop.itemId)) {
                    newPlayer = { ...newPlayer, ownedEquipment: [...newPlayer.ownedEquipment, drop.itemId] }
                    drops.push(drop.itemId)
                  }
                } else if (drop.itemType === 'pet_egg') {
                  const petId = drop.itemId.replace(/_egg$/, '')
                  if (!newPlayer.ownedPets.includes(petId)) {
                    newPlayer = { ...newPlayer, ownedPets: [...newPlayer.ownedPets, petId] }
                    drops.push(petId)
                  }
                } else if (drop.itemType === 'crystal') {
                  newPlayer = { ...newPlayer, crystals: newPlayer.crystals + 1 }
                  drops.push('crystal')
                }
              }
            }
          }

          newPlayer = { ...newPlayer, hp: newPlayer.maxHp }

          const { player: levelled, levelUps } = processLevelUp(newPlayer)

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
              battle: s.battle ? { ...s.battle, status: 'victory', drops } : null,
              pendingLevelUps: [...s.pendingLevelUps, ...levelUps],
              dailyChallenges: updatedChallenges,
              todayStats: {
                ...s.todayStats,
                monstersDefeated: s.todayStats.monstersDefeated + 1,
                perfectBattles: s.todayStats.perfectBattles + (isPerfect ? 1 : 0),
              },
            }
          })

          const { _unlockAch } = get()
          const _fp = get().player
          if (_fp) {
            if (_fp.completedBattles.length >= 1)               _unlockAch('first_win')
            if (isPerfect)                                       _unlockAch('perfect')
            if (_fp.level >= 5)                                  _unlockAch('level5')
            if (_fp.level >= 10)                                 _unlockAch('level10')
            if (_fp.level >= 20)                                 _unlockAch('level20')
            if (_fp.ownedPets.length >= 1)                      _unlockAch('pet1')
            if (Object.values(_fp.equippedItems).some(Boolean)) _unlockAch('equip1')
          }
          if (get().streak.count >= 7) _unlockAch('streak7')

        } else {
          set(s => ({
            battle: s.battle ? { ...s.battle, status: 'defeat' } : null,
            player: s.player ? { ...s.player, hp: s.player.maxHp } : null,
          }))
        }
      },

      // ── Claim daily challenge reward ─────────────────────────
      claimChallenge: (challengeId) => {
        const { dailyChallenges, player } = get()
        const challenge = dailyChallenges.find(c => c.id === challengeId)
        if (!challenge || !challenge.isCompleted || challenge.isClaimed || !player) return

        const r: Reward = challenge.reward
        set(s => {
          let newPlayer = s.player ? {
            ...s.player,
            gold:     s.player.gold     + (r.gold ?? 0),
            crystals: s.player.crystals + (r.crystals ?? 0),
            exp:      s.player.exp      + (r.exp ?? 0),
          } : null

          // 2E-8: Grant alien skin on seven_day_streak challenge
          if (challenge.id.includes('seven_day_streak') && newPlayer && !(newPlayer.ownedSkins ?? ['wizard']).includes('alien')) {
            newPlayer = { ...newPlayer, ownedSkins: [...(newPlayer.ownedSkins ?? ['wizard']), 'alien'] }
          }
          // Also grant on 7-day streak achievement
          if (s.streak.count >= 7 && newPlayer && !(newPlayer.ownedSkins ?? ['wizard']).includes('alien')) {
            newPlayer = { ...newPlayer, ownedSkins: [...(newPlayer.ownedSkins ?? ['wizard']), 'alien'] }
          }

          return {
            player: newPlayer,
            dailyChallenges: s.dailyChallenges.map(c =>
              c.id === challengeId ? { ...c, isClaimed: true } : c
            ),
          }
        })
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
        get()._unlockAch('equip1')
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
        get()._unlockAch('shop1')
        return true
      },

      // ── Crystal shop ─────────────────────────────────────────
      buyCrystalItem: (itemId) => {
        const { player } = get()
        if (!player) return false
        const item = EQUIPMENT_DATA.find(e => e.id === itemId)
        if (!item || !item.crystalPrice) return false
        if (player.crystals < item.crystalPrice) return false
        if (player.ownedEquipment.includes(itemId)) return false
        set(s => ({
          player: s.player ? {
            ...s.player,
            crystals: s.player.crystals - (item.crystalPrice as number),
            ownedEquipment: [...s.player.ownedEquipment, itemId],
          } : null,
        }))
        get()._unlockAch('first_crystal_item')  // 2E-11
        return true
      },

      // ── Skin shop (2E-13: ownedSkins tracking) ───────────────
      buySkin: (skinId) => {
        const { player } = get()
        if (!player) return false
        const skin = SKINS_DATA.find(s => s.id === skinId)
        if (!skin) return false
        const ownedSkins = player.ownedSkins ?? ['wizard']

        // Level-unlocked skins are free
        if (skin.unlockMethod === 'level') {
          if ((skin.requiredLevel ?? 0) > player.level) return false
          if (ownedSkins.includes(skinId)) return false
          set(s => ({ player: s.player ? { ...s.player, ownedSkins: [...(s.player.ownedSkins ?? ['wizard']), skinId] } : null }))
          const newOwned = [...ownedSkins, skinId]
          if (newOwned.length >= 3) get()._unlockAch('skin_collector')  // 2E-11
          return true
        }
        // Crystal shop skins
        if (skin.unlockMethod === 'crystal_shop') {
          if (!skin.crystalPrice) return false
          if (player.crystals < skin.crystalPrice) return false
          if (ownedSkins.includes(skinId)) return false
          set(s => ({
            player: s.player ? {
              ...s.player,
              crystals: s.player.crystals - (skin.crystalPrice ?? 0),
              ownedSkins: [...(s.player.ownedSkins ?? ['wizard']), skinId],
            } : null,
          }))
          const newOwned = [...ownedSkins, skinId]
          if (newOwned.length >= 3) get()._unlockAch('skin_collector')  // 2E-11
          return true
        }
        return false
      },

      equipSkin: (skinId) => {
        const skin = SKINS_DATA.find(s => s.id === skinId)
        if (!skin) return
        set(s => ({ player: s.player ? { ...s.player, activeSkin: skin.emoji } : null }))
      },

      // ── Pets ─────────────────────────────────────────────────
      activatePet: (petId) => {
        set(s => {
          if (!s.player || s.player.activePets.length >= 3) return s
          if (s.player.activePets.includes(petId)) return s
          return { player: { ...s.player, activePets: [...s.player.activePets, petId] } }
        })
        get()._unlockAch('pet1')
        const { player } = get()
        if (player && player.activePets.length >= 3) get()._unlockAch('full_pet_slots')  // 2E-11
      },

      deactivatePet: (petId) => {
        set(s => ({
          player: s.player
            ? { ...s.player, activePets: s.player.activePets.filter(id => id !== petId) }
            : null,
        }))
      },

      // ── 2E-7: Equipment upgrade ──────────────────────────────
      upgradeItem: (itemId) => {
        const { player } = get()
        if (!player) return false
        if (!player.ownedEquipment.includes(itemId)) return false
        const item = EQUIPMENT_DATA.find(e => e.id === itemId)
        if (!item) return false
        //const currentLevel = item.upgradeLevel  // base item; in practice upgradeLevel is stored on item data
        // Track upgrade levels separately on player (using a map)
        const upgrades = (player as any).itemUpgrades as Record<string,number> ?? {}
        const curUpgrade = upgrades[itemId] ?? 0
        if (curUpgrade >= 5) return false
        const cost = 50 * (curUpgrade + 1)
        if (player.gold < cost) return false
        set(s => {
          if (!s.player) return {}
          const prevUpgrades = (s.player as any).itemUpgrades as Record<string,number> ?? {}
          return {
            player: {
              ...s.player,
              gold: s.player.gold - cost,
              itemUpgrades: { ...prevUpgrades, [itemId]: (prevUpgrades[itemId] ?? 0) + 1 },
            } as any,
          }
        })
        return true
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
        return JSON.stringify({
          version: 6,
          exportedAt: new Date().toISOString(),
          player:              s.player,
          topicProgress:       s.topicProgress,
          ownedPets:           s.ownedPets,
          parentSettings:      s.parentSettings,
          streak:              s.streak,
          dailyChallenges:     s.dailyChallenges,
          todayStats:          s.todayStats,
          unlockedAchievements:s.unlockedAchievements,
        }, null, 2)
      },

      importSave: (json) => {
        try {
          const data = JSON.parse(json)
          if (!data.player || !data.player.name) return false
          // Ensure new fields exist
          if (!data.player.ownedSkins) data.player.ownedSkins = ['wizard']
          set({
            player:              data.player,
            topicProgress:       data.topicProgress  ?? {},
            ownedPets:           data.ownedPets       ?? {},
            parentSettings:      data.parentSettings  ?? defaultParentSettings(),
            streak:              data.streak          ?? { count: 0, lastDate: '' },
            dailyChallenges:     data.dailyChallenges ?? [],
            todayStats:          data.todayStats      ?? defaultTodayStats(),
            unlockedAchievements:data.unlockedAchievements ?? [],
            nav: { screen: 'main_menu' },
          })
          return true
        } catch { return false }
      },
    }),
    {
      name: 'math-kingdom-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        player:              s.player,
        topicProgress:       s.topicProgress,
        ownedPets:           s.ownedPets,
        parentSettings:      s.parentSettings,
        streak:              s.streak,
        dailyChallenges:     s.dailyChallenges,
        todayStats:          s.todayStats,
        unlockedAchievements:s.unlockedAchievements,
      }),
    }
  )
)
