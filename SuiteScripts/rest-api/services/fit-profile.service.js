/**
 * Service module for fit profile records
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
  'vendor/faker',
  'vendor/lodash',
  //'services/mocker',
  'utils/objectMapper',
  'utils/query'
], function (runtime, search, record, error, log, faker, _,
  //mocker,
  objectMapper, queryUtils) {
  'use strict'

  const TYPE = 'customrecord_sc_fit_profile'
  const MODEL = new Map([
    ['id', { field: 'internalid', type: 'integer' }],
    ['name', { field: 'name', defaultSort: true }],
    ['clientid', { field: 'custrecord_fp_client'}],
    ['productType', { field: 'custrecord_fp_product_type', listmap:[
      {name:'Jacket',value:3},
      {name:'Trouser',value:4},
      {name:'Waistcoat',value:6},
      {name:'Overcoat',value:8},
      {name:'Shirt',value:7},
      {name:'3-Piece-Suit',value:9},
      {name:'2-Piece-Suit',value:10},
      {name:'Short-Sleeves-Shirt',value:12},
      {name:'Trenchcoat',value:13},
      {name:'Ladies-Jacket',value:14},
      {name:'Ladies-Pants',value:15},
      {name:'Ladies-Skirt',value:16},
      {name:'L-2PC-Skirt',value:17},
      {name:'L-3PC-Suit',value:18},
      {name:'L-2PC-Pants',value:19},
      {name:'Morning-Coat',value:27},
      {name:'Shorts',value:28}
    ]}],
    ['blockValue', { field: 'custrecord_fp_block_value' }],
    ['measurementType', { field: 'custrecord_fp_measure_type',listmap:[
      {name:'Block',value:1},
      {name:'Body',value:2}
    ]}],
    ['measurementValues', { field: 'custrecord_fp_measure_value', jsontostring:true}]
  ])
  const FILTER_MAP = new Map([
    ['fp-client', { field: 'custrecord_fp_client' }],
    ['fp-product-type', { field: 'custrecord_fp_product_type' }],
    ['fp-measurement-type', { field: 'custrecord_fp_measure_type' }],
    ['tailor', { field: 'custrecord_tc_tailor', join: 'custrecord_fp_client' }]
  ])

   function getColumns(){
    var searchColumns = [];
    searchColumns.push(search.createColumn({name:'internalid', sort: search.Sort.DESC}));
    searchColumns.push(search.createColumn({name:'name'}));
    searchColumns.push(search.createColumn({name:'custrecord_fp_client'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_first_name',join:'custrecord_fp_client'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_last_name',join:'custrecord_fp_client'}));
    searchColumns.push(search.createColumn({name:'custrecord_fp_product_type'}));
    searchColumns.push(search.createColumn({name:'custrecord_fp_block_value'}));
    searchColumns.push(search.createColumn({name:'custrecord_fp_measure_type'}));
    searchColumns.push(search.createColumn({name:'custrecord_fp_measure_value'}));
    return searchColumns;
  }
   function getFilters(code, user){
    var searchFilters = [];
    if(code && code != ''){
      searchFilters.push(search.createFilter({
        name: 'name',
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
      name:'custrecord_tc_tailor',
      join: 'custrecord_fp_client',
      operator: search.Operator.ANYOF,
      values: user
    }));
    return searchFilters;
  }
  const exports = {}

  /**
   * Searches fit profile records and returns the search results
   *
   * @param {Object} [filters] - Filters to use for the search
   * @param {number} [offset] - Page offset to use for the search
   * @param {number} [limit] - Page limit to use for the search
   * @param {string} [orderBy] - Field to sort the search by
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.query = function (code, name, user){
    //filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {
    const result = { data: [] }
    var searchColumns = getColumns();
    var searchFilters = getFilters(code, user);
    var start = 0;
    var limit = 1000;
    var itemSearchCount = search.create({
        type: TYPE,
        filters: searchFilters,
        columns: searchColumns
      }).runPaged().count;
      result.length = itemSearchCount;
    var pages = Math.ceil(itemSearchCount/1000);
    for(var i=0;i<pages;i++){
      var itemSearch = search.create({
        type: TYPE,
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
      start+= limit;
    }
    return result
  }

  /**
   * Retrieves and returns a fit profile record
   *
   * @function
   * @param {number} id - The id of the record to load
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.read = function (id, filters, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'FitProfileService#read.call',
      details: {
        user,
        id,
        isDryRun
      }
    })

    let result = {}

    if (isDryRun) {
      //result = mocker.mockFitProfile({ id })
    } else {
      const fitProfile = record.load({
        type: TYPE,
        id: id
      })

      const tailorClient = search.lookupFields({
        id: fitProfile.getValue({ fieldId: 'custrecord_fp_client' }),
        type: 'customrecord_sc_tailor_client',
        columns: 'custrecord_tc_tailor'
      })
      if (tailorClient.custrecord_tc_tailor[0].value != filters.user) {
        return "{status:'error', name:'NOT_FOUND', message: 'Fit profile with id "+id+" not found.'}";
        // throw error.create({
        //   name: 'NOT_FOUND',
        //   message: `Fit profile with id ${id} not found.`,
        //   notifyOff: true
        // })
      }

      result = objectMapper.buildRestObject(MODEL, fitProfile)
    }

    log.debug({
      title: 'FitProfileService#read.result',
      details: result
    })

    return result
  }

  /**
   * Creates a fit profile record and returns the created record
   *
   * @function
   * @param {Object} data - The map of values to use to create/update a record

   * @returns {Object}
   */
  exports.create = function (data = {}) {

    let result = {}
    const tailorClient = search.lookupFields({
        id: data.clientid,
        type: 'customrecord_sc_tailor_client',
        columns: 'custrecord_tc_tailor'
      })
      if (tailorClient.custrecord_tc_tailor[0].value != data.tailor) {
        return "{status:'error', name:'NOT_FOUND', message: 'Client with id "+data.clientid+" not found.'}";
        // throw error.create({
        //   name: 'NOT_FOUND',
        //   message: `Client with id ${data.client} not found.`,
        //   notifyOff: true
        // })
      }

      const fitprofilerecord = objectMapper.buildRecordObject(
        MODEL,
        record.create({
          type: TYPE
        }),
        data
      )

      const id = fitprofilerecord.save({ enableSourcing: true })

      result = objectMapper.buildRestObject(MODEL, fitprofilerecord)
      result = {
        ...result,
        id
      }


    log.debug({
      title: 'FitProfileService#create.result',
      details: result
    })

    return result
  }

  /**
   * Updates an existing fit profile record and returns the updated record
   *
   * @function
   * @param {number} id - The id
   * @param {Object} data - The map of values to use to create/update a record

   * @returns {Object}
   */
  exports.update = function (user, data = {}) {

    let result = {}

      const fitProfile = record.load({
        type: TYPE,
        id:data.id
      })

      const tailorClient = search.lookupFields({
        id: fitProfile.getValue({ fieldId: 'custrecord_fp_client' }),
        type: 'customrecord_sc_tailor_client',
        columns: 'custrecord_tc_tailor'
      })

      if (tailorClient.custrecord_tc_tailor[0].value != data.tailor) {
        return "{status:'error', name:'NOT_FOUND', message: 'Fit profile with id "+data.id+" not found.'}";
        // throw error.create({
        //   name: 'NOT_FOUND',
        //   message: `Fit profile with id ${id} not found.`,
        //   notifyOff: true
        // })
      }

      const recordid = objectMapper
        .buildRecordObject(MODEL, fitProfile, data)
        .save({ enableSourcing: true })

      result = objectMapper.buildRestObject(MODEL, fitProfile)
    log.debug({
      title: 'FitProfileService#update.result',
      details: result
    })

    return result
  }

  return exports
})
