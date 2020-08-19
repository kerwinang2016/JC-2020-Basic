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
    ['name', { field: 'displayname', defaultSort: true, stripCode: true }],
    ['vendor', { field: 'othervendor', mapToText: true, operator:'anyOf',defaultValue:'[17,671]' }],
    ['stock', { field: 'custitem_ftorderstock', type: 'number' }],
    ['status', { field: 'custitem_ftstatus', mapToText: true }],
    ['stockmessage', { field: 'outofstockmessage' }],
    ['checkstockmessage', { field: 'custitem_checkstockmessage' }],
    ['isinactive', {field: 'isinactive', defaultValue:false, show:false}],
    ['isonline', {field: 'isonline', defaultValue:true, show:false }],
    ['isserviceitem', {field: 'custitem_jerome_cmt_serviceitem', defaultValue:false, show:false}]
  ])
  const FILTER_MAP = new Map([
    ['fb-name', { field: 'displayname', operator: search.Operator.CONTAINS }],
    ['fb-vendor', { field: 'vendorname', operator: search.Operator.CONTAINS }]
  ])

  const exports = {}
   function getColumns(){
    var searchColumns = [];
    searchColumns.push(search.createColumn({name:'internalid'}));
    searchColumns.push(search.createColumn({name:'displayname'}));
    searchColumns.push(search.createColumn({name:'othervendor'}));
    searchColumns.push(search.createColumn({name:'custitem_ftorderstock'}));
    searchColumns.push(search.createColumn({name:'custitem_ftstatus'}));
    searchColumns.push(search.createColumn({name:'custitem_checkstockmessage'}));
    searchColumns.push(search.createColumn({name:'outofstockmessage'}));
    return searchColumns;
  }
   function getFilters(code){
    var searchFilters = [];
    if(code && code != ''){
      searchFilters.push(search.createFilter({
        name: 'displayname',
        operator: search.Operator.CONTAINS,
        values: code
      }));
    }
    searchFilters.push(search.createFilter({
      name:'isinactive',
      operator: search.Operator.IS,
      values: false
    }));
    searchFilters.push(search.createFilter({
      name:'isonline',
      operator: search.Operator.IS,
      values: true
    }));
    searchFilters.push(search.createFilter({
      name:'custitem_jerome_cmt_serviceitem',
      operator: search.Operator.IS,
      values: false
    }));
    searchFilters.push(search.createFilter({
      name:'othervendor',
      operator: search.Operator.ANYOF,
      values: [17,671]
    }));
    return searchFilters;
  }
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
  exports.query = function (code = ''){// (filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {

    const result = { data: [] };
    var searchColumns = getColumns();
    var searchFilters = getFilters(code);
    try{
      var start = 0;
      var limit = 1000;
      var itemSearchCount = search.create({
          type: search.Type.NON_INVENTORY_ITEM,
          filters: searchFilters,//!_.isEmpty(filters) ? queryUtils.getFilters(FILTER_MAP, filters) : undefined,
          columns: searchColumns//queryUtils.getColumns(MODEL)//, orderBy)
        }).runPaged().count;
        result.length = itemSearchCount;
      var pages = Math.ceil(itemSearchCount/1000);
      for(var i=0;i<pages;i++){
        var itemSearch = search.create({
          type: search.Type.NON_INVENTORY_ITEM,
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
