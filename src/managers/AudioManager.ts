import {WebAudio} from '../core/WebAudio'
import {Graphics} from '../core/Graphics'
import {Decrypter} from '../core/Decrypter'
import {Html5Audio} from '../core/Html5Audio'
import {Utils} from '../core/Utils'
import {Data_Audio} from '../types/global'

type Buffer = (typeof Html5Audio | WebAudio) & { _reservedSeName?: string } // _reservedSeName 临时变量

// AudioManager
//
// The static class that handles BGM, BGS, ME and SE.
export class AudioManager {
  private static _masterVolume = 1   // (min: 0, max: 1)
  private static _bgmVolume = 100
  private static _bgsVolume = 100
  private static _meVolume = 100
  private static _seVolume = 100
  private static _currentBgm: Data_Audio | null = null
  private static _currentBgs: Data_Audio | null = null
  private static _currentMe: Data_Audio | null = null
  private static _bgmBuffer: Buffer | null = null
  private static _bgsBuffer: Buffer | null = null
  private static _meBuffer: Buffer | null = null
  private static _seBuffers: Buffer[] = []
  private static _staticBuffers: Buffer[] = []
  private static _replayFadeTime = 0.5
  private static _path = 'audio/'
  private static _blobUrl: string | null = null

  static get masterVolume() {
    return this._masterVolume
  }

  static set masterVolume(value) {
    this._masterVolume = value
    WebAudio.setMasterVolume(this._masterVolume)
    Graphics.setVideoVolume(this._masterVolume)
  }

  static get bgmVolume() {
    return this._bgmVolume
  }

  static set bgmVolume(value) {
    this._bgmVolume = value
    this.updateBgmParameters(this._currentBgm)
  }

  static get bgsVolume() {
    return this._bgsVolume
  }

  static set bgsVolume(value) {
    this._bgsVolume = value
    this.updateBgsParameters(this._currentBgs)
  }

  static get meVolume() {
    return this._meVolume
  }

  static set meVolume(value) {
    this._meVolume = value
    this.updateMeParameters(this._currentMe)
  }

  static get seVolume() {
    return this._seVolume
  }

  static set seVolume(value) {
    this._seVolume = value
  }

  static playBgm(bgm: Data_Audio, pos = 0) {
    if (this.isCurrentBgm(bgm)) {
      this.updateBgmParameters(bgm)
    } else {
      this.stopBgm()
      if (bgm.name) {
        if (Decrypter.hasEncryptedAudio && this.shouldUseHtml5Audio()) {
          this.playEncryptedBgm(bgm, pos)
        } else {
          this._bgmBuffer = this.createBuffer('bgm', bgm.name)
          this.updateBgmParameters(bgm)
          if (!this._meBuffer) {
            this._bgmBuffer.play(true, pos || 0)
          }
        }
      }
    }
    this.updateCurrentBgm(bgm, pos)
  }

  static playEncryptedBgm(bgm: Data_Audio, pos: number) {
    const ext = this.audioFileExt()
    let url = this._path + 'bgm/' + encodeURIComponent(bgm.name) + ext
    url = Decrypter.extToEncryptExt(url)
    Decrypter.decryptHTML5Audio(url, bgm, pos)
  }

  static createDecryptBuffer(url: string, bgm: Data_Audio, pos: number) {
    this._blobUrl = url
    this._bgmBuffer = this.createBuffer('bgm', bgm.name)
    this.updateBgmParameters(bgm)
    if (!this._meBuffer) {
      this._bgmBuffer.play(true, pos || 0)
    }
    this.updateCurrentBgm(bgm, pos)
  }

  static replayBgm(bgm: Data_Audio) {
    if (this.isCurrentBgm(bgm)) {
      this.updateBgmParameters(bgm)
    } else {
      this.playBgm(bgm, bgm.pos)
      if (this._bgmBuffer) {
        this._bgmBuffer.fadeIn(this._replayFadeTime)
      }
    }
  }

  static isCurrentBgm(bgm: Data_Audio) {
    return (this._currentBgm && this._bgmBuffer &&
      this._currentBgm.name === bgm.name)
  }

  static updateBgmParameters(bgm: Data_Audio | null) {
    this.updateBufferParameters(this._bgmBuffer, this._bgmVolume, bgm)
  }

