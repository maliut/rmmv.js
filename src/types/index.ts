import {Game_System} from '../objects/Game_System'
import {Game_Screen} from '../objects/Game_Screen'
import {Game_Timer} from '../objects/Game_Timer'
import {Game_Switches} from '../objects/Game_Switches'
import {Game_Variables} from '../objects/Game_Variables'
import {Game_SelfSwitches} from '../objects/Game_SelfSwitches'
import {Game_Actors} from '../objects/Game_Actors'
import {Game_Party} from '../objects/Game_Party'
import {Game_Map} from '../objects/Game_Map'
import {Game_Player} from '../objects/Game_Player'

export type WeatherType = 'none' | 'rain' | 'storm' | 'snow'

export type VehicleType = 'boat' | 'ship' | 'airship' | 'walk'


// todo
export interface Audio {
  name: string,
  volume: number,
  pitch: number,
  pan: number,
  pos: number
}

export interface TextState {
  index: number
  x: number
  y: number
  left: number
  text: string
  height: number
}

export interface GlobalInfo {
  globalId: string
  title: string
  characters: [string, number][]
  faces: [string, number][]
  playtime: string
  timestamp: number
}

export interface SaveContent {
  system: Game_System
  screen: Game_Screen
  timer: Game_Timer
  switches: Game_Switches
  variables: Game_Variables
  selfSwitches: Game_SelfSwitches
  actors: Game_Actors
  party: Game_Party
  map: Game_Map
  player: Game_Player
}
