/**
 * Controller module for POST requests
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
  'services/fitProfile',
  'services/order',
  'vendor/lodash'
], function (error, log, clientSvc, fitProfileSvc, orderSvc, _) {
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
     * POST / handler
     *
     * @method
     * @param {Object} [body] - POST request body
     * @returns {Object}
     */
    const handler = function (body = {}) {
      const now = Date.now()

      log.debug({
        title: 'PostController#call',
        details: {
          ...body,
          isDryRun: isDryRun
        }
      })

      const type = `${_.get(body, 'type', '')}`.toUpperCase()
      const data = _.get(body, 'data', {})

      if (_.isEmpty(data) || !_.isPlainObject(data)) {
        return "{status:'error', name:'INVALID_INPUT', message: 'The data submitted in invalid.'}";
        // throw error.create({
        //   name: 'INVALID_INPUT',
        //   message: 'The data submitted in invalid.',
        //   notifyOff: true
        // })
      }

      const serviceMap = new Map([
        ['CLIENT', clientSvc],
        ['FIT_PROFILE', fitProfileSvc],
        ['ORDER', orderSvc]
      ])

      const service = serviceMap.get(type)

      if (_.isEmpty(service)) {
        return "{status:'error', name:'INVALID_TYPE', message: 'Kindly specify a valid type.'}";
        // throw error.create({
        //   name: 'INVALID_TYPE',
        //   message: 'Kindly specify a valid type.',
        //   notifyOff: true
        // })
      }

      const result = service.create(data, isDryRun)

      log.debug({
        title: 'PostController#result',
        details: {
          result,
          responseTime: `${Date.now() - now}ms`
        }
      })

      return result
    }

    return handler
  }
})
