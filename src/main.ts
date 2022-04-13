import './modules' // 立刻初始化注册所有 class。如依赖 JsonEx 中读取，可能因循环引用导致丢失部分 class
import './core/JsExtensions'
// import {PluginManager} from './managers/PluginManager'
import {SceneManager} from './managers/SceneManager'
import {Scene_Boot} from './scenes/Scene_Boot'

// useless
// PluginManager.setup([])

window.onload = function() {
  SceneManager.run(Scene_Boot)
}
