/**
 * Helper module for mapping/transposing to and from NetSuite records and RESTlet objects
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 * @author Benj Sicam
 */
define(['N/log', 'vendor/lodash'], function (log, _) {
  'use strict'

  const TYPE_CONVERSIONS = new Map([
    ['integer', _.toSafeInteger],
    ['number', _.toNumber],
    ['string', _.toString],
    [
      'json',
      (val) => {
        if (_.isEmpty(val)) return val

        if (_.isPlainObject(val)) return JSON.stringify(val)
        else return JSON.parse(val)
      }
    ]
  ])

  const exports = {}

  /**
   * Helper function for mapping/transposing NetSuite record sublists to RESTlet objects
   *
   * @method
   * @param {String} sublist - The sublist id
   * @param {Map} modelMap - The model field mapping/description
   * @param {record.Record | search.Result} record - The record or search result instance to use for mapping
   * @returns {Object}
   */
  const buildSublistRestObject = function (sublistId, fieldMap, record) {
    const lines = []
    const lineCount = record.getLineCount(sublistId)

    _.times(lineCount, (line) => {
      const result = {}

      fieldMap.forEach((value, key) => {
        let val = value.mapToText
          ? record.getSublistText({ sublistId, fieldId: value.field, line })
          : record.getSublistValue({ sublistId, fieldId: value.field, line })

        if (value.type && TYPE_CONVERSIONS.get(value.type)) {
          val = TYPE_CONVERSIONS.get(value.type)(val)
        } else {
          val = TYPE_CONVERSIONS.get('string')(val)
        }

        _.set(result, key, val)
      })

      lines.push(result)
    })

    return lines
  }

  /**
   * Helper function for mapping/transposing RESTlet sublists to NetSuite record sublists
   *
   * @method
   * @param {String} sublist - The sublist id
   * @param {Map} modelMap - The model field mapping/description
   * @param {record.Record | search.Result} record - The record or search result instance to use for mapping
   * @param {Object[]} - A collection of values to be set on the sublist
   * @returns {Object}
   */
  const buildSublist = function (sublistId, fieldMap, record, values) {
    _.forEach(values, (val, index) => {
      fieldMap.forEach((value, key) => {
        let fieldValue = _.get(val, key)

        if (!_.isEmpty(fieldValue) && value.type && value.type === 'json')
          fieldValue = JSON.stringify(fieldValue)

        if (value.mapToText) {
          record.setSublistText({
            sublistId,
            fieldId: value.field,
            line: index,
            value: fieldValue
          })
        } else {
          record.setSublistValue({
            sublistId,
            fieldId: value.field,
            line: index,
            value: fieldValue
          })
        }
      })
    })
  }

  /**
   * Helper function for mapping/transposing NetSuite records to RESTlet objects
   *
   * @method
   * @param {Map} modelMap - The model field mapping/description
   * @param {record.Record | search.Result} record - The record or search result instance to use for mapping
   * @returns {Object}
   */
  exports.buildRestObject = function (modelMap, record) {
    const result = {}

    modelMap.forEach((value, key) => {

      if(value.show == false){
        //do not add the columns that have show false
        log.debug('has show only');
      }
      else{
        if (_.isEmpty(value.sublist)) {
          var val;

          if(value.field == 'internalid'){
            val = record.id;
          }else{
            val = value.mapToText
              ? record.getText({ fieldId: value.field, name:value.field})
              : record.getValue({ fieldId: value.field, name:value.field})
            if(value.stripCode == true){
              var s1 = val.split('(');
              if(s1.length > 1){
                val = s1[1].split(')')[0];
              }
            }
          }
          if (value.type && TYPE_CONVERSIONS.get(value.type)) {
            val = TYPE_CONVERSIONS.get(value.type)(val)
          } else {
            val = TYPE_CONVERSIONS.get('string')(val)
          }

          _.set(result, key, val)
        } else {
          _.set(result, key, buildSublistRestObject(value.sublist, value.fields, record))
        }
      }
    })

    return result
  }

  /**
   * Helper function for mapping/transposing RESTlet objects to NetSuite records
   *
   * @method
   * @param {Map} modelMap - The model field mapping/description
   * @param {record.Record} record - The record to use for mapping
   * @param {Object} restObject - The rest object to use for mapping
   * @returns {record.Record}
   */
  exports.buildRecordObject = function (modelMap, record, restObject) {
    modelMap.forEach((value, key) => {
      if (_.isEmpty(value.sublist)) {
        if(value.mapToText && key !== 'id'){
          record.setText({ fieldId: value.field, value: _.get(restObject, key, '') });
        }else{
          if(value.jsontostring){
            record.setValue({ fieldId: value.field, value: JSON.stringify(_.get(restObject, key, '')) })
          }else{
            if(value.listmap){
              var found = _.find(value.listmap,function(o){ return o.name == _.get(restObject, key, '');});
              if(found){
                  record.setValue({ fieldId: value.field, value: found.value });
              }
            }else{
              record.setValue({ fieldId: value.field, value: _.get(restObject, key, '') })
            }
          }
        }
      } else {
        buildSublist(value.sublist, value.fields, record, _.get(restObject, key, []))
      }
    })

    return record
  }

  return exports
})
