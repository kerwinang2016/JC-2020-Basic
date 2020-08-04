/**
 * Service module for order records
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
  //'services/mocker',
  'utils/objectMapper',
  'utils/query'
], function (runtime, search, record, error, log, faker, _,
  //mocker, 
  objectMapper, queryUtils) {
  'use strict'

  const LIST_MODEL = new Map([
    ['id', { field: 'internalid', type: 'integer' }],
    ['orderNumber', { field: 'custcol_so_id' }],
    ['date', { field: 'trandate', defaultSort: true, sort: search.Sort.DESC }],
    ['client', { field: 'custcol_tailor_client_name' }],
    ['item', { field: 'item', mapToText: true }],
    ['fabricStatus', { field: 'custcol_avt_fabric_status', mapToText: true }],
    ['cmtStatus', { field: 'custcol_avt_cmt_status', mapToText: true }],
    ['dateNeeded', { field: 'custcol_avt_date_needed' }]
  ])
  const DETAIL_MODEL = new Map([
    ['id', { field: 'id', type: 'integer' }],
    ['orderNummber', { field: 'tranid' }],
    ['date', { field: 'trandate' }],
    ['orderSubtotal', { field: 'subtotal', type: 'number' }],
    ['taxTotal', { field: 'taxtotal', type: 'number' }],
    ['orderTotal', { field: 'total', type: 'number' }],
    ['shipTo', { field: 'shipaddress' }],
    [
      'items',
      {
        sublist: 'item',
        fields: new Map([
          ['fabric', { field: 'item', mapToText: true }],
          ['productType', { field: 'custcol_producttype', mapToText: true }],
          ['client', { field: 'custcol_tailor_client' }],
          ['designOptionsJacket', { field: 'custcol_designoptions_jacket', type: 'json' }],
          ['designOptionsOverCoat', { field: 'custcol_designoptions_overcoat', type: 'json' }],
          ['designOptionsShirt', { field: 'custcol_designoptions_shirt', type: 'json' }],
          [
            'designOptionsShortSleevesShirt',
            { field: 'custcol_designoptions_ssshirt', type: 'json' }
          ],
          ['designOptionsTrenchCoat', { field: 'custcol_designoptions_trenchcoat', type: 'json' }],
          ['designOptionsTrouser', { field: 'custcol_designoptions_trouser', type: 'json' }],
          ['designOptionsWaistCoat', { field: 'custcol_designoptions_waistcoat', type: 'json' }],
          [
            'designOptionsLadiesJacket',
            { field: 'custcol_designoptions_ladiesjacket', type: 'json' }
          ],
          [
            'designOptionsLadiesPants',
            { field: 'custcol_designoptions_ladiespants', type: 'json' }
          ],
          [
            'designOptionsLadiesSkirt',
            { field: 'custcol_designoptions_ladiesskirt', type: 'json' }
          ],
          ['designOptionsMessage', { field: 'custcol_designoption_message' }],
          ['fitProfileJacket', { field: 'custcol_fitprofile_jacket', type: 'json' }],
          ['fitProfileOverCoat', { field: 'custcol_fitprofile_overcoat', type: 'json' }],
          ['fitProfileShirt', { field: 'custcol_fitprofile_shirt', type: 'json' }],
          ['fitProfileShortSleevesShirt', { field: 'custcol_fitprofile_ssshirt', type: 'json' }],
          ['fitProfileTrenchCoat', { field: 'custcol_fitprofile_trenchcoat', type: 'json' }],
          ['fitProfileTrouser', { field: 'custcol_fitprofile_trouser', type: 'json' }],
          ['fitProfileWaistCoat', { field: 'custcol_fitprofile_waistcoat', type: 'json' }],
          ['fitProfileLadiesJacket', { field: 'custcol_fitprofile_ladiesjacket', type: 'json' }],
          ['fitProfileLadiesPants', { field: 'custcol_fitprofile_ladiespants', type: 'json' }],
          ['fitProfileLadiesSkirt', { field: 'custcol_fitprofile_ladiesskirt', type: 'json' }],
          ['fitProfileMessage', { field: 'custcol_fitprofile_message' }],
          ['fabricQuantity', { field: 'custcol_fabric_quantity', type: 'number' }],
          ['amount', { field: 'amount', type: 'number' }],
          ['category', { field: 'custcol_itm_category_url' }]
        ])
      }
    ]
  ])
  const FILTER_MAP = new Map([
    ['ord-ordernumber', { field: 'custcol_so_id', operator: search.Operator.CONTAINS }],
    ['type', { field: 'type', operator: search.Operator.ANYOF }],
    ['status', { field: 'status', operator: search.Operator.ANYOF }],
    ['category', { field: 'custcol_itm_category_url', operator: search.Operator.ISNOTEMPTY }],
    ['user', { field: 'entity' }]
  ])

  const exports = {}

  /**
   * Searches order records and returns the search results
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
      title: 'OrderService#query.call',
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
      //_.times(limit, () => result.data.push(mocker.mockOrderList()))
    } else {
      search
        .create({
          type: search.Type.TRANSACTION,
          filters: !_.isEmpty(filters)
            ? queryUtils.getFilters(FILTER_MAP, {
                ...filters,
                type: ['SalesOrd'],
                status: ['SalesOrd:A', 'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E', 'SalesOrd:F'],
                category: '',
                user
              })
            : queryUtils.getFilters(FILTER_MAP, {
                type: ['SalesOrd'],
                status: ['SalesOrd:A', 'SalesOrd:B', 'SalesOrd:D', 'SalesOrd:E', 'SalesOrd:F'],
                category: '',
                user
              }),
          columns: queryUtils.getColumns(LIST_MODEL, orderBy)
        })
        .run()
        .getRange({
          start: offset,
          end: offset + limit
        })
        .forEach((res) => result.data.push(objectMapper.buildRestObject(LIST_MODEL, res)))
    }

    log.debug({
      title: 'OrderService#query.result',
      details: result
    })

    return result
  }

  /**
   * Retrieves and returns an order record
   *
   * @function
   * @param {number} id - The id of the record to load
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.read = function (id, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'OrderService#read.call',
      details: {
        user,
        id,
        isDryRun
      }
    })

    let result = {}

    if (isDryRun) {
      //result = mocker.mockOrder({ id })
    } else {
      const order = record.load({
        type: record.Type.SALES_ORDER,
        id
      })

      if (+order.getValue('entity') !== user) {
        throw error.create({
          name: 'NOT_FOUND',
          message: `Order with id ${id} not found.`,
          notifyOff: true
        })
      }

      const restObject = objectMapper.buildRestObject(DETAIL_MODEL, order)
      const items = []

      const tmp = _.reject(_.get(restObject, 'items', []), (item) => {
        return _.isEmpty(item.category)
      })

      _.forEach(tmp, (val) => {
        items.push(_.omit(val, ['category']))
      })

      _.set(restObject, 'items', items)

      result = restObject
    }

    log.debug({
      title: 'OrderService#read.result',
      details: result
    })

    return result
  }

  /**
   * Creates an order record and returns the created record
   *
   * @function
   * @param {Object} data - The map of values to use to create/update a record
   * @param {boolean} [isDryRun] - Denotes if the operation is a dry run
   * @returns {Object}
   */
  exports.create = function (data = {}, isDryRun = true) {
    const user = runtime.getCurrentUser().id

    log.debug({
      title: 'OrderService#create.call',
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
      // TODO: Create order based on data
    }

    log.debug({
      title: 'OrderService#create.result',
      details: result
    })

    return result
  }

  return exports
})
