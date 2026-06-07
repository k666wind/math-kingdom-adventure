import type { Monster, Region, Equipment, Pet, Skin } from '../types'

// ─────────────────────────────────────────────────────────────
// MONSTERS  (2E-12: isBoss flag added to all)
// ─────────────────────────────────────────────────────────────

export const MONSTERS: Record<string, Monster> = {
  // Greenleaf Forest
  forest_slime:       { id:'forest_slime',       name:'Forest Slime',    emoji:'🟢', level:1,  maxHp:40,  attackDamage:5,  expReward:20,  goldRewardMin:5,   goldRewardMax:12,  dropTable:[], isBoss:false },
  leaf_sprite:        { id:'leaf_sprite',         name:'Leaf Sprite',     emoji:'🍃', level:2,  maxHp:55,  attackDamage:7,  expReward:28,  goldRewardMin:8,   goldRewardMax:15,  dropTable:[], isBoss:false },
  mushroom_guard:     { id:'mushroom_guard',       name:'Mushroom Guard',  emoji:'🍄', level:3,  maxHp:70,  attackDamage:9,  expReward:35,  goldRewardMin:10,  goldRewardMax:18,  dropTable:[], isBoss:false },
  forest_wolf:        { id:'forest_wolf',          name:'Forest Wolf',     emoji:'🐺', level:4,  maxHp:90,  attackDamage:11, expReward:45,  goldRewardMin:12,  goldRewardMax:22,  dropTable:[{itemId:'cloth_tunic',itemType:'equipment',dropChance:0.15}], isBoss:false },
  vine_golem_mini:    { id:'vine_golem_mini',      name:'Vine Golem',      emoji:'🌿', level:5,  maxHp:130, attackDamage:13, expReward:70,  goldRewardMin:20,  goldRewardMax:35,  dropTable:[{itemId:'wooden_sword',itemType:'equipment',dropChance:0.3}], isBoss:false },
  forest_dragon_boss: {
    id:'forest_dragon_boss', name:'Forest Drake', emoji:'🐲', level:6, maxHp:200, attackDamage:15,
    expReward:120, goldRewardMin:40, goldRewardMax:60, isBoss:true,
    dropTable:[{itemId:'iron_sword',itemType:'equipment',dropChance:0.5},{itemId:'lucky_boots',itemType:'equipment',dropChance:0.2}],
    specialAbility:{ name:'Drake Roar', description:'Reduces timer at 50% HP', triggerCondition:'hp_50', effect:'reduce_timer', effectValue:3 },
  },
  // Shadowbat Caverns
  cave_bat:        { id:'cave_bat',        name:'Cave Bat',       emoji:'🦇', level:5,  maxHp:60,  attackDamage:10, expReward:30,  goldRewardMin:8,   goldRewardMax:16,  dropTable:[], isBoss:false },
  shadow_bat:      { id:'shadow_bat',      name:'Shadow Bat',     emoji:'🖤', level:6,  maxHp:80,  attackDamage:12, expReward:40,  goldRewardMin:10,  goldRewardMax:20,  dropTable:[], isBoss:false },
  crystal_bat:     { id:'crystal_bat',     name:'Crystal Bat',    emoji:'💜', level:7,  maxHp:100, attackDamage:14, expReward:50,  goldRewardMin:14,  goldRewardMax:24,  dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.25}], isBoss:false },
  stone_golem:     { id:'stone_golem',     name:'Stone Golem',    emoji:'🪨', level:8,  maxHp:120, attackDamage:16, expReward:60,  goldRewardMin:16,  goldRewardMax:28,  dropTable:[], isBoss:false },
  bat_king_mini:   { id:'bat_king_mini',   name:'Bat King',       emoji:'👹', level:9,  maxHp:180, attackDamage:18, expReward:90,  goldRewardMin:28,  goldRewardMax:45,  dropTable:[{itemId:'gold_ring',itemType:'equipment',dropChance:0.2}], isBoss:false },
  baron_batsworth: {
    id:'baron_batsworth', name:'Baron Batsworth', emoji:'🧛', level:10, maxHp:280, attackDamage:20,
    expReward:160, goldRewardMin:50, goldRewardMax:80, isBoss:true,
    dropTable:[{itemId:'crystal_sword',itemType:'equipment',dropChance:0.35},{itemId:'wise_owl_egg',itemType:'pet_egg',dropChance:0.15}],
    specialAbility:{ name:'Darkness Surge', description:'Reduces timer at 50% HP', triggerCondition:'hp_50', effect:'reduce_timer', effectValue:5 },
  },
  // Number Castle
  iron_knight:          { id:'iron_knight',          name:'Iron Knight',     emoji:'⚔️', level:10, maxHp:100, attackDamage:18, expReward:55,  goldRewardMin:15, goldRewardMax:25, dropTable:[], isBoss:false },
  castle_archer:        { id:'castle_archer',         name:'Castle Archer',   emoji:'🏹', level:11, maxHp:85,  attackDamage:20, expReward:60,  goldRewardMin:16, goldRewardMax:28, dropTable:[], isBoss:false },
  dark_wizard:          { id:'dark_wizard',            name:'Dark Wizard',     emoji:'🧙', level:12, maxHp:110, attackDamage:22, expReward:70,  goldRewardMin:18, goldRewardMax:32, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.3}], isBoss:false },
  armoured_troll:       { id:'armoured_troll',         name:'Armoured Troll',  emoji:'👾', level:13, maxHp:140, attackDamage:24, expReward:80,  goldRewardMin:22, goldRewardMax:38, dropTable:[], isBoss:false },
  castle_guardian_mini: { id:'castle_guardian_mini',   name:'Castle Guardian', emoji:'🛡️', level:14, maxHp:220, attackDamage:26, expReward:110, goldRewardMin:35, goldRewardMax:55, dropTable:[{itemId:'crystal_armor',itemType:'equipment',dropChance:0.2}], isBoss:false },
  lord_dividus: {
    id:'lord_dividus', name:'Lord Dividus', emoji:'👑', level:15, maxHp:350, attackDamage:28,
    expReward:200, goldRewardMin:70, goldRewardMax:100, isBoss:true,
    dropTable:[{itemId:'crystal_armor',itemType:'equipment',dropChance:0.5},{itemId:'math_cat_egg',itemType:'pet_egg',dropChance:0.2}],
    specialAbility:{ name:'Division Fury', description:'Double damage on consecutive wrong answers', triggerCondition:'consecutive_wrong_2', effect:'double_damage', effectValue:2 },
  },
  // Fraction Volcano
  lava_sprite:       { id:'lava_sprite',       name:'Lava Sprite',    emoji:'🔥', level:15, maxHp:110, attackDamage:22, expReward:65,  goldRewardMin:18, goldRewardMax:30, dropTable:[], isBoss:false },
  fraction_phantom:  { id:'fraction_phantom',  name:'Fraction Phantom',emoji:'👻', level:16, maxHp:130, attackDamage:24, expReward:75,  goldRewardMin:20, goldRewardMax:35, dropTable:[], isBoss:false },
  decimal_drake:     { id:'decimal_drake',     name:'Decimal Drake',   emoji:'🦎', level:17, maxHp:155, attackDamage:26, expReward:88,  goldRewardMin:24, goldRewardMax:40, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.25}], isBoss:false },
  magma_toad:        { id:'magma_toad',        name:'Magma Toad',      emoji:'🐸', level:18, maxHp:175, attackDamage:28, expReward:100, goldRewardMin:28, goldRewardMax:46, dropTable:[], isBoss:false },
  volcano_golem_mini:{ id:'volcano_golem_mini',name:'Volcano Golem',   emoji:'🌋', level:19, maxHp:270, attackDamage:30, expReward:140, goldRewardMin:45, goldRewardMax:65, dropTable:[{itemId:'gold_ring',itemType:'equipment',dropChance:0.2}], isBoss:false },
  inferna_queen: {
    id:'inferna_queen', name:'Inferna Queen', emoji:'👸', level:20, maxHp:450, attackDamage:32,
    expReward:260, goldRewardMin:90, goldRewardMax:130, isBoss:true,
    dropTable:[{itemId:'crystal_sword',itemType:'equipment',dropChance:0.4},{itemId:'lucky_fox_egg',itemType:'pet_egg',dropChance:0.2}],
    specialAbility:{ name:'Eruption', description:'Reduces timer at 50% HP', triggerCondition:'hp_50', effect:'reduce_timer', effectValue:4 },
  },
  // Percentage Peaks
  snow_sprite:      { id:'snow_sprite',      name:'Snow Sprite',   emoji:'❄️',  level:22, maxHp:145, attackDamage:30, expReward:90,  goldRewardMin:25, goldRewardMax:42, dropTable:[], isBoss:false },
  ice_archer:       { id:'ice_archer',       name:'Ice Archer',    emoji:'🏹',  level:23, maxHp:165, attackDamage:33, expReward:105, goldRewardMin:28, goldRewardMax:48, dropTable:[], isBoss:false },
  ratio_raven:      { id:'ratio_raven',      name:'Ratio Raven',   emoji:'🐦‍⬛', level:24, maxHp:185, attackDamage:36, expReward:118, goldRewardMin:32, goldRewardMax:54, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.3}], isBoss:false },
  blizzard_beast:   { id:'blizzard_beast',   name:'Blizzard Beast',emoji:'🐻‍❄️', level:25, maxHp:210, attackDamage:39, expReward:135, goldRewardMin:38, goldRewardMax:62, dropTable:[], isBoss:false },
  frost_titan_mini: { id:'frost_titan_mini', name:'Frost Titan',   emoji:'🗿',  level:26, maxHp:320, attackDamage:42, expReward:180, goldRewardMin:58, goldRewardMax:85, dropTable:[{itemId:'crystal_armor',itemType:'equipment',dropChance:0.18}], isBoss:false },
  baron_percent: {
    id:'baron_percent', name:'Baron Percent', emoji:'🧊', level:27, maxHp:520, attackDamage:45,
    expReward:310, goldRewardMin:110, goldRewardMax:155, isBoss:true,
    dropTable:[{itemId:'magic_calculator_hat',itemType:'equipment',dropChance:0.35},{itemId:'baby_dragon_egg',itemType:'pet_egg',dropChance:0.18}],
    specialAbility:{ name:'Avalanche', description:'Double damage on consecutive wrong answers', triggerCondition:'consecutive_wrong_2', effect:'double_damage', effectValue:2 },
  },
  // Algebra Ocean
  sea_variable:      { id:'sea_variable',      name:'Sea Variable',    emoji:'🌊', level:28, maxHp:180, attackDamage:40, expReward:115, goldRewardMin:32, goldRewardMax:52, dropTable:[], isBoss:false },
  algebra_eel:       { id:'algebra_eel',       name:'Algebra Eel',     emoji:'🐍', level:29, maxHp:205, attackDamage:43, expReward:130, goldRewardMin:36, goldRewardMax:58, dropTable:[], isBoss:false },
  sequence_shark:    { id:'sequence_shark',    name:'Sequence Shark',  emoji:'🦈', level:30, maxHp:230, attackDamage:46, expReward:148, goldRewardMin:40, goldRewardMax:66, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.3}], isBoss:false },
  negative_nautilus: { id:'negative_nautilus', name:'Negative Nautilus',emoji:'🐙',level:31, maxHp:260, attackDamage:49, expReward:165, goldRewardMin:46, goldRewardMax:74, dropTable:[], isBoss:false },
  kraken_mini:       { id:'kraken_mini',       name:'Mini Kraken',     emoji:'🦑', level:32, maxHp:390, attackDamage:52, expReward:220, goldRewardMin:72, goldRewardMax:105, dropTable:[{itemId:'gold_ring',itemType:'equipment',dropChance:0.2}], isBoss:false },
  lord_algebrax: {
    id:'lord_algebrax', name:'Lord Algebrax', emoji:'🔱', level:33, maxHp:620, attackDamage:55,
    expReward:370, goldRewardMin:130, goldRewardMax:180, isBoss:true,
    dropTable:[{itemId:'crystal_sword',itemType:'equipment',dropChance:0.45},{itemId:'wise_owl_egg',itemType:'pet_egg',dropChance:0.2}],
    specialAbility:{ name:'Variable Storm', description:'Reduces timer at 50% HP', triggerCondition:'hp_50', effect:'reduce_timer', effectValue:6 },
  },
  // Geometry Fortress
  angle_archer:          { id:'angle_archer',          name:'Angle Archer',    emoji:'📐', level:35, maxHp:220, attackDamage:52, expReward:145, goldRewardMin:42, goldRewardMax:68, dropTable:[], isBoss:false },
  area_assassin:         { id:'area_assassin',          name:'Area Assassin',   emoji:'📏', level:36, maxHp:250, attackDamage:56, expReward:165, goldRewardMin:48, goldRewardMax:76, dropTable:[], isBoss:false },
  coordinate_cobra:      { id:'coordinate_cobra',       name:'Coordinate Cobra',emoji:'🐉', level:37, maxHp:280, attackDamage:59, expReward:185, goldRewardMin:54, goldRewardMax:86, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.35}], isBoss:false },
  shape_shifter:         { id:'shape_shifter',          name:'Shape Shifter',   emoji:'🔷', level:38, maxHp:310, attackDamage:62, expReward:205, goldRewardMin:60, goldRewardMax:96, dropTable:[], isBoss:false },
  citadel_guardian_mini: { id:'citadel_guardian_mini',  name:'Citadel Guardian',emoji:'⚡', level:39, maxHp:460, attackDamage:66, expReward:275, goldRewardMin:90, goldRewardMax:130, dropTable:[{itemId:'crystal_armor',itemType:'equipment',dropChance:0.22}], isBoss:false },
  general_geometra: {
    id:'general_geometra', name:'General Geometra', emoji:'🏰', level:40, maxHp:750, attackDamage:70,
    expReward:450, goldRewardMin:160, goldRewardMax:220, isBoss:true,
    dropTable:[{itemId:'magic_calculator_hat',itemType:'equipment',dropChance:0.5},{itemId:'robot_dog_egg',itemType:'pet_egg',dropChance:0.2}],
    specialAbility:{ name:'Geometric Surge', description:'Double damage on consecutive wrong answers', triggerCondition:'consecutive_wrong_2', effect:'double_damage', effectValue:2 },
  },
  // Shadow Lair
  shadow_scholar:  { id:'shadow_scholar',  name:'Shadow Scholar', emoji:'🌑', level:40, maxHp:260, attackDamage:65, expReward:175, goldRewardMin:52,  goldRewardMax:84,  dropTable:[], isBoss:false },
  void_viper:      { id:'void_viper',      name:'Void Viper',     emoji:'🐍', level:41, maxHp:295, attackDamage:70, expReward:200, goldRewardMin:60,  goldRewardMax:96,  dropTable:[], isBoss:false },
  dark_algebraist: { id:'dark_algebraist', name:'Dark Algebraist',emoji:'🧮', level:42, maxHp:330, attackDamage:75, expReward:225, goldRewardMin:68,  goldRewardMax:110, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.4}], isBoss:false },
  trig_wraith:     { id:'trig_wraith',     name:'Trig Wraith',    emoji:'👁️', level:43, maxHp:370, attackDamage:80, expReward:255, goldRewardMin:76,  goldRewardMax:124, dropTable:[], isBoss:false },
  shadow_titan_mini:{ id:'shadow_titan_mini',name:'Shadow Titan', emoji:'🌚', level:44, maxHp:560, attackDamage:85, expReward:340, goldRewardMin:115, goldRewardMax:165, dropTable:[{itemId:'crystal_sword',itemType:'equipment',dropChance:0.25}], isBoss:false },
  the_shadow_mathematician: {
    id:'the_shadow_mathematician', name:'The Shadow Mathematician', emoji:'💀', level:45, maxHp:999, attackDamage:90,
    expReward:600, goldRewardMin:220, goldRewardMax:300, isBoss:true,
    dropTable:[{itemId:'crystal_sword',itemType:'equipment',dropChance:0.6},{itemId:'wise_owl_egg',itemType:'pet_egg',dropChance:0.35},{itemId:'crystals',itemType:'crystal',dropChance:0.8}],
    specialAbility:{ name:'Shadow Mastery', description:'Reduces timer and doubles damage at 50% HP', triggerCondition:'hp_50', effect:'reduce_timer', effectValue:8 },
  },
  // 2F-5: Scholar's Tower monsters
  algebra_golem:    { id:'algebra_golem',    name:'Algebra Golem',    emoji:'🔢', level:30, maxHp:300, attackDamage:40, expReward:180, goldRewardMin:60,  goldRewardMax:90,  dropTable:[], isBoss:false },
  equation_wraith:  { id:'equation_wraith',  name:'Equation Wraith',  emoji:'📐', level:33, maxHp:340, attackDamage:44, expReward:205, goldRewardMin:68,  goldRewardMax:100, dropTable:[], isBoss:false },
  formula_phantom:  { id:'formula_phantom',  name:'Formula Phantom',  emoji:'👻', level:35, maxHp:380, attackDamage:48, expReward:230, goldRewardMin:76,  goldRewardMax:112, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.3}], isBoss:false },
  matrix_mage:      { id:'matrix_mage',      name:'Matrix Mage',      emoji:'🧮', level:37, maxHp:420, attackDamage:52, expReward:255, goldRewardMin:85,  goldRewardMax:125, dropTable:[], isBoss:false },
  proof_golem:      { id:'proof_golem',      name:'Proof Golem',      emoji:'📜', level:39, maxHp:460, attackDamage:56, expReward:280, goldRewardMin:92,  goldRewardMax:138, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.35}], isBoss:false },
  calculus_sprite:  { id:'calculus_sprite',  name:'Calculus Sprite',  emoji:'∞',  level:41, maxHp:500, attackDamage:60, expReward:305, goldRewardMin:100, goldRewardMax:150, dropTable:[], isBoss:false },
  trig_titan:       { id:'trig_titan',       name:'Trig Titan',       emoji:'📏', level:43, maxHp:545, attackDamage:65, expReward:335, goldRewardMin:110, goldRewardMax:165, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.4}], isBoss:false },
  theorem_colossus: { id:'theorem_colossus', name:'Theorem Colossus', emoji:'🗿', level:45, maxHp:590, attackDamage:70, expReward:365, goldRewardMin:120, goldRewardMax:180, dropTable:[], isBoss:false },
  calculus_dragon:  { id:'calculus_dragon',  name:'Calculus Dragon',  emoji:'🐉', level:47, maxHp:650, attackDamage:76, expReward:400, goldRewardMin:135, goldRewardMax:200, dropTable:[{itemId:'crystals',itemType:'crystal',dropChance:0.5}], isBoss:false,
    specialAbility:{ name:'Dragon Theorem', description:'Reduces timer at 50% HP', triggerCondition:'hp_50', effect:'reduce_timer', effectValue:5 } },
  grand_professor:  { id:'grand_professor',  name:'Grand Professor',  emoji:'🎓', level:50, maxHp:1200, attackDamage:85, expReward:800, goldRewardMin:250, goldRewardMax:350, isBoss:true,
    dropTable:[{itemId:'crystal_sword',itemType:'equipment',dropChance:0.7},{itemId:'crystals',itemType:'crystal',dropChance:0.9}],
    specialAbility:{ name:'Academic Supremacy', description:'Double damage on consecutive wrong answers', triggerCondition:'consecutive_wrong_2', effect:'double_damage', effectValue:2 } },
}

