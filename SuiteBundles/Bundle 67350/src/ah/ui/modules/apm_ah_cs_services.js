/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 Mar 2019     alaurito         Initial
 * 2.00       21 May 2019     jmarimla         Get perf data
 * 3.00       23 May 2019     jmarimla         Snoozed rows
 * 4.00       27 May 2019     rwong            Added code to set snooze items in tab header
 * 5.00       10 Jul 2019     rwong            New UI
 * 6.00       18 Jul 2019     jmarimla         Expandable chart
 * 7.00       09 Sep 2019     jmarimla         Data formatting
 * 8.00       11 Sep 2019     erepollo         Investigate link
 * 9.00       12 Sep 2019     erepollo         Moved date range logic
 * 10.00      13 Sep 2019     jmarimla         Snooze
 * 11.00      26 Sep 2019     jmarimla         Show snoozed
 * 12.00      07 Jan 2020     earepollo        Translation readiness
 * 13.00      20 Feb 2020     jmarimla         Smell details call
 * 14.00      21 Feb 2020     jmarimla         Pass compfil to smell details
 *
 */
APMAH = APMAH || {};

APMAH._Services = function() {
    var _testModeParam = '&testmode=' + TEST_MODE;
    var _urls = {
        accountOverview: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ah_sl_accountoverview&deploy=customdeploy_apm_ah_sl_accountoverview' + _testModeParam,
        smellDetails: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ah_sl_smelldetails&deploy=customdeploy_apm_ah_sl_smelldetails' + _testModeParam,
        lists: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ah_sl_lists&deploy=customdeploy_apm_ah_sl_lists' + _testModeParam,
        snooze: '/app/site/hosting/scriptlet.nl?script=customscript_apm_ah_sl_snooze&deploy=customdeploy_apm_ah_sl_snooze' + _testModeParam
    };

    var _globalSettings = {
        startDateMS: '',
        endDateMS: '',
        compfil: '',
        startDatePSTString: '',
        endDatePSTString: '',
        currentTile: null,
        currentTab: null,
        showSnoozed: false
    };

    function getGlobalSettings() {
        return _globalSettings;
    }

    var _cachedData = {
            gridData: {
                "record":[],
                "script":[],
                "savedsearch":[],
                "integration":[],
                "processor":[]
            },
            tileSummary: {
                "record":0,
                "script":1,
                "savedsearch":2,
                "integration":3,
                "processor":4
            },
            tileData: [ 
                { 
                    "name":APMTranslation.apm.db.label.recordpages(),
                    "tileId":"record",
                    "errorCount":0,
                    "errorSnoozed":0,
                    "performanceCount":0,
                    "performanceSnoozed":0,
                    "complianceCount":0,
                    "complianceSnoozed":0
                 },
                 { 
                    "name":APMTranslation.apm.r2019a.scripts(),
                    "tileId":"script",
                    "errorCount":0,
                    "errorSnoozed":0,
                    "performanceCount":0,
                    "performanceSnoozed":0,
                    "complianceCount":0,
                    "complianceSnoozed":0
                 },
                 { 
                    "name":APMTranslation.apm.spa.label.savedsearches(),
                    "tileId":"savedsearch",
                    "errorCount":0,
                    "errorSnoozed":0,
                    "performanceCount":0,
                    "performanceSnoozed":0,
                    "complianceCount":0,
                    "complianceSnoozed":0
                 },
                 { 
                    "name":APMTranslation.apm.r2020a.integrations(),
                    "tileId":"integration",
                    "errorCount":0,
                    "errorSnoozed":0,
                    "performanceCount":0,
                    "performanceSnoozed":0,
                    "complianceCount":0,
                    "complianceSnoozed":0
                 },
                 { 
                    "name":APMTranslation.apm.scpm.label.processors(),
                    "tileId":"processor",
                    "errorCount":0,
                    "errorSnoozed":0,
                    "performanceCount":0,
                    "performanceSnoozed":0,
                    "complianceCount":0,
                    "complianceSnoozed":0
                 }
              ],
            listData: {
                recordType: null,
                script: null,
                search: null,
                integration: null
            }
    };
    var gridData = {
            setData: function (newData) {
                var me = this;
                me.indexData(newData, 'record');
                me.indexData(newData, 'script');
                me.indexData(newData, 'savedsearch');
                me.indexData(newData, 'integration');
                me.indexData(newData, 'processor');
            },
            indexData: function (newData, tileType) {
                if (!newData[tileType]) return;
                
                _cachedData.gridData[tileType] = [];
                var store = _cachedData.gridData[tileType];
                for (var i in newData[tileType]) {
                    var smellData = newData[tileType][i];
                    smellData.index = i;
                    store.push(smellData);
                }
            },
            getData: function (tileType, tabType, showSnoozed) {
                var allTabs = ['error', 'performance', 'standardsupdate'];
                var data = _cachedData.gridData;
                var dataByTab = [];
                var dataBySnoozed = [];
                
                //filter data by tile
                var dataByTile = data[tileType];
                
                //filter data by tab
                if (allTabs.indexOf(tabType) == -1) { //ALL tab is selected
                    dataByTab = dataByTile;
                } else {
                    function filterByTab (rowData) {
                        return (rowData.tab == tabType);
                    }
                    dataByTab = dataByTile.filter(filterByTab);
                }
                
                //filter data by showSnoozed
                if (showSnoozed) { //show all
                    dataBySnoozed = dataByTab;
                } else { //hide snoozed
                    function filterBySnoozed (rowData) {
                        return (!rowData.actions.isSnoozed);
                    }
                    dataBySnoozed = dataByTab.filter(filterBySnoozed);
                }
                return dataBySnoozed;
            },
            toggleSnooze: function (tileType, index) {
                var smell = _cachedData.gridData[tileType][index];
                if (!smell) return;
                smell.actions.isSnoozed = !smell.actions.isSnoozed;
            }
    };
    var tileData = {
            setData: function (newData) {
                _cachedData.tileData = newData;
            },
            getData: function () {
                return _cachedData.tileData;
            },
            updateAllTileData: function () {
                var me = this;
                me.updateTileData('record');
                me.updateTileData('script');
                me.updateTileData('savedsearch');
                me.updateTileData('integration');
                me.updateTileData('processor');
            },
            updateTileData: function (tileType) {
                var tileIndex = _cachedData.tileSummary[tileType];
                var tileData = _cachedData.tileData[tileIndex];
                var gridData = _cachedData.gridData[tileType];
                
                //reset count
                tileData.errorCount = 0;
                tileData.errorSnoozed = 0;
                tileData.performanceCount = 0;
                tileData.performanceSnoozed = 0;
                tileData.complianceCount = 0;
                tileData.complianceSnoozed = 0;
                
                for (var i in gridData) {
                    var tab = gridData[i].tab;
                    var isSnoozed = gridData[i].actions.isSnoozed;
                    switch (tab) {
                    case 'error':
                        tileData.errorCount++;
                        if (isSnoozed) tileData.errorSnoozed++;
                        break;
                    case 'performance':
                        tileData.performanceCount++;
                        if (isSnoozed) tileData.performanceSnoozed++;
                        break;
                    case 'standardsupdate':
                        tileData.complianceCount++;
                        if (isSnoozed) tileData.complianceSnoozed++;
                        break;
                    }
                }
            }
    };
    var listData = {
            setData: function (newData, listType) {
                _cachedData.listData[listType] = newData;
            },
            getData: function () {
                return _cachedData.listData;
            },
            getName: function (listType, id) {
                var name = _cachedData.listData[listType][id]; 
                return (name) ? name : '';
            }
    }
    
    function getURL(name) {
        return _urls[name];
    }

    function showLoading() {
        var maskHeight = $(window).height();
        $('.psgp-main-content').css({
            height: maskHeight + 'px'
        }).addClass('psgp-loading-mask');
    }

    function hideLoading() {
        $('.psgp-main-content').removeClass('psgp-loading-mask');
    }
    
    function _getLists(params) {
        var $xhr = $.ajax({
            url: _urls.lists,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function _getAccountOverviewData(params) {
        var $xhr = $.ajax({
            url: _urls.accountOverview,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }
    
    function _getSmellDetailsData(params) {
        var $xhr = $.ajax({
            url: _urls.smellDetails,
            type: 'GET',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }
    
    function _postSnooze(params) {
        var $xhr = $.ajax({
            url: _urls.snooze,
            type: 'POST',
            data: params,
            dataType: 'json'
        });
        return $xhr;
    }

    function refreshAccountOverviewData() {
        var maskHeight = $(window).height() - 100;
        $('.psgp-main-content').css({
            height: maskHeight + 'px'
        }).addClass('psgp-loading-mask');

        var params = {
                startDateMS: _globalSettings.startDateMS,
                endDateMS: _globalSettings.endDateMS,
                compfil: _globalSettings.compfil,
                startDatePSTString: _globalSettings.startDatePSTString,
                endDatePSTString: _globalSettings.endDatePSTString,
        };

        $.when(
                _getLists(params)
                .done(function(response) {
                    //console.log(response);
                    if (!response.success) {
                        alert(APMTranslation.apm.common.alert.errorinsearch());
                        return;
                    }
                    
                    if (response.data.recordType) listData.setData(response.data.recordType, 'recordType');
                    if (response.data.script) listData.setData(response.data.script, 'script');
                    if (response.data.search) listData.setData(response.data.search, 'search');
                    if (response.data.integration) listData.setData(response.data.integration, 'integration');
                    
                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.common.alert.errorinsuitelet());
                }),
                
                _getAccountOverviewData(params)
                .done(function(response) {
                    //console.log(response);
                    if (!response.success) {
                        alert(APMTranslation.apm.common.alert.errorinsearch());
                        return;
                    }
                    if (response.data.gridData) {
                        APMAH.Components.renderRefreshDate(response.data.refreshDate);
                        gridData.setData(response.data.gridData);
                        tileData.updateAllTileData();
                    }
                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.common.alert.errorinsuitelet());
                })

        ).then(
                function () {
                    
                    APMAH.Components.renderTiles(tileData.getData());
                    
                    var startDateMS = convertMSToPSTString(_globalSettings.startDateMS);
                    var endDateMS = convertMSToPSTString(_globalSettings.endDateMS);
                    _globalSettings.startDatePSTString = new Date(startDateMS).toISOString().substring(0,19);
                    _globalSettings.endDatePSTString = new Date(endDateMS).toISOString().substring(0,19);
                    
                    $('.psgp-main-content').removeClass('psgp-loading-mask');
                }
        );
    }
    
    function refreshSmellDetailsData(params, $expandedRow) {

        params.compfil = _globalSettings.compfil;
        
        $expandedRow.addClass('psgp-component-loading-mask');
        
        $.when(
                _getSmellDetailsData(params)
                .done(function(response) {
                    //console.log(response);
                    if (!response.success) {
                        alert(APMTranslation.apm.common.alert.errorinsearch());
                        return;
                    }
                    
                    var $chartContainer = $expandedRow.find('.chart .body');
                    APMAH.Highcharts.renderExpandableRowChart ( $chartContainer, 'daily-error-rates', response.data.errorRateDaily);
                    
                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.common.alert.errorinsuitelet());
                })

        ).then(
                function () {
                    $expandedRow.removeClass('psgp-component-loading-mask');
                }
        );
    }
    
    function snoozeItem (snoozeParams) {
        
        APMAH.Components.$AccountOverviewPortlet.psgpPortlet('getBody').addClass('psgp-loading-mask');
        
        var params = {
                'setSnooze': snoozeParams.setSnooze,
                'smellType': snoozeParams.smellType,
                'smellBucket': JSON.stringify(snoozeParams.smellBucket)
        }
        
        $.when(
                
                _postSnooze(params)
                .done(function(response) {
                    //console.log(response);
                    if (!response.success) {
                        alert(APMTranslation.apm.common.alert.errorinsearch());
                        return;
                    }
                    
                    gridData.toggleSnooze(_globalSettings.currentTile, snoozeParams.rData.index);
                    tileData.updateAllTileData();
                    APMAH.Components.renderTiles(tileData.getData());
                    APMAH.Components.GridControls.renderGrid();
                    
                })
                .fail(function(response) {
                    //console.log(response);
                    alert(APMTranslation.apm.common.alert.errorinsuitelet());
                })
                
        ).then(
                function () {
                    APMAH.Components.$AccountOverviewPortlet.psgpPortlet('getBody').removeClass('psgp-loading-mask');
                }
        );
                
    }
    
    function convertMSToPSTString(dateMS) {
        //convert to dateObj
        var ISOdateObj = new Date(dateMS);
        //convert to GMT netsuite string
        var GMTString = NSFORMAT.format({
            value: ISOdateObj,
            type: NSFORMAT.Type.DATETIME,
            timezone: NSFORMAT.Timezone.AMERICA_LOS_ANGELES
        });
        //convert to PST date object
        var PSTdateObj = NSFORMAT.parse({
            value: GMTString,
            type: NSFORMAT.Type.DATETIME,
            timezone: NSFORMAT.Timezone.GMT
        });
        //convert to MS
        var PSTdateMS = PSTdateObj.getTime();
        return PSTdateMS;
    }

    return {
        gridData: gridData,
        tileData: tileData,
        listData: listData,
        getURL: getURL,
        showLoading: showLoading,
        hideLoading: hideLoading,
        refreshAccountOverviewData: refreshAccountOverviewData,
        refreshSmellDetailsData: refreshSmellDetailsData,
        getGlobalSettings: getGlobalSettings,
        convertMSToPSTString: convertMSToPSTString,
        snoozeItem: snoozeItem
    };
};