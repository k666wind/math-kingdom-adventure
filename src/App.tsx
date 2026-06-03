import React from 'react'
import { useGameStore } from './store/gameStore'
import { SplashScreen, WelcomeScreen, NameEntryScreen } from './components/onboarding'
import { MainMenu } from './components/menu'
import { WorldMap } from './components/map'
import { BattleScreen } from './components/battle'
import { LevelUpScreen } from './components/levelup'
import { CollectionEquipment, CollectionPets } from './components/collection'
import { ShopScreen } from './components/shop'
import { DailyChallengesScreen } from './components/challenges'
import { AchievementsScreen } from './components/achievements'
import { ParentPinScreen, ParentDashboard } from './components/parent'

export default function App() {
  const screen = useGameStore(s => s.nav.screen)

  const screens: Record<string, React.ReactNode> = {
    splash:               <SplashScreen />,
    onboarding_welcome:   <WelcomeScreen />,
    onboarding_name:      <NameEntryScreen />,
    main_menu:            <MainMenu />,
    world_map:            <WorldMap />,
    region_detail:        <WorldMap />,   // handled inside WorldMap
    battle:               <BattleScreen />,
    level_up:             <LevelUpScreen />,
    collection_equipment: <CollectionEquipment />,
    collection_pets:      <CollectionPets />,
    shop:                 <ShopScreen />,
    daily_challenges:     <DailyChallengesScreen />,
    achievements:         <AchievementsScreen />,
    parent_pin:           <ParentPinScreen />,
    parent_dashboard:     <ParentDashboard />,
  }

  return (
    <div className="w-full h-full overflow-hidden">
      {screens[screen] ?? <SplashScreen />}
    </div>
  )
}
