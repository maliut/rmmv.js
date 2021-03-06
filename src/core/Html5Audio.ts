import {Decrypter} from './Decrypter'

/**
 * The static class that handles HTML5 Audio.
 *
 * @class Html5Audio
 * @constructor
 */
export class Html5Audio {
  private static _initialized = false
  private static _unlocked = false
  private static _audioElement: HTMLAudioElement
  private static _gainTweenInterval: number
  private static _tweenGain = 0
  private static _tweenTargetGain = 0
  private static _tweenGainStep = 0
  private static _staticSePath: string | null = null
  private static _url: string | null = null
  private static _volume = 1
  private static _loadListeners: (() => void)[] = []
  private static _hasError = false
  private static _autoPlay = false
  private static _isLoading = false
  private static _buffered = false
  private static _tweenInterval = null

  /**
   * [read-only] The url of the audio file.
   *
   * @property url
   * @type String
   */
  static get url() {
    return Html5Audio._url
  }

  /**
   * The volume of the audio.
   *
   * @property volume
   * @type Number
   */
  static get volume() {
    return Html5Audio._volume
  }

  static set volume(value) {
    Html5Audio._volume = value
    if (Html5Audio._audioElement) {
      Html5Audio._audioElement.volume = this._volume
    }
  }

  /**
   * Sets up the Html5 Audio.
   *
   * @static
   * @method setup
   * @param {String} url The url of the audio file
   */
  static setup(url: string) {
    if (!this._initialized) {
      this.initialize()
    }
    this.clear()

    if (Decrypter.hasEncryptedAudio && this._audioElement.src) {
      window.URL.revokeObjectURL(this._audioElement.src)
    }
    this._url = url
  }

  /**
   * Initializes the audio system.
   *
   * @static
   * @method initialize
   * @return {Boolean} True if the audio system is available
   */
  static initialize() {
    if (!this._initialized) {
      if (!this._audioElement) {
        try {
          this._audioElement = new Audio()
        } catch (e) {
          // this._audioElement = null
        }
      }
      if (this._audioElement) this._setupEventHandlers()
      this._initialized = true
    }
    return !!this._audioElement
  }

  private static _setupEventHandlers() {
    document.addEventListener('touchstart', this._onTouchStart.bind(this))
    document.addEventListener('visibilitychange', this._onVisibilityChange.bind(this))
    this._audioElement.addEventListener('loadeddata', this._onLoadedData.bind(this))
    this._audioElement.addEventListener('error', this._onError.bind(this))
    this._audioElement.addEventListener('ended', this._onEnded.bind(this))
  }

  private static _onTouchStart() {
    if (this._audioElement && !this._unlocked) {
      if (this._isLoading) {
        this._load(this._url!)
        this._unlocked = true
      } else {
        if (this._staticSePath) {
          this._audioElement.src = this._staticSePath
          this._audioElement.volume = 0
          this._audioElement.loop = false
          this._audioElement.play()
          this._unlocked = true
        }
      }
    }
  }

