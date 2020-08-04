/**
 * Generic helper functions
 *
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NAmdConfig /SuiteScripts/rest-api/modules.json
 * @author Benj Sicam
 */
define(['N/runtime'], function (runtime) {
  'use strict'

  const exports = {}

  /**
   * Helper function for determining dry runs based on deployment id
   *
   * @method
   * @param {String} depId - The deployment identifier for development
   * @returns {Boolean}
   */
  exports.isDryRun = function (depId) {
    const deploymentId = runtime.getCurrentScript().deploymentId
    return deploymentId === depId
  }

  return exports
})
