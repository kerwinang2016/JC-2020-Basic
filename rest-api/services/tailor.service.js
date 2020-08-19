/**
 * Service module for tailor records
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 * @author Benj Sicam
 */
define([
  'N/runtime',
  'N/search',
  'N/record',
  'N/error',
  'N/log',
  'vendor/lodash',
  //'services/mocker',
  'utils/objectMapper',
  'utils/query'
], function (runtime, search, record, error, log, _,
  //mocker,
  objectMapper, queryUtils) {
  'use strict'

  const MODEL = new Map([
    ['id', { field: 'internalid', type: 'integer' }],
    ['name', { field: 'entityid' }],
    ['email', { field: 'email' }],
    ['phone', { field: 'phone' }]
  ])
  const FILTER_MAP = new Map([
    ['tl-name', { field: 'entityid', operator: search.Operator.CONTAINS }],
    ['tl-email', { field: 'email', operator: search.Operator.CONTAINS }],
    ['parent', { field: 'parent' }]
  ])

   function getColumns(){
    var searchColumns = [];
    searchColumns.push(search.createColumn({name:'internalid'}));
    searchColumns.push(search.createColumn({name:'entityid'}));
    searchColumns.push(search.createColumn({name:'email'}));
    searchColumns.push(search.createColumn({name:'phone'}));
    return searchColumns;
  }
   function getFilters(user){
    var searchFilters = [];
    searchFilters.push(search.createFilter({
      name:'internalid',
      operator: search.Operator.ANYOF,
      values: user
    }));
    return searchFilters;
  }
  const exports = {}

  /**
   * Searches tailor records and returns the search results
   *
   * @param {Object} [filters] - Filters to use for the search
   * @param {number} [offset] - Page offset to use for the search
   * @param {number} [limit] - Page limit to use for the search
   * @param {string} [orderBy] - Field to sort the search by
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.query = function (code, name, user){//filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {

    const result = { data: [] }
    var searchColumns = getColumns();
    var searchFilters = getFilters(user);
    var start = 0;
    var limit = 1000;
    var itemSearchCount = search.create({
        type: search.Type.CUSTOMER,
        filters: searchFilters,
        columns: searchColumns
      }).runPaged().count;
      result.length = itemSearchCount;
    var pages = Math.ceil(itemSearchCount/1000);

      var itemSearch = search.create({
        type: search.Type.CUSTOMER,
        filters: searchFilters,
        columns: searchColumns
      })
      var resultSet = itemSearch.run();
      var results = resultSet.getRange({
        start: start,
        end: start + limit
      });
      results.forEach((res) => {
        result.data.push(objectMapper.buildRestObject(MODEL, res))
      });
    return result
  }

  /**
   * Retrieves and returns a tailor record
   *
   * @function
   * @param {number} id - The id of the record to load
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.read = function (id, filters, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'TailorService#read.call',
      details: {
        user,
        id,
        isDryRun
      }
    })

    let result = {}

    if (isDryRun) {
      //result = mocker.mockTailor({ id })
    } else {
      const tailor = record.load({
        type: record.Type.CUSTOMER,
        id:id
      })
      log.debug('parent',tailor.getValue('parent'));
      log.debug('id',tailor.id);
      if (tailor.getValue('parent') != filters.userid && tailor.id != filters.userid) {
        return "{status:'error', name:'NOT_FOUND', message: 'Tailor with id "+id+" not found.'}";
        // throw error.create({
        //   name: 'NOT_FOUND',
        //   message: `Tailor with id ${id} not found.`,
        //   notifyOff: true
        // })
      }
      log.debug('HELLO');
      result = objectMapper.buildRestObject(MODEL, tailor);
      log.debug('HELLO1');
    }

    log.debug({
      title: 'TailorService#read.result',
      details: result
    })

    return result
  }

  return exports
})
