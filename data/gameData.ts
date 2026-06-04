import type { Monster, Region, Equipment, Pet } from '../types'

// ─────────────────────────────────────────────────────────────
// MONSTERS
// ─────────────────────────────────────────────────────────────

export const MONSTERS: Record<string, Monster> = {
  // Greenleaf Forest
  forest_slime: {
    id: 'forest_slime', name: 'Forest Slime', emoji: '🟢',
    level: 1, maxHp: 40, attackDamage: 5,
    expReward: 20, goldRewardMin: 5, goldRewardMax: 12, dropTable: [],
  },
  leaf_sprite: {
    id: 'leaf_sprite', name: 'Leaf Sprite', emoji: '🍃',
    level: 2, maxHp: 55, attackDamage: 7,
    expReward: 28, goldRewardMin: 8, goldRewardMax: 15, dropTable: [],
  },
  mushroom_guard: {
    id: 'mushroom_guard', name: 'Mushroom Guard', emoji: '🍄',
    level: 3, maxHp: 70, attackDamage: 9,
    expReward: 35, goldRewardMin: 10, goldRewardMax: 18, dropTable: [],
  },
  forest_wolf: {
    id: 'forest_wolf', name: 'Forest Wolf', emoji: '🐺',
    level: 4, maxHp: 90, attackDamage: 11,
    expReward: 45, goldRewardMin: 12, goldRewardMax: 22,
    dropTable: [{ itemId: 'cloth_tunic', itemType: 'equipment', dropChance: 0.15 }],
  },
  vine_golem_mini: {
    id: 'vine_golem_mini', name: 'Vine Golem', emoji: '🌿',
    level: 5, maxHp: 130, attackDamage: 13,
    expReward: 70, goldRewardMin: 20, goldRewardMax: 35,
    dropTable: [{ itemId: 'wooden_sword', itemType: 'equipment', dropChance: 0.3 }],
  },
  forest_dragon_boss: {
    id: 'forest_dragon_boss', name: 'Forest Drake', emoji: '🐲',
    level: 6, maxHp: 200, attackDamage: 15,
    expReward: 120, goldRewardMin: 40, goldRewardMax: 60,
    dropTable: [
      { itemId: 'iron_sword', itemType: 'equipment', dropChance: 0.5 },
      { itemId: 'lucky_boots', itemType: 'equipment', dropChance: 0.2 },
    ],
    specialAbility: {
      name: 'Drake Roar', description: 'Reduces timer at 50% HP',
      triggerCondition: 'hp_50', effect: 'reduce_timer', effectValue: 3,
    },
  },
  // Shadowbat Caverns
  cave_bat: {
    id: 'cave_bat', name: 'Cave Bat', emoji: '🦇',
    level: 5, maxHp: 60, attackDamage: 10,
    expReward: 30, goldRewardMin: 8, goldRewardMax: 16, dropTable: [],
  },
  shadow_bat: {
    id: 'shadow_bat', name: 'Shadow Bat', emoji: '🖤',
    level: 6, maxHp: 80, attackDamage: 12,
    expReward: 40, goldRewardMin: 10, goldRewardMax: 20, dropTable: [],
  },
  crystal_bat: {
    id: 'crystal_bat', name: 'Crystal Bat', emoji: '💜',
    level: 7, maxHp: 100, attackDamage: 14,
    expReward: 50, goldRewardMin: 14, goldRewardMax: 24,
    dropTable: [{ itemId: 'crystals', itemType: 'crystal', dropChance: 0.25 }],
  },
  stone_golem: {
    id: 'stone_golem', name: 'Stone Golem', emoji: '🪨',
    level: 8, maxHp: 120, attackDamage: 16,
    expReward: 60, goldRewardMin: 16, goldRewardMax: 28,
    dropTable: [],
  },
  bat_king_mini: {
    id: 'bat_king_mini', name: 'Bat King', emoji: '👹',
    level: 9, maxHp: 180, attackDamage: 18,
    expReward: 90, goldRewardMin: 28, goldRewardMax: 45,
    dropTable: [{ itemId: 'gold_ring', itemType: 'equipment', dropChance: 0.2 }],
  },
  baron_batsworth: {
    id: 'baron_batsworth', name: 'Baron Batsworth', emoji: '🧛',
    level: 10, maxHp: 280, attackDamage: 20,
    expReward: 160, goldRewardMin: 50, goldRewardMax: 80,
    dropTable: [
      { itemId: 'crystal_sword', itemType: 'equipment', dropChance: 0.35 },
      { itemId: 'wise_owl_egg', itemType: 'pet_egg', dropChance: 0.15 },
    ],
    specialAbility: {
      name: 'Darkness Surge', description: 'Reduces timer at 50% HP',
      triggerCondition: 'hp_50', effect: 'reduce_timer', effectValue: 5,
    },
  },
  // Number Castle
  iron_knight: {
    id: 'iron_knight', name: 'Iron Knight', emoji: '⚔️',
    level: 10, maxHp: 100, attackDamage: 18,
    expReward: 55, goldRewardMin: 15, goldRewardMax: 25, dropTable: [],
  },
  castle_archer: {
    id: 'castle_archer', name: 'Castle Archer', emoji: '🏹',
    level: 11, maxHp: 85, attackDamage: 20,
    expReward: 60, goldRewardMin: 16, goldRewardMax: 28, dropTable: [],
  },
  dark_wizard: {
    id: 'dark_wizard', name: 'Dark Wizard', emoji: '🧙',
    level: 12, maxHp: 110, attackDamage: 22,
    expReward: 70, goldRewardMin: 18, goldRewardMax: 32,
    dropTable: [{ itemId: 'crystals', itemType: 'crystal', dropChance: 0.3 }],
  },
  armoured_troll: {
    id: 'armoured_troll', name: 'Armoured Troll', emoji: '👾',
    level: 13, maxHp: 140, attackDamage: 24,
    expReward: 80, goldRewardMin: 22, goldRewardMax: 38, dropTable: [],
  },
  castle_guardian_mini: {
    id: 'castle_guardian_mini', name: 'Castle Guardian', emoji: '🛡️',
    level: 14, maxHp: 220, attackDamage: 26,
    expReward: 110, goldRewardMin: 35, goldRewardMax: 55,
    dropTable: [{ itemId: 'crystal_armor', itemType: 'equipment', dropChance: 0.2 }],
  },
  lord_dividus: {
    id: 'lord_dividus', name: 'Lord Dividus', emoji: '👑',
    level: 15, maxHp: 350, attackDamage: 28,
    expReward: 200, goldRewardMin: 70, goldRewardMax: 100,
    dropTable: [
      { itemId: 'crystal_armor', itemType: 'equipment', dropChance: 0.5 },
      { itemId: 'math_cat_egg', itemType: 'pet_egg', dropChance: 0.2 },
    ],
    specialAbility: {
      name: 'Division Fury', description: 'Double damage when consecutive wrong answers',
      triggerCondition: 'consecutive_wrong_2', effect: 'double_damage', effectValue: 2,
    },
  },

  // ── Fraction Volcano (Lv 15–19) ──────────────────────────────
  lava_sprite: {
    id: 'lava_sprite', name: 'Lava Sprite', emoji: '🔥',
    level: 15, maxHp: 110, attackDamage: 22,
    expReward: 65, goldRewardMin: 18, goldRewardMax: 30, dropTable: [],
  },
  fraction_phantom: {
    id: 'fraction_phantom', name: 'Fraction Phantom', emoji: '👻',
    level: 16, maxHp: 130, attackDamage: 24,
    expReward: 75, goldRewardMin: 20, goldRewardMax: 35, dropTable: [],
  },
  decimal_drake: {
    id: 'decimal_drake', name: 'Decimal Drake', emoji: '🦎',
    level: 17, maxHp: 155, attackDamage: 26,
    expReward: 88, goldRewardMin: 24, goldRewardMax: 40,
    dropTable: [{ itemId: 'crystals', itemType: 'crystal', dropChance: 0.25 }],
  },
  magma_toad: {
    id: 'magma_toad', name: 'Magma Toad', emoji: '🐸',
    level: 18, maxHp: 175, attackDamage: 28,
    expReward: 100, goldRewardMin: 28, goldRewardMax: 46, dropTable: [],
  },
  volcano_golem_mini: {
    id: 'volcano_golem_mini', name: 'Volcano Golem', emoji: '🌋',
    level: 19, maxHp: 270, attackDamage: 30,
    expReward: 140, goldRewardMin: 45, goldRewardMax: 65,
    dropTable: [{ itemId: 'gold_ring', itemType: 'equipment', dropChance: 0.2 }],
  },
  inferna_queen: {
    id: 'inferna_queen', name: 'Inferna Queen', emoji: '👸',
    level: 20, maxHp: 450, attackDamage: 32,
    expReward: 260, goldRewardMin: 90, goldRewardMax: 130,
    dropTable: [
      { itemId: 'crystal_sword', itemType: 'equipment', dropChance: 0.4 },
      { itemId: 'lucky_fox_egg', itemType: 'pet_egg', dropChance: 0.2 },
    ],
    specialAbility: {
      name: 'Eruption', description: 'Reduces timer at 50% HP',
      triggerCondition: 'hp_50', effect: 'reduce_timer', effectValue: 4,
    },
  },

  // ── Percentage Peaks (Lv 22–27) ──────────────────────────────
  snow_sprite: {
    id: 'snow_sprite', name: 'Snow Sprite', emoji: '❄️',
    level: 22, maxHp: 145, attackDamage: 30,
    expReward: 90, goldRewardMin: 25, goldRewardMax: 42, dropTable: [],
  },
  ice_archer: {
    id: 'ice_archer', name: 'Ice Archer', emoji: '🏹',
    level: 23, maxHp: 165, attackDamage: 33,
    expReward: 105, goldRewardMin: 28, goldRewardMax: 48, dropTable: [],
  },
  ratio_raven: {
    id: 'ratio_raven', name: 'Ratio Raven', emoji: '🐦‍⬛',
    level: 24, maxHp: 185, attackDamage: 36,
    expReward: 118, goldRewardMin: 32, goldRewardMax: 54,
    dropTable: [{ itemId: 'crystals', itemType: 'crystal', dropChance: 0.3 }],
  },
  blizzard_beast: {
    id: 'blizzard_beast', name: 'Blizzard Beast', emoji: '🐻‍❄️',
    level: 25, maxHp: 210, attackDamage: 39,
    expReward: 135, goldRewardMin: 38, goldRewardMax: 62, dropTable: [],
  },
  frost_titan_mini: {
    id: 'frost_titan_mini', name: 'Frost Titan', emoji: '🗿',
    level: 26, maxHp: 320, attackDamage: 42,
    expReward: 180, goldRewardMin: 58, goldRewardMax: 85,
    dropTable: [{ itemId: 'crystal_armor', itemType: 'equipment', dropChance: 0.18 }],
  },
  baron_percent: {
    id: 'baron_percent', name: 'Baron Percent', emoji: '🧊',
    level: 27, maxHp: 520, attackDamage: 45,
    expReward: 310, goldRewardMin: 110, goldRewardMax: 155,
    dropTable: [
      { itemId: 'magic_calculator_hat', itemType: 'equipment', dropChance: 0.35 },
      { itemId: 'baby_dragon_egg', itemType: 'pet_egg', dropChance: 0.18 },
    ],
    specialAbility: {
      name: 'Avalanche', description: 'Double damage on consecutive wrong answers',
      triggerCondition: 'consecutive_wrong_2', effect: 'double_damage', effectValue: 2,
    },
  },

  // ── Algebra Ocean (Lv 28–33) ─────────────────────────────────
  sea_variable: {
    id: 'sea_variable', name: 'Sea Variable', emoji: '🌊',
    level: 28, maxHp: 180, attackDamage: 40,
    expReward: 115, goldRewardMin: 32, goldRewardMax: 52, dropTable: [],
  },
  algebra_eel: {
    id: 'algebra_eel', name: 'Algebra Eel', emoji: '🐍',
    level: 29, maxHp: 205, attackDamage: 43,
    expReward: 130, goldRewardMin: 36, goldRewardMax: 58, dropTable: [],
  },
  sequence_shark: {
    id: 'sequence_shark', name: 'Sequence Shark', emoji: '🦈',
    level: 30, maxHp: 230, attackDamage: 46,
    expReward: 148, goldRewardMin: 40, goldRewardMax: 66,
    dropTable: [{ itemId: 'crystals', itemType: 'crystal', dropChance: 0.3 }],
  },
  negative_nautilus: {
    id: 'negative_nautilus', name: 'Negative Nautilus', emoji: '🐙',
    level: 31, maxHp: 260, attackDamage: 49,
    expReward: 165, goldRewardMin: 46, goldRewardMax: 74, dropTable: [],
  },
  kraken_mini: {
    id: 'kraken_mini', name: 'Mini Kraken', emoji: '🦑',
    level: 32, maxHp: 390, attackDamage: 52,
    expReward: 220, goldRewardMin: 72, goldRewardMax: 105,
    dropTable: [{ itemId: 'gold_ring', itemType: 'equipment', dropChance: 0.2 }],
  },
  lord_algebrax: {
    id: 'lord_algebrax', name: 'Lord Algebrax', emoji: '🔱',
    level: 33, maxHp: 620, attackDamage: 55,
    expReward: 370, goldRewardMin: 130, goldRewardMax: 180,
    dropTable: [
      { itemId: 'crystal_sword', itemType: 'equipment', dropChance: 0.45 },
      { itemId: 'wise_owl_egg', itemType: 'pet_egg', dropChance: 0.2 },
    ],
    specialAbility: {
      name: 'Variable Storm', description: 'Reduces timer at 50% HP',
      triggerCondition: 'hp_50', effect: 'reduce_timer', effectValue: 6,
    },
  },

  // ── Geometry Fortress (Lv 35–39) ─────────────────────────────
  angle_archer: {
    id: 'angle_archer', name: 'Angle Archer', emoji: '📐',
    level: 35, maxHp: 220, attackDamage: 52,
    expReward: 145, goldRewardMin: 42, goldRewardMax: 68, dropTable: [],
  },
  area_assassin: {
    id: 'area_assassin', name: 'Area Assassin', emoji: '📏',
    level: 36, maxHp: 250, attackDamage: 56,
    expReward: 165, goldRewardMin: 48, goldRewardMax: 76, dropTable: [],
  },
  coordinate_cobra: {
    id: 'coordinate_cobra', name: 'Coordinate Cobra', emoji: '🐉',
    level: 37, maxHp: 280, attackDamage: 59,
    expReward: 185, goldRewardMin: 54, goldRewardMax: 86,
    dropTable: [{ itemId: 'crystals', itemType: 'crystal', dropChance: 0.35 }],
  },
  shape_shifter: {
    id: 'shape_shifter', name: 'Shape Shifter', emoji: '🔷',
    level: 38, maxHp: 310, attackDamage: 62,
    expReward: 205, goldRewardMin: 60, goldRewardMax: 96, dropTable: [],
  },
  citadel_guardian_mini: {
    id: 'citadel_guardian_mini', name: 'Citadel Guardian', emoji: '⚡',
    level: 39, maxHp: 460, attackDamage: 66,
    expReward: 275, goldRewardMin: 90, goldRewardMax: 130,
    dropTable: [{ itemId: 'crystal_armor', itemType: 'equipment', dropChance: 0.22 }],
  },
  general_geometra: {
    id: 'general_geometra', name: 'General Geometra', emoji: '🏰',
    level: 40, maxHp: 750, attackDamage: 70,
    expReward: 450, goldRewardMin: 160, goldRewardMax: 220,
    dropTable: [
      { itemId: 'magic_calculator_hat', itemType: 'equipment', dropChance: 0.5 },
      { itemId: 'robot_dog_egg', itemType: 'pet_egg', dropChance: 0.2 },
    ],
    specialAbility: {
      name: 'Geometric Surge', description: 'Double damage on consecutive wrong answers',
      triggerCondition: 'consecutive_wrong_2', effect: 'double_damage', effectValue: 2,
    },
  },

  // ── Shadow Lair (Lv 40–45) ───────────────────────────────────
  shadow_scholar: {
    id: 'shadow_scholar', name: 'Shadow Scholar', emoji: '🌑',
    level: 40, maxHp: 260, attackDamage: 65,
    expReward: 175, goldRewardMin: 52, goldRewardMax: 84, dropTable: [],
  },
  void_viper: {
    id: 'void_viper', name: 'Void Viper', emoji: '🐍',
    level: 41, maxHp: 295, attackDamage: 70,
    expReward: 200, goldRewardMin: 60, goldRewardMax: 96, dropTable: [],
  },
  dark_algebraist: {
    id: 'dark_algebraist', name: 'Dark Algebraist', emoji: '🧮',
    level: 42, maxHp: 330, attackDamage: 75,
    expReward: 225, goldRewardMin: 68, goldRewardMax: 110,
    dropTable: [{ itemId: 'crystals', itemType: 'crystal', dropChance: 0.4 }],
  },
  trig_wraith: {
    id: 'trig_wraith', name: 'Trig Wraith', emoji: '👁️',
    level: 43, maxHp: 370, attackDamage: 80,
    expReward: 255, goldRewardMin: 76, goldRewardMax: 124, dropTable: [],
  },
  shadow_titan_mini: {
    id: 'shadow_titan_mini', name: 'Shadow Titan', emoji: '🌚',
    level: 44, maxHp: 560, attackDamage: 85,
    expReward: 340, goldRewardMin: 115, goldRewardMax: 165,
    dropTable: [{ itemId: 'crystal_sword', itemType: 'equipment', dropChance: 0.25 }],
  },
  the_shadow_mathematician: {
    id: 'the_shadow_mathematician', name: 'The Shadow Mathematician', emoji: '💀',
    level: 45, maxHp: 999, attackDamage: 90,
    expReward: 600, goldRewardMin: 220, goldRewardMax: 300,
    dropTable: [
      { itemId: 'crystal_sword', itemType: 'equipment', dropChance: 0.6 },
      { itemId: 'wise_owl_egg', itemType: 'pet_egg', dropChance: 0.35 },
      { itemId: 'crystals', itemType: 'crystal', dropChance: 0.8 },
    ],
    specialAbility: {
      name: 'Shadow Mastery', description: 'Reduces timer and doubles damage at 50% HP',
      triggerCondition: 'hp_50', effect: 'reduce_timer', effectValue: 8,
    },
  },
}

