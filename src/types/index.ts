export type QuestionTier = 'Y3'|'Y4'|'Y5'|'Y6'|'Y7'|'Y8'|'Y9'|'Y10'|'Y11'
export type DifficultyLevel = 'bronze'|'silver'|'gold'
export type QuestionType =
  |'addition'|'subtraction'|'multiplication'|'division'
  |'fractions'|'decimals'|'percentages'|'ratio'
  |'algebra'|'sequences'|'geometry_area'|'geometry_angles'
  |'coordinates'|'statistics'|'probability'
  |'worded_1step'|'worded_2step'|'worded_3step'
  |'factors_primes'|'negative_numbers'|'bodmas'
  |'quadratics'|'trigonometry'|'simultaneous'

export interface Question {
  id: string
  tier: QuestionTier
  type: QuestionType
  difficulty: DifficultyLevel
  questionText: string
  answers: string[]       // 4 MCQ options
  correctIndex: number    // index into answers[]
  explanation: string
  timeLimitSeconds: number
}

export interface TopicProgress {
  type: QuestionType
  tier: QuestionTier
  difficulty: DifficultyLevel
  totalAnswered: number
  totalCorrect: number
  consecutiveCorrect: number
  lastAttemptedAt: string|null
  masteryScore: number
}

export interface Player {
  id: string
  name: string
  level: number
  exp: number
  expToNextLevel: number
  hp: number
  maxHp: number
  gold: number
  crystals: number
  attack: number
  defence: number
  speedBonus: number
  luckBonus: number
  createdAt: string
  lastPlayedAt: string
  totalPlayTimeSeconds: number
  equippedItems: EquippedItems
  activePets: string[]
  unlockedRegions: RegionId[]
  completedBattles: string[]
  ownedEquipment: string[]
  ownedPets: string[]
}

export interface EquippedItems {
  weapon: string|null
  armour: string|null
  accessory: string|null
  hat: string|null
}

export type RegionId =
  |'greenleaf_forest'|'shadowbat_caverns'|'number_castle'
  |'fraction_volcano'|'percentage_peaks'|'algebra_ocean'
  |'geometry_fortress'|'shadow_lair'

export interface Region {
  id: RegionId
  name: string
  description: string
  emoji: string
  requiredLevel: number
  battles: BattleConfig[]
  topicFocus: QuestionType[]
  tiers: QuestionTier[]
}

export interface BattleConfig {
  id: string
  regionId: RegionId
  battleNumber: number
  monsterId: string
  isBoss: boolean
  isMiniBoss: boolean
  questionTiers: QuestionTier[]
  questionTypes: QuestionType[]
}

export interface BattleRecord {
  battleId: string
  bestStars: 0|1|2|3
  completedAt: string
}

export interface Monster {
  id: string
  name: string
  emoji: string
  level: number
  maxHp: number
  attackDamage: number
  expReward: number
  goldRewardMin: number
  goldRewardMax: number
  dropTable: DropEntry[]
  specialAbility?: MonsterSpecialAbility
}

export interface MonsterSpecialAbility {
  name: string
  description: string
  triggerCondition: 'hp_50'|'hp_25'|'consecutive_wrong_2'
  effect: 'reduce_timer'|'double_damage'|'heal'
  effectValue: number
}

export interface DropEntry {
  itemId: string
  itemType: 'equipment'|'pet_egg'|'crystal'
  dropChance: number
}

export interface BattleState {
  sessionId: string
  regionId: RegionId
  battleId: string
  monster: Monster
  monsterCurrentHp: number
  playerCurrentHp: number
  currentQuestion: Question|null
  questionsAnswered: QuestionResult[]
  comboCount: number
  maxComboReached: number
  expGained: number
  goldGained: number
  phase: number
  status: 'idle'|'question'|'feedback_correct'|'feedback_wrong'|'victory'|'defeat'
  lastAnswerCorrect: boolean|null
  timerBonus: number
}

export interface QuestionResult {
  questionId: string
  questionType: QuestionType
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeRemaining: number
  timestamp: string
}

export type EquipmentSlot = 'weapon'|'armour'|'accessory'|'hat'
export type Rarity = 'common'|'uncommon'|'rare'|'legendary'

export interface Equipment {
  id: string
  name: string
  emoji: string
  slot: EquipmentSlot
  rarity: Rarity
  description: string
  loreText: string
  stats: EquipmentStats
  upgradeLevel: number
  shopPrice: number|null
  obtainMethod: 'level_reward'|'shop'|'boss_drop'|'daily_reward'
  requiredLevel: number
}

export interface EquipmentStats {
  attack?: number
  hp?: number
  defence?: number
  speedBonus?: number
  luckBonus?: number
  expBonus?: number
  comboMultiplierBonus?: number
}

export type PetEffectType = 'hint_on_wrong'|'exp_boost'|'absorb_wrong'|'fifty_fifty'|'gold_boost'

export interface Pet {
  id: string
  name: string
  emoji: string
  description: string
  maxLevel: number
  passiveAbility: PetAbility
  shopPrice: number|null
  obtainMethod: 'level_reward'|'boss_drop'|'daily_reward'|'pet_egg'
}

export interface PetAbility {
  name: string
  description: string
  effectType: PetEffectType
  baseValue: number
  maxLevelValue: number
}

export interface OwnedPet {
  petId: string
  level: number
  exp: number
  happiness: number
  isActive: boolean
}

export interface Reward {
  gold?: number
  crystals?: number
  exp?: number
  equipmentId?: string
  petEgg?: boolean
  badgeId?: string
}

export type ChallengeType =
  |'questions_correct'|'monsters_defeated'|'combo_reached'
  |'perfect_battle'|'accuracy_streak'|'topic_specific'|'boss_defeated'

export interface DailyChallenge {
  id: string
  date: string
  type: ChallengeType
  description: string
  targetValue: number
  currentProgress: number
  isCompleted: boolean
  isClaimed: boolean
  reward: Reward
  topicFilter?: QuestionType
}

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  category: 'combat'|'academic'|'collection'|'streak'|'special'
  isUnlocked: boolean
  unlockedAt: string|null
  reward: Reward
}

export interface ParentSettings {
  pinHash: string
  isPinSet: boolean
  difficultyOverride: QuestionTier|null
  enabledTopics: QuestionType[]
  disabledTopics: QuestionType[]
  dailyTimeLimitMinutes: number|null
  dailyQuestionGoal: number|null
  timerMode: 'normal'|'relaxed'|'challenge'
  lastUpdated: string
}

export interface SessionStats {
  date: string
  questionsAnswered: number
  questionsCorrect: number
  playTimeSeconds: number
  topicsAttempted: QuestionType[]
  highestCombo: number
  battlesWon: number
  expGained: number
  goldGained: number
}

export type AppScreen =
  |'splash'|'onboarding_welcome'|'onboarding_name'
  |'main_menu'|'world_map'|'region_detail'|'battle'|'level_up'
  |'collection_equipment'|'collection_pets'|'shop'
  |'daily_challenges'|'achievements'|'parent_pin'|'parent_dashboard'

export interface NavigationState {
  screen: AppScreen
  regionId?: RegionId
  battleId?: string
}
