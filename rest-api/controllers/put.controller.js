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

    /**
     * PUT / handler
     *
     * @method
     * @param {Object} [body] - PUT request body
     * @returns {Object}
     */
    const handler = function (body = {}) {
      const now = Date.now();
      const user = _.get(body, 'user');
      const usertoken = _.get(body, 'usertoken');
      const type = `${_.get(body, 'type', '')}`.toUpperCase();
      const data = _.get(body, 'data', {});

      if (_.isEmpty(data) || !_.isPlainObject(data)) {
        return "{status:'error', name:'INVALID_INPUT', message: 'The data submitted in invalid.'}";
      }

      const serviceMap = new Map([
        ['CLIENT', clientSvc],
        ['FIT_PROFILE', fitProfileSvc]
      ])

      const service = serviceMap.get(type)

      if (_.isEmpty(service)) {
        return "{status:'error', name:'INVALID_TYPE', message: 'Kindly specify a valid type.'}";
      }
      log.debug('user',user + " " + usertoken)
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
      const result = service.update(user, data)

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
})
