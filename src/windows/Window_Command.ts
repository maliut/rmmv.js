import {Window_Selectable} from './Window_Selectable'

type Command = { name: string, symbol: string, enabled: boolean, ext: number | null }

// Window_Command
//
// The superclass of windows for selecting a command.
export class Window_Command extends Window_Selectable {

  private _list: Command[] = []

  override initialize(x: number, y: number, width?: number, height?: number) {
    this.clearCommandList()
    this.makeCommandList()
    super.initialize(x, y, width || this.windowWidth(), height || this.windowHeight())
    this.refresh()
    this.select(0)
    this.activate()
    return this
  }

  windowWidth() {
    return 240
  }

  windowHeight() {
    return this.fittingHeight(this.numVisibleRows())
  }

  numVisibleRows() {
    return Math.ceil(this.maxItems() / this.maxCols())
  }

  override maxItems() {
    return this._list.length
  }

  clearCommandList() {
    this._list = []
  }

  makeCommandList() {
    // empty
  }

  addCommand(name: string, symbol: string, enabled = true, ext: number | null = null) {
    this._list.push({name: name, symbol: symbol, enabled: enabled, ext: ext})
  }

  commandName(index: number) {
    return this._list[index].name
  }

  commandSymbol(index: number) {
    return this._list[index].symbol
  }

  isCommandEnabled(index: number) {
    return this._list[index].enabled
  }

  currentData() {
    return this.index() >= 0 ? this._list[this.index()] : null
  }

  override isCurrentItemEnabled() {
    return this.currentData()?.enabled || false
  }

  currentSymbol() {
    return this.currentData()?.symbol || null
  }

  currentExt() {
    return this.currentData()?.ext || null
  }

  findSymbol(symbol: string | null) {
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].symbol === symbol) {
        return i
      }
    }
    return -1
  }

  selectSymbol(symbol: string | null) {
    const index = this.findSymbol(symbol)
    if (index >= 0) {
      this.select(index)
    } else {
      this.select(0)
    }
  }

  findExt(ext: number | null) {
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].ext === ext) {
        return i
      }
    }
    return -1
  }

  selectExt(ext: number | null) {
    const index = this.findExt(ext)
    if (index >= 0) {
      this.select(index)
    } else {
      this.select(0)
    }
  }

  override drawItem(index: number) {
    const rect = this.itemRectForText(index)
    const align = this.itemTextAlign()
    this.resetTextColor()
    this.changePaintOpacity(this.isCommandEnabled(index))
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align)
  }

  itemTextAlign(): CanvasTextAlign {
    return 'left'
  }

  override isOkEnabled() {
    return true
  }

  override callOkHandler() {
    const symbol = this.currentSymbol()
    if (symbol && this.isHandled(symbol)) {
      this.callHandler(symbol)
    } else if (this.isHandled('ok')) {
      super.callOkHandler()
    } else {
      this.activate()
    }
  }

  override refresh() {
    this.clearCommandList()
    this.makeCommandList()
    this.createContents()
    super.refresh()
  }
}
