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
  'N/search',
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
  search,
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
   * @returns {Function}
   */
  //return function () {
    /**
     * GET / handler
     *
     * @function
     * @param {Object} [query] - GET query parameters
     * @returns {Object}
     */
    const handler = function (query = {}) {
      const now = Date.now()
      const params = _.get(objectParser.transpose(query), '_data', {})

      const type = `${_.get(params, 'type', '')}`.toUpperCase()
      const code = _.get(params, 'code')
      const name = _.get(params, 'name')
      const page = _.get(params, 'page')
      const hideReleased = _.get(params, 'hideReleased')
      var user = _.get(params, 'user');
      var usertoken = _.get(params, 'usertoken');

      if (_.isEmpty(type)) {
        return "{status:'error', name:'INVALID_QUERY_PARAMETER', message: 'Kindly specify the type of request.'}";
      }
      // do not implement name...
      const serviceMap = new Map([
        ['CLIENT', clientSvc], //name
        ['FABRIC', fabricSvc], //code
        ['FIT_PROFILE', fitProfileSvc], //name
        ['LINING', liningSvc], //code
        ['ORDER', orderSvc], //code
        ['TAILOR', tailorSvc] //name//do not use filter here
      ]);
      const service = serviceMap.get(type)

      if (_.isEmpty(service)) {
        return "{status:'error', name:'MISSING REQUEST TYPE', message: 'Kindly specify a valid type.'}";
        // throw error.create({
        //   name: 'INVALID_QUERY_PARAMETER',
        //   message: 'Kindly specify a valid type.',
        //   notifyOff: true
        // })
      }else if(type != 'FABRIC' && type != 'LINING'){

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
      }
      const result = service.query(code, name, user, page, hideReleased);//, offset, limit, orderBy, isDryRun)//_.isNaN(id)
        //? service.query(filters, offset, limit, orderBy, isDryRun)
        //: service.read(id, filters, isDryRun)


      result.responseTime = `${Date.now() - now}ms`;
      return JSON.stringify(result)
    }
    return handler
  //}
})
