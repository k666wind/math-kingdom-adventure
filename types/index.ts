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
  |'roman_numerals'|'money_problems'|'time_problems'
  |'venn_diagrams'|'function_machines'|'long_division'
  |'volume_3d'|'algebraic_expressions'

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
  // 2I-2: Spaced Repetition (Leitner box)
  srsBox: number        // 1–5; 1=daily, 2=2days, 3=4days, 4=7days, 5=mastered
  nextReviewAt: string  // ISO date string
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
  craftingMaterials: Record<string, number>  // 2I-8: spare copies
  ownedPets: string[]
  ownedSkins: string[]        // 2E-13: owned skin ids (default: ['wizard'])
  battleRecords: Record<string, BattleRecord>
  seenRegions: string[]
  activeSkin: string           // emoji string e.g. '🧙'
  examHistory: ExamResult[]    // 2G-1: last 10 mock exams
  weeklyStats: Array<{         // 2G-3: daily stats for chart
    date: string
    correct: number
    attempted: number
  }>
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
  |'geometry_fortress'|'shadow_lair'|'scholars_tower'

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
  isBoss: boolean             // 2E-12
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
  drops: string[]
  phoenixUsed: boolean        // 2E-3
  timerReduction: number      // 2E-6
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
export type Rarity = 'common'|'uncommon'|'rare'|'legendary'|'epic'
export type EquipmentTier = 'common'|'rare'|'epic'    // 2E-2

export interface Equipment {
  id: string
  name: string
  emoji: string
  slot: EquipmentSlot
  rarity: Rarity
  tier: EquipmentTier         // 2E-2
  description: string
  loreText: string
  stats: EquipmentStats
  upgradeLevel: number
  shopPrice: number|null
  crystalPrice?: number
  obtainMethod: 'level_reward'|'shop'|'boss_drop'|'daily_reward'|'crystal_shop'
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

export type PetEffectType =
  |'hint_on_wrong'|'exp_boost'|'absorb_wrong'|'fifty_fifty'|'gold_boost'
  |'timer_bonus'|'perfect_gold_double'|'revive'|'first_answer_correct'
  |'attack_bonus_pct'|'heal_on_correct'    // 2E-3 new pet effects

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

// 2F-2: Weekly challenge
export interface WeeklyChallenge {
  id: string
  weekStart: string          // ISO Monday date
  description: string
  type: 'total_correct' | 'bosses_defeated' | 'topic_mastery' | 'streak'
  targetValue: number
  currentProgress: number
  isCompleted: boolean
  isClaimed: boolean
  reward: Reward
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
  timerAdjustSeconds: number  // 2H-E: -10 to +30, 0=normal, replaces timerMode radio
  skipBattleIntro: boolean    // 2H-9
  lastUpdated: string
  // 2G-6
  soundSettings: {
    sfxVolume: number
    bgmVolume: number
    bgmEnabled: boolean
  }
  // 2G-7
  accessibility: {
    fontScale: 'normal'|'large'|'xlarge'
    highContrast: boolean
    readAloud: boolean
  }
}

// ─── Exam types (2G-1) ───────────────────────────────────────
export interface ExamConfig {
  questionCount: 25 | 50
  timeLimitMinutes: 25 | 45
  yearGroup: 'Y4' | 'Y5' | 'Y6' | 'mixed'
  examBoard: 'GL' | 'CEM' | 'CSSE' | 'practice'
}

export interface ExamSession {
  config: ExamConfig
  questions: Question[]
  answers: (number | null)[]
  flagged: boolean[]
  currentIndex: number
  startedAt: string
  finishedAt: string | null
  status: 'active' | 'completed' | 'timed_out'
}

export interface ExamResult {
  id: string
  config: ExamConfig
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  timeTakenSeconds: number
  topicBreakdown: Record<string, { attempted: number; correct: number }>
  date: string
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

// ─── Multi-Account System (2H-0) ────────────────────────────
export interface AccountMeta {
  id: string           // 'account_' + timestamp
  name: string
  pinHash: string      // '' if no PIN
  hasPIN: boolean
  createdAt: string
  lastPlayedAt: string
  avatarEmoji: string  // player.activeSkin
  level: number        // player.level (for display)
}

// 2I-8: Crafting
export interface CraftingRecipe {
  id: string
  name: string
  emoji: string
  description: string
  ingredients: Array<{ itemId: string; count: number }>
  outputItemId: string
  requiredLevel: number
}

// 2I-1: Practice Mode
export interface PracticeSession {
  topic: QuestionType
  tier: QuestionTier
  currentQuestion: Question | null
  questions: QuestionResult[]
  streak: number
  startedAt: string
  mode: 'free' | 'srs_review'  // free = any question, srs_review = due topics only
}

export type AppScreen =
  |'splash'|'onboarding_welcome'|'onboarding_name'
  |'main_menu'|'world_map'|'region_detail'|'battle'|'level_up'
  |'collection_equipment'|'collection_pets'|'shop'
  |'daily_challenges'|'achievements'|'parent_pin'|'parent_dashboard'
  |'exam_setup'|'exam_active'|'exam_results'
  |'account_select'
  |'practice_select'|'practice_active'|'practice_results'
  |'pvp_setup'|'pvp_active'|'pvp_results'


export interface NavigationState {
  screen: AppScreen
  regionId?: RegionId
  battleId?: string
}

// ─── Skin System (2D-8, extended 2E-4) ──────────────────────
export interface Skin {
  id: string
  emoji: string
  name: string
  glowColor: string    // 2E-4
  bgColor: string      // 2E-4
  unlockMethod: 'default'|'level'|'crystal_shop'|'daily_reward'
  requiredLevel?: number
  crystalPrice?: number
}
