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
  exports.query = function (filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {
    //const user = runtime.getCurrentUser().id

    log.debug({
      title: 'ClientService#query.call',
      details: {
        //user,
        filters,
        offset,
        limit,
        orderBy,
        isDryRun
      }
    })

    const result = { offset, limit, data: [] }

    if (isDryRun) {
      //_.times(limit, () => result.data.push(mocker.mockClient()))
    } else {
      try{
      search
        .create({
          type: TYPE,
          filters: !_.isEmpty(filters)
            ? queryUtils.getFilters(FILTER_MAP, { ...filters })
            : queryUtils.getFilters(FILTER_MAP),
          columns: queryUtils.getColumns(MODEL, orderBy)
        })
        .run()
        .getRange({
          start: offset,
          end: offset + limit
        })
        .forEach((res) => result.data.push(objectMapper.buildRestObject(MODEL, res)))
      }catch(e){
        log.debug('error',e.message)
      }
    }

    log.debug({
      title: 'ClientService#query.result',
      details: result
    })

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

      if (+client.getValue('custrecord_tc_tailor') != filters.user) {
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
  exports.create = function (data = {}, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'ClientService#create.call',
      details: {
        user,
        data,
        isDryRun
      }
    })

    let result = {}

    if (isDryRun) {
      result = { id: faker.random.number(), ...data }
    } else {
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
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.update = function (id, data = {}, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'ClientService#update.call',
      details: {
        id,
        user,
        data,
        isDryRun
      }
    })

    let result = {}

    if (isDryRun) {
      result = { id, ...data }
    } else {
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
    }

    log.debug({
      title: 'ClientService#update.result',
      details: result
    })

    return result
  }

  return exports
})
