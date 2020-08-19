/**
 * Main entrypoint for the RESTlet
 *
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 * @author Benj Sicam
 */
define(['controllers/get', 'controllers/post', 'controllers/put', 'utils/generic'], function (
  getController,
  postController,
  putController,
  utils
) {
  'use strict'

  /**
   * The script deployment id for the dev endpoint
   *
   * @type {string}
   */
  const DEV_DEPLOYMENT_ID = 'customdeploy_rest_api_dev'

  return {
    get: getController,
    post: postController,
    put: putController
  }
})
