/**
 * Service module for fabric/item records
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 * @author Benj Sicam
 */
define([
  'N/search',
  'N/record',
  'N/log',
  'vendor/lodash',
  //'services/mocker',
  'utils/objectMapper',
  'utils/query'
], function (search, record, log, _,
  //mocker,
  objectMapper, queryUtils) {
  'use strict'

  const MODEL = new Map([
    ['id', { field: 'internalid', type: 'integer' }],
    ['name', { field: 'displayname', defaultSort: true }],
    ['vendor', { field: 'vendorname' }],
    ['stock', { field: 'custitem_ftorderstock', type: 'number' }],
    ['status', { field: 'custitem_ftstatus', mapToText: true }]
  ])
  const FILTER_MAP = new Map([
    ['fb-name', { field: 'displayname', operator: search.Operator.CONTAINS }],
    ['fb-vendor', { field: 'vendorname', operator: search.Operator.CONTAINS }]
  ])

  const exports = {}

  /**
   * Searches fabric records and returns the search results
   *
   * @param {Object} [filters] - Filters to use for the search
   * @param {number} [offset] - Page offset to use for the search
   * @param {number} [limit] - Page limit to use for the search
   * @param {string} [orderBy] - Field to sort the search by
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.query = function (filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {
    log.debug({
      title: 'FabricService#query.call',
      details: {
        filters,
        offset,
        limit,
        orderBy,
        isDryRun
      }
    })

    const result = { offset, limit, data: [] }
    try{
    if (isDryRun) {
      //_.times(limit, () => result.data.push(mocker.mockFabric()))
    } else {
      search
        .create({
          type: search.Type.NON_INVENTORY_ITEM,
          filters: !_.isEmpty(filters) ? queryUtils.getFilters(FILTER_MAP, filters) : undefined,
          columns: queryUtils.getColumns(MODEL, orderBy)
        })
        .run()
        .getRange({
          start: offset,
          end: offset + limit
        })
        .forEach((res) => result.data.push(objectMapper.buildRestObject(MODEL, res)))
    }
  }catch(e){
    log.debug({
      title: 'error',
      details: JSON.stringify(e)
    })
  }
    log.debug({
      title: 'FabricService#query.result',
      details: result
    })

    return result
  }

  /**
   * Retrieves and returns a fabric record
   *
   * @function
   * @param {number} id - The id of the record to load
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.read = function (id, filters, isDryRun = true) {
    log.debug({
      title: 'FabricService#read.call',
      details: {
        id,
        isDryRun
      }
    })

    let result = {}

    if (isDryRun) {
      //result = mocker.mockFabric({ id })
    } else {
      const fabric = record.load({
        type: record.Type.NON_INVENTORY_ITEM,
        id:id
      })

      result = objectMapper.buildRestObject(MODEL, fabric)
    }

    log.debug({
      title: 'FabricService#read.result',
      details: result
    })

    return result
  }

  return exports
})
