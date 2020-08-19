/**
 * Service module for tailor client records
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

  const TYPE = 'customrecord_sc_tailor_client'
  const MODEL = new Map([
    ['id', { field: 'internalid', type: 'integer' }],
    ['email', { field: 'custrecord_tc_email', defaultSort: true }],
    ['firstName', { field: 'custrecord_tc_first_name' }],
    ['lastName', { field: 'custrecord_tc_last_name' }],
    ['phone', { field: 'custrecord_tc_phone' }],
    ['dateOfBirth', { field: 'custrecord_tc_dob' }],
    ['company', { field: 'custrecord_tc_company' }],
    ['address1', { field: 'custrecord_tc_addr1' }],
    ['address2', { field: 'custrecord_tc_addr2' }],
    ['city', { field: 'custrecord_tc_city' }],
    ['state', { field: 'custrecord_tc_state' }],
    ['country', { field: 'custrecord_tc_country' }],
    ['zipCode', { field: 'custrecord_tc_zip' }],
    ['notes', { field: 'custrecord_tc_notes' }]
  ])
  const FILTER_MAP = new Map([
    ['cl-email', { field: 'custrecord_tc_email', operator: search.Operator.CONTAINS }],
    ['cl-first-name', { field: 'custrecord_tc_first_name', operator: search.Operator.CONTAINS }],
    ['cl-last-name', { field: 'custrecord_tc_last_name', operator: search.Operator.CONTAINS }],
    ['user', { field: 'custrecord_tc_tailor', operator: search.Operator.ANYOF }]
  ])
  function getColumns(){
    var searchColumns = [];
    searchColumns.push(search.createColumn({name:'internalid', sort: search.Sort.DESC}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_email'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_first_name'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_last_name'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_phone'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_dob'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_company'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_addr1'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_addr2'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_city'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_state'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_country'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_zip'}));
    searchColumns.push(search.createColumn({name:'custrecord_tc_notes'}));
    return searchColumns;
  }
   function getFilters(name, user){
    var searchFilters = [];
    if(name && name != ''){
      var splitName = name.split(' ');
      if(splitName.length > 1){
        searchFilters.push(search.createFilter({
          name: 'formulatext',
          operator: search.Operator.CONTAINS,
          values: name.toLowerCase(),
          formula: "CONCAT(CONCAT(LOWER({custrecord_tc_first_name}), ' '),LOWER({custrecord_tc_last_name}))"
        }));
      }else{
        searchFilters.push(search.createFilter({
          name: 'formulatext',
          operator: search.Operator.CONTAINS,
          values: name.toLowerCase(),
          formula: "CONCAT(CONCAT(LOWER({custrecord_tc_first_name}), ' '),LOWER({custrecord_tc_last_name}))"
        }));
      }
    }
    searchFilters.push(search.createFilter({
      name:'isinactive',
      operator: search.Operator.IS,
      values: false
    }));
    searchFilters.push(search.createFilter({
      name:'custrecord_tc_tailor',
      operator: search.Operator.IS,
      values: user
    }));
    return searchFilters;
  }
  const exports = {}

  /**
   * Searches tailor client records and returns the search results
   *
   * @param {Object} [filters] - Filters to use for the search
   * @param {number} [offset] - Page offset to use for the search
   * @param {number} [limit] - Page limit to use for the search
   * @param {string} [orderBy] - Field to sort the search by
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.query = function (code,name,user){
    //filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {

    const result = { data: [] }
    var searchColumns = getColumns();
    var searchFilters = getFilters(name, user);
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
   * Retrieves and returns a tailor client record
   *
   * @function
   * @param {number} id - The id of the record to load
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.read = function (id, filters, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'ClientService#read.call',
      details: {
        user,
        id,
        isDryRun
      }
    })

    let result = {}

    if (isDryRun) {
      //result = mocker.mockClient({ id })
    } else {
      const client = record.load({
        type: TYPE,
        id:id
      })

      if (+client.getValue('custrecord_tc_tailor') != filters.userid) {
        return "{status:'error', name:'NOT_FOUND', message: 'Client with id "+id+" not found.'}";
        // throw error.create({
        //   name: 'NOT_FOUND',
        //   message: `Tailor with id ${id} not found.`,
        //   notifyOff: true
        // })
      }

      result = objectMapper.buildRestObject(MODEL, client)
    }

    log.debug({
      title: 'ClientService#read.result',
      details: result
    })

    return result
  }

  /**
   * Creates a tailor client record and returns the created record
   *
   * @function
   * @param {Object} data - The map of values to use to create/update a record
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.create = function (data = {}) {
    const user = runtime.getCurrentUser().id
    let result = {}

      let clientrecord = objectMapper.buildRecordObject(
        MODEL,
        record.create({
          type: TYPE
        }),
        { ...data}
      )

      clientrecord.setValue('custrecord_tc_tailor', data.tailor)

      const id = clientrecord.save({ enableSourcing: true })

      result = objectMapper.buildRestObject(MODEL, clientrecord)
      result = {
        ...result,
        id
      }

    log.debug({
      title: 'ClientService#create.result',
      details: result
    })

    return result
  }

  /**
   * Updates an existing tailor client record and returns the updated record
   *
   * @function
   * @param {number} id - The id
   * @param {Object} data - The map of values to use to create/update a record
   * @returns {Object}
   */
  exports.update = function (user, data = {}) {
    let result = {}
      const updateData = _.omit(data, ['user'])

      const client = record.load({
        type: TYPE,
        id:data.id
      });
      objectMapper
        .buildRecordObject(
          MODEL,
          client,
          updateData
        )
        .save({ enableSourcing: true })

      result = objectMapper.buildRestObject(MODEL, client)


    log.debug({
      title: 'ClientService#update.result',
      details: result
    })

    return result
  }

  return exports
})