  static updateCurrentBgm(bgm: Data_Audio, pos: number) {
    this._currentBgm = {
      name: bgm.name,
      volume: bgm.volume,
      pitch: bgm.pitch,
      pan: bgm.pan,
      pos: pos
    }
  }

  static stopBgm() {
    if (this._bgmBuffer) {
      this._bgmBuffer.stop()
      this._bgmBuffer = null
      this._currentBgm = null
    }
  }

  static fadeOutBgm(duration: number) {
    if (this._bgmBuffer && this._currentBgm) {
      this._bgmBuffer.fadeOut(duration)
      this._currentBgm = null
    }
  }

  static fadeInBgm(duration: number) {
    if (this._bgmBuffer && this._currentBgm) {
      this._bgmBuffer.fadeIn(duration)
    }
  }

  static playBgs(bgs: Data_Audio, pos = 0) {
    if (this.isCurrentBgs(bgs)) {
      this.updateBgsParameters(bgs)
    } else {
      this.stopBgs()
      if (bgs.name) {
        this._bgsBuffer = this.createBuffer('bgs', bgs.name)
        this.updateBgsParameters(bgs)
        this._bgsBuffer.play(true, pos || 0)
      }
    }
    this.updateCurrentBgs(bgs, pos)
  }

  static replayBgs(bgs: Data_Audio) {
    if (this.isCurrentBgs(bgs)) {
      this.updateBgsParameters(bgs)
    } else {
      this.playBgs(bgs, bgs.pos)
      if (this._bgsBuffer) {
        this._bgsBuffer.fadeIn(this._replayFadeTime)
      }
    }
  }

  static isCurrentBgs(bgs: Data_Audio) {
    return (this._currentBgs && this._bgsBuffer &&
      this._currentBgs.name === bgs.name)
  }

  static updateBgsParameters(bgs: Data_Audio | null) {
    this.updateBufferParameters(this._bgsBuffer, this._bgsVolume, bgs)
  }

  static updateCurrentBgs(bgs: Data_Audio, pos: number) {
    this._currentBgs = {
      name: bgs.name,
      volume: bgs.volume,
      pitch: bgs.pitch,
      pan: bgs.pan,
      pos: pos
    }
  }

  static stopBgs() {
    if (this._bgsBuffer) {
      this._bgsBuffer.stop()
      this._bgsBuffer = null
      this._currentBgs = null
    }
  }

  static fadeOutBgs(duration: number) {
    if (this._bgsBuffer && this._currentBgs) {
      this._bgsBuffer.fadeOut(duration)
      this._currentBgs = null
    }
  }

  static fadeInBgs(duration: number) {
    if (this._bgsBuffer && this._currentBgs) {
      this._bgsBuffer.fadeIn(duration)
    }
  }

  static playMe(me: Data_Audio) {
    this.stopMe()
    if (me.name) {
      if (this._bgmBuffer && this._currentBgm) {
        this._currentBgm.pos = this._bgmBuffer.seek()
        this._bgmBuffer.stop()
      }
      this._meBuffer = this.createBuffer('me', me.name)
      this.updateMeParameters(me)
      this._meBuffer.play(false)
      if (this._meBuffer instanceof WebAudio) { // changed
        this._meBuffer.addStopListener(this.stopMe.bind(this))
      }
    }
  }

  static updateMeParameters(me: Data_Audio | null) {
    this.updateBufferParameters(this._meBuffer, this._meVolume, me)
  }

  static fadeOutMe(duration: number) {
    if (this._meBuffer) {
      this._meBuffer.fadeOut(duration)
    }
  }

  static stopMe() {
    if (this._meBuffer) {
      this._meBuffer.stop()
      this._meBuffer = null
      if (this._bgmBuffer && this._currentBgm && !this._bgmBuffer.isPlaying()) {
        this._bgmBuffer.play(true, this._currentBgm.pos)
        this._bgmBuffer.fadeIn(this._replayFadeTime)
      }
    }
  }

  static playSe(se: Data_Audio) {
    if (se.name) {
      this._seBuffers = this._seBuffers.filter((audio) => audio.isPlaying())
      const buffer = this.createBuffer('se', se.name)
      this.updateSeParameters(buffer, se)
      buffer.play(false)
      this._seBuffers.push(buffer)
    }
  }

