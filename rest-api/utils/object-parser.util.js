/**
 * Helper module for parsing Objects
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 */
define(['vendor/lodash'], function (_) {
  'use strict'

  /**
   * Creates a new ObjectParser
   *
   * @class
   */
  function ObjectParser($data) {
    this._data = $data || {}
  }

  /**
   * Given a dot deliminated string set will create an object
   * based on the structure of the string with the desired value
   *
   * @param {[String]} $path - path indicating where value should be placed
   * @param {Mixed} $value - the value desired to be set at the location determined by path
   */
  ObjectParser.prototype.set = function ($path, $value) {
    if (!$path || $path === '') return void 0

    const _self = this
    const re = /[\$\w-|]+|\[\]|([^\[[\w]\]]|["'](.*?)['"])/g
    const pathList = $path.match(re)

    let parent = this._data
    let parentKey
    let grandParent = null
    let grandParentKey = null

    const addObj = function ($obj, $key, $data) {
      if ($key === '[]') {
        $obj.push($data)
      } else {
        $obj[$key] = $data
      }
    }

    while (pathList.length > 0) {
      parentKey = pathList.shift().replace(/["']/g, '')

      if (!isNaN(+parentKey) || parentKey === '[]') {
        if (!_.isArray(parent)) {
          parent = []
          addObj(grandParent, grandParentKey, parent)
        }
      } else if (_.isString(parentKey)) {
        if (!_.isObject(parent)) {
          parent = {}
          addObj(grandParent, grandParentKey, parent)
        }
      }

      grandParent = parent
      grandParentKey = parentKey
      parent = parent[parentKey]
    }

    addObj(grandParent, grandParentKey, $value)

    return this
  }

  /**
   * Returns the value defined by the path passed in
   *
   * @param  {String} $path - string leading to a desired value
   * @return {Mixed} - a value in an object
   */
  ObjectParser.prototype.get = function ($path) {
    const regex = /[\$\w-|]+|\[\]|([^\[[\w]\]]|["'](.*?)['"])/g

    let data = this._data

    if (!$path) return void 0

    const paths = $path.match(regex)

    while (data !== null && paths.length > 0) {
      if (data.propertyIsEnumerable(paths[0].replace(/"/g, ''))) {
        data = data[paths.shift().replace(/"/g, '')]
      } else {
        return undefined
      }
    }

    return data
  }

  ObjectParser.prototype.data = function ($data) {
    if (!_.isNil($data)) {
      this._data = $data
      return this
    }

    return this._data
  }

  /**
   * "Transposes" data receives flat data and returns structured
   *
   * @param  {Object} $data - Structured object
   * @return {ObjectParser} - An instance of a ObjectParser
   */
  ObjectParser.transpose = function ($flat) {
    var parser = new ObjectParser()

    for (var n in $flat) {
      if ($flat[n] !== undefined) {
        parser.set(n, $flat[n])
      }
    }

    return parser
  }

  /**
   * "Untransposes" data object opposite of transpose
   *
   * @param  {Mixed}  $structured - A Object or a ObjectParser
   * @return {Object} - Flat object
   */
  ObjectParser.untranspose = function ($structured = {}) {
    let structuredData = $structured._data || $structured

    const traverse = function ($data, $isIndex) {
      let result = []

      const createMapHandler = function ($name, $data) {
        return function ($item, $i) {
          let name = $name

          if (/\./.test($name)) name = '["' + name + '"]'

          $item.key.unshift(name + '.')

          return {
            key: $item.key,
            data: $item.data
          }
        }
      }

      for (let name in $data) {
        let modifiedName

        if ($isIndex) modifiedName = '[' + name + ']'
        else modifiedName = name

        if (
          _.isString($data[name]) ||
          _.isNumber($data[name]) ||
          $data[name] === null ||
          _.isBoolean($data[name]) ||
          _.isDate($data[name])
        ) {
          if (/\./.test(name)) modifiedName = '["' + name + '"]'
          result.push({
            key: [modifiedName],
            data: $data[name]
          })
        } else if (_.isArray($data[name])) {
          let subArray = traverse($data[name], true)
          result = result.concat(subArray.map(createMapHandler(modifiedName, $data)))
        } else if (_.isObject($data[name])) {
          var subObject = traverse($data[name], false)
          result = result.concat(subObject.map(createMapHandler(modifiedName, $data)))
        }
      }

      return result
    }

    var flatArray = traverse(structuredData, false)
    var flatObj = {}

    flatArray.every(function ($item) {
      for (var i = 0; i < $item.key.length - 1; i++) {
        var name = $item.key[i]
        var nextName = $item.key[i + 1]
        if (/^\[/.test(nextName)) {
          $item.key[i] = name.replace(/\.$/, '')
        }
      }

      flatObj[$item.key.join('')] = $item.data
      return true
    })
    return flatObj
  }

  return ObjectParser
})
