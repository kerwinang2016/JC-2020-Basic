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
  'N/search',
  'services/client',
  'services/fitProfile',
  'services/order',
  'vendor/lodash'
], function (error, log, search, clientSvc, fitProfileSvc, orderSvc, _) {
  'use strict'

  /**
   * Controller function
   *
   * @function

   * @returns {Function}
   */
  // return function (isDryRun = true) {
    /**
     * POST / handler
     *
     * @method
     * @param {Object} [body] - POST request body
     * @returns {Object}
     */
    const handler = function (body = {}) {
      const now = Date.now()


      const type = _.get(body, 'type', '').toUpperCase()
      const user = _.get(body, 'user', '');
      const usertoken = _.get(body, 'usertoken', '');
      const data = _.get(body, 'data', {})

      if (_.isEmpty(data) ) {
        return "{status:'error', name:'INVALID_INPUT', message: 'The data submitted in invalid.'}";
      }

      const serviceMap = new Map([
        ['CLIENT', clientSvc],
        ['FIT_PROFILE', fitProfileSvc],
        ['ORDER', orderSvc]
      ])

      if(!user || !usertoken){
        return "{status:'error', name:'RESTRICTED ACCESS', message: 'Kindly specify your user and usertoken.'}";
      }
      //Lets validate the user and tailortoken
      var tailorClient = search.lookupFields({
        id: user,
        type: 'customer',
        columns: 'custentity_rest_token'
      });

      if(tailorClient.custentity_rest_token != usertoken){
        return "{status:'error', name:'RESTRICTED ACCESS', message: 'Incorrect token for user " + user + "'}";
      }
      
      const service = serviceMap.get(type)

      if (_.isEmpty(service)) {
        return "{status:'error', name:'INVALID_TYPE', message: 'Kindly specify a valid type.'}";
      }
      if (type == 'ORDER' && user != data.tailor) {
        return "{status:'error', name:'INVALID_INPUT', message: 'userid and data.tailor should be the same.'}";
      }
      const result = service.create(data)

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
  // }
})
