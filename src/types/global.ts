import type {Game_Temp} from '../objects/Game_Temp'
import type {Game_System} from '../objects/Game_System'
import type {Game_Screen} from '../objects/Game_Screen'
import type {Game_Timer} from '../objects/Game_Timer'
import type {Game_Message} from '../objects/Game_Message'
import type {Game_Switches} from '../objects/Game_Switches'
import type {Game_Variables} from '../objects/Game_Variables'
import type {Game_SelfSwitches} from '../objects/Game_SelfSwitches'
import type {Game_Actors} from '../objects/Game_Actors'
import type {Game_Party} from '../objects/Game_Party'
import type {Game_Troop} from '../objects/Game_Troop'
import type {Game_Map} from '../objects/Game_Map'
import type {Game_Player} from '../objects/Game_Player'

/**
 * 角色信息
 */
export interface Data_Actor {
  id: number
  battlerName: string
  characterIndex: number
  characterName: string
  classId: number
  equips: number[]
  faceIndex: number
  faceName: string
  traits: Data_Trait[]
  initialLevel: number
  maxLevel: number
  name: string
  nickname: string
  note: string
  profile: string
}

/**
 * 职业信息
 */
export interface Data_Class {
  id: number
  expParams: number[]
  traits: Data_Trait[]
  learnings: {
    level: number
    note: string
    skillId: number
  }[]
  name: string
  note: string
  params: number[][]
}

export interface Data_ItemBase {
  id: number
  description: string
  iconIndex: number
  name: string
  note: string
}

/**
 * 技能信息
 */
export interface Data_Skill extends Data_ItemBase {
  animationId: number
  damage: Data_Damage
  effects: Data_Effect[]
  hitType: number
  message1: string
  message2: string
  mpCost: number
  occasion: number
  repeats: number
  requiredWtypeId1: number
  requiredWtypeId2: number
  scope: number
  speed: number
  stypeId: number
  successRate: number
  tpCost: number
  tpGain: number
}

/**
 * 物品信息
 */
export interface Data_Item extends Data_ItemBase {
  animationId: number
  consumable: boolean
  damage: Data_Damage
  effects: Data_Effect[]
  hitType: number
  itypeId: number
  occasion: number
  repeats: number
  scope: number
  speed: number
  successRate: number
  tpGain: number
  price: number
}

/**
 * 武器信息
 */
export interface Data_Weapon extends Data_ItemBase {
  animationId: number
  etypeId: number
  traits: Data_Trait[]
  params: number[]
  wtypeId: number
  price: number
}

/**
 * 防具信息
 */
export interface Data_Armor extends Data_ItemBase {
  atypeId: number
  etypeId: number
  traits: Data_Trait[]
  params: number[]
  price: number
}

/**
 * 敌人信息
 */
export interface Data_Enemy {
  id: number
  actions: Data_EnemyAction[]
  battlerHue: number
  battlerName: string
  dropItems: {
    dataId: number
    denominator: number
    kind: number
  }[]
  exp: number
  traits: Data_Trait[]
  gold: number
  name: string
  note: string
  params: number[]
}

export interface Data_EnemyAction {
  conditionParam1: number
  conditionParam2: number
  conditionType: number
  rating: number
  skillId: number
}

/**
 * 敌群信息
 */
export interface Data_Troop {
  id: number
  members: {
    enemyId: number
    x: number
    y: number
    hidden: boolean
  }[]
  name: string
  pages: Data_TroopPage[]
}

export interface Data_TroopPage {
  conditions: {
    actorHp: number
    actorId: number
    actorValid: boolean
    enemyHp: number
    enemyIndex: number
    enemyValid: boolean
    switchId: number
    switchValid: boolean
    turnA: number
    turnB: number
    turnEnding: boolean
    turnValid: boolean
  },
  list: Data_EventCommand[]
  span: number
}

/**
 * 异常状态信息
 */