// ─────────────────────────────────────────────────────────────
// REGIONS
// ─────────────────────────────────────────────────────────────

export const REGIONS: Region[] = [
  {
    id: 'greenleaf_forest',
    name: 'Greenleaf Forest',
    description: 'A sunny woodland where the adventure begins. Master addition and subtraction to drive away the shadow creatures!',
    emoji: '🌲',
    requiredLevel: 1,
    tiers: ['Y3'],
    topicFocus: ['addition', 'subtraction', 'multiplication', 'worded_1step'],
    battles: [
      { id: 'gf_1', regionId: 'greenleaf_forest', battleNumber: 1, monsterId: 'forest_slime',       isBoss: false, isMiniBoss: false, questionTiers: ['Y3'], questionTypes: ['addition'] },
      { id: 'gf_2', regionId: 'greenleaf_forest', battleNumber: 2, monsterId: 'leaf_sprite',        isBoss: false, isMiniBoss: false, questionTiers: ['Y3'], questionTypes: ['addition', 'subtraction'] },
      { id: 'gf_3', regionId: 'greenleaf_forest', battleNumber: 3, monsterId: 'mushroom_guard',     isBoss: false, isMiniBoss: false, questionTiers: ['Y3'], questionTypes: ['subtraction', 'multiplication'] },
      { id: 'gf_4', regionId: 'greenleaf_forest', battleNumber: 4, monsterId: 'forest_wolf',        isBoss: false, isMiniBoss: false, questionTiers: ['Y3'], questionTypes: ['multiplication', 'worded_1step'] },
      { id: 'gf_mb', regionId: 'greenleaf_forest', battleNumber: 5, monsterId: 'vine_golem_mini',   isBoss: false, isMiniBoss: true,  questionTiers: ['Y3'], questionTypes: ['addition', 'subtraction', 'multiplication'] },
      { id: 'gf_boss', regionId: 'greenleaf_forest', battleNumber: 6, monsterId: 'forest_dragon_boss', isBoss: true, isMiniBoss: false, questionTiers: ['Y3'], questionTypes: ['addition', 'subtraction', 'multiplication', 'worded_1step'] },
    ],
  },
  {
    id: 'shadowbat_caverns',
    name: 'Shadowbat Caverns',
    description: 'Dark caves full of bats and crystals. Times tables and division are your weapons here.',
    emoji: '🦇',
    requiredLevel: 5,
    tiers: ['Y3', 'Y4'],
    topicFocus: ['multiplication', 'division', 'decimals', 'worded_1step'],
    battles: [
      { id: 'sc_1', regionId: 'shadowbat_caverns', battleNumber: 1, monsterId: 'cave_bat',        isBoss: false, isMiniBoss: false, questionTiers: ['Y3','Y4'], questionTypes: ['multiplication'] },
      { id: 'sc_2', regionId: 'shadowbat_caverns', battleNumber: 2, monsterId: 'shadow_bat',      isBoss: false, isMiniBoss: false, questionTiers: ['Y3','Y4'], questionTypes: ['multiplication', 'division'] },
      { id: 'sc_3', regionId: 'shadowbat_caverns', battleNumber: 3, monsterId: 'crystal_bat',     isBoss: false, isMiniBoss: false, questionTiers: ['Y4'],      questionTypes: ['division', 'decimals'] },
      { id: 'sc_4', regionId: 'shadowbat_caverns', battleNumber: 4, monsterId: 'stone_golem',     isBoss: false, isMiniBoss: false, questionTiers: ['Y4'],      questionTypes: ['division', 'worded_1step'] },
      { id: 'sc_mb', regionId: 'shadowbat_caverns', battleNumber: 5, monsterId: 'bat_king_mini', isBoss: false, isMiniBoss: true,  questionTiers: ['Y3','Y4'], questionTypes: ['multiplication', 'division', 'decimals'] },
      { id: 'sc_boss', regionId: 'shadowbat_caverns', battleNumber: 6, monsterId: 'baron_batsworth', isBoss: true, isMiniBoss: false, questionTiers: ['Y3','Y4'], questionTypes: ['multiplication', 'division', 'decimals', 'worded_1step'] },
    ],
  },
  {
    id: 'number_castle',
    name: 'Number Castle',
    description: 'An ancient fortress guarded by knights of division. Master long division and word problems to claim the crystal within.',
    emoji: '🏰',
    requiredLevel: 10,
    tiers: ['Y4', 'Y5'],
    topicFocus: ['division', 'fractions', 'decimals', 'worded_2step', 'bodmas'],
    battles: [
      { id: 'nc_1', regionId: 'number_castle', battleNumber: 1, monsterId: 'iron_knight',          isBoss: false, isMiniBoss: false, questionTiers: ['Y4','Y5'], questionTypes: ['division'] },
      { id: 'nc_2', regionId: 'number_castle', battleNumber: 2, monsterId: 'castle_archer',        isBoss: false, isMiniBoss: false, questionTiers: ['Y4','Y5'], questionTypes: ['division', 'fractions'] },
      { id: 'nc_3', regionId: 'number_castle', battleNumber: 3, monsterId: 'dark_wizard',          isBoss: false, isMiniBoss: false, questionTiers: ['Y5'],      questionTypes: ['fractions', 'decimals'] },
      { id: 'nc_4', regionId: 'number_castle', battleNumber: 4, monsterId: 'armoured_troll',       isBoss: false, isMiniBoss: false, questionTiers: ['Y5'],      questionTypes: ['bodmas', 'worded_2step'] },
      { id: 'nc_mb', regionId: 'number_castle', battleNumber: 5, monsterId: 'castle_guardian_mini', isBoss: false, isMiniBoss: true, questionTiers: ['Y4','Y5'], questionTypes: ['division', 'fractions', 'decimals', 'bodmas'] },
      { id: 'nc_boss', regionId: 'number_castle', battleNumber: 6, monsterId: 'lord_dividus',      isBoss: true, isMiniBoss: false,  questionTiers: ['Y4','Y5'], questionTypes: ['division', 'fractions', 'decimals', 'worded_2step', 'bodmas'] },
    ],
  },
  {
    id: 'fraction_volcano',
    name: 'Fraction Volcano',
    description: 'A fiery mountain where wrong answers cause eruptions. Fractions and percentages rule this volatile land.',
    emoji: '🌋',
    requiredLevel: 15,
    tiers: ['Y5'],
    topicFocus: ['fractions', 'percentages', 'decimals', 'negative_numbers'],
    battles: [
      { id: 'fv_1',    regionId: 'fraction_volcano', battleNumber: 1, monsterId: 'lava_sprite',        isBoss: false, isMiniBoss: false, questionTiers: ['Y5'], questionTypes: ['fractions'] },
      { id: 'fv_2',    regionId: 'fraction_volcano', battleNumber: 2, monsterId: 'fraction_phantom',   isBoss: false, isMiniBoss: false, questionTiers: ['Y5'], questionTypes: ['fractions', 'decimals'] },
      { id: 'fv_3',    regionId: 'fraction_volcano', battleNumber: 3, monsterId: 'decimal_drake',      isBoss: false, isMiniBoss: false, questionTiers: ['Y5'], questionTypes: ['decimals', 'percentages'] },
      { id: 'fv_4',    regionId: 'fraction_volcano', battleNumber: 4, monsterId: 'magma_toad',         isBoss: false, isMiniBoss: false, questionTiers: ['Y5'], questionTypes: ['percentages', 'negative_numbers'] },
      { id: 'fv_mb',   regionId: 'fraction_volcano', battleNumber: 5, monsterId: 'volcano_golem_mini', isBoss: false, isMiniBoss: true,  questionTiers: ['Y5'], questionTypes: ['fractions', 'decimals', 'percentages'] },
      { id: 'fv_boss', regionId: 'fraction_volcano', battleNumber: 6, monsterId: 'inferna_queen',      isBoss: true,  isMiniBoss: false, questionTiers: ['Y5'], questionTypes: ['fractions', 'decimals', 'percentages', 'negative_numbers'] },
    ],
  },
  {
    id: 'percentage_peaks',
    name: 'Percentage Peaks',
    description: 'Snow-capped mountains where avalanches threaten slow thinkers. Ratio and percentage mastery is essential.',
    emoji: '❄️',
    requiredLevel: 22,
    tiers: ['Y5', 'Y6'],
    topicFocus: ['percentages', 'ratio', 'worded_2step'],
    battles: [
      { id: 'pp_1',    regionId: 'percentage_peaks', battleNumber: 1, monsterId: 'snow_sprite',      isBoss: false, isMiniBoss: false, questionTiers: ['Y5','Y6'], questionTypes: ['percentages'] },
      { id: 'pp_2',    regionId: 'percentage_peaks', battleNumber: 2, monsterId: 'ice_archer',       isBoss: false, isMiniBoss: false, questionTiers: ['Y5','Y6'], questionTypes: ['percentages', 'ratio'] },
      { id: 'pp_3',    regionId: 'percentage_peaks', battleNumber: 3, monsterId: 'ratio_raven',      isBoss: false, isMiniBoss: false, questionTiers: ['Y6'],      questionTypes: ['ratio', 'worded_2step'] },
      { id: 'pp_4',    regionId: 'percentage_peaks', battleNumber: 4, monsterId: 'blizzard_beast',   isBoss: false, isMiniBoss: false, questionTiers: ['Y6'],      questionTypes: ['worded_2step', 'percentages'] },
      { id: 'pp_mb',   regionId: 'percentage_peaks', battleNumber: 5, monsterId: 'frost_titan_mini', isBoss: false, isMiniBoss: true,  questionTiers: ['Y5','Y6'], questionTypes: ['percentages', 'ratio', 'worded_2step'] },
      { id: 'pp_boss', regionId: 'percentage_peaks', battleNumber: 6, monsterId: 'baron_percent',    isBoss: true,  isMiniBoss: false, questionTiers: ['Y5','Y6'], questionTypes: ['percentages', 'ratio', 'worded_2step', 'decimals'] },
    ],
  },
  {
    id: 'algebra_ocean',
    name: 'Algebra Ocean',
    description: 'Mysterious depths where variables hide. Solve equations and sequences to navigate the currents.',
    emoji: '🌊',
    requiredLevel: 28,
    tiers: ['Y6'],
    topicFocus: ['algebra', 'sequences', 'ratio', 'worded_3step'],
    battles: [
      { id: 'ao_1',    regionId: 'algebra_ocean', battleNumber: 1, monsterId: 'sea_variable',      isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['algebra'] },
      { id: 'ao_2',    regionId: 'algebra_ocean', battleNumber: 2, monsterId: 'algebra_eel',       isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['algebra', 'sequences'] },
      { id: 'ao_3',    regionId: 'algebra_ocean', battleNumber: 3, monsterId: 'sequence_shark',    isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['sequences', 'negative_numbers'] },
      { id: 'ao_4',    regionId: 'algebra_ocean', battleNumber: 4, monsterId: 'negative_nautilus', isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['negative_numbers', 'worded_3step'] },
      { id: 'ao_mb',   regionId: 'algebra_ocean', battleNumber: 5, monsterId: 'kraken_mini',       isBoss: false, isMiniBoss: true,  questionTiers: ['Y6'], questionTypes: ['algebra', 'sequences', 'negative_numbers'] },
      { id: 'ao_boss', regionId: 'algebra_ocean', battleNumber: 6, monsterId: 'lord_algebrax',     isBoss: true,  isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['algebra', 'sequences', 'negative_numbers', 'worded_3step'] },
    ],
  },
  {
    id: 'geometry_fortress',
    name: 'Geometry Fortress',
    description: 'A lightning-struck citadel where every wall, angle and coordinate matters.',
    emoji: '⚡',
    requiredLevel: 35,
    tiers: ['Y6'],
    topicFocus: ['geometry_area', 'geometry_angles', 'coordinates', 'statistics'],
    battles: [
      { id: 'gf2_1',    regionId: 'geometry_fortress', battleNumber: 1, monsterId: 'angle_archer',         isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['geometry_angles'] },
      { id: 'gf2_2',    regionId: 'geometry_fortress', battleNumber: 2, monsterId: 'area_assassin',        isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['geometry_area', 'geometry_angles'] },
      { id: 'gf2_3',    regionId: 'geometry_fortress', battleNumber: 3, monsterId: 'coordinate_cobra',     isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['coordinates', 'geometry_area'] },
      { id: 'gf2_4',    regionId: 'geometry_fortress', battleNumber: 4, monsterId: 'shape_shifter',        isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['statistics', 'coordinates'] },
      { id: 'gf2_mb',   regionId: 'geometry_fortress', battleNumber: 5, monsterId: 'citadel_guardian_mini',isBoss: false, isMiniBoss: true,  questionTiers: ['Y6'], questionTypes: ['geometry_area', 'geometry_angles', 'coordinates'] },
      { id: 'gf2_boss', regionId: 'geometry_fortress', battleNumber: 6, monsterId: 'general_geometra',     isBoss: true,  isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['geometry_area', 'geometry_angles', 'coordinates', 'statistics'] },
    ],
  },
  {
    id: 'shadow_lair',
    name: "Shadow Mathematician's Lair",
    description: 'The final confrontation. All your knowledge will be tested in the ultimate 11+ challenge.',
    emoji: '🌑',
    requiredLevel: 40,
    tiers: ['Y6'],
    topicFocus: ['addition','subtraction','multiplication','division','fractions','percentages','ratio','algebra','geometry_area','statistics'],
    battles: [
      { id: 'sl_1',    regionId: 'shadow_lair', battleNumber: 1, monsterId: 'shadow_scholar',           isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['algebra', 'worded_3step'] },
      { id: 'sl_2',    regionId: 'shadow_lair', battleNumber: 2, monsterId: 'void_viper',               isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['sequences', 'negative_numbers', 'worded_3step'] },
      { id: 'sl_3',    regionId: 'shadow_lair', battleNumber: 3, monsterId: 'dark_algebraist',          isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['algebra', 'fractions', 'percentages'] },
      { id: 'sl_4',    regionId: 'shadow_lair', battleNumber: 4, monsterId: 'trig_wraith',              isBoss: false, isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['geometry_area', 'geometry_angles', 'statistics'] },
      { id: 'sl_mb',   regionId: 'shadow_lair', battleNumber: 5, monsterId: 'shadow_titan_mini',        isBoss: false, isMiniBoss: true,  questionTiers: ['Y6'], questionTypes: ['algebra', 'fractions', 'percentages', 'ratio', 'worded_3step'] },
      { id: 'sl_boss', regionId: 'shadow_lair', battleNumber: 6, monsterId: 'the_shadow_mathematician', isBoss: true,  isMiniBoss: false, questionTiers: ['Y6'], questionTypes: ['algebra', 'fractions', 'percentages', 'ratio', 'geometry_area', 'statistics', 'worded_3step'] },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// EQUIPMENT
// ─────────────────────────────────────────────────────────────

export const EQUIPMENT_DATA: Equipment[] = [
  {
    id: 'wooden_sword', name: 'Wooden Sword', emoji: '🗡️',
    slot: 'weapon', rarity: 'common',
    description: 'A trusty training sword.', loreText: 'Every hero starts here.',
    stats: { attack: 2 }, upgradeLevel: 0, shopPrice: null,
    obtainMethod: 'level_reward', requiredLevel: 2,
  },
  {
    id: 'iron_sword', name: 'Iron Sword', emoji: '⚔️',
    slot: 'weapon', rarity: 'uncommon',
    description: 'Forged in the castle armoury.', loreText: 'Sharp enough to solve most problems.',
    stats: { attack: 5 }, upgradeLevel: 0, shopPrice: 80,
    obtainMethod: 'shop', requiredLevel: 5,
  },
  {
    id: 'crystal_sword', name: 'Crystal Sword', emoji: '💎',
    slot: 'weapon', rarity: 'rare',
    description: 'Infused with Number Crystal energy.', loreText: 'Hums with mathematical power.',
    stats: { attack: 10, comboMultiplierBonus: 0.05 }, upgradeLevel: 0, shopPrice: null,
    obtainMethod: 'boss_drop', requiredLevel: 10,
  },
  {
    id: 'cloth_tunic', name: 'Cloth Tunic', emoji: '👕',
    slot: 'armour', rarity: 'common',
    description: 'Basic protection.', loreText: 'Better than nothing.',
    stats: { hp: 10 }, upgradeLevel: 0, shopPrice: 40,
    obtainMethod: 'shop', requiredLevel: 1,
  },
  {
    id: 'crystal_armor', name: 'Crystal Armour', emoji: '🛡️',
    slot: 'armour', rarity: 'rare',
    description: 'Forged from Number Crystals.', loreText: 'The kingdom\'s finest protection.',
    stats: { hp: 25, defence: 5 }, upgradeLevel: 0, shopPrice: null,
    obtainMethod: 'level_reward', requiredLevel: 20,
  },
  {
    id: 'lucky_boots', name: 'Lucky Boots', emoji: '👢',
    slot: 'accessory', rarity: 'uncommon',
    description: 'Slightly enchanted footwear.', loreText: 'Coins seem to fall towards you.',
    stats: { luckBonus: 10 }, upgradeLevel: 0, shopPrice: null,
    obtainMethod: 'level_reward', requiredLevel: 7,
  },
  {
    id: 'gold_ring', name: 'Gold Ring', emoji: '💍',
    slot: 'accessory', rarity: 'rare',
    description: 'Increases the wisdom of your victories.', loreText: 'Ancient scholars wore these.',
    stats: { expBonus: 15 }, upgradeLevel: 0, shopPrice: 150,
    obtainMethod: 'shop', requiredLevel: 8,
  },
  {
    id: 'magic_calculator_hat', name: 'Calculator Hat', emoji: '🎩',
    slot: 'hat', rarity: 'uncommon',
    description: '+5 seconds on every question.', loreText: 'Think longer, answer better.',
    stats: { speedBonus: 5 }, upgradeLevel: 0, shopPrice: null,
    obtainMethod: 'level_reward', requiredLevel: 30,
  },
]

// ─────────────────────────────────────────────────────────────
// PETS
// ─────────────────────────────────────────────────────────────

export const PETS_DATA: Pet[] = [
  {
    id: 'math_cat', name: 'Math Cat', emoji: '🐱',
    description: 'A clever cat who whispers hints when you go wrong.',
    maxLevel: 10,
    passiveAbility: {
      name: 'Helpful Hint', description: 'Shows a hint on wrong answer',
      effectType: 'hint_on_wrong', baseValue: 1, maxLevelValue: 2,
    },
    shopPrice: null, obtainMethod: 'level_reward',
  },
  {
    id: 'baby_dragon', name: 'Baby Dragon', emoji: '🐉',
    description: 'A tiny dragon who celebrates your victories with extra EXP.',
    maxLevel: 10,
    passiveAbility: {
      name: 'Dragon\'s Blessing', description: '+10% EXP from all battles',
      effectType: 'exp_boost', baseValue: 10, maxLevelValue: 25,
    },
    shopPrice: null, obtainMethod: 'level_reward',
  },
  {
    id: 'robot_dog', name: 'Robot Dog', emoji: '🤖',
    description: 'A mechanical pup that absorbs one mistake per battle.',
    maxLevel: 10,
    passiveAbility: {
      name: 'Error Shield', description: 'Absorbs 1 wrong answer per battle',
      effectType: 'absorb_wrong', baseValue: 1, maxLevelValue: 2,
    },
    shopPrice: null, obtainMethod: 'level_reward',
  },
  {
    id: 'wise_owl', name: 'Wise Owl', emoji: '🦉',
    description: 'An ancient owl who removes two wrong answers per battle.',
    maxLevel: 10,
    passiveAbility: {
      name: 'Fifty-Fifty', description: 'Remove 2 wrong options once per battle',
      effectType: 'fifty_fifty', baseValue: 1, maxLevelValue: 2,
    },
    shopPrice: null, obtainMethod: 'boss_drop',
  },
  {
    id: 'lucky_fox', name: 'Lucky Fox', emoji: '🦊',
    description: 'A fox whose magic tail brings extra gold.',
    maxLevel: 10,
    passiveAbility: {
      name: 'Gold Rush', description: '+15% gold from all battles',
      effectType: 'gold_boost', baseValue: 15, maxLevelValue: 30,
    },
    shopPrice: 200, obtainMethod: 'daily_reward',
  },
]

// ─────────────────────────────────────────────────────────────
// LEVEL-UP REWARDS TABLE
// ─────────────────────────────────────────────────────────────

export const LEVEL_REWARDS: Record<number, { type: 'equipment'|'pet'|'region_unlock'|'topic_unlock', id: string, label: string }[]> = {
  2:  [{ type: 'equipment', id: 'wooden_sword',        label: 'Wooden Sword' }],
  3:  [{ type: 'pet',       id: 'math_cat',            label: 'Math Cat Pet' }],
  5:  [{ type: 'region_unlock', id: 'shadowbat_caverns', label: 'Shadowbat Caverns' }],
  7:  [{ type: 'equipment', id: 'lucky_boots',         label: 'Lucky Boots' }],
  10: [{ type: 'region_unlock', id: 'number_castle',   label: 'Number Castle' }],
  15: [{ type: 'region_unlock', id: 'fraction_volcano', label: 'Fraction Volcano' }],
  20: [{ type: 'equipment', id: 'crystal_armor',       label: 'Crystal Armour' }],
  22: [{ type: 'region_unlock', id: 'percentage_peaks', label: 'Percentage Peaks' }],
  25: [{ type: 'pet',       id: 'baby_dragon',         label: 'Baby Dragon Pet' }],
  28: [{ type: 'region_unlock', id: 'algebra_ocean',   label: 'Algebra Ocean' }],
  30: [{ type: 'equipment', id: 'magic_calculator_hat', label: 'Calculator Hat' }],
  35: [{ type: 'region_unlock', id: 'geometry_fortress', label: 'Geometry Fortress' }],
  40: [{ type: 'pet',       id: 'robot_dog',           label: 'Robot Dog Pet' },
       { type: 'region_unlock', id: 'shadow_lair',     label: "Shadow Mathematician's Lair" }],
}
