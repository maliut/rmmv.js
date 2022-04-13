import {cloneDeep} from 'lodash-es'
import {moduleMap} from '../modules'

/**
 * The static class that handles JSON with object information.
 *
 * @class JsonEx
 */
export class JsonEx {

  /**
   * The maximum depth of objects.
   *
   * @static
   * @property maxDepth
   * @type Number
   * @default 100
   */
  static maxDepth = 100

  private static _id = 1

  private static _generateId() {
    return JsonEx._id++
  }

  /**
   * Converts an object to a JSON string with object information.
   *
   * @static
   * @method stringify
   * @param {Object} object The object to be converted
   * @return {String} The JSON string
   */
  static stringify(object) {
    const circular = []
    JsonEx._id = 1
    const json = JSON.stringify(this._encode(object, circular, 0))
    this._cleanMetadata(object)
    this._restoreCircularReference(circular)

    return json
  }

  private static _restoreCircularReference(circulars) {
    circulars.forEach(function (circular) {
      const key = circular[0]
      const value = circular[1]
      const content = circular[2]

      value[key] = content
    })
  }

  /**
   * Parses a JSON string and reconstructs the corresponding object.
   *
   * @static
   * @method parse
   * @param {String} json The JSON string
   * @return {Object} The reconstructed object
   */
  static parse(json: string) {
    const circular = []
    const registry = {}
    const contents = this._decode(JSON.parse(json), circular, registry)
    this._cleanMetadata(contents)
    this._linkCircularReference(contents, circular, registry)

    return contents
  }

  private static _linkCircularReference(contents, circulars, registry) {
    circulars.forEach(function (circular) {
      const key = circular[0]
      const value = circular[1]
      const id = circular[2]

      value[key] = registry[id]
    })
  }

  private static _cleanMetadata(object) {
    if (!object) return

    delete object['@']
    delete object['@c']

    if (typeof object === 'object') {
      Object.keys(object).forEach(function (key) {
        const value = object[key]
        if (typeof value === 'object') {
          JsonEx._cleanMetadata(value)
        }
      })
    }
  }

  /**
   * Makes a deep copy of the specified object.
   *
   * @static
   * @method makeDeepCopy
   * @param {Object} object The object to be copied
   * @return {Object} The copied object
   */
  static makeDeepCopy<T>(object: T) {
    return cloneDeep<T>(object)
  }

  private static _encode(value, circular, depth = 0) {
    if (++depth >= this.maxDepth) {
      throw new Error('Object too deep')
    }
    const type = Object.prototype.toString.call(value)
    if (type === '[object Object]' || type === '[object Array]') {
      value['@c'] = JsonEx._generateId()

      const constructorName = this._getConstructorName(value)
      if (constructorName !== 'Object' && constructorName !== 'Array') {
        value['@'] = constructorName
      }
      for (const key in value) {
        // eslint-disable-next-line no-prototype-builtins
        if (value.hasOwnProperty(key) && !key.match(/^@./)) {
          if (value[key] && typeof value[key] === 'object') {
            if (value[key]['@c']) {
              circular.push([key, value, value[key]])
              value[key] = {'@r': value[key]['@c']}
            } else {
              value[key] = this._encode(value[key], circular, depth + 1)

              if (value[key] instanceof Array) {
                //wrap array
                circular.push([key, value, value[key]])

                value[key] = {
                  '@c': value[key]['@c'],
                  '@a': value[key]
                }
              }
            }
          } else {
            value[key] = this._encode(value[key], circular, depth + 1)
          }
        }
      }
    }
    depth--
    return value
  }

  private static _decode(value, circular, registry) {
    const type = Object.prototype.toString.call(value)
    if (type === '[object Object]' || type === '[object Array]') {
      registry[value['@c']] = value

      if (value['@']) {
        const constructor = moduleMap[value['@']]
        if (constructor) {
          // @ts-ignore
          value = this._resetPrototype(value, constructor.prototype)
        }
      }
      for (const key in value) {
        // eslint-disable-next-line no-prototype-builtins
        if (value.hasOwnProperty(key)) {
          if (value[key] && value[key]['@a']) {
            //object is array wrapper
            const body = value[key]['@a']
            body['@c'] = value[key]['@c']
            value[key] = body
          }
          if (value[key] && value[key]['@r']) {
            //object is reference
            circular.push([key, value, value[key]['@r']])
          }
          value[key] = this._decode(value[key], circular, registry)
        }
      }
    }
    return value
  }

  private static _getConstructorName(value) {
    let name = value.constructor.name
    if (name === undefined) {
      const func = /^\s*function\s*([A-Za-z0-9_$]*)/
      name = func.exec(value.constructor)[1]
    }
    return name
  }

  private static _resetPrototype(value, prototype) {
    if (Object.setPrototypeOf !== undefined) {
      Object.setPrototypeOf(value, prototype)
    } else if ('__proto__' in value) {
      value.__proto__ = prototype
    } else {
      const newValue = Object.create(prototype)
      for (const key in value) {
        // eslint-disable-next-line no-prototype-builtins
        if (value.hasOwnProperty(key)) {
          newValue[key] = value[key]
        }
      }
      value = newValue
    }
    return value
  }
}