export interface Data_State {
  id: number
  autoRemovalTiming: number
  chanceByDamage: number
  iconIndex: number
  maxTurns: number
  message1: string
  message2: string
  message3: string
  message4: string
  minTurns: number
  motion: number
  name: string
  note: string
  overlay: number
  priority: number
  releaseByDamage: boolean
  removeAtBattleEnd: boolean
  removeByDamage: boolean
  removeByRestriction: boolean
  removeByWalking: boolean
  restriction: number
  stepsToRemove: number
  traits: Data_Trait[]
}

/**
 * 动画信息
 */
export interface Data_Animation {
  id: number
  animation1Hue: number
  animation1Name: string
  animation2Hue: number
  animation2Name: string
  frames: number[][][]
  name: string
  position: number
  timings: Data_AnimationTiming[]
}

export interface Data_AnimationTiming {
  flashColor: number[]
  flashDuration: number
  flashScope: number
  frame: number
  se: Data_Audio
}

/**
 * 图块信息
 */
export interface Data_Tileset {
  id: number
  flags: number[]
  mode: number
  name: string
  note: string
  tilesetNames: string[]
}

/**
 * 公共事件信息
 */
export interface Data_CommonEvent {
  id: number
  list: Data_EventCommand[]
  name: string
  switchId: number
  trigger: number
}

/**
 * 系统信息
 */
export interface Data_System {
  airship: Data_Vehicle
  armorTypes: string[]
  attackMotions: {
    type: number
    weaponImageId: number
  }[]
  battleBgm: Data_Audio
  battleback1Name: string
  battleback2Name: string
  battlerHue: number
  battlerName: string
  boat: Data_Vehicle
  currencyUnit: string
  defeatMe: Data_Audio
  editMapId: number
  elements: string[]
  equipTypes: string[]
  gameTitle: string
  gameoverMe: Data_Audio
  locale: string
  magicSkills: number[]
  menuCommands: boolean[]
  optDisplayTp: boolean
  optDrawTitle: boolean
  optExtraExp: boolean
  optFloorDeath: boolean
  optFollowers: boolean
  optSideView: boolean
  optSlipDeath: boolean
  optTransparent: boolean
  partyMembers: number[]
  ship: Data_Vehicle
  skillTypes: string[]
  sounds: Data_Audio[]
  startMapId: number
  startX: number
  startY: number
  switches: string[]
  terms: {
    basic: string[]
    commands: string[]
    params: string[]
    messages: {
      actionFailure: string
      actorDamage: string
      actorDrain: string
      actorGain: string
      actorLoss: string
      actorNoDamage: string
      actorNoHit: string
      actorRecovery: string
      alwaysDash: string
      bgmVolume: string
      bgsVolume: string
      buffAdd: string
      buffRemove: string
      commandRemember: string
      counterAttack: string
      criticalToActor: string
      criticalToEnemy: string
      debuffAdd: string
      defeat: string
      emerge: string
      enemyDamage: string
      enemyDrain: string
      enemyGain: string
      enemyLoss: string
      enemyNoDamage: string
      enemyNoHit: string
      enemyRecovery: string
      escapeFailure: string
      escapeStart: string
      evasion: string
      expNext: string
      expTotal: string
      file: string
      levelUp: string
      loadMessage: string
      magicEvasion: string
      magicReflection: string
      meVolume: string
      obtainExp: string
      obtainGold: string
      obtainItem: string
      obtainSkill: string
      partyName: string
      possession: string
      preemptive: string
      saveMessage: string
      seVolume: string
      substitute: string
      surprise: string
      useItem: string
      victory: string
    }
  }
  testBattlers: {
    actorId: number
    equips: number[]
    level: number
  }[]
  testTroopId: number
  title1Name: string
  title2Name: string
  titleBgm: Data_Audio
  variables: string[]
  versionId: number
  victoryMe: Data_Audio
  weaponTypes: string[]
  windowTone: number[]
  encryptionKey: string
}

/**
 * 地图元信息
 */
