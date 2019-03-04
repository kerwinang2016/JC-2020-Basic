/**
 * Copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Mar 2015     jyeh             Initial
 * 2.00       24 Mar 2015     jyeh
 * 3.00       28 Mar 2015     jyeh
 * 4.00       06 Apr 2015     rwong            Changed link to add support for trigger types
 * 5.00       09 Apr 2015     jyeh
 * 6.00       01 Jul 2015     jmarimla         Updated loading masks
 * 7.00       06 Aug 2015     rwong            Added url css class to links
 * 8.00       11 Aug 2015     rwong            Added url css class to script deployment
 * 9.00       28 Aug 2015     rwong            Added support for customer debugging
 * 10.00      04 May 2018     jmarimla         N/A client script columns
 * 11.00      16 May 2018     jmarimla         en dash
 * 12.00      29 Jun 2018     jmarimla         Translation readiness
 * 13.00      26 Jul 2018     jmarimla         FRHT column
 * 14.00      18 Oct 2018     jmarimla         Redirect to profiler
 * 15.00      26 Oct 2018     jmarimla         Frht label
 * 16.00      04 Jan 2019     rwong            Added translation to no records to show.
 * 17.00      23 Jan 2019     jmarimla         Hide frht
 *
 */

function APMComponents() {
    Ext4.define('PSGP.APM.SIA.Component.Grid.SuiteScriptDetail', {
        extend: 'PSGP.APM.Component.Grid',
        store: PSGP.APM.SIA.dataStores.suiteScriptDetailData,
        viewConfig: {
            deferEmptyText: false,
            emptyText: APMTranslation.apm.common.label.norecordstoshow(),
            loadMask: MASK_CONFIG
        },
        columns: {
            defaults : {
                hideable : false,
                draggable : false,
                menuDisabled : true,
                height: 28,
                flex: 1
            },
            items : [
                {
                    text : APMTranslation.apm.common.label.datetime(),
                    dataIndex : 'date'
                },
                {
                    text : APMTranslation.apm.ptd.label.scripttypeworkflow(),
                    dataIndex : 'scripttype',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        switch(value) {
                        case 'CLIENT': return APMTranslation.apm.common.label.client(); break;
                        case 'USEREVENT': return APMTranslation.apm.common.label.userevent(); break;
                        case 'WORKFLOW': return APMTranslation.apm.ns.context.workflow(); break;
                        default: return value;
                        }
                    }
                },
                {
                    text : APMTranslation.apm.common.label.name(),
                    dataIndex : 'script',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var url = record.get('scriptwfurl');
                        var scriptid = record.get('scriptid');
                        if ((COMPID_MODE == 'T') && (COMP_FIL)) {
                            if(url != '') {
                                return '<a href="' + url + '" target="_blank" class="apm-a">'
                                + scriptid + '</a>';
                            } else {
                                return scriptid;
                            }
                        } else {
                            return '<a href="' + url + '" target="_blank" class="apm-a">'
                            + value + '</a>';
                        }
                        return value;
                    }
                },
                {
                    text : APMTranslation.apm.common.label.executioncontext(),
                    dataIndex : 'triggertype'
                },
                {
                    text : APMTranslation.apm.ptd.label.deploymentid(),
                    dataIndex : 'deployment',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var url = record.get('deploymenturl');
                        if (value != null && url != '')
                        {
                            return '<a href="'+url+'" target="_blank" class="apm-a">'
                                + value +'</a>';
                        }
                        return value;
                    }
                },
                {
                    text : APMTranslation.apm.common.label.totaltime(),
                    dataIndex : 'totaltime'
                },
                {
                    text : APMTranslation.apm.ptd.label.usage(),
                    dataIndex : 'usagecount',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var scriptType = record.get('scripttype');
                        if (scriptType == 'CLIENT') {
                            return '\u2013';
                        }
                        return value;
                    }
                },
                {
                    text : APMTranslation.apm.common.label.recordoperations(),
                    dataIndex : 'records',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var scriptType = record.get('scripttype');
                        if (scriptType == 'CLIENT') {
                            return '\u2013';
                        }
                        return value;
                    }
                },
                {
                    text : APMTranslation.apm.common.label.urlrequests(),
                    dataIndex : 'urlrequests',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var scriptType = record.get('scripttype');
                        if (scriptType == 'CLIENT') {
                            return '\u2013';
                        }
                        return value;
                    }
                },
                {
                    text : APMTranslation.apm.ptd.label.searches(),
                    dataIndex : 'searches',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var scriptType = record.get('scripttype');
                        if (scriptType == 'CLIENT') {
                            return '\u2013';
                        }
                        return value;
                    }
                }/*,
                Ext4.create('PSGP.APM.Component.ColumnAction.Details',
                     {
                         text: APMTranslation.apm.common.label.profilerdetails(),
                         items: [
                             {
                                 handler: function(grid, rowIndex, colIndex) {
                                     var rec = grid.getStore().getAt(rowIndex);
                                     var operationId = rec.get('operationId');
                                     var frhtId = rec.get('frhtId');
                                     var dataParams = {
                                             compfil : ((COMPID_MODE == 'T') && (COMP_FIL)) ? COMP_FIL : '',
                                             operationId: operationId,
                                             frhtId: frhtId
                                     };

                                     var paramString = Ext4.urlEncode(dataParams);
                                     var PRF_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_prf_sl_main&deploy=customdeploy_apm_prf_sl_main';
                                     window.open(PRF_URL + '&' + paramString);

                                 },
                                 scope: this,
                                 getClass: function(value,meta,record,rowIx,colIx, store) {
                                     return 'x-hide-display';  //Hide the action icon
                                 }
                             }
                         ]
                     }
                 )*/
            ]
        },
        listeners : {
            itemmouseenter: function (view, record, item, index, e, opts)
            {
                var rowcmp = Ext4.select('#' + Ext4.get(item).id + '  img.x4-action-col-icon');
                rowcmp.addCls('apm-column-action-details');
                rowcmp.removeCls('x-hide-display');
                var name = record.get('id');
                var chart = PSGP.APM.SIA.Highcharts.timelineChart;
                chart.get(name).setState('hover');
            },
            itemmouseleave: function (view, record, item, index, e, opts)
            {
                var rowcmp = Ext4.select('#' + Ext4.get(item).id + '  img.x4-action-col-icon');
                rowcmp.removeCls('apm-column-action-details');
                rowcmp.addCls('x-hide-display');
                var name = record.get('id');
                var chart = PSGP.APM.SIA.Highcharts.timelineChart;
                chart.get(name).setState();
            }
        }
    });

}

