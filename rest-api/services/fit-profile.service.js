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
  'services/mocker',
  'utils/objectMapper',
  'utils/query'
], function (runtime, search, record, error, log, faker, _, mocker, objectMapper, queryUtils) {
  'use strict'

  const TYPE = 'customrecord_sc_fit_profile'
  const MODEL = new Map([
    ['id', { field: 'internalid', type: 'integer' }],
    ['name', { field: 'name', defaultSort: true }],
    ['client', { field: 'custrecord_fp_client', mapToText: true }],
    ['productType', { field: 'custrecord_fp_product_type', mapToText: true }],
    ['blockValue', { field: 'custrecord_fp_block_value' }],
    ['measurementType', { field: 'custrecord_fp_measure_type', mapToText: true }],
    ['measurementValues', { field: 'custrecord_fp_measure_value', type: 'json' }]
  ])
  const FILTER_MAP = new Map([
    ['fp-client', { field: 'custrecord_fp_client' }],
    ['fp-product-type', { field: 'custrecord_fp_product_type' }],
    ['fp-measurement-type', { field: 'custrecord_fp_measure_type' }],
    ['tailor', { field: 'custrecord_tc_tailor', join: 'custrecord_fp_client' }]
  ])

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
  exports.query = function (filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'FitProfileService#query.call',
      details: {
        user,
        filters,
        offset,
        limit,
        orderBy,
        isDryRun
      }
    })

    const result = { offset, limit, data: [] }

    if (isDryRun) {
      _.times(limit, () => result.data.push(mocker.mockFitProfile()))
    } else {
      search
        .create({
          type: TYPE,
          filters: !_.isEmpty(filters)
            ? queryUtils.getFilters(FILTER_MAP, { ...filters, tailor: user })
            : queryUtils.getFilters(FILTER_MAP, { tailor: user }),
          columns: queryUtils.getColumns(MODEL, orderBy)
        })
        .run()
        .getRange({
          start: offset,
          end: offset + limit
        })
        .forEach((res) => result.data.push(objectMapper.buildRestObject(MODEL, res)))
    }

    log.debug({
      title: 'FitProfileService#query.result',
      details: result
    })

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
  exports.read = function (id, isDryRun = true) {
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
      result = mocker.mockFitProfile({ id })
    } else {
      const fitProfile = record.load({
        type: TYPE,
        id
      })

      const tailorClient = search.lookupFields({
        id: fitProfile.getValue({ fieldId: 'custrecord_fp_client' }),
        type: 'customrecord_sc_tailor_client',
        columns: 'custrecord_tc_tailor'
      })

      if (tailorClient.custrecord_tc_tailor !== user) {
        throw error.create({
          name: 'NOT_FOUND',
          message: `Fit profile with id ${id} not found.`,
          notifyOff: true
        })
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
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.create = function (data = {}, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'FitProfileService#create.call',
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
      const tailorClient = search.lookupFields({
        id: data.client,
        type: 'customrecord_sc_tailor_client',
        columns: 'custrecord_tc_tailor'
      })

      if (tailorClient.custrecord_tc_tailor !== user) {
        throw error.create({
          name: 'NOT_FOUND',
          message: `Client with id ${data.client} not found.`,
          notifyOff: true
        })
      }

      const record = objectMapper.buildRecordObject(
        MODEL,
        record.create({
          type: TYPE
        }),
        data
      )

      const id = record.save({ enableSourcing: true })

      result = objectMapper.buildRestObject(MODEL, record)
      result = {
        ...result,
        id
      }
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
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.update = function (id, data = {}, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'FitProfileService#update.call',
      details: {
        user,
        id,
        data,
        isDryRun
      }
    })

    let result = {}

    if (isDryRun) {
      result = { id, ...data }
    } else {
      const fitProfile = record.load({
        type: TYPE,
        id
      })

      const tailorClient = search.lookupFields({
        id: fitProfile.getValue({ fieldId: 'custrecord_fp_client' }),
        type: 'customrecord_sc_tailor_client',
        columns: 'custrecord_tc_tailor'
      })

      if (tailorClient.custrecord_tc_tailor !== user) {
        throw error.create({
          name: 'NOT_FOUND',
          message: `Fit profile with id ${id} not found.`,
          notifyOff: true
        })
      }

      const record = objectMapper
        .buildRecordObject(MODEL, fitProfile, data)
        .save({ enableSourcing: true })

      result = objectMapper.buildRestObject(MODEL, record)
    }

    log.debug({
      title: 'FitProfileService#update.result',
      details: result
    })

    return result
  }

  return exports
})
