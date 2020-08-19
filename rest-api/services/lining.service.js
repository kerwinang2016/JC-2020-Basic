/**
 * Service module for lining records
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

  const TYPE = 'customrecord_factory_lining_fabrics'
  const MODEL = new Map([
    ['id', { field: 'internalid', type: 'integer' }],
    ['number', { field: 'custrecord_flf_ftno' }],
    ['code', { field: 'custrecord_flf_ftcode', defaultSort: true }],
    ['stock', { field: 'custrecord_flf_ftstock', type: 'number' }],
    ['status', { field: 'custrecord_flf_ftstatus', mapToText: true }]
  ])
  const FILTER_MAP = new Map([
    ['ln-number', { field: 'custrecord_flf_ftno', operator: search.Operator.CONTAINS }],
    ['ln-code', { field: 'custrecord_flf_ftcode', operator: search.Operator.CONTAINS }]
  ])
  function getColumns(){
   var searchColumns = [];
   searchColumns.push(search.createColumn({name:'internalid'}));
   searchColumns.push(search.createColumn({name:'custrecord_flf_ftno'}));
   searchColumns.push(search.createColumn({name:'custrecord_flf_ftcode'}));
   searchColumns.push(search.createColumn({name:'custrecord_flf_ftstock'}));
   searchColumns.push(search.createColumn({name:'custrecord_flf_ftstatus'}));
   return searchColumns;
 }
  function getFilters(code){
     var searchFilters = [];
     if(code && code != ''){
       searchFilters.push(search.createFilter({
         name: 'custrecord_flf_ftcode',
         operator: search.Operator.CONTAINS,
         values: code
       }));
     }
     searchFilters.push(search.createFilter({
       name:'isinactive',
       operator: search.Operator.IS,
       values: false
     }));
     return searchFilters;
   }
  const exports = {}

  /**
   * Searches lining records and returns the search results
   *
   * @param {Object} [filters] - Filters to use for the search
   * @param {number} [offset] - Page offset to use for the search
   * @param {number} [limit] - Page limit to use for the search
   * @param {string} [orderBy] - Field to sort the search by
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.query = function (code){
    //filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {
    const result = { data: [] }
    var searchColumns = getColumns();
    var searchFilters = getFilters(code);

      var start = 0;
      var limit = 1000;
      var itemSearchCount = search.create({
          type: TYPE,
          filters: searchFilters,//!_.isEmpty(filters) ? queryUtils.getFilters(FILTER_MAP, filters) : undefined,
          columns: searchColumns//queryUtils.getColumns(MODEL)//, orderBy)
        }).runPaged().count;
        result.length = itemSearchCount;
      var pages = Math.ceil(itemSearchCount/1000);
      for(var i=0;i<pages;i++){
        var itemSearch = search.create({
          type: TYPE,
          filters: searchFilters,//!_.isEmpty(filters) ? queryUtils.getFilters(FILTER_MAP, filters) : undefined,
          columns: searchColumns//queryUtils.getColumns(MODEL)//, orderBy)
        })
        var resultSet = itemSearch.run();
        var results = resultSet.getRange({
          start: start,
          end: start + limit
        });
        results.forEach((res) => {
          result.data.push(objectMapper.buildRestObject(MODEL, res))
        });
        start+= limit;
      }
    return result
  }

  /**
   * Retrieves and returns a lining record
   *
   * @function
   * @param {number} id - The id of the record to load

   * @returns {Object}
   */
  exports.read = function (id, filters) {
    let result = {}

      const lining = record.load({
        type: TYPE,
        id:id
      })

      result = objectMapper.buildRestObject(MODEL, lining)

    log.debug({
      title: 'LiningService#read.result',
      details: result
    })

    return result
  }

  return exports
})
