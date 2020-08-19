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
    ['item', { field: 'item', mapToText: true, stripCode: true }],
    ['fabrictext', {field:'custcol_avt_fabric_text',type:'text'}],
    ['fabricStatus', { field: 'custcol_avt_fabric_status', mapToText: true }],
    ['fabricsentdate',{field:'custcol_avt_date_sent',type:'text'}],
    ['fabrictracking',{field:'custcol_avt_tracking', type:'text'}],
    ['cmttext', {field:'custcol_avt_cmt_status_text',type:'text'}],
    ['cmtStatus', { field: 'custcol_avt_cmt_status', mapToText: true }],
    ['cmtsentdate', {field:'custcol_avt_cmt_date_sent',type:'text'}],
    ['cmttracking',{field:'custcol_avt_cmt_tracking',type:'text'}],
    ['dateNeeded', { field: 'custcol_avt_date_needed' }]
  ])
  const DETAIL_MODEL = new Map([
    ['id', { field: 'internalid', type: 'integer' }],
    ['orderNummber', { field: 'tranid' }],
    ['date', { field: 'trandate' }],
    ['orderSubtotal', { field: 'subtotal', type: 'number' }],
    ['taxTotal', { field: 'taxtotal', type: 'number' }],
    ['orderTotal', { field: 'total', type: 'number' }],
    ['shipTo', { field: 'shipaddress' }],
    ['tailor', {field: 'entity'}],
    ['createdBy', {field: 'custbody4'}],
    [
      'items',
      {
        sublist: 'item',
        fields: new Map([
          ['fabric', { field: 'item', mapToText: true, stripCode: true }],
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
          ['category', { field: 'custcol_itm_category_url' }],
          ['fabrictext', {field:'custcol_avt_fabric_text',type:'text'}],
          ['fabricStatus', { field: 'custcol_avt_fabric_status', mapToText: true }],
          ['fabricsentdate',{field:'custcol_avt_date_sent',type:'text'}],
          ['fabrictracking',{field:'custcol_avt_tracking', type:'text'}],
          ['cmttext', {field:'custcol_avt_cmt_status_text',type:'text'}],
          ['cmtStatus', { field: 'custcol_avt_cmt_status', mapToText: true }],
          ['cmtsentdate', {field:'custcol_avt_cmt_date_sent',type:'text'}],
          ['cmttracking',{field:'custcol_avt_cmt_tracking',type:'text'}],
          ['dateNeeded', { field: 'custcol_avt_date_needed' }]
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
  var ORDER_COLUMN_MAP =  [
    {name:'productType',value:'custcol_producttype'},
    {name:'client',value:'custcol_tailor_client_name'},
    {name:'designOptionsJacket',value:'custcol_designoptions_jacket',stringify:true},
    {name:'designOptionsOverCoat',value:'custcol_designoptions_overcoat',stringify:true},
    {name:'designOptionsShirt',value:'custcol_designoptions_shirt',stringify:true},
    {name:'designOptionsShortSleevesShirt',value:'custcol_designoptions_ssshirt',stringify:true},
    {name:'designOptionsTrenchCoat',value:'custcol_designoptions_trenchcoat',stringify:true},
    {name:'designOptionsTrouser',value:'custcol_designoptions_trouser',stringify:true},
    {name:'designOptionsWaistCoat',value:'custcol_designoptions_waistcoat',stringify:true},
    {name:'designOptionsLadiesJacket',value:'custcol_designoptions_ladiesjacket',stringify:true},
    {name:'designOptionsLadiesPants',value:'custcol_designoptions_ladiespants',stringify:true},
    {name:'designOptionsLadiesSkirt',value:'custcol_designoptions_ladiesskirt',stringify:true},
    {name:'designOptionsMessage',value:'custcol_designoption_message',stringify:true},
    {name:'fitProfileJacket',value:'custcol_fitprofile_jacket',stringify:true},
    {name:'fitProfileOverCoat',value:'custcol_fitprofile_overcoat',stringify:true},
    {name:'fitProfileShirt',value:'custcol_fitprofile_shirt',stringify:true},
    {name:'fitProfileShortSleevesShirt',value:'custcol_fitprofile_ssshirt',stringify:true},
    {name:'fitProfileTrenchCoat',value:'custcol_fitprofile_trenchcoat',stringify:true},
    {name:'fitProfileTrouser',value:'custcol_fitprofile_trouser',stringify:true},
    {name:'fitProfileWaistCoat',value:'custcol_fitprofile_waistcoat',stringify:true},
    {name:'fitProfileLadiesJacket',value:'custcol_fitprofile_ladiesjacket',stringify:true},
    {name:'fitProfileLadiesPants',value:'custcol_fitprofile_ladiespants',stringify:true},
    {name:'fitProfileLadiesSkirt',value:'custcol_fitprofile_ladiesskirt',stringify:true},
    {name:'fitProfileMessage',value:'custcol_fitprofile_message',stringify:true},
    {name:'fabricQuantity',value:'custcol_fabric_quantity'},
    {name:'dateNeeded',value:'custcol_avt_date_needed'}
  ];

   function getStatusColumns(){
    var searchColumns = [];
    searchColumns.push(search.createColumn({name:'internalid'}));
    searchColumns.push(search.createColumn({name:'custcol_so_id'}));
    searchColumns.push(search.createColumn({name:'trandate', sort: search.Sort.DESC}));
    searchColumns.push(search.createColumn({name:'item'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_fabric_text'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_fabric_status'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_date_sent'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_tracking'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_cmt_status_text'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_cmt_status'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_cmt_date_sent'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_cmt_tracking'}));
    searchColumns.push(search.createColumn({name:'custcol_avt_date_needed'}));
    return searchColumns;
  }
   function getStatusFilters(code, name, user, hideReleased){
    var searchFilters = [];
    if(code && code != ''){
      searchFilters.push(search.createFilter({
        name: "custcol_so_id",
        operator: search.Operator.CONTAINS,
        values: code
      }));
    }
    if(name && name != ''){
      searchFilters.push(search.createFilter({
        name: "custbody_customer_name",
        operator: search.Operator.CONTAINS,
        values: name
      }));
    }
    if(hideReleased == 'Yes'){
      searchFilters.push(search.createFilter({
        name:'custbody_isinvoicepaid',
        operator: search.Operator.IS,
        values: false
      }));
    }
    searchFilters.push(search.createFilter({
      name:'entity',
      operator: search.Operator.ANYOF,
      values: user
    }));
    searchFilters.push(search.createFilter({
      name:'type',
      operator: search.Operator.IS,
      values: 'SalesOrd'
    }));
    searchFilters.push(search.createFilter({
      name:'status',
      operator: search.Operator.ANYOF,
      values: ['SalesOrd:A', 'SalesOrd:B', 'SalesOrd:G', 'SalesOrd:E', 'SalesOrd:F']
    }));
    return searchFilters;
  }
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
  exports.query = function (code,name, user, page = 1, hideReleased = "No", limit = 1000){//filters = {}, offset = 0, limit = 25, orderBy = '', isDryRun = true) {
    const result = { data: [] }
    var searchColumns = getStatusColumns();
    var searchFilters = getStatusFilters(code, name, user, hideReleased);
    var start = ((page-1)<0)? 0:page-1 ;
    start = start * limit;
    limit = limit > 1000? 1000:limit;
    limit = limit < 1? 1:limit;
    result.start = start;
    result.limit = limit;
    //var limit = 1000;
    var itemSearchCount = search.create({
        type: search.Type.TRANSACTION,
        filters: searchFilters,//!_.isEmpty(filters) ? queryUtils.getFilters(FILTER_MAP, filters) : undefined,
        columns: searchColumns//queryUtils.getColumns(MODEL)//, orderBy)
      }).runPaged().count;
    result.length = itemSearchCount;
    var pages = Math.ceil(itemSearchCount/1000);
    // for(var i=0;i<pages;i++){
      var itemSearch = search.create({
        type: search.Type.TRANSACTION,
        filters: searchFilters,//!_.isEmpty(filters) ? queryUtils.getFilters(FILTER_MAP, filters) : undefined,
        columns: searchColumns//queryUtils.getColumns(MODEL)//, orderBy)
      })
      var resultSet = itemSearch.run();
      var results = resultSet.getRange({
        start: start,
        end: start + limit
      });
      results.forEach((res) => {
        result.data.push(objectMapper.buildRestObject(LIST_MODEL, res))
      });
      // start+= limit;
    // }
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
  exports.read = function (id, filters, isDryRun = true) {
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
        id: id
      })
      //log.debug('filters.user',filters.user)
      //log.debug("+order.getValue('entity')",+order.getValue('entity'))
      //Disabled for testing
      if (+order.getValue('entity') != filters.userid) {
        return "{name: 'NOT_FOUND', message:'Order with id "+id+" not found.'}";
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

   * @returns {Object}
   */
  exports.create = function (data = {}) {

    let result = {}

        var noerrors = true;
        var orderrecord = record.create({
            type: record.Type.SALES_ORDER,
            isDynamic: true
          });
          orderrecord.setValue('entity',data.tailor);
          orderrecord.setValue('custbody_customer_name',data.client);
          orderrecord.setValue('custbody_restorder_createdby',data.createdBy);

          for(var i=0;i<data.items.length;i++){
            var item = data.items[i];
            var searchFilters = [];
            searchFilters.push(search.createFilter({
              name:'isinactive',
              operator: search.Operator.IS,
              values: false
            }));
            searchFilters.push(search.createFilter({
              name:'name',
              operator: 'contains',
              values: item.fabric
            }));
            searchFilters.push(search.createFilter({
              name:'isonline',
              operator: search.Operator.IS,
              values: true
            }));
            searchFilters.push(search.createFilter({
              name:'othervendor',
              operator: search.Operator.ANYOF,
              values: [17,671]
            }));
            searchFilters.push(search.createFilter({
              name:'custitem_jerome_cmt_serviceitem',
              operator: search.Operator.IS,
              values: false
            }));
            var itemsearch = search.create({
              type:search.Type.ITEM,
              filters: searchFilters
            });
            var itemid = "";
            itemsearch.run().each(function(sr){ itemid = sr.id;});
            if(itemid){
                orderrecord.selectNewLine({sublistId:'item'});
                orderrecord.setCurrentSublistValue('item','item',itemid);
                Object.keys(item).forEach(function(o){
                  var found = _.find(ORDER_COLUMN_MAP,function(colname){return colname.name == o;});
                  if(found && item[o]){
                      if(found.value == 'custcol_avt_date_needed')
                        orderrecord.setCurrentSublistValue('item',found.value,new Date(item[o]));
                      else if(found.stringify){
                        orderrecord.setCurrentSublistValue('item',found.value,JSON.stringify(item[o]));
                      }else{
                        orderrecord.setCurrentSublistValue('item',found.value,item[o]);
                      }
                  }
                });
                orderrecord.commitLine('item');
            }
            else{
              result = {status:'error',name:'ERROR ITEM IN DATA', message:'Please check with us on the item.'};
            }

          }
          if(noerrors){
              try{
              const id = orderrecord.save({ enableSourcing: true });
              result = {status:'success',id:id};
            }catch(e){
              result = {status:'error',name:'FAILED TO SAVE', message:JSON.stringify(e)};
            }
          }

    log.debug({
      title: 'OrderService#create.result',
      details: result
    })

    return result
  }

  return exports
})