// ─────────────────────────────────────────────────────────────
// REGIONS
// ─────────────────────────────────────────────────────────────

export const REGIONS: Region[] = [
  {
    id: 'greenleaf_forest', name: 'Greenleaf Forest',
    description: 'A sunny woodland where the adventure begins.',
    emoji: '🌲', requiredLevel: 1, tiers: ['Y3'],
    topicFocus: ['addition','subtraction','multiplication','worded_1step'],
    battles: [
      { id:'gf_1',    regionId:'greenleaf_forest', battleNumber:1, monsterId:'forest_slime',       isBoss:false, isMiniBoss:false, questionTiers:['Y3'], questionTypes:['addition'] },
      { id:'gf_2',    regionId:'greenleaf_forest', battleNumber:2, monsterId:'leaf_sprite',        isBoss:false, isMiniBoss:false, questionTiers:['Y3'], questionTypes:['addition','subtraction'] },
      { id:'gf_3',    regionId:'greenleaf_forest', battleNumber:3, monsterId:'mushroom_guard',     isBoss:false, isMiniBoss:false, questionTiers:['Y3'], questionTypes:['subtraction','multiplication'] },
      { id:'gf_4',    regionId:'greenleaf_forest', battleNumber:4, monsterId:'forest_wolf',        isBoss:false, isMiniBoss:false, questionTiers:['Y3'], questionTypes:['multiplication','worded_1step'] },
      { id:'gf_mb',   regionId:'greenleaf_forest', battleNumber:5, monsterId:'vine_golem_mini',   isBoss:false, isMiniBoss:true,  questionTiers:['Y3'], questionTypes:['addition','subtraction','multiplication'] },
      { id:'gf_boss', regionId:'greenleaf_forest', battleNumber:6, monsterId:'forest_dragon_boss', isBoss:true,  isMiniBoss:false, questionTiers:['Y3'], questionTypes:['addition','subtraction','multiplication','worded_1step'] },
    ],
  },
  {
    id: 'shadowbat_caverns', name: 'Shadowbat Caverns',
    description: 'Dark caves full of bats and crystals.',
    emoji: '🦇', requiredLevel: 5, tiers: ['Y3','Y4'],
    topicFocus: ['multiplication','division','decimals','worded_1step'],
    battles: [
      { id:'sc_1',    regionId:'shadowbat_caverns', battleNumber:1, monsterId:'cave_bat',        isBoss:false, isMiniBoss:false, questionTiers:['Y3','Y4'], questionTypes:['multiplication'] },
      { id:'sc_2',    regionId:'shadowbat_caverns', battleNumber:2, monsterId:'shadow_bat',      isBoss:false, isMiniBoss:false, questionTiers:['Y3','Y4'], questionTypes:['multiplication','division'] },
      { id:'sc_3',    regionId:'shadowbat_caverns', battleNumber:3, monsterId:'crystal_bat',     isBoss:false, isMiniBoss:false, questionTiers:['Y4'],      questionTypes:['division','decimals'] },
      { id:'sc_4',    regionId:'shadowbat_caverns', battleNumber:4, monsterId:'stone_golem',     isBoss:false, isMiniBoss:false, questionTiers:['Y4'],      questionTypes:['division','worded_1step'] },
      { id:'sc_mb',   regionId:'shadowbat_caverns', battleNumber:5, monsterId:'bat_king_mini',   isBoss:false, isMiniBoss:true,  questionTiers:['Y3','Y4'], questionTypes:['multiplication','division','decimals'] },
      { id:'sc_boss', regionId:'shadowbat_caverns', battleNumber:6, monsterId:'baron_batsworth', isBoss:true,  isMiniBoss:false, questionTiers:['Y3','Y4'], questionTypes:['multiplication','division','decimals','worded_1step'] },
    ],
  },
  {
    id: 'number_castle', name: 'Number Castle',
    description: 'An ancient fortress guarded by knights of division.',
    emoji: '🏰', requiredLevel: 10, tiers: ['Y4','Y5'],
    topicFocus: ['division','fractions','decimals','worded_2step','bodmas'],
    battles: [
      { id:'nc_1',    regionId:'number_castle', battleNumber:1, monsterId:'iron_knight',          isBoss:false, isMiniBoss:false, questionTiers:['Y4','Y5'], questionTypes:['division'] },
      { id:'nc_2',    regionId:'number_castle', battleNumber:2, monsterId:'castle_archer',        isBoss:false, isMiniBoss:false, questionTiers:['Y4','Y5'], questionTypes:['division','fractions'] },
      { id:'nc_3',    regionId:'number_castle', battleNumber:3, monsterId:'dark_wizard',          isBoss:false, isMiniBoss:false, questionTiers:['Y5'],      questionTypes:['fractions','decimals'] },
      { id:'nc_4',    regionId:'number_castle', battleNumber:4, monsterId:'armoured_troll',       isBoss:false, isMiniBoss:false, questionTiers:['Y5'],      questionTypes:['bodmas','worded_2step'] },
      { id:'nc_mb',   regionId:'number_castle', battleNumber:5, monsterId:'castle_guardian_mini', isBoss:false, isMiniBoss:true,  questionTiers:['Y4','Y5'], questionTypes:['division','fractions','decimals','bodmas'] },
      { id:'nc_boss', regionId:'number_castle', battleNumber:6, monsterId:'lord_dividus',         isBoss:true,  isMiniBoss:false, questionTiers:['Y4','Y5'], questionTypes:['division','fractions','decimals','worded_2step','bodmas'] },
    ],
  },
  {
    id: 'fraction_volcano', name: 'Fraction Volcano',
    description: 'A fiery mountain where wrong answers cause eruptions.',
    emoji: '🌋', requiredLevel: 15, tiers: ['Y5'],
    topicFocus: ['fractions','percentages','decimals','negative_numbers'],
    battles: [
      { id:'fv_1',    regionId:'fraction_volcano', battleNumber:1, monsterId:'lava_sprite',        isBoss:false, isMiniBoss:false, questionTiers:['Y5'], questionTypes:['fractions'] },
      { id:'fv_2',    regionId:'fraction_volcano', battleNumber:2, monsterId:'fraction_phantom',   isBoss:false, isMiniBoss:false, questionTiers:['Y5'], questionTypes:['fractions','decimals'] },
      { id:'fv_3',    regionId:'fraction_volcano', battleNumber:3, monsterId:'decimal_drake',      isBoss:false, isMiniBoss:false, questionTiers:['Y5'], questionTypes:['decimals','percentages'] },
      { id:'fv_4',    regionId:'fraction_volcano', battleNumber:4, monsterId:'magma_toad',         isBoss:false, isMiniBoss:false, questionTiers:['Y5'], questionTypes:['percentages','negative_numbers'] },
      { id:'fv_mb',   regionId:'fraction_volcano', battleNumber:5, monsterId:'volcano_golem_mini', isBoss:false, isMiniBoss:true,  questionTiers:['Y5'], questionTypes:['fractions','decimals','percentages'] },
      { id:'fv_boss', regionId:'fraction_volcano', battleNumber:6, monsterId:'inferna_queen',      isBoss:true,  isMiniBoss:false, questionTiers:['Y5'], questionTypes:['fractions','decimals','percentages','negative_numbers'] },
    ],
  },
  {
    id: 'percentage_peaks', name: 'Percentage Peaks',
    description: 'Snow-capped mountains where avalanches threaten slow thinkers.',
    emoji: '❄️', requiredLevel: 22, tiers: ['Y5','Y6'],
    topicFocus: ['percentages','ratio','worded_2step'],
    battles: [
      { id:'pp_1',    regionId:'percentage_peaks', battleNumber:1, monsterId:'snow_sprite',      isBoss:false, isMiniBoss:false, questionTiers:['Y5','Y6'], questionTypes:['percentages'] },
      { id:'pp_2',    regionId:'percentage_peaks', battleNumber:2, monsterId:'ice_archer',       isBoss:false, isMiniBoss:false, questionTiers:['Y5','Y6'], questionTypes:['percentages','ratio'] },
      { id:'pp_3',    regionId:'percentage_peaks', battleNumber:3, monsterId:'ratio_raven',      isBoss:false, isMiniBoss:false, questionTiers:['Y6'],      questionTypes:['ratio','worded_2step'] },
      { id:'pp_4',    regionId:'percentage_peaks', battleNumber:4, monsterId:'blizzard_beast',   isBoss:false, isMiniBoss:false, questionTiers:['Y6'],      questionTypes:['worded_2step','percentages'] },
      { id:'pp_mb',   regionId:'percentage_peaks', battleNumber:5, monsterId:'frost_titan_mini', isBoss:false, isMiniBoss:true,  questionTiers:['Y5','Y6'], questionTypes:['percentages','ratio','worded_2step'] },
      { id:'pp_boss', regionId:'percentage_peaks', battleNumber:6, monsterId:'baron_percent',    isBoss:true,  isMiniBoss:false, questionTiers:['Y5','Y6'], questionTypes:['percentages','ratio','worded_2step','decimals'] },
    ],
  },
  {
    id: 'algebra_ocean', name: 'Algebra Ocean',
    description: 'Mysterious depths where variables hide.',
    emoji: '🌊', requiredLevel: 28, tiers: ['Y6'],
    topicFocus: ['algebra','sequences','ratio','worded_3step'],
    battles: [
      { id:'ao_1',    regionId:'algebra_ocean', battleNumber:1, monsterId:'sea_variable',      isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['algebra'] },
      { id:'ao_2',    regionId:'algebra_ocean', battleNumber:2, monsterId:'algebra_eel',       isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['algebra','sequences'] },
      { id:'ao_3',    regionId:'algebra_ocean', battleNumber:3, monsterId:'sequence_shark',    isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['sequences','negative_numbers'] },
      { id:'ao_4',    regionId:'algebra_ocean', battleNumber:4, monsterId:'negative_nautilus', isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['negative_numbers','worded_3step'] },
      { id:'ao_mb',   regionId:'algebra_ocean', battleNumber:5, monsterId:'kraken_mini',       isBoss:false, isMiniBoss:true,  questionTiers:['Y6'], questionTypes:['algebra','sequences','negative_numbers'] },
      { id:'ao_boss', regionId:'algebra_ocean', battleNumber:6, monsterId:'lord_algebrax',     isBoss:true,  isMiniBoss:false, questionTiers:['Y6'], questionTypes:['algebra','sequences','negative_numbers','worded_3step'] },
    ],
  },
  {
    id: 'geometry_fortress', name: 'Geometry Fortress',
    description: 'A lightning-struck citadel where every wall, angle and coordinate matters.',
    emoji: '⚡', requiredLevel: 35, tiers: ['Y6'],
    topicFocus: ['geometry_area','geometry_angles','coordinates','statistics'],
    battles: [
      { id:'gf2_1',    regionId:'geometry_fortress', battleNumber:1, monsterId:'angle_archer',          isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['geometry_angles'] },
      { id:'gf2_2',    regionId:'geometry_fortress', battleNumber:2, monsterId:'area_assassin',         isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['geometry_area','geometry_angles'] },
      { id:'gf2_3',    regionId:'geometry_fortress', battleNumber:3, monsterId:'coordinate_cobra',      isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['coordinates','geometry_area'] },
      { id:'gf2_4',    regionId:'geometry_fortress', battleNumber:4, monsterId:'shape_shifter',         isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['statistics','coordinates'] },
      { id:'gf2_mb',   regionId:'geometry_fortress', battleNumber:5, monsterId:'citadel_guardian_mini', isBoss:false, isMiniBoss:true,  questionTiers:['Y6'], questionTypes:['geometry_area','geometry_angles','coordinates'] },
      { id:'gf2_boss', regionId:'geometry_fortress', battleNumber:6, monsterId:'general_geometra',      isBoss:true,  isMiniBoss:false, questionTiers:['Y6'], questionTypes:['geometry_area','geometry_angles','coordinates','statistics'] },
    ],
  },
  {
    id: 'shadow_lair', name: "Shadow Mathematician's Lair",
    description: 'The final confrontation. All your knowledge will be tested.',
    emoji: '🌑', requiredLevel: 40, tiers: ['Y6'],
    topicFocus: ['addition','subtraction','multiplication','division','fractions','percentages','ratio','algebra','geometry_area','statistics'],
    battles: [
      { id:'sl_1',    regionId:'shadow_lair', battleNumber:1, monsterId:'shadow_scholar',           isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['algebra','worded_3step'] },
      { id:'sl_2',    regionId:'shadow_lair', battleNumber:2, monsterId:'void_viper',               isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['sequences','negative_numbers','worded_3step'] },
      { id:'sl_3',    regionId:'shadow_lair', battleNumber:3, monsterId:'dark_algebraist',          isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['algebra','fractions','percentages'] },
      { id:'sl_4',    regionId:'shadow_lair', battleNumber:4, monsterId:'trig_wraith',              isBoss:false, isMiniBoss:false, questionTiers:['Y6'], questionTypes:['geometry_area','geometry_angles','statistics'] },
      { id:'sl_mb',   regionId:'shadow_lair', battleNumber:5, monsterId:'shadow_titan_mini',        isBoss:false, isMiniBoss:true,  questionTiers:['Y6'], questionTypes:['algebra','fractions','percentages','ratio','worded_3step'] },
      { id:'sl_boss', regionId:'shadow_lair', battleNumber:6, monsterId:'the_shadow_mathematician', isBoss:true,  isMiniBoss:false, questionTiers:['Y6'], questionTypes:['algebra','fractions','percentages','ratio','geometry_area','statistics','worded_3step'] },
    ],
  },
  // 2F-5: Scholar's Tower (Y7-Y11, unlocked at Level 30)
  {
    id: 'scholars_tower', name: "Scholar's Tower",
    description: 'A ten-floor tower of advanced mathematics for elite scholars.',
    emoji: '🏛️', requiredLevel: 30, tiers: ['Y7','Y8','Y9','Y10','Y11'],
    topicFocus: ['quadratics','trigonometry','simultaneous','algebra','statistics'],
    battles: [
      { id:'st_1',  regionId:'scholars_tower', battleNumber:1,  monsterId:'algebra_golem',    isBoss:false, isMiniBoss:false, questionTiers:['Y7'], questionTypes:['algebra','sequences'] },
      { id:'st_2',  regionId:'scholars_tower', battleNumber:2,  monsterId:'equation_wraith',  isBoss:false, isMiniBoss:false, questionTiers:['Y7'], questionTypes:['algebra','quadratics'] },
      { id:'st_3',  regionId:'scholars_tower', battleNumber:3,  monsterId:'formula_phantom',  isBoss:false, isMiniBoss:false, questionTiers:['Y8'], questionTypes:['quadratics','algebra'] },
      { id:'st_4',  regionId:'scholars_tower', battleNumber:4,  monsterId:'matrix_mage',      isBoss:false, isMiniBoss:false, questionTiers:['Y8'], questionTypes:['quadratics','simultaneous'] },
      { id:'st_5',  regionId:'scholars_tower', battleNumber:5,  monsterId:'proof_golem',      isBoss:false, isMiniBoss:false, questionTiers:['Y9'], questionTypes:['simultaneous','quadratics'] },
      { id:'st_6',  regionId:'scholars_tower', battleNumber:6,  monsterId:'calculus_sprite',  isBoss:false, isMiniBoss:false, questionTiers:['Y9'], questionTypes:['trigonometry','simultaneous'] },
      { id:'st_7',  regionId:'scholars_tower', battleNumber:7,  monsterId:'trig_titan',       isBoss:false, isMiniBoss:false, questionTiers:['Y10'], questionTypes:['trigonometry','quadratics'] },
      { id:'st_8',  regionId:'scholars_tower', battleNumber:8,  monsterId:'theorem_colossus', isBoss:false, isMiniBoss:false, questionTiers:['Y10'], questionTypes:['trigonometry','simultaneous','quadratics'] },
      { id:'st_9',  regionId:'scholars_tower', battleNumber:9,  monsterId:'calculus_dragon',  isBoss:false, isMiniBoss:false, questionTiers:['Y11'], questionTypes:['trigonometry','quadratics','simultaneous'] },
      { id:'st_boss', regionId:'scholars_tower', battleNumber:10, monsterId:'grand_professor', isBoss:true, isMiniBoss:false, questionTiers:['Y11'], questionTypes:['quadratics','trigonometry','simultaneous','algebra','statistics'] },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// EQUIPMENT (2E-2: tier field added, expanded inventory)
// ─────────────────────────────────────────────────────────────

export const EQUIPMENT_DATA: Equipment[] = [
  // ── Weapons ──────────────────────────────────────────────────
  { id:'wooden_sword',   name:'Wooden Sword',  emoji:'🗡️', slot:'weapon',    rarity:'common',    tier:'common', description:'A trusty training sword.',       loreText:'Every hero starts here.',           stats:{attack:2},  upgradeLevel:0, shopPrice:null, obtainMethod:'level_reward', requiredLevel:2 },
  { id:'short_bow',      name:'Short Bow',     emoji:'🏹', slot:'weapon',    rarity:'common',    tier:'common', description:'Quick shots from a distance.',  loreText:'Light and reliable.',               stats:{attack:3},  upgradeLevel:0, shopPrice:50,  obtainMethod:'shop',         requiredLevel:3 },
  { id:'iron_sword',     name:'Iron Sword',    emoji:'⚔️', slot:'weapon',    rarity:'uncommon',  tier:'rare',   description:'Forged in the castle armoury.', loreText:'Sharp enough to solve most problems.',stats:{attack:5}, upgradeLevel:0, shopPrice:80,  obtainMethod:'shop',         requiredLevel:5 },
  { id:'shadow_axe',     name:'Shadow Axe',    emoji:'🪓', slot:'weapon',    rarity:'rare',      tier:'rare',   description:'Carved from shadow-wood.',       loreText:'Swings with dark intent.',           stats:{attack:8},  upgradeLevel:0, shopPrice:140, obtainMethod:'shop',         requiredLevel:8 },
  { id:'crystal_sword',  name:'Crystal Sword', emoji:'💎', slot:'weapon',    rarity:'rare',      tier:'rare',   description:'Infused with Number Crystal energy.',loreText:'Hums with mathematical power.',   stats:{attack:10,comboMultiplierBonus:0.05}, upgradeLevel:0, shopPrice:null, obtainMethod:'boss_drop', requiredLevel:10 },
  { id:'thunder_sword',  name:'Thunder Sword', emoji:'⚡', slot:'weapon',    rarity:'rare',      tier:'rare',   description:'Crackles with electric energy.', loreText:'Strikes like a wrong answer.',       stats:{attack:12}, upgradeLevel:0, shopPrice:200, obtainMethod:'shop',         requiredLevel:15 },
  { id:'crystal_blade',  name:'Crystal Blade', emoji:'🔮', slot:'weapon',    rarity:'epic',      tier:'epic',   description:'A blade forged from pure Number Crystals.',loreText:'Only the worthy may wield its power.',stats:{attack:15,comboMultiplierBonus:0.1}, upgradeLevel:0, shopPrice:null, crystalPrice:5, obtainMethod:'crystal_shop', requiredLevel:15 },
  { id:'dragon_fang',    name:'Dragon Fang',   emoji:'🦷', slot:'weapon',    rarity:'epic',      tier:'epic',   description:'A fang torn from a Dragon Lord.',loreText:'Carries ancient draconic power.',    stats:{attack:18,comboMultiplierBonus:0.15}, upgradeLevel:0, shopPrice:null, crystalPrice:8, obtainMethod:'crystal_shop', requiredLevel:25 },
  // ── Armour ───────────────────────────────────────────────────
  { id:'cloth_tunic',    name:'Cloth Tunic',   emoji:'👕', slot:'armour',    rarity:'common',    tier:'common', description:'Basic protection.',              loreText:'Better than nothing.',               stats:{hp:10},     upgradeLevel:0, shopPrice:40,  obtainMethod:'shop',         requiredLevel:1 },
  { id:'cloth_robe',     name:'Cloth Robe',    emoji:'🥻', slot:'armour',    rarity:'common',    tier:'common', description:'A simple woven robe.',           loreText:'Comfortable for long study sessions.',stats:{hp:12,defence:1}, upgradeLevel:0, shopPrice:55, obtainMethod:'shop', requiredLevel:2 },
  { id:'chain_mail',     name:'Chain Mail',    emoji:'🔗', slot:'armour',    rarity:'uncommon',  tier:'rare',   description:'Interlocked rings of protection.',loreText:'Each ring a solved equation.',       stats:{hp:20,defence:3}, upgradeLevel:0, shopPrice:120, obtainMethod:'shop', requiredLevel:8 },
  { id:'shadow_cloak',   name:'Shadow Cloak',  emoji:'🌑', slot:'armour',    rarity:'rare',      tier:'rare',   description:'Woven from shadow-silk.',         loreText:'Makes you harder to hit.',           stats:{hp:22,defence:4}, upgradeLevel:0, shopPrice:180, obtainMethod:'shop', requiredLevel:12 },
  { id:'crystal_armor',  name:'Crystal Armour',emoji:'🛡️', slot:'armour',    rarity:'rare',      tier:'rare',   description:'Forged from Number Crystals.',    loreText:"The kingdom's finest protection.",   stats:{hp:25,defence:5}, upgradeLevel:0, shopPrice:null, obtainMethod:'level_reward', requiredLevel:20 },
  { id:'mana_shield',    name:'Mana Shield',   emoji:'🌟', slot:'armour',    rarity:'epic',      tier:'epic',   description:'Absorbs magical attacks.',        loreText:'Woven from starlight and theorems.',  stats:{hp:40,defence:10}, upgradeLevel:0, shopPrice:null, crystalPrice:3, obtainMethod:'crystal_shop', requiredLevel:12 },
  { id:'dragon_scale',   name:'Dragon Scale',  emoji:'🐉', slot:'armour',    rarity:'epic',      tier:'epic',   description:'Scales shed by a Dragon Lord.',  loreText:'Virtually impenetrable.',             stats:{hp:50,defence:15}, upgradeLevel:0, shopPrice:null, crystalPrice:9, obtainMethod:'crystal_shop', requiredLevel:30 },
  // ── Accessories ──────────────────────────────────────────────
  { id:'lucky_charm',    name:'Lucky Charm',   emoji:'🍀', slot:'accessory', rarity:'common',    tier:'common', description:'A four-leaf clover.',            loreText:'Fortune favours the prepared.',       stats:{luckBonus:8}, upgradeLevel:0, shopPrice:30, obtainMethod:'shop', requiredLevel:1 },
  { id:'copper_ring',    name:'Copper Ring',   emoji:'💫', slot:'accessory', rarity:'common',    tier:'common', description:'A simple copper band.',          loreText:'Warm to the touch.',                  stats:{expBonus:5}, upgradeLevel:0, shopPrice:45, obtainMethod:'shop', requiredLevel:2 },
  { id:'lucky_boots',    name:'Lucky Boots',   emoji:'👢', slot:'accessory', rarity:'uncommon',  tier:'rare',   description:'Slightly enchanted footwear.',   loreText:'Coins seem to fall towards you.',     stats:{luckBonus:10}, upgradeLevel:0, shopPrice:null, obtainMethod:'level_reward', requiredLevel:7 },
  { id:'gold_ring',      name:'Gold Ring',     emoji:'💍', slot:'accessory', rarity:'rare',      tier:'rare',   description:'Increases the wisdom of your victories.',loreText:'Ancient scholars wore these.', stats:{expBonus:15}, upgradeLevel:0, shopPrice:150, obtainMethod:'shop', requiredLevel:8 },
  { id:'star_pendant',   name:'Star Pendant',  emoji:'⭐', slot:'accessory', rarity:'rare',      tier:'rare',   description:'Captures starlight for power.',  loreText:'Glows after a perfect battle.',        stats:{luckBonus:15,expBonus:8}, upgradeLevel:0, shopPrice:220, obtainMethod:'shop', requiredLevel:15 },
  { id:'wisdom_amulet',  name:'Wisdom Amulet', emoji:'📿', slot:'accessory', rarity:'epic',      tier:'epic',   description:'Doubles EXP on perfect answers.', loreText:'Scholars have sought this for centuries.',stats:{expBonus:25}, upgradeLevel:0, shopPrice:null, crystalPrice:4, obtainMethod:'crystal_shop', requiredLevel:10 },
  { id:'dragon_eye',     name:'Dragon Eye',    emoji:'👁️', slot:'accessory', rarity:'epic',      tier:'epic',   description:'Grants foresight in battle.',    loreText:'See the answer before you answer.',   stats:{luckBonus:20,expBonus:15}, upgradeLevel:0, shopPrice:null, crystalPrice:7, obtainMethod:'crystal_shop', requiredLevel:20 },
  // ── Hats ─────────────────────────────────────────────────────
  { id:'apprentice_hat', name:'Apprentice Hat',emoji:'🎓', slot:'hat',       rarity:'common',    tier:'common', description:'A student\'s pointed cap.',       loreText:'You\'re just getting started.',        stats:{speedBonus:2}, upgradeLevel:0, shopPrice:35, obtainMethod:'shop', requiredLevel:1 },
  { id:'jester_cap',     name:'Jester Cap',    emoji:'🃏', slot:'hat',       rarity:'common',    tier:'common', description:'A colourful jester\'s hat.',      loreText:'Fortune smiles on the fool.',         stats:{luckBonus:5,speedBonus:1}, upgradeLevel:0, shopPrice:50, obtainMethod:'shop', requiredLevel:3 },
  { id:'wizard_hat',     name:'Wizard Hat',    emoji:'🧙', slot:'hat',       rarity:'uncommon',  tier:'rare',   description:'+3 seconds per question.',        loreText:'The classic hat of number magic.',    stats:{speedBonus:3}, upgradeLevel:0, shopPrice:100, obtainMethod:'shop', requiredLevel:6 },
  { id:'battle_helm',    name:'Battle Helm',   emoji:'⛑️', slot:'hat',       rarity:'rare',      tier:'rare',   description:'Absorbs blows to your focus.',    loreText:'Worn by champions.',                  stats:{defence:4,speedBonus:2}, upgradeLevel:0, shopPrice:170, obtainMethod:'shop', requiredLevel:12 },
  { id:'magic_calculator_hat', name:'Calculator Hat', emoji:'🎩', slot:'hat', rarity:'uncommon', tier:'rare',  description:'+5 seconds on every question.',   loreText:'Think longer, answer better.',         stats:{speedBonus:5}, upgradeLevel:0, shopPrice:null, obtainMethod:'level_reward', requiredLevel:30 },
  { id:'crown_of_wisdom',name:'Crown of Wisdom',emoji:'👑', slot:'hat',      rarity:'epic',      tier:'epic',   description:'The crown of the Kingdom\'s top scholar.',loreText:'Earned, never given.',         stats:{speedBonus:6,expBonus:20}, upgradeLevel:0, shopPrice:null, crystalPrice:6, obtainMethod:'crystal_shop', requiredLevel:18 },
  { id:'dragon_crest',   name:'Dragon Crest',  emoji:'🐲', slot:'hat',       rarity:'epic',      tier:'epic',   description:'A helm bearing the Dragon Lord\'s crest.',loreText:'Commands respect.',             stats:{speedBonus:7,defence:6,expBonus:10}, upgradeLevel:0, shopPrice:null, crystalPrice:10, obtainMethod:'crystal_shop', requiredLevel:35 },
]

// ─────────────────────────────────────────────────────────────
// PETS (2E-3: 6 new pets added)
// ─────────────────────────────────────────────────────────────

export const PETS_DATA: Pet[] = [
  {
    id:'math_cat', name:'Math Cat', emoji:'🐱',
    description:'A clever cat who whispers hints when you go wrong.',
    maxLevel:10,
    passiveAbility:{ name:'Helpful Hint', description:'Shows a hint on wrong answer', effectType:'hint_on_wrong', baseValue:1, maxLevelValue:2 },
    shopPrice:null, obtainMethod:'level_reward',
  },
  {
    id:'baby_dragon', name:'Baby Dragon', emoji:'🐉',
    description:'A tiny dragon who celebrates your victories with extra EXP.',
    maxLevel:10,
    passiveAbility:{ name:"Dragon's Blessing", description:'+10% EXP from all battles', effectType:'exp_boost', baseValue:10, maxLevelValue:25 },
    shopPrice:null, obtainMethod:'level_reward',
  },
  {
    id:'robot_dog', name:'Robot Dog', emoji:'🤖',
    description:'A mechanical pup that absorbs one mistake per battle.',
    maxLevel:10,
    passiveAbility:{ name:'Error Shield', description:'Absorbs 1 wrong answer per battle', effectType:'absorb_wrong', baseValue:1, maxLevelValue:2 },
    shopPrice:null, obtainMethod:'level_reward',
  },
  {
    id:'wise_owl', name:'Wise Owl', emoji:'🦉',
    description:'An ancient owl who removes two wrong answers per battle.',
    maxLevel:10,
    passiveAbility:{ name:'Fifty-Fifty', description:'Remove 2 wrong options once per battle', effectType:'fifty_fifty', baseValue:1, maxLevelValue:2 },
    shopPrice:null, obtainMethod:'boss_drop',
  },
  {
    id:'lucky_fox', name:'Lucky Fox', emoji:'🦊',
    description:'A fox whose magic tail brings extra gold.',
    maxLevel:10,
    passiveAbility:{ name:'Gold Rush', description:'+15% gold from all battles', effectType:'gold_boost', baseValue:15, maxLevelValue:30 },
    shopPrice:200, obtainMethod:'daily_reward',
  },
  // ── 2E-3: 6 new pets ─────────────────────────────────────────
  {
    id:'time_tortoise', name:'Time Tortoise', emoji:'🐢',
    description:'+5 seconds on every question timer.',
    maxLevel:5,
    passiveAbility:{ name:'Slow and Steady', description:'+5s per question', effectType:'timer_bonus', baseValue:5, maxLevelValue:8 },
    shopPrice:250, obtainMethod:'level_reward',
  },
  {
    id:'golden_dragon', name:'Golden Dragon', emoji:'🐉',
    description:'Double gold on a Perfect battle (all correct).',
    maxLevel:5,
    passiveAbility:{ name:'Gold Hoard', description:'Double gold on perfect battle', effectType:'perfect_gold_double', baseValue:2, maxLevelValue:2 },
    shopPrice:300, obtainMethod:'boss_drop',
  },
  {
    id:'star_phoenix', name:'Star Phoenix', emoji:'🦅',
    description:'Revive once per battle with 30% HP.',
    maxLevel:5,
    passiveAbility:{ name:'Rebirth', description:'Revive once per battle with 30% HP', effectType:'revive', baseValue:30, maxLevelValue:50 },
    shopPrice:null, obtainMethod:'boss_drop',
  },
  {
    id:'ice_fox', name:'Ice Fox', emoji:'🦊',
    description:'First question of each battle is always correct.',
    maxLevel:5,
    passiveAbility:{ name:'First Strike', description:'First answer is always correct', effectType:'first_answer_correct', baseValue:1, maxLevelValue:1 },
    shopPrice:350, obtainMethod:'daily_reward',
  },
  {
    id:'thunder_cat', name:'Thunder Cat', emoji:'⚡',
    description:'+20% attack damage.',
    maxLevel:5,
    passiveAbility:{ name:'Thunderstrike', description:'+20% attack damage', effectType:'attack_bonus_pct', baseValue:20, maxLevelValue:30 },
    shopPrice:280, obtainMethod:'level_reward',
  },
  {
    id:'healing_bunny', name:'Healing Bunny', emoji:'🐰',
    description:'Restore 10 HP on each correct answer.',
    maxLevel:5,
    passiveAbility:{ name:'Healing Touch', description:'+10 HP per correct answer', effectType:'heal_on_correct', baseValue:10, maxLevelValue:20 },
    shopPrice:260, obtainMethod:'level_reward',
  },
]

// ─────────────────────────────────────────────────────────────
// LEVEL-UP REWARD POOLS (2E-2: random equipment drops)
// ─────────────────────────────────────────────────────────────

export type LevelRewardEntry =
  | { type: 'equipment'; id: string; label: string }
  | { type: 'equipment_pool'; pool: string[]; label: string }
  | { type: 'pet'; id: string; label: string }
  | { type: 'region_unlock'; id: string; label: string }
  | { type: 'topic_unlock'; id: string; label: string }

export const LEVEL_REWARDS: Record<number, LevelRewardEntry[]> = {
  2:  [{ type:'equipment', id:'wooden_sword', label:'Wooden Sword' }],
  3:  [{ type:'pet', id:'math_cat', label:'Math Cat Pet' }],
  5:  [{ type:'region_unlock', id:'shadowbat_caverns', label:'Shadowbat Caverns' },
       { type:'equipment_pool', pool:['iron_sword','cloth_tunic','lucky_charm','apprentice_hat'], label:'Random Common Equipment!' }],
  7:  [{ type:'equipment', id:'lucky_boots', label:'Lucky Boots' }],
  9:  [{ type:'pet', id:'healing_bunny', label:'Healing Bunny Pet' }],
  10: [{ type:'region_unlock', id:'number_castle', label:'Number Castle' },
       { type:'equipment_pool', pool:['shadow_axe','chain_mail','gold_ring','wizard_hat'], label:'Random Rare Equipment!' }],
  12: [{ type:'pet', id:'thunder_cat', label:'Thunder Cat Pet' }],
  15: [{ type:'region_unlock', id:'fraction_volcano', label:'Fraction Volcano' },
       { type:'equipment_pool', pool:['thunder_sword','shadow_cloak','star_pendant','battle_helm'], label:'Random Rare Equipment!' }],
  18: [{ type:'pet', id:'time_tortoise', label:'Time Tortoise Pet' }],
  20: [{ type:'equipment', id:'crystal_armor', label:'Crystal Armour' },
       { type:'equipment_pool', pool:['crystal_blade','mana_shield','wisdom_amulet','crown_of_wisdom'], label:'Random Epic Equipment!' }],
  22: [{ type:'region_unlock', id:'percentage_peaks', label:'Percentage Peaks' }],
  25: [{ type:'pet', id:'baby_dragon', label:'Baby Dragon Pet' }],
  28: [{ type:'region_unlock', id:'algebra_ocean', label:'Algebra Ocean' },
       { type:'equipment_pool', pool:['dragon_fang','dragon_scale','dragon_eye','dragon_crest'], label:'Dragon Equipment!' }],
  30: [{ type:'equipment', id:'magic_calculator_hat', label:'Calculator Hat' },
       { type:'region_unlock', id:'scholars_tower', label:"Scholar's Tower 🏛️" }],
  35: [{ type:'region_unlock', id:'geometry_fortress', label:'Geometry Fortress' }],
  40: [{ type:'pet', id:'robot_dog', label:'Robot Dog Pet' },
       { type:'region_unlock', id:'shadow_lair', label:"Shadow Mathematician's Lair" }],
}

// ─────────────────────────────────────────────────────────────
// SKINS DATA (2E-4: glowColor + bgColor added)
// ─────────────────────────────────────────────────────────────

export const SKINS_DATA: Skin[] = [
  { id:'wizard',  emoji:'🧙', name:'Wizard',      glowColor:'#FF6B35', bgColor:'#5a2d82', unlockMethod:'default' },
  { id:'knight',  emoji:'🧝', name:'Elf Knight',  glowColor:'#6BCB77', bgColor:'#1a4a2a', unlockMethod:'level',        requiredLevel:10 },
  { id:'warrior', emoji:'🦸', name:'Hero',         glowColor:'#4ECDC4', bgColor:'#1a3a4a', unlockMethod:'level',        requiredLevel:20 },
  { id:'ninja',   emoji:'🥷', name:'Ninja',         glowColor:'#aaaaaa', bgColor:'#1a1a1a', unlockMethod:'crystal_shop', crystalPrice:3 },
  { id:'robot',   emoji:'🤖', name:'Robot',         glowColor:'#4ECDC4', bgColor:'#0a2a3a', unlockMethod:'crystal_shop', crystalPrice:5 },
  { id:'dragon',  emoji:'🐲', name:'Dragon Lord',  glowColor:'#FF4D6D', bgColor:'#3a0a0a', unlockMethod:'crystal_shop', crystalPrice:10 },
  { id:'alien',   emoji:'👾', name:'Alien',         glowColor:'#FFE66D', bgColor:'#0a3a0a', unlockMethod:'daily_reward' },
]

// ─────────────────────────────────────────────────────────────
// ACHIEVEMENTS (2E-11)
// ─────────────────────────────────────────────────────────────

export const ACHIEVEMENTS_DATA = [
  // Existing achievements (must keep IDs matching store)
  { id:'first_win',       emoji:'⚔️', name:'First Victory',       description:'Win your first battle',                      category:'combat'    as const, reward:{ gold:25 } },
  { id:'perfect',         emoji:'⭐', name:'Perfect Battle',       description:'Answer every question correctly in a battle', category:'combat'    as const, reward:{ gold:50 } },
  { id:'combo5',          emoji:'🔥', name:'Combo x5',             description:'Reach a combo of 5',                         category:'combat'    as const, reward:{ gold:30 } },
  { id:'combo10',         emoji:'⚡', name:'Combo x10',            description:'Reach a combo of 10',                        category:'combat'    as const, reward:{ gold:75 } },
  { id:'100q',            emoji:'📚', name:'Century',              description:'Answer 100 questions correctly',              category:'academic'  as const, reward:{ gold:100 } },
  { id:'level5',          emoji:'🌟', name:'Rising Star',          description:'Reach Level 5',                              category:'special'   as const, reward:{ gold:50 } },
  { id:'level10',         emoji:'💫', name:'Seasoned Hero',        description:'Reach Level 10',                             category:'special'   as const, reward:{ gold:100 } },
  { id:'level20',         emoji:'🏆', name:'Champion',             description:'Reach Level 20',                             category:'special'   as const, reward:{ gold:200 } },
  { id:'pet1',            emoji:'🐾', name:'Pet Companion',        description:'Activate your first pet',                   category:'collection' as const, reward:{ gold:30 } },
  { id:'equip1',          emoji:'🛡️', name:'Geared Up',            description:'Equip your first item',                     category:'collection' as const, reward:{ gold:20 } },
  { id:'shop1',           emoji:'🛒', name:'First Purchase',       description:'Buy something from the shop',               category:'collection' as const, reward:{ gold:10 } },
  { id:'streak7',         emoji:'📅', name:'Week Warrior',         description:'Log in 7 days in a row',                    category:'streak'    as const, reward:{ crystals:1 } },
  // 2E-11: New achievements
  { id:'first_crystal_item', emoji:'💎', name:'Crystal Hunter',    description:'Buy your first crystal shop item',           category:'collection' as const, reward:{ gold:50 } },
  { id:'skin_collector',  emoji:'🎭', name:'Skin Collector',       description:'Own 3 different skins',                      category:'collection' as const, reward:{ gold:100 } },
  { id:'quadratics_streak',emoji:'📐',name:'Quadratic Master',    description:'Answer 5 quadratics correctly in a row',     category:'academic'  as const, reward:{ gold:75, crystals:1 } },
  { id:'trig_first_gold', emoji:'📏', name:'Trig Ace',             description:'Get a gold answer on trigonometry',          category:'academic'  as const, reward:{ gold:50 } },
  { id:'robot_dog_save',  emoji:'🤖', name:'Shielded!',            description:'Let Robot Dog absorb a wrong answer',        category:'combat'    as const, reward:{ gold:30 } },
  { id:'full_pet_slots',  emoji:'🐾', name:'Pet Master',           description:'Fill all 3 pet slots',                       category:'collection' as const, reward:{ crystals:2 } },
]