  private static _onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this._onHide()
    } else {
      this._onShow()
    }
  }

  private static _onLoadedData() {
    this._buffered = true
    if (this._unlocked) this._onLoad()
  }

  private static _onError() {
    this._hasError = true
  }

  private static _onEnded() {
    if (!this._audioElement.loop) {
      this.stop()
    }
  }

  private static _onHide() {
    this._audioElement.volume = 0
    this._tweenGain = 0
  }

  private static _onShow() {
    this.fadeIn(0.5)
  }

  /**
   * Clears the audio data.
   *
   * @static
   * @method clear
   */
  static clear() {
    this.stop()
    this._volume = 1
    this._loadListeners = []
    this._hasError = false
    this._autoPlay = false
    this._isLoading = false
    this._buffered = false
  }

  /**
   * Set the URL of static se.
   *
   * @static
   * @param {String} url
   */
  static setStaticSe(url: string | null) {
    if (!this._initialized) {
      this.initialize()
      this.clear()
    }
    this._staticSePath = url
  }

  /**
   * Checks whether the audio data is ready to play.
   *
   * @static
   * @method isReady
   * @return {Boolean} True if the audio data is ready to play
   */
  static isReady() {
    return this._buffered
  }

  /**
   * Checks whether a loading error has occurred.
   *
   * @static
   * @method isError
   * @return {Boolean} True if a loading error has occurred
   */
  static isError() {
    return this._hasError
  }

  /**
   * Checks whether the audio is playing.
   *
   * @static
   * @method isPlaying
   * @return {Boolean} True if the audio is playing
   */
  static isPlaying() {
    return !this._audioElement.paused
  }

  /**
   * Plays the audio.
   *
   * @static
   * @method play
   * @param {Boolean} loop Whether the audio data play in a loop
   * @param {Number} offset The start position to play in seconds
   */
  static play(loop: boolean, offset = 0) {
    if (this.isReady()) {
      this._startPlaying(loop, offset)
    } else if (Html5Audio._audioElement) {
      this._autoPlay = true
      this.addLoadListener(() => {
        if (this._autoPlay) {
          this.play(loop, offset)
          if (this._gainTweenInterval) {
            clearInterval(this._gainTweenInterval)
            this._gainTweenInterval = 0
          }
        }
      })
      if (!this._isLoading) this._load(this._url!)
    }
  }

  /**
   * Stops the audio.
   *
   * @static
   * @method stop
   */
  static stop() {
    if (this._audioElement) this._audioElement.pause()
    this._autoPlay = false
    if (this._tweenInterval) {
      clearInterval(this._tweenInterval)
      this._tweenInterval = null
      this._audioElement.volume = 0
    }
  }

  /**
   * Performs the audio fade-in.
   *
   * @static
   * @method fadeIn
   * @param {Number} duration Fade-in time in seconds
   */
  static fadeIn(duration: number) {
    if (this.isReady()) {
      if (this._audioElement) {
        this._tweenTargetGain = this._volume
        this._tweenGain = 0
        this._startGainTween(duration)
      }
    } else if (this._autoPlay) {
      this.addLoadListener(() => {
        this.fadeIn(duration)
      })
    }
  }

  /**
   * Performs the audio fade-out.
   *
   * @static
   * @method fadeOut
   * @param {Number} duration Fade-out time in seconds
   */
  static fadeOut(duration: number) {
    if (this._audioElement) {
      this._tweenTargetGain = 0
      this._tweenGain = this._volume
      this._startGainTween(duration)
    }
  }

  /**
   * Gets the seek position of the audio.
   *
   * @static
   * @method seek
   */
  static seek() {
    if (this._audioElement) {
      return this._audioElement.currentTime
    } else {
      return 0
    }
  }

  /**
   * Add a callback function that will be called when the audio data is loaded.
   *
   * @static
   * @method addLoadListener
   * @param {Function} listner The callback function
   */
  static addLoadListener(listner) {
    this._loadListeners.push(listner)
  }

  private static _load(url: string) {
    if (this._audioElement) {
      this._isLoading = true
      this._audioElement.src = url
      this._audioElement.load()
    }
  }

  private static _startPlaying(loop: boolean, offset: number) {
    this._audioElement.loop = loop
    if (this._gainTweenInterval) {
      clearInterval(this._gainTweenInterval)
      this._gainTweenInterval = 0
    }
    if (this._audioElement) {
      this._audioElement.volume = this._volume
      this._audioElement.currentTime = offset
      this._audioElement.play()
    }
  }

  private static _onLoad() {
    this._isLoading = false
    while (this._loadListeners.length > 0) {
      const listener = this._loadListeners.shift()!
      listener()
    }
  }

  private static _startGainTween(duration: number) {
    this._audioElement.volume = this._tweenGain
    if (this._gainTweenInterval) {
      clearInterval(this._gainTweenInterval)
      this._gainTweenInterval = 0
    }
    this._tweenGainStep = (this._tweenTargetGain - this._tweenGain) / (60 * duration)
    // @ts-ignore window.setInterval
    this._gainTweenInterval = setInterval(function () {
      Html5Audio._applyTweenValue(Html5Audio._tweenTargetGain)
    }, 1000 / 60)
  }

  private static _applyTweenValue(volume: number) {
    Html5Audio._tweenGain += Html5Audio._tweenGainStep
    if (Html5Audio._tweenGain < 0 && Html5Audio._tweenGainStep < 0) {
      Html5Audio._tweenGain = 0
    } else if (Html5Audio._tweenGain > volume && Html5Audio._tweenGainStep > 0) {
      Html5Audio._tweenGain = volume
    }

    if (Math.abs(Html5Audio._tweenTargetGain - Html5Audio._tweenGain) < 0.01) {
      Html5Audio._tweenGain = Html5Audio._tweenTargetGain
      clearInterval(Html5Audio._gainTweenInterval)
      Html5Audio._gainTweenInterval = 0
    }

    Html5Audio._audioElement.volume = Html5Audio._tweenGain
  }
}