  static updateSeParameters(buffer: Buffer, se: Data_Audio) {
    this.updateBufferParameters(buffer, this._seVolume, se)
  }

  static stopSe() {
    this._seBuffers.forEach((buffer) => {
      buffer.stop()
    })
    this._seBuffers = []
  }

  static playStaticSe(se: Data_Audio) {
    if (se.name) {
      this.loadStaticSe(se)
      for (let i = 0; i < this._staticBuffers.length; i++) {
        const buffer = this._staticBuffers[i]
        if (buffer._reservedSeName === se.name) {
          buffer.stop()
          this.updateSeParameters(buffer, se)
          buffer.play(false)
          break
        }
      }
    }
  }

  static loadStaticSe(se: Data_Audio) {
    if (se.name && !this.isStaticSe(se)) {
      const buffer = this.createBuffer('se', se.name)
      buffer._reservedSeName = se.name
      this._staticBuffers.push(buffer)
      if (this.shouldUseHtml5Audio()) {
        Html5Audio.setStaticSe(buffer.url)
      }
    }
  }

  static isStaticSe(se: Data_Audio) {
    for (let i = 0; i < this._staticBuffers.length; i++) {
      const buffer = this._staticBuffers[i]
      if (buffer._reservedSeName === se.name) {
        return true
      }
    }
    return false
  }

  static stopAll() {
    this.stopMe()
    this.stopBgm()
    this.stopBgs()
    this.stopSe()
  }

  static saveBgm(): Data_Audio {
    if (this._currentBgm) {
      const bgm = this._currentBgm
      return {
        name: bgm.name,
        volume: bgm.volume,
        pitch: bgm.pitch,
        pan: bgm.pan,
        pos: this._bgmBuffer ? this._bgmBuffer.seek() : 0
      }
    } else {
      return this.makeEmptyAudioObject()
    }
  }

  static saveBgs(): Data_Audio {
    if (this._currentBgs) {
      const bgs = this._currentBgs
      return {
        name: bgs.name,
        volume: bgs.volume,
        pitch: bgs.pitch,
        pan: bgs.pan,
        pos: this._bgsBuffer ? this._bgsBuffer.seek() : 0
      }
    } else {
      return this.makeEmptyAudioObject()
    }
  }

  static makeEmptyAudioObject(): Data_Audio {
    return {pan: 0, pos: 0, name: '', volume: 0, pitch: 0}
  }

  static createBuffer(folder: string, name: string): Buffer {
    const ext = this.audioFileExt()
    const url = this._path + folder + '/' + encodeURIComponent(name) + ext
    if (this.shouldUseHtml5Audio() && folder === 'bgm') {
      if (this._blobUrl) Html5Audio.setup(this._blobUrl)
      else Html5Audio.setup(url)
      return Html5Audio
    } else {
      return new WebAudio(url)
    }
  }

  static updateBufferParameters(buffer: Buffer | null, configVolume: number, audio: Data_Audio | null) {
    if (buffer && audio) {
      buffer.volume = configVolume * (audio.volume || 0) / 10000
      if (buffer instanceof WebAudio) {
        buffer.pitch = (audio.pitch || 0) / 100
        buffer.pan = (audio.pan || 0) / 100
      }
    }
  }

  static audioFileExt() {
    if (WebAudio.canPlayOgg() && !Utils.isMobileDevice()) {
      return '.ogg'
    } else {
      return '.m4a'
    }
  }

  static shouldUseHtml5Audio() {
    // The only case where we wanted html5audio was android/ no encrypt
    // Atsuma-ru asked to force webaudio there too, so just return false for ALL    // return Utils.isAndroidChrome() && !Decrypter.hasEncryptedAudio;
    return false
  }

  static checkErrors() {
    this.checkWebAudioError(this._bgmBuffer)
    this.checkWebAudioError(this._bgsBuffer)
    this.checkWebAudioError(this._meBuffer)
    this._seBuffers.forEach((buffer) => {
      this.checkWebAudioError(buffer)
    })
    this._staticBuffers.forEach((buffer) => {
      this.checkWebAudioError(buffer)
    })
  }

  static checkWebAudioError(webAudio: Buffer | null) {
    if (webAudio && webAudio.isError()) {
      throw new Error('Failed to load: ' + webAudio.url)
    }
  }
}
