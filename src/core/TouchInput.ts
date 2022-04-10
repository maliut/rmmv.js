/**
 * The static class that handles input data from the mouse and touchscreen.
 *
 * @class TouchInput
 */
import {Utils} from './Utils'
import {Graphics} from './Graphics'

export class TouchInput {
  /**
   * The wait time of the pseudo key repeat in frames.
   *
   * @static
   * @property keyRepeatWait
   * @type Number
   */
  static keyRepeatWait = 24

  /**
   * The interval of the pseudo key repeat in frames.
   *
   * @static
   * @property keyRepeatInterval
   * @type Number
   */
  static keyRepeatInterval = 6

  private static _mousePressed = false
  private static _screenPressed = false
  private static _pressedTime = 0
  private static _events = {
    triggered: false,
    cancelled: false,
    moved: false,
    released: false,
    wheelX: 0,
    wheelY: 0
  }
  private static _triggered = false
  private static _cancelled = false
  private static _moved = false
  private static _released = false
  private static _wheelX = 0
  private static _wheelY = 0
  private static _x = 0
  private static _y = 0
  private static _date = 0

  /**
   * [read-only] The x coordinate on the canvas area of the latest touch event.
   *
   * @static
   * @property x
   * @type Number
   */
  static get x() {
    return this._x
  }

  /**
   * [read-only] The y coordinate on the canvas area of the latest touch event.
   *
   * @static
   * @property y
   * @type Number
   */
  static get y() {
    return this._y
  }

  /**
   * [read-only] The time of the last input in milliseconds.
   *
   * @static
   * @property date
   * @type Number
   */
  static get date() {
    return this._date
  }

  /**
   * Initializes the touch system.
   *
   * @static
   * @method initialize
   */
  static initialize() {
    this.clear()
    this._setupEventHandlers()
  }

  /**
   * Clears all the touch data.
   *
   * @static
   * @method clear
   */
  static clear() {
    this._mousePressed = false
    this._screenPressed = false
    this._pressedTime = 0
    // this._events = {}
    this._events.triggered = false
    this._events.cancelled = false
    this._events.moved = false
    this._events.released = false
    this._events.wheelX = 0
    this._events.wheelY = 0
    this._triggered = false
    this._cancelled = false
    this._moved = false
    this._released = false
    this._wheelX = 0
    this._wheelY = 0
    this._x = 0
    this._y = 0
    this._date = 0
  }

  /**
   * Updates the touch data.
   *
   * @static
   * @method update
   */
  static update() {
    this._triggered = this._events.triggered
    this._cancelled = this._events.cancelled
    this._moved = this._events.moved
    this._released = this._events.released
    this._wheelX = this._events.wheelX
    this._wheelY = this._events.wheelY
    this._events.triggered = false
    this._events.cancelled = false
    this._events.moved = false
    this._events.released = false
    this._events.wheelX = 0
    this._events.wheelY = 0
    if (this.isPressed()) {
      this._pressedTime++
    }
  }

  /**
   * Checks whether the mouse button or touchscreen is currently pressed down.
   *
   * @static
   * @method isPressed
   * @return {Boolean} True if the mouse button or touchscreen is pressed
   */
  static isPressed() {
    return this._mousePressed || this._screenPressed
  }

  /**
   * Checks whether the left mouse button or touchscreen is just pressed.
   *
   * @static
   * @method isTriggered
   * @return {Boolean} True if the mouse button or touchscreen is triggered
   */
  static isTriggered() {
    return this._triggered
  }

  /**
   * Checks whether the left mouse button or touchscreen is just pressed
   * or a pseudo key repeat occurred.
   *
   * @static
   * @method isRepeated
   * @return {Boolean} True if the mouse button or touchscreen is repeated
   */
  static isRepeated() {
    return (this.isPressed() &&
      (this._triggered ||
        (this._pressedTime >= this.keyRepeatWait &&
          this._pressedTime % this.keyRepeatInterval === 0)))
  }

  /**
   * Checks whether the left mouse button or touchscreen is kept depressed.
   *
   * @static
   * @method isLongPressed
   * @return {Boolean} True if the left mouse button or touchscreen is long-pressed
   */
  static isLongPressed() {
    return this.isPressed() && this._pressedTime >= this.keyRepeatWait
  }

  /**
   * Checks whether the right mouse button is just pressed.
   *
   * @static
   * @method isCancelled
   * @return {Boolean} True if the right mouse button is just pressed
   */
  static isCancelled() {
    return this._cancelled
  }

  /**
   * Checks whether the mouse or a finger on the touchscreen is moved.
   *
   * @static
   * @method isMoved
   * @return {Boolean} True if the mouse or a finger on the touchscreen is moved
   */
  static isMoved() {
    return this._moved
  }

