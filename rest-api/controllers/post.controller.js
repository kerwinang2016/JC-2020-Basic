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

      const type = _.get(body, 'type', '').toUpperCase()
      const userid = _.get(body, 'userid', '');
      const usertoken = _.get(body, 'usertoken', '');
      const data = _.get(body, 'data', {})
      log.debug('type',type);
      log.debug('userid',userid);
      log.debug('usertoken',usertoken);
      log.debug('data',data);
      if (!userid ) {
        return "{status:'error', name:'INVALID_INPUT', message: 'userid is required.'}";
      }
      if (_.isEmpty(data) ) {
        return "{status:'error', name:'INVALID_INPUT', message: 'The data submitted in invalid.'}";
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
      if (type == 'ORDER' && userid != data.tailor) {
        return "{status:'error', name:'INVALID_INPUT', message: 'userid and data.tailor should be the same.'}";
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
