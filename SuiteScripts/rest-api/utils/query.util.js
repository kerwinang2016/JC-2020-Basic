/**
 * Helper module for building queries
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 * @author Benj Sicam
 */
define(['N/search', 'vendor/lodash'], function (search, _) {
  'use strict'

  const exports = {}

  /**
   * Helper function for building search filters
   *
   * @method
   * @param {Map} filterMap - The filter mapping/description
   * @param {Object} filters - The filters to apply as supplied from the REST API
   * @returns {search.Filter[]}
   */
  exports.getFilters = function (filterMap, filters = {}) {
    const searchFilters = []

    filterMap.forEach((value, key) => {
      var val;
      if(value.defaultValue){
        val = value.defaultValue;
      }else{
        val = _.get(filters, key)
        if (_.isEmpty(val)) return
      }
      const filterOptions = {
        name: value.field,
        operator: value.operator || search.Operator.IS,
        values: val
      }

      if (!_.isEmpty(value.join)) Object.assign(filterOptions, { join: value.join })

      searchFilters.push(search.createFilter(filterOptions))
    })

    return searchFilters
  }

  /**
   * Helper function for building search columns
   *
   * @method
   * @param {Map} modelMap - The model field mapping/description
   * @param {string} orderBy - The field to sort by as passed from the request
   * @returns {search.Column[]}
   */
  exports.getColumns = function (modelMap, orderBy = '') {
    const searchColumns = []

    let orderByField = `${orderBy}`.trim()
    let sortOrder = search.Sort.ASC

    if (orderByField.charAt(0) === '-' && !_.isEmpty(modelMap.get(orderByField.substr(1)))) {
      orderByField = _.get(modelMap.get(orderByField.substr(1)), 'field')
      sortOrder = search.Sort.DESC
    } else if (!_.isEmpty(orderByField)) {
      orderByField = _.get(modelMap.get(orderByField), 'field')
    }

    modelMap.forEach((value) => {
      let sort

      if (value.defaultSort && _.isEmpty(orderByField)) {
        sort = value.sort || search.Sort.ASC
      } else if (value.field === orderByField) {
        sort = sortOrder
      }

      const columnOptions = {
        name: value.field
      }

      if (!_.isEmpty(value.join)) Object.assign(columnOptions, { join: value.join })
      if (!_.isEmpty(sort)) Object.assign(columnOptions, { sort })

      searchColumns.push(search.createColumn(columnOptions))
    })

    return searchColumns
  }

  return exports
})
