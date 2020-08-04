/**
 * Controller module for GET requests
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 * @author Benj Sicam
 */
define([
  'N/error',
  'N/log',
  'services/client',
  'services/fabric',
  'services/fitProfile',
  'services/lining',
  'services/order',
  'services/tailor',
  'vendor/lodash',
  'utils/objectParser'
], function (
  error,
  log,
  clientSvc,
  fabricSvc,
  fitProfileSvc,
  liningSvc,
  orderSvc,
  tailorSvc,
  _,
  objectParser
) {
  'use strict'

  /**
   * Controller function
   *
   * @function
   * @param {boolean} isDryRun - Denotes if the controller is running dry-runs
   * @returns {Function}
   */
  return function (isDryRun = true) {
    /**
     * GET / handler
     *
     * @function
     * @param {Object} [query] - GET query parameters
     * @returns {Object}
     */
    const handler = function (query = {}) {
      const now = Date.now()
      log.debug({
        title: 'GOT HERE 1',
        details: query
      })
      const params = _.get(objectParser.transpose(query), '_data', {})

      log.debug({
        title: 'GOT HERE 2'
      })
      log.debug({
        title: 'GetController#call',
        details: {
          ...params,
          isDryRun: isDryRun
        }
      })

      const id = +_.get(params, 'id')
      const tailorid = +_.get(params, 'tailorid');
      const type = `${_.get(params, 'type', '')}`.toUpperCase()
      const filters = _.get(params, 'filters')
      const offset = +_.get(params, 'offset', '0')
      const limit = +_.get(params, 'limit', '25')
      const orderBy = _.get(params, 'orderBy')
      log.debug('filters',filters);

      if (_.isEmpty(type) && _.isEmpty(id) && _.isEmpty(tailorid)) {
        return "{status:'error',name:'ERROR INVALID_QUERY_PARAMETER', message:'Kindly specify a value for type and/or id and tailorid.'}";
        // throw error.create({
        //   name: 'INVALID_QUERY_PARAMETER',
        //   message: 'Kindly specify a value for type and/or id.',
        //   notifyOff: true
        // })
      }
      if (_.isEmpty(type) && !_.isEmpty(id)) {
        return "{status:'error', name:'INVALID_QUERY_PARAMETER', message: 'Kindly specify the type of record to retrieve.'}";
        // throw error.create({
        //   name: 'INVALID_QUERY_PARAMETER',
        //   message: 'Kindly specify the type of record to retrieve.',
        //   notifyOff: true
        // })
      }

      const serviceMap = new Map([
        ['CLIENT', clientSvc],
        ['FABRIC', fabricSvc],
        ['FIT_PROFILE', fitProfileSvc],
        ['LINING', liningSvc],
        ['ORDER', orderSvc],
        ['TAILOR', tailorSvc]
      ]);
      const service = serviceMap.get(type)

      if (_.isEmpty(service)) {
        return "{status:'error', name:'INVALID_QUERY_PARAMETER', message: 'Kindly specify a valid type.'}";
        // throw error.create({
        //   name: 'INVALID_QUERY_PARAMETER',
        //   message: 'Kindly specify a valid type.',
        //   notifyOff: true
        // })
      }

      const result = _.isNaN(id)
        ? service.query(filters, offset, limit, orderBy, tailorid, isDryRun)
        : service.read(id, tailorid, isDryRun)

      log.debug({
        title: 'GetController#result',
        details: {
          result,
          responseTime: `${Date.now() - now}ms`
        }
      })
      return JSON.stringify(result)
    }
    return handler
  }
})