  /**
   * Checks whether the left mouse button or touchscreen is released.
   *
   * @static
   * @method isReleased
   * @return {Boolean} True if the mouse button or touchscreen is released
   */
  static isReleased() {
    return this._released
  }

  private static _setupEventHandlers() {
    const isSupportPassive = Utils.isSupportPassiveEvent()
    document.addEventListener('mousedown', this._onMouseDown.bind(this))
    document.addEventListener('mousemove', this._onMouseMove.bind(this))
    document.addEventListener('mouseup', this._onMouseUp.bind(this))
    document.addEventListener('wheel', this._onWheel.bind(this))
    document.addEventListener('touchstart', this._onTouchStart.bind(this), isSupportPassive ? {passive: false} : false)
    document.addEventListener('touchmove', this._onTouchMove.bind(this), isSupportPassive ? {passive: false} : false)
    document.addEventListener('touchend', this._onTouchEnd.bind(this))
    document.addEventListener('touchcancel', this._onTouchCancel.bind(this))
    document.addEventListener('pointerdown', this._onPointerDown.bind(this))
  }

  private static _onMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      this._onLeftButtonDown(event)
    } else if (event.button === 1) {
      this._onMiddleButtonDown(event)
    } else if (event.button === 2) {
      this._onRightButtonDown(event)
    }
  }

  private static _onLeftButtonDown(event: MouseEvent) {
    const x = Graphics.pageToCanvasX(event.pageX)
    const y = Graphics.pageToCanvasY(event.pageY)
    if (Graphics.isInsideCanvas(x, y)) {
      this._mousePressed = true
      this._pressedTime = 0
      this._onTrigger(x, y)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private static _onMiddleButtonDown(event: MouseEvent) {
  }

  private static _onRightButtonDown(event: MouseEvent) {
    const x = Graphics.pageToCanvasX(event.pageX)
    const y = Graphics.pageToCanvasY(event.pageY)
    if (Graphics.isInsideCanvas(x, y)) {
      this._onCancel(x, y)
    }
  }

  private static _onMouseMove(event: MouseEvent) {
    if (this._mousePressed) {
      const x = Graphics.pageToCanvasX(event.pageX)
      const y = Graphics.pageToCanvasY(event.pageY)
      this._onMove(x, y)
    }
  }

  private static _onMouseUp(event: MouseEvent) {
    if (event.button === 0) {
      const x = Graphics.pageToCanvasX(event.pageX)
      const y = Graphics.pageToCanvasY(event.pageY)
      this._mousePressed = false
      this._onRelease(x, y)
    }
  }

  private static _onWheel(event: WheelEvent) {
    this._events.wheelX += event.deltaX
    this._events.wheelY += event.deltaY
    event.preventDefault()
  }

  private static _onTouchStart(event: TouchEvent) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      const x = Graphics.pageToCanvasX(touch.pageX)
      const y = Graphics.pageToCanvasY(touch.pageY)
      if (Graphics.isInsideCanvas(x, y)) {
        this._screenPressed = true
        this._pressedTime = 0
        if (event.touches.length >= 2) {
          this._onCancel(x, y)
        } else {
          this._onTrigger(x, y)
        }
        event.preventDefault()
      }
    }
    // @ts-ignore
    if (window.cordova || window.navigator.standalone) {
      event.preventDefault()
    }
  }

  private static _onTouchMove(event: TouchEvent) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      const x = Graphics.pageToCanvasX(touch.pageX)
      const y = Graphics.pageToCanvasY(touch.pageY)
      this._onMove(x, y)
    }
  }

  private static _onTouchEnd(event: TouchEvent) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      const x = Graphics.pageToCanvasX(touch.pageX)
      const y = Graphics.pageToCanvasY(touch.pageY)
      this._screenPressed = false
      this._onRelease(x, y)
    }
  }

  private static _onTouchCancel() {
    this._screenPressed = false
  }

  private static _onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'touch' && !event.isPrimary) {
      const x = Graphics.pageToCanvasX(event.pageX)
      const y = Graphics.pageToCanvasY(event.pageY)
      if (Graphics.isInsideCanvas(x, y)) {
        // For Microsoft Edge
        this._onCancel(x, y)
        event.preventDefault()
      }
    }
  }

  private static _onTrigger(x: number, y: number) {
    this._events.triggered = true
    this._x = x
    this._y = y
    this._date = Date.now()
  }

  private static _onCancel(x: number, y: number) {
    this._events.cancelled = true
    this._x = x
    this._y = y
  }

  private static _onMove(x: number, y: number) {
    this._events.moved = true
    this._x = x
    this._y = y
  }

  private static _onRelease(x: number, y: number) {
    this._events.released = true
    this._x = x
    this._y = y
  }
}