export interface Data_MapInfo {
  id: number
  expanded: boolean
  name: string
  order: number
  parentId: number
  scrollX: number
  scrollY: number
}

/**
 * 当前地图信息
 */
export interface Data_Map {
  autoplayBgm: boolean
  autoplayBgs: boolean
  battleback1Name: string
  battleback2Name: string
  bgm: Data_Audio
  bgs: Data_Audio
  disableDashing: boolean
  displayName: string
  encounterList: Data_MapEncounter[]
  encounterStep: number
  height: number
  note: string
  parallaxLoopX: boolean
  parallaxLoopY: boolean
  parallaxName: string
  parallaxShow: boolean
  parallaxSx: number
  parallaxSy: number
  scrollType: number
  specifyBattleback: boolean
  tilesetId: number
  width: number
  data: number[]
  events: Data_Event[]
}

export interface Data_MapEncounter {
  troopId: number
  weight: number
  regionSet: number[]
}

export interface Data_Trait {
  code: number
  dataId: number
  value: number
}

export interface Data_Damage {
  critical: boolean
  elementId: number
  formula: string
  type: number
  variance: number
}

export interface Data_Effect {
  code: number
  dataId: number
  value1: number
  value2: number
}

export interface Data_Event {
  note: string
  id: number
  name: string
  x: number
  y: number
  pages: Data_EventPage[]
}

export interface Data_EventPage {
  conditions: {
    switch1Valid: boolean
    switch2Valid: boolean
    variableValid: boolean
    selfSwitchValid: boolean
    itemValid: boolean
    actorValid: boolean
    switch1Id: number
    switch2Id: number
    variableId: number
    variableValue: number
    selfSwitchCh: string
    itemId: number
    actorId: number
  }
  image: {
    tileId: number
    characterName: string
    characterIndex: number
    direction: number
    pattern: number
  }
  moveType: number
  moveSpeed: number
  moveFrequency: number
  moveRoute: Data_MoveRoute
  walkAnime: boolean
  stepAnime: boolean
  directionFix: boolean
  through: boolean
  priorityType: number
  trigger: number
  list: Data_EventCommand[]
}

export interface Data_EventCommand {
  code: number
  indent: number
  parameters: any[]
}

export interface Data_MoveRoute {
  repeat: boolean
  skippable: boolean
  wait: boolean
  list: {
    code: number
    parameters: any[]
  }[]
}

export interface Data_Audio {
  name: string
  pan: number
  pitch: number
  volume: number
  pos?: number // todo 这个可以分开，让 Data 不可变
}

export interface Data_Vehicle {
  bgm: Data_Audio
  characterIndex: number
  characterName: string
  startMapId: number
  startX: number
  startY: number
}

export interface GlobalVars {
  $dataActors: Data_Actor[]
  $dataClasses: Data_Class[]
  $dataSkills: Data_Skill[]
  $dataItems: Data_Item[]
  $dataWeapons: Data_Weapon[]
  $dataArmors: Data_Armor[]
  $dataEnemies: Data_Enemy[]
  $dataTroops: Data_Troop[]
  $dataStates: Data_State[]
  $dataAnimations: Data_Animation[]
  $dataTilesets: Data_Tileset[]
  $dataCommonEvents: Data_CommonEvent[]
  $dataSystem: Data_System
  $dataMapInfos: Data_MapInfo[]
  $dataMap: Data_Map
  $gameTemp: Game_Temp
  $gameSystem: Game_System
  $gameScreen: Game_Screen
  $gameTimer: Game_Timer
  $gameMessage: Game_Message
  $gameSwitches: Game_Switches
  $gameVariables: Game_Variables
  $gameSelfSwitches: Game_SelfSwitches
  $gameActors: Game_Actors
  $gameParty: Game_Party
  $gameTroop: Game_Troop
  $gameMap: Game_Map
  $gamePlayer: Game_Player
  $testEvent: Data_EventCommand[] | null
}
