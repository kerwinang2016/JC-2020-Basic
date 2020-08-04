/**
 * Controller module for PUT requests
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
     * PUT / handler
     *
     * @method
     * @param {Object} [body] - PUT request body
     * @returns {Object}
     */
    const handler = function (body = {}) {
      const now = Date.now()

      log.debug({
        title: 'PutController#call',
        details: {
          ...body,
          isDryRun: isDryRun
        }
      })

      const id = +_.get(body, 'id')
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
        ['FIT_PROFILE', fitProfileSvc]
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

      const result = service.update(id, data, isDryRun)

      log.debug({
        title: 'PutController#result',
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
