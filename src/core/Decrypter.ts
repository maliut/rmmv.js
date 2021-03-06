import {Bitmap} from './Bitmap'
import { global } from '../managers/DataManager'
import {AudioManager} from '../managers/AudioManager'
import {assert} from '../utils'
import {Data_Audio} from '../types/global'

export class Decrypter {
  static hasEncryptedImages = false
  static hasEncryptedAudio = false

  // private static _requestImgFile = []
  private static _headerlength = 16
  private static _xhrOk = 400
  private static _encryptionKey: string[] = []
  private static _ignoreList = [
    'img/system/Window.png'
  ]

  static SIGNATURE = '5250474d56000000'
  static VER = '000301'
  static REMAIN = '0000000000'

  static checkImgIgnore(url: string) {
    for (let cnt = 0; cnt < this._ignoreList.length; cnt++) {
      if (url === this._ignoreList[cnt]) return true
    }
    return false
  }

  static decryptImg(url: string, bitmap: Bitmap) {
    url = this.extToEncryptExt(url)

    const requestFile = new XMLHttpRequest()
    requestFile.open('GET', url)
    requestFile.responseType = 'arraybuffer'
    requestFile.send()

    requestFile.onload = function () {
      if (this.status < Decrypter._xhrOk) {
        assert(bitmap._image !== null)
        const arrayBuffer = Decrypter.decryptArrayBuffer(requestFile.response)
        bitmap._image.src = Decrypter.createBlobUrl(arrayBuffer)
        bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap.prototype._onLoad.bind(bitmap))
        bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap.prototype._onError.bind(bitmap))
      }
    }

    requestFile.onerror = function () {
      if (bitmap._loader) {
        bitmap._loader()
      } else {
        bitmap._onError()
      }
    }
  }

  static decryptHTML5Audio(url: string, bgm: Data_Audio, pos: number) {
    const requestFile = new XMLHttpRequest()
    requestFile.open('GET', url)
    requestFile.responseType = 'arraybuffer'
    requestFile.send()

    requestFile.onload = function () {
      if (this.status < Decrypter._xhrOk) {
        const arrayBuffer = Decrypter.decryptArrayBuffer(requestFile.response)
        const url = Decrypter.createBlobUrl(arrayBuffer)
        AudioManager.createDecryptBuffer(url, bgm, pos)
      }
    }
  }

  static cutArrayHeader(arrayBuffer: ArrayBuffer, length: number) {
    return arrayBuffer.slice(length)
  }

  static decryptArrayBuffer(arrayBuffer: ArrayBuffer) {
    assert(arrayBuffer !== null)
    const header = new Uint8Array(arrayBuffer, 0, this._headerlength)

    let i
    const ref = this.SIGNATURE + this.VER + this.REMAIN
    const refBytes = new Uint8Array(16)
    for (i = 0; i < this._headerlength; i++) {
      refBytes[i] = parseInt('0x' + ref.substr(i * 2, 2), 16)
    }
    for (i = 0; i < this._headerlength; i++) {
      if (header[i] !== refBytes[i]) {
        throw new Error('Header is wrong')
      }
    }

    arrayBuffer = this.cutArrayHeader(arrayBuffer, Decrypter._headerlength)
    const view = new DataView(arrayBuffer)
    this.readEncryptionkey()
    if (arrayBuffer) {
      const byteArray = new Uint8Array(arrayBuffer)
      for (i = 0; i < this._headerlength; i++) {
        byteArray[i] = byteArray[i] ^ parseInt(Decrypter._encryptionKey[i], 16)
        view.setUint8(i, byteArray[i])
      }
    }

    return arrayBuffer
  }

  static createBlobUrl(arrayBuffer: ArrayBuffer) {
    const blob = new Blob([arrayBuffer])
    return window.URL.createObjectURL(blob)
  }

  static extToEncryptExt(url: string) {
    const ext = url.split('.').pop() || ''
    let encryptedExt

    if (ext === 'ogg') encryptedExt = '.rpgmvo'
    else if (ext === 'm4a') encryptedExt = '.rpgmvm'
    else if (ext === 'png') encryptedExt = '.rpgmvp'
    else encryptedExt = ext

    return url.slice(0, url.lastIndexOf(ext) - 1) + encryptedExt
  }

  static readEncryptionkey() {
    this._encryptionKey = global.$dataSystem.encryptionKey.split(/(.{2})/).filter(Boolean)
  }
}
