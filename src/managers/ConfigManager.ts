import {StorageManager} from './StorageManager'
import {AudioManager} from './AudioManager'

// ConfigManager
//
// The static class that manages the configuration data.
export class ConfigManager {

  static alwaysDash = false
  static commandRemember = false

  static bgmVolume = 0
  static bgsVolume = 0
  static meVolume = 0
  static seVolume = 0

  get bgmVolume() {
    return AudioManager.bgmVolume
  }

  set bgmVolume(value) {
    AudioManager.bgmVolume = value
  }

  get bgsVolume() {
    return AudioManager.bgsVolume
  }

  set bgsVolume(value) {
    AudioManager.bgsVolume = value
  }

  get meVolume() {
    return AudioManager.meVolume
  }

  set meVolume(value) {
    AudioManager.meVolume = value
  }

  get seVolume() {
    return AudioManager.seVolume
  }

  set seVolume(value) {
    AudioManager.seVolume = value
  }

  static load() {
    let json
    let config = {}
    try {
      json = StorageManager.load(-1)
    } catch (e) {
      console.error(e)
    }
    if (json) {
      config = JSON.parse(json)
    }
    this.applyData(config)
  }

  static save() {
    StorageManager.save(-1, JSON.stringify(this.makeData()))
  }

  static makeData() {
    const config: Record<string, number | boolean> = {}
    config.alwaysDash = this.alwaysDash
    config.commandRemember = this.commandRemember
    config.bgmVolume = this.bgmVolume
    config.bgsVolume = this.bgsVolume
    config.meVolume = this.meVolume
    config.seVolume = this.seVolume
    return config
  }

  static applyData(config: Record<string, number | boolean>) {
    this.alwaysDash = this.readFlag(config, 'alwaysDash')
    this.commandRemember = this.readFlag(config, 'commandRemember')
    this.bgmVolume = this.readVolume(config, 'bgmVolume')
    this.bgsVolume = this.readVolume(config, 'bgsVolume')
    this.meVolume = this.readVolume(config, 'meVolume')
    this.seVolume = this.readVolume(config, 'seVolume')
  }

  static readFlag(config: Record<string, number | boolean>, name: string) {
    return !!config[name]
  }

  static readVolume(config: Record<string, number | boolean>, name: string) {
    const value = config[name]
    if (value !== undefined) {
      return Number(value).clamp(0, 100)
    } else {
      return 100
    }
  }
}
