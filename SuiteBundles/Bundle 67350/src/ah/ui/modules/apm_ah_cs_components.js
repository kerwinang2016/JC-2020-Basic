/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 *  1.00      11 Mar 2019     alaurito         Initial
 *  2.00      20 Mar 2019     alaurito         Adjust column width
 *  3.00      22 Mar 2019     alaurito         Modify for new mockup
 *  4.00      14 May 2019     rwong            Adjusted portlet to tab based
 *  5.00      21 May 2019     jmarimla         Records grid
 *  6.00      23 May 2019     jmarimla         Snoozed rows
 *  7.00      27 May 2019     rwong            Rename psgptabs to psgpsubtabs
 *  8.00      10 Jul 2019     rwong            New UI
 *  9.00      18 Jul 2019     jmarimla         Expandable grid
 * 10.00      24 Jul 2019     rwong            Added info icon
 * 11.00      02 Aug 2019     jmarimla         Grid contents
 * 12.00      02 Sep 2019     erepollo         Updated chart colors
 * 13.00      09 Sep 2019     jmarimla         Data formatting
 * 14.00      11 Sep 2019     erepollo         Investigate link
 * 15.00      12 Sep 2019     erepollo         Moved date range logic
 * 16.00      13 Sep 2019     jmarimla         Snooze
 * 17.00      23 Sep 2019     erepollo         Customer debugging
 * 18.00      24 Sep 2019     jmarimla         Labels
 * 19.00      26 Sep 2019     jmarimla         Show snoozed
 * 20.00      27 Sep 2019     erepollo         Fixed undefined function. Added scriptType param. Expand details
 * 21.00      02 Oct 2019     erepollo         Reset tab and grid contents during customer debug
 * 22.00      04 Oct 2019     jmarimla         Update tile UI
 * 23.00      10 Oct 2019     erepollo         Removed fields in expanded details. Trim Customer Id
 * 24.00      07 Jan 2020     earepollo        Translation readiness
 * 25.00      28 Jan 2020     lemarcelo        Customer debugging changes
 * 26.00      20 Feb 2020     jmarimla         Saved search daily error rates
 * 27.00      24 Feb 2020     earepollo        Round-off failed executions count
 * 28.00      24 Feb 2020     earepollo        Added failed executions count under script error rate smell
 * 29.00      26 Feb 2020     lemarcelo        Script Daily Error Rate
 * 30.00      27 Feb 2020     lemarcelo        Integration Daily Error Rate
 * 31.00      04 Mar 2020     earepollo        Label changes
 * 32.00      13 Mar 2020     earepollo        Label changes
 *
 */
APMAH = APMAH || {};

APMAH._Components = function() {

    var $TitleBar = $('<div>').psgpSuiteletTitle({
        title: ''
    });

    var $CustomerDebuggingDialog =  $('' +
            '<div class="apm-ah-dialog-custdebug">' +
                '<div class="container-field-customer"><span class="psgp-field-label">' + APMTranslation.apm.common.label.companyid() + '</span><div class="field-customer"></div></div>' +
                '<div class="buttons"><div class="btn-save"></div><div class="btn-cancel"></div></div>' +
            '</div>')
            .psgpSettingsDialog({width: 240});

    $CustomerDebuggingDialog.find('.field-customer').psgpTextBox({
        width:  250
    });

    $CustomerDebuggingDialog.find('.btn-save').psgpBlueButton({
        text: APMTranslation.apm.common.button.done(),
        handler: function () {
            var me = this;
            var globalSettings = APMAH.Services.getGlobalSettings();
            var $dialog = $(me).parents('.apm-ah-dialog-custdebug');
            $dialog.dialog('close');

            var compfil = $dialog.find('.field-customer .psgp-textbox').val();
            globalSettings.compfil = compfil.trim();
            globalSettings.endDateMS = new Date().setMinutes(0, 0, 0);
            globalSettings.startDateMS = globalSettings.endDateMS - 1000*60*60*24*8;
            globalSettings.currentTile = null;
            globalSettings.currentTab = null;
            $('.apm-ah-accountoverview-tab-container').empty();
            $('.apm-ah-accountoverview-grid-container').empty();

            APMAH.Services.refreshAccountOverviewData();
        }
    });

    $CustomerDebuggingDialog.find('.btn-cancel').psgpGrayButton({
        text: APMTranslation.apm.common.button.cancel(),
        handler: function () {
            var me = this;
            var globalSettings = APMAH.Services.getGlobalSettings();
            var $dialog = $(me).parents('.apm-ah-dialog-custdebug');
            $dialog.dialog('close');

            var oldCompfil = globalSettings.compfil;
            $dialog.find('.field-customer .psgp-textbox').val(oldCompfil);
        }
    });

    var $CustomerDebuggingLabel = $('<div>').addClass('apm-ah-settings-custdebug')
    .psgpSuiteletSettings({
        label: APMTranslation.apm.common.label.customerdebugsettings(),
        $dialog: $CustomerDebuggingDialog
    });

    if (APM_PARAMS.debugMode) {
        $TitleBar.append($CustomerDebuggingLabel);
    }

    var $ShowSnoozedFilter = $(
            '<div class="apm-ah-show-snoozed-items">' +
            '<div class="apm-ah-snooze-icon"></div>' +
            '<div class="apm-ah-snooze-label">' + APMTranslation.apm.r2020a.showsnoozed() +'</div>' +
            '</div>'
    );

    $ShowSnoozedFilter.click(function() {
        var globalSettings = APMAH.Services.getGlobalSettings();
        if ($ShowSnoozedFilter.find('.apm-ah-snooze-icon').hasClass('on')) {
            //show snoozed items
            $ShowSnoozedFilter.find('.apm-ah-snooze-icon').removeClass('on');
            globalSettings.showSnoozed = false;
        } else {
            //hide snoozed items
            $ShowSnoozedFilter.find('.apm-ah-snooze-icon').addClass('on');
            globalSettings.showSnoozed = true;
        }
        APMAH.Components.GridControls.renderGrid();
    });

    var $AccountOverviewPortlet = $('<div>').psgpPortlet({
        title: APMTranslation.apm.r2020a.accounthealthdashboard()
    });

    var $AccountOverviewToolbar = $('<div class="apm-ah-accountoverview-toolbar"><div class="left"></div><div class="right"></div></div>');
    $AccountOverviewToolbar.find('.left')
        .append($('<div class="apm-ah-label">' + APMTranslation.apm.common.label.last7days() + '</div>'))
        .append($('<div class="apm-ah-sublabel"></div>'))
        .append($('<div class="apm-ah-info"></div>'));
    $AccountOverviewToolbar.find('.right')
        .append($ShowSnoozedFilter);

    var rowMarkUp = '<div class="apm-ah-tiles-row"></div>';

    var $AccountOverviewTabContainer = $('<div class="apm-ah-accountoverview-tab-container"></div>');
    var $AccountOverviewGridContainer = $('<div class="apm-ah-accountoverview-grid-container"></div>');

    $AccountOverviewPortlet.psgpPortlet('getBody')
        .append($AccountOverviewToolbar)
        .append(rowMarkUp)
        .append($AccountOverviewTabContainer)
        .append($AccountOverviewGridContainer);

    function renderRefreshDate(dateString) {
        var refreshDateText = '';
        if (dateString) {
            refreshDateText = APMTranslation.apm.common.label.asof({
                params: [dateString]
            });
        }
        $('.apm-ah-accountoverview-toolbar .apm-ah-sublabel').html(refreshDateText);
    }

    function renderTiles(tilesData){
        if (!tilesData || tilesData.length < 1) return;

        var accountOverviewPortlet = $AccountOverviewPortlet.psgpPortlet('getBody');
        accountOverviewPortlet.find('.apm-ah-tiles-row').empty();

        var tilesTotal = tilesData.length;

        var tileMarkUp =
            '<div class="apm-ah-tile">' +
                '<div class="main selectable">' +
                    '<div class="anchor">' +
                    '</div>' +
                    '<div class="header"></div>' +
                    '<div class="body">' +
                        '<div class="no-data">' +
                            '<div class="no-data-icon"></div>' +
                            '<div class="no-data-text">' + APMTranslation.apm.r2020a.noissuesfound() + '</div>' +
                            '<div class="no-data-sub-text">' + APMTranslation.apm.r2020a.noissuesdetectedrecently() + '</div>' +
                        '</div>' +
                        '<div class="issues error-issues">' +
                            '<div class="column-1 error-issues-column-1">' +
                                '<div class="error-issues-count">0</div>' +
                                '<div class="error-issues-label"></div>' +
                            '</div>' +
                            '<div class="column-2 error-issues-column-2"></div>' +
                        '</div>' +
                        '<hr class="error-issues-hr">' +
                        '<div class="issues performance-issues">' +
                            '<div class="column-1 performance-issues-column-1">' +
                                '<div class="performance-issues-count">0</div>' +
                                '<div class="performance-issues-label"></div>' +
                            '</div>' +
                            '<div class="column-2 performance-issues-column-2"></div>' +
                        '</div>' +
                        '<hr class="performance-issues-hr">' +
                        '<div class="issues compliance-issues">' +
                            '<div class="column-1 compliance-issues-column-1">' +
                                '<div class="compliance-issues-count">0</div>' +
                                '<div class="compliance-issues-label"></div>' +
                            '</div>' +
                            '<div class="column-2 compliance-issues-column-2"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        for (var i = 0; i < tilesTotal; i++) {
            var $Tile = $(tileMarkUp);
            var tileData = tilesData[i];
            var tileId = tileData.tileId;
            var errorCount = tileData.errorCount;
            var errorSnoozed = tileData.errorSnoozed;
            var performanceCount = tileData.performanceCount;
            var performanceSnoozed = tileData.performanceSnoozed;
            var complianceCount = tileData.complianceCount;
            var complianceSnoozed = tileData.complianceSnoozed;

            $Tile.find('.main').data('tileData', tileData);
            $Tile.find('.main').addClass(tileId);

            $Tile.find('.header').text(tileData.name);

            if(errorCount) {
                $Tile.find('.error-issues-count').text(errorCount);
                if(errorCount > 1) {
                    $Tile.find('.error-issues-label').text((APMTranslation.apm.r2020a.errors()).toLowerCase());
                }
                else {
                    $Tile.find('.error-issues-label').text((APMTranslation.apm.r2020a.error()).toLowerCase());
                }

            }
            if(errorSnoozed)
                $Tile.find('.error-issues-column-2').text(errorSnoozed + ' ' + APMTranslation.apm.r2020a.snoozed());
            if(errorCount) {
                $Tile.find('.error-issues').removeClass('hidden');
            } else {
                $Tile.find('.error-issues').addClass('hidden');
            }

            if(performanceCount) {
                $Tile.find('.performance-issues-count').text(performanceCount);
                if(performanceCount > 1) {
                    $Tile.find('.performance-issues-label').text((APMTranslation.apm.r2020a.performanceissues()).toLowerCase());
                }
                else {
                    $Tile.find('.performance-issues-label').text((APMTranslation.apm.r2020a.performanceissue()).toLowerCase());
                }
            }
            if(performanceSnoozed)
                $Tile.find('.performance-issues-column-2').text(performanceSnoozed + ' ' + APMTranslation.apm.r2020a.snoozed());
            if(performanceCount) {
                $Tile.find('.performance-issues').removeClass('hidden');
            } else {
                $Tile.find('.performance-issues').addClass('hidden');
            }

            if(complianceCount) {
                $Tile.find('.compliance-issues-count').text(complianceCount);
                if(complianceCount > 1) {
                    $Tile.find('.compliance-issues-label').text((APMTranslation.apm.r2020a.standardsupdates()).toLowerCase());
                }
                else {
                    $Tile.find('.compliance-issues-label').text((APMTranslation.apm.r2020a.standardsupdate()).toLowerCase());
                }
            }
            if(complianceSnoozed)
                $Tile.find('.compliance-issues-column-2').text(complianceSnoozed + ' ' + APMTranslation.apm.r2020a.snoozed());
            if(complianceCount) {
                $Tile.find('.compliance-issues').removeClass('hidden');
            } else {
                $Tile.find('.compliance-issues').addClass('hidden');
            }


            if ((errorCount) && (performanceCount)) {
                $Tile.find('.error-issues-hr').show();
            } else {
                $Tile.find('.error-issues-hr').hide();
            }

            if (((errorCount) && (complianceCount)) || ((performanceCount) && (complianceCount))) {
                $Tile.find('.performance-issues-hr').show();
            } else {
                $Tile.find('.performance-issues-hr').hide();
            }

            if(errorCount || errorSnoozed || performanceCount || performanceSnoozed || complianceCount || complianceSnoozed)
                $Tile.find('.no-data').hide();
            else
                $Tile.find('.main').removeClass('selectable');

            accountOverviewPortlet.find('.apm-ah-tiles-row').append($Tile);
        }

        //select current tile
        var globalSettings = APMAH.Services.getGlobalSettings();
        var currentTile = globalSettings.currentTile;
        if (currentTile) accountOverviewPortlet.find('.apm-ah-tile .'+currentTile).addClass('clicked');

        $('.apm-ah-tiles-row .apm-ah-tile').on('click', '.main.selectable', function() {
            var $element = $(this);
            $('.apm-ah-tiles-row .apm-ah-tile .main.selectable').removeClass('clicked');
            $element.addClass('clicked');

            var tileData = $element.data('tileData');

            var tabLabels = new Array();
            var tabIds = new Array();

            if($element.find('.error-issues').is(":visible")) {
                tabLabels.push(APMTranslation.apm.r2020a.errors());
                tabIds.push('error');
            }
            if($element.find('.performance-issues').is(":visible")) {
                tabLabels.push(APMTranslation.apm.r2020a.performanceissues());
                tabIds.push('performance');
            }
            if($element.find('.compliance-issues').is(":visible")) {
                tabLabels.push(APMTranslation.apm.r2020a.standardsupdates());
                tabIds.push('standardsupdate');
            }

            //add ALL tab
            if (tabIds.length > 1) {
                tabLabels.unshift(APMTranslation.apm.common.label.all());
                tabIds.unshift('all');
            }

            $('.apm-ah-accountoverview-tab').remove();
            var $AccountOverviewTab = $('<div class="apm-ah-accountoverview-tab"></div>').psgpSubTabs({
                prefixId: 'apm-ah-accountoverview-tab-',
                labels: tabLabels,
                listeners: {
                    tabsActivate : function (event, ui) {
                        var $tab = $(event.target);
                        var newTabIndex = $tab.tabs('option', 'active');
                        var tabId = tabIds[newTabIndex];

                        var globalSettings = APMAH.Services.getGlobalSettings();
                        globalSettings.currentTab = tabId;
                        GridControls.renderGrid();
                    }
                }
            });
            $('.apm-ah-accountoverview-tab-container').append($AccountOverviewTab);

            var globalSettings = APMAH.Services.getGlobalSettings();
            globalSettings.currentTile = tileData.tileId;
            globalSettings.currentTab = tabIds[0];
            GridControls.renderGrid();
        })
    }

    /*
     * Expandable Grid
     */

    var GridControls = {
            gridOptions: {
                'record': {
                    columns: [
                        {
                            dataIndex: 'expand',
                            width: '40px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'issue',
                            text: APMTranslation.apm.r2020a.issue(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'record',
                            text: APMTranslation.apm.common.label.recordtype(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'operation',
                            text: APMTranslation.apm.common.label.operation(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'measuredValue',
                            text: APMTranslation.apm.ssa.label.value(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'actions',
                            width: '250px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        }
                    ],

                    listeners: {
                        afterRefreshData: function (grid, response) {
                            var rows = grid.element.find('.main-tbody > .tr-main');
                            var expandableRows = grid.element.find('.main-tbody > .tr-expandable');
                            var gData = grid.options.data;
                            var gParams = grid.options.params;

                            //collapse all
                            grid.element.find('.cell-expandible').hide();

                            rows.each(function(index) {
                                var me = this;
                                $(me).find('.cell-actions .investigate').attr('param-rowIndex', index);
                                $(me).find('.cell-actions .snooze').attr('param-rowIndex', index);
                                $(me).find('.cell-expand .btn').attr('param-rowIndex', index);

                                if (gData[index].actions.isSnoozed) {
                                    rows.eq(index).addClass('snoozed');
                                    expandableRows.eq(index).addClass('snoozed');
                                }
                            });

                            rows.find('.cell-actions .investigate').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];
                                var globalSettings = APMAH.Services.getGlobalSettings();
                                var params = {
                                        sdatetime: globalSettings.startDatePSTString,
                                        edatetime: globalSettings.endDatePSTString,
                                        oper: rData.operation.name.slice(0, 1),
                                        rectype: rData.record.name,
                                        compfil: globalSettings.compfil
                                }
                                var paramString = $.param(params);
                                var SPM_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_spm_sl_main&deploy=customdeploy_apm_spm_sl_main';
                                window.open(SPM_URL + '&' + paramString);
                            });

                            rows.find('.cell-actions .snooze').click(function() {
                                var me = this;
                                var index = $(me).attr('param-rowIndex');
                                var rData = gData[index];
                                var actionsData = rData.actions;
                                var snoozeParams = (actionsData.snoozeParams) ? actionsData.snoozeParams : {};

                                var snoozeParams = {
                                        setSnooze: (actionsData.isSnoozed) ? 'F' : 'T',
                                        smellType: snoozeParams.type,
                                        smellBucket: snoozeParams.bucket,
                                        rData: rData
                                };
                                APMAH.Services.snoozeItem(snoozeParams);
                            });

                            rows.find('.cell-expand .btn').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];

                                GridControls.clickExpandButton(me, rData);
                            });
                        }
                    }
                },
                'script': {
                    columns: [
                        {
                            dataIndex: 'expand',
                            width: '40px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'issue',
                            text: APMTranslation.apm.r2020a.issue(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'script',
                            text: APMTranslation.apm.common.label.scriptname(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'deployment',
                            text: APMTranslation.apm.ptd.label.deploymentid(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'stage',
                            text: APMTranslation.apm.r2020a.stage(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'measuredValue',
                            text: APMTranslation.apm.ssa.label.value(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'actions',
                            width: '250px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        }
                    ],

                    listeners: {
                        afterRefreshData: function (grid, response) {
                            var rows = grid.element.find('.main-tbody > .tr-main');
                            var expandableRows = grid.element.find('.main-tbody > .tr-expandable');
                            var gData = grid.options.data;
                            var gParams = grid.options.params;

                            //collapse all
                            grid.element.find('.cell-expandible').hide();

                            rows.each(function(index) {
                                var me = this;
                                $(me).find('.cell-actions .investigate').attr('param-rowIndex', index);
                                $(me).find('.cell-actions .snooze').attr('param-rowIndex', index);
                                $(me).find('.cell-expand .btn').attr('param-rowIndex', index);

                                if (gData[index].actions.isSnoozed) {
                                    rows.eq(index).addClass('snoozed');
                                    expandableRows.eq(index).addClass('snoozed');
                                }
                            });

                            rows.find('.cell-actions .investigate').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];
                                var globalSettings = APMAH.Services.getGlobalSettings();
                                var params = {
                                        sdatetime: globalSettings.startDatePSTString,
                                        edatetime: globalSettings.endDatePSTString,
                                        scriptid: rData.script.name,
                                        scriptname: APMAH.Services.listData.getName('script', rData.script.name),
                                        compfil: globalSettings.compfil,
                                        scripttype: rData.actions.investigateParams.scriptType,
                                        triggertype: rData.actions.investigateParams.triggerType
                                }
                                var paramString = $.param(params);
                                var SSA_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_ssa_sl_main&deploy=customdeploy_apm_ssa_sl_main';
                                window.open(SSA_URL + '&' + paramString);
                            });

                            rows.find('.cell-actions .snooze').click(function() {
                                var me = this;
                                var index = $(me).attr('param-rowIndex');
                                var rData = gData[index];
                                var actionsData = rData.actions;
                                var snoozeParams = (actionsData.snoozeParams) ? actionsData.snoozeParams : {};

                                var snoozeParams = {
                                        setSnooze: (actionsData.isSnoozed) ? 'F' : 'T',
                                        smellType: snoozeParams.type,
                                        smellBucket: snoozeParams.bucket,
                                        rData: rData
                                };
                                APMAH.Services.snoozeItem(snoozeParams);
                            });

                            rows.find('.cell-expand .btn').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];

                                GridControls.clickExpandButton(me, rData);
                            });
                        }
                    }
                },
                'savedsearch': {
                    columns: [
                        {
                            dataIndex: 'expand',
                            width: '40px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'issue',
                            text: APMTranslation.apm.r2020a.issue(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'savedsearch',
                            text: APMTranslation.apm.spd.label.savedsearch(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'record',
                            text: APMTranslation.apm.common.label.recordtype(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'measuredValue',
                            text: APMTranslation.apm.ssa.label.value(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'actions',
                            width: '250px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        }
                    ],

                    listeners: {
                        afterRefreshData: function (grid, response) {
                            var rows = grid.element.find('.main-tbody > .tr-main');
                            var expandableRows = grid.element.find('.main-tbody > .tr-expandable');
                            var gData = grid.options.data;
                            var gParams = grid.options.params;

                            //collapse all
                            grid.element.find('.cell-expandible').hide();

                            rows.each(function(index) {
                                var me = this;
                                $(me).find('.cell-actions .investigate').attr('param-rowIndex', index);
                                $(me).find('.cell-actions .snooze').attr('param-rowIndex', index);
                                $(me).find('.cell-expand .btn').attr('param-rowIndex', index);

                                if (gData[index].actions.isSnoozed) {
                                    rows.eq(index).addClass('snoozed');
                                    expandableRows.eq(index).addClass('snoozed');
                                }
                            });

                            rows.find('.cell-actions .investigate').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];
                                var globalSettings = APMAH.Services.getGlobalSettings();
                                var params = {
                                        startDateMS: globalSettings.startDateMS,
                                        endDateMS: globalSettings.endDateMS,
                                        searchId: rData.savedsearch.name,
                                        compfil: globalSettings.compfil
                                }
                                var paramString = $.param(params);
                                var SPD_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_spd_sl_main&deploy=customdeploy_apm_spd_sl_main';
                                window.open(SPD_URL + '&' + paramString);
                            });

                            rows.find('.cell-actions .snooze').click(function() {
                                var me = this;
                                var index = $(me).attr('param-rowIndex');
                                var rData = gData[index];
                                var actionsData = rData.actions;
                                var snoozeParams = (actionsData.snoozeParams) ? actionsData.snoozeParams : {};

                                var snoozeParams = {
                                        setSnooze: (actionsData.isSnoozed) ? 'F' : 'T',
                                        smellType: snoozeParams.type,
                                        smellBucket: snoozeParams.bucket,
                                        rData: rData
                                };
                                APMAH.Services.snoozeItem(snoozeParams);
                            });

                            rows.find('.cell-expand .btn').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];

                                GridControls.clickExpandButton(me, rData);
                            });
                        }
                    }
                },
                'integration': {
                    columns: [
                        {
                            dataIndex: 'expand',
                            width: '40px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'issue',
                            text: APMTranslation.apm.r2020a.issue(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'integration',
                            text: APMTranslation.apm.common.label.integration(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'operation',
                            text: APMTranslation.apm.common.label.operation(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'measuredValue',
                            text: APMTranslation.apm.ssa.label.value(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'actions',
                            width: '250px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        }
                    ],

                    listeners: {
                        afterRefreshData: function (grid, response) {
                            var rows = grid.element.find('.main-tbody > .tr-main');
                            var expandableRows = grid.element.find('.main-tbody > .tr-expandable');
                            var gData = grid.options.data;
                            var gParams = grid.options.params;

                            //collapse all
                            grid.element.find('.cell-expandible').hide();

                            rows.each(function(index) {
                                var me = this;
                                $(me).find('.cell-actions .investigate').attr('param-rowIndex', index);
                                $(me).find('.cell-actions .snooze').attr('param-rowIndex', index);
                                $(me).find('.cell-expand .btn').attr('param-rowIndex', index);

                                if (gData[index].actions.isSnoozed) {
                                    rows.eq(index).addClass('snoozed');
                                    expandableRows.eq(index).addClass('snoozed');
                                }
                            });

                            rows.find('.cell-actions .investigate').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];
                                var globalSettings = APMAH.Services.getGlobalSettings();

                                if (rData.issue.type == "integration-concurrency-limit-close") {
                                    var params = {
                                            startDateMS: globalSettings.startDateMS,
                                            endDateMS: globalSettings.endDateMS,
                                            compfil: globalSettings.compfil
                                    }
                                    var paramString = $.param(params);
                                    var CM_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_cm_sl_main&deploy=customdeploy_apm_cm_sl_main';
                                    window.open(CM_URL + '&' + paramString);
                                } else {
                                    var params = {
                                            startDateMS: globalSettings.startDateMS,
                                            endDateMS: globalSettings.endDateMS,
                                            operation: rData.operation.name,
                                            integration: rData.integration.name,
                                            compfil: globalSettings.compfil
                                    }
                                    var paramString = $.param(params);
                                    var WSOD_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_wsod_sl_main&deploy=customdeploy_apm_wsod_sl_main';
                                    window.open(WSOD_URL + '&' + paramString);
                                }
                            });

                            rows.find('.cell-actions .snooze').click(function() {
                                var me = this;
                                var index = $(me).attr('param-rowIndex');
                                var rData = gData[index];
                                var actionsData = rData.actions;
                                var snoozeParams = (actionsData.snoozeParams) ? actionsData.snoozeParams : {};

                                var snoozeParams = {
                                        setSnooze: (actionsData.isSnoozed) ? 'F' : 'T',
                                        smellType: snoozeParams.type,
                                        smellBucket: snoozeParams.bucket,
                                        rData: rData
                                };
                                APMAH.Services.snoozeItem(snoozeParams);
                            });

                            rows.find('.cell-expand .btn').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];

                                GridControls.clickExpandButton(me, rData);
                            });
                        }
                    }
                },
                'processor': {
                    columns: [
                        {
                            dataIndex: 'expand',
                            width: '40px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'issue',
                            text: APMTranslation.apm.r2020a.issue(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'measuredValue',
                            text: APMTranslation.apm.ssa.label.value(),
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        },
                        {
                            dataIndex: 'actions',
                            width: '250px',
                            text: '',
                            renderer: function (value, record) {
                                var markUp = GridControls.getGridCellContent(value);
                                return markUp;
                            }
                        }
                    ],

                    listeners: {
                        afterRefreshData: function (grid, response) {
                            var rows = grid.element.find('.main-tbody > .tr-main');
                            var expandableRows = grid.element.find('.main-tbody > .tr-expandable');
                            var gData = grid.options.data;
                            var gParams = grid.options.params;

                            //collapse all
                            grid.element.find('.cell-expandible').hide();

                            rows.each(function(index) {
                                var me = this;
                                $(me).find('.cell-actions .investigate').attr('param-rowIndex', index);
                                $(me).find('.cell-actions .snooze').attr('param-rowIndex', index);
                                $(me).find('.cell-expand .btn').attr('param-rowIndex', index);

                                if (gData[index].actions.isSnoozed) {
                                    rows.eq(index).addClass('snoozed');
                                    expandableRows.eq(index).addClass('snoozed');
                                }
                            });

                            rows.find('.cell-actions .investigate').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];
                                var globalSettings = APMAH.Services.getGlobalSettings();

                                var params = {
                                        startDateMS: globalSettings.startDateMS,
                                        endDateMS: globalSettings.endDateMS
                                }
                                var paramString = $.param(params);
                                var SCPM_URL = '/app/site/hosting/scriptlet.nl?script=customscript_apm_scpm_sl_main&deploy=customdeploy_apm_scpm_sl_main';
                                window.open(SCPM_URL + '&' + paramString);
                            });

                            rows.find('.cell-actions .snooze').click(function() {
                                var me = this;
                                var index = $(me).attr('param-rowIndex');
                                var rData = gData[index];
                                var actionsData = rData.actions;
                                var snoozeParams = (actionsData.snoozeParams) ? actionsData.snoozeParams : {};

                                var snoozeParams = {
                                        setSnooze: (actionsData.isSnoozed) ? 'F' : 'T',
                                        smellType: snoozeParams.type,
                                        smellBucket: snoozeParams.bucket,
                                        rData: rData
                                };
                                APMAH.Services.snoozeItem(snoozeParams);
                            });

                            rows.find('.cell-expand .btn').click(function() {
                                var me = this;
                                var rData = gData[$(me).attr('param-rowIndex')];

                                GridControls.clickExpandButton(me, rData);
                            });
                        }
                    }
                },
            },

            renderGrid: function () {
                var me = this;
                var globalSettings = APMAH.Services.getGlobalSettings();
                var tileType = globalSettings.currentTile;
                var tabType = globalSettings.currentTab;
                var showSnoozed = globalSettings.showSnoozed;
                $('.apm-ah-accountoverview-grid-container').empty();

                var gridOptions = me.gridOptions[tileType];
                if (!gridOptions) return;

                var gridClass = "apm-ah-expandablegrid " + tileType;
                var $Grid = $('<div class="' + gridClass + '"></div>').psgpExpandableGrid(gridOptions);
                $('.apm-ah-accountoverview-grid-container').append($Grid);

                var dataToShow = APMAH.Services.gridData.getData(tileType, tabType, showSnoozed);
                if (dataToShow && dataToShow.length > 0) {
                    $Grid.psgpExpandableGrid('refreshData', {data: dataToShow});
                }

            },

            getGridCellContent: function (params) {
                var markUp = '';
                var format = params.format;

                switch (format) {


                /* COMMON */
                case 'expand':
                    markUp =
                        '<div class="cell-expand cell-main">' +
                            '<div class="btn"></div>'
                        '</div>';
                    break;

                case 'actions':
                    var showInvestigate = params.showInvestigate;
                    var isSnoozed = params.isSnoozed;
                    var showSnooze = params.showSnooze;

                    markUp +=  '<div class="cell-actions cell-main">';
                    if (showInvestigate) {
                        markUp += '<div class="investigate">' + APMTranslation.apm.r2020a.investigate() + '</div>';
                    } else {
                        markUp += '<div class="no-action">' + '</div>';
                    }
                    if (showSnooze) {
                        if (isSnoozed) {
                            markUp += '<div class="snooze">' + APMTranslation.apm.r2020a.endsnooze() + '</div>';
                        } else {
                            markUp += '<div class="snooze">' + APMTranslation.apm.r2020a.snooze() + '</div>';
                        }
                    } else {
                        markUp += '<div class="no-action">' + '</div>';
                    }

                    markUp += '</div>';

                    break;

                /* RECORD */
                case 'record-issue-error':
                    var text = '';
                    switch (params.type) {
                    }

                    markUp = '<div class="cell-issue cell-error cell-main">' + text + '</div>';
                    break;

                case 'record-issue-performance':
                    var text = '';
                    switch (params.type) {
                    case 'record-high-response-time':
                        text = APMTranslation.apm.r2020a.highmedianresponsetime();
                        break;
                    }

                    markUp = '<div class="cell-issue cell-performance cell-main">' + text + '</div>';
                    break;

                case 'record-issue-standardsupdate':
                    var text = '';
                    switch (params.type) {
                    }

                    markUp = '<div class="cell-issue cell-standardsupdate cell-main">' + text + '</div>';
                    break;

                case 'record-record':
                    var text = APMAH.Services.listData.getName('recordType', params.name);
                    text = text ? text : params.name;
                    markUp = '<div class="cell-record cell-main">' + text + '</div>';
                    break;

                case 'record-operation':
                    var text = params.name;
                    markUp = '<div class="cell-operation cell-main">' + text + '</div>';
                    break;

                case 'record-measured-value':
                    var text = '';
                    switch (params.type) {
                    case 'record-response-time':
                        text = params.value ? params.value / 1000 : 0;
                        text = text ? text.toFixed(2) + ' s' : '0';
                        break;
                    }
                    markUp = '<div class="cell-measured-value cell-main">' + text + '</div>';
                    break;

                /* SCRIPT */
                case 'script-issue-error':
                    var text = '';
                    switch (params.type) {
                    case 'script-high-error-rate':
                        text = APMTranslation.apm.r2020a.higherrorrate();
                        break;
                    }

                    markUp = '<div class="cell-issue cell-error cell-main">' + text + '</div>';
                    break;

                case 'script-issue-performance':
                    var text = '';
                    switch (params.type) {
                    }

                    markUp = '<div class="cell-issue cell-performance cell-main">' + text + '</div>';
                    break;

                case 'script-issue-standardsupdate':
                    var text = '';
                    switch (params.type) {
                    case 'script-deployments-exceed':
                        text = APMTranslation.apm.r2020a.deploymentsover100();
                        break;
                    }

                    markUp = '<div class="cell-issue cell-standardsupdate cell-main">' + text + '</div>';
                    break;

                case 'script-script':
                    var text = APMAH.Services.listData.getName('script', params.name);
                    text = text ? text : params.name;
                    markUp = '<div class="cell-script cell-main">' + text + '</div>';
                    break;

                case 'script-deployment':
                    var text = params.name;
                    markUp = '<div class="cell-deployment cell-main">' + text + '</div>';
                    break;

                case 'script-stage':
                    var text = params.map;
                    text = text ? text : '-';
                    markUp = '<div class="cell-stage cell-main">' + text + '</div>';
                    break;

                case 'script-measured-value':
                    var text = '';
                    switch (params.type) {
                    case 'script-error-rate':
                        text = params.value ? params.value : 0;
                        text = text ? text.toFixed(2) + ' %' : '0';
                        break;
                    case 'script-deployment-count':
                        text = params.value ? parseInt(params.value) : '0';
                    }
                    markUp = '<div class="cell-measured-value cell-main">' + text + '</div>';
                    break;

                /* SAVED SEARCH */
                case 'savedsearch-issue-error':
                    var text = '';
                    switch (params.type) {
                    }

                    markUp = '<div class="cell-issue cell-error cell-main">' + text + '</div>';
                    break;

                case 'savedsearch-issue-performance':
                    var text = '';
                    switch (params.type) {
                    case 'savedsearch-high-timeout-rate':
                        text = APMTranslation.apm.r2020a.hightimeoutrate();
                        break;
                    case 'savedsearch-high-execution-time':
                        text = APMTranslation.apm.r2020a.highmedianrequesttime();
                        break;
                    }

                    markUp = '<div class="cell-issue cell-performance cell-main">' + text + '</div>';
                    break;

                case 'savedsearch-issue-standardsupdate':
                    var text = '';
                    switch (params.type) {
                    }

                    markUp = '<div class="cell-issue cell-standardsupdate cell-main">' + text + '</div>';
                    break;

                case 'savedsearch-savedsearch':
                    var listObj = APMAH.Services.listData.getName('search', params.name);
                    var text = listObj[1];
                    text = text ? text : params.name;
                    markUp = '<div class="cell-savedsearch cell-main">' + text + '</div>';
                    break;

                case 'savedsearch-record':
                    var listObj = APMAH.Services.listData.getName('search', params.name);
                    var text = listObj[4];
                    text = text ? text : params.name;
                    markUp = '<div class="cell-record cell-main">' + text + '</div>';
                    break;

                case 'savedsearch-measured-value':
                    var text = '';
                    switch (params.type) {
                    case 'savedsearch-timeout-rate':
                        text = params.value ? params.value : 0;
                        text = text ? text.toFixed(2) + ' %' : '0';
                        break;
                    case 'savedsearch-execution-time':
                        text = params.value ? params.value / 1000 : 0;
                        text = text ? text.toFixed(2) + ' s' : '0';
                        break;
                    }
                    markUp = '<div class="cell-measured-value cell-main">' + text + '</div>';
                    break;

                /* INTEGRATION */
                case 'integration-issue-error':
                    var text = '';
                    switch (params.type) {
                    case 'integration-high-error-rate':
                        text = APMTranslation.apm.r2020a.higherrorrate();
                        break;
                    case 'integration-high-account-concurrency':
                        text = APMTranslation.apm.r2020a.higherrorrateforaccountconcurrency();
                        break;
                    case 'integration-high-user-concurrency':
                        text = APMTranslation.apm.r2020a.higherrorrateforuserconcurrency();
                        break;
                    }

                    markUp = '<div class="cell-issue cell-error cell-main">' + text + '</div>';
                    break;

                case 'integration-issue-performance':
                    var text = '';
                    switch (params.type) {
                    case 'integration-high-median-time-record':
                        text = APMTranslation.apm.r2020a.highmediantimeperrecord();
                        break;
                    }

                    markUp = '<div class="cell-issue cell-performance cell-main">' + text + '</div>';
                    break;

                case 'integration-issue-standardsupdate':
                    var text = '';
                    switch (params.type) {
                    case 'integration-unsupported-wsdl':
                        text = APMTranslation.apm.r2020a.unsupportedwsdlversion();
                        break;
                    case 'integration-concurrency-limit-close':
                        text = APMTranslation.apm.r2020a.requestsnearconcurrencylimit();
                        break;
                    }

                    markUp = '<div class="cell-issue cell-standardsupdate cell-main">' + text + '</div>';
                    break;

                case 'integration-integration':
                    var text = APMAH.Services.listData.getName('integration', params.name);
                    text = text ? text : params.name;
                    text = text ? text : '-';
                    markUp = '<div class="cell-integration cell-main">' + text + '</div>';
                    break;

                case 'integration-operation':
                    var text = params.name;
                    text = text ? text : '-';
                    markUp = '<div class="cell-operation cell-main">' + text + '</div>';
                    break;

                case 'integration-measured-value':
                    var text = '';
                    switch (params.type) {
                    case 'integration-error-rate':
                        text = params.value ? params.value : 0;
                        text = text ? text.toFixed(2) + ' %' : '0';
                        break;
                    case 'integration-execution-time':
                        text = params.value ? params.value / 1000 : 0;
                        text = text ? text.toFixed(2) + ' s' : '0';
                        break;
                    case 'integration-wsdl':
                        text = params.value ? params.value : '-';
                        break;
                    case 'integration-concurrency-limit':
                        text = params.value ? params.value : 0;
                        text = text ? text.toFixed(2) + ' % ' + APMTranslation.apm.r2020a.oftime() : '0';
                        break;
                    }
                    markUp = '<div class="cell-measured-value cell-main">' + text + '</div>';
                    break;

                /* PROCESSOR */
                case 'processor-issue-error':
                    var text = '';
                    switch (params.type) {
                    }

                    markUp = '<div class="cell-issue cell-error cell-main">' + text + '</div>';
                    break;

                case 'processor-issue-performance':
                    var text = '';
                    switch (params.type) {
                    case 'processor-high-wait-time':
                        text = APMTranslation.apm.r2020a.highaveragewaittime();
                        break;
                    case 'processor-high-failure-rate':
                        text = APMTranslation.apm.r2020a.highrateoffailedjobs();
                        break;
                    case 'processor-low-utilization':
                        text = APMTranslation.apm.r2020a.lowusageofreservedprocessors();
                        break;
                    }

                    markUp = '<div class="cell-issue cell-performance cell-main">' + text + '</div>';
                    break;

                case 'processor-issue-standardsupdate':
                    var text = '';
                    switch (params.type) {
                    }

                    markUp = '<div class="cell-issue cell-standardsupdate cell-main">' + text + '</div>';
                    break;

                case 'processor-measured-value':
                    var text = '';
                    switch (params.type) {
                    case 'processor-wait-time':
                        text = params.value ? params.value / 1000 : 0;
                        text = text ? text.toFixed(2) + ' s' : '0';
                        break;
                    case 'processor-failure-rate':
                        text = params.value ? params.value : 0;
                        text = text ? text.toFixed(2) + ' %' : '0';
                        break;
                    case 'processor-utilization':
                        text = params.value ? params.value : 0;
                        text = text ? text.toFixed(2) + ' %' : '0';
                        break;
                    }
                    markUp = '<div class="cell-measured-value cell-main">' + text + '</div>';
                    break;

                default:
                    markUp = '';
                };

                return markUp;
            },

            renderExpandedCellContent: function ($container, params) {
                var me = this;
                var format = params.format;

                switch (format) {
                /* RECORD */
                case 'record-high-response-time':
                    var metricsData = [
                        {
                            classId: 'requests',
                            label: APMTranslation.apm.common.label.requests(),
                            value: params.requestsTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];

                    var markUp =
                        '<div class="record-high-response-time">' +
                            '<div class="metrics">' +
                                me.buildMetricsMarkUp(metricsData) +
                            '</div>' +
                            '<div class="median-times">' +
                                '<div class="title">' +
                                    APMTranslation.apm.r2020a.mediantimes() +
                                '</div>' +
                                '<div class="bars">' +
                                '</div>' +
                                '<div class="list">' +
                                '</div>' +
                            '</div>' +
                        '</div>';

                    $container.append(markUp);

                    var medianTimesData = [
                        {
                            label: APMTranslation.apm.r2020a.suitescripts(),
                            color: '#99C3FF',
                            timeValue: params.suiteScriptsTime,
                            percValue: params.suiteScriptsTimePerc
                        },
                        {
                            label: APMTranslation.apm.r2019a.workflows(),
                            color: '#006AFF',
                            timeValue: params.workflowsTime,
                            percValue: params.workflowsTimePerc
                        },
                        {
                            label: APMTranslation.apm.common.label.network(),
                            color: '#E6C317',
                            timeValue: params.networkTime,
                            percValue: params.networkTimePerc
                        },
                        {
                            label: APMTranslation.apm.common.label.client(),
                            color: '#58643B',
                            timeValue: params.clientTime,
                            percValue: params.clientTimePerc
                        }
                    ]

                    var maxBarWidth = 700;
                    var $MedianTimesValuesArray = new Array();
                    var $MedianTimesBarArray = new Array();

                    for (var i in medianTimesData) {
                        $MedianTimesValues = $(  '<div class="median-time">' +
                                                    '<div class="label">' +
                                                        '<div class="label-dot">' +
                                                        '</div>' +
                                                        '<div class="label-text">' +
                                                            medianTimesData[i].label +
                                                        '</div>' +
                                                    '</div>' +
                                                    '<div class="value">' +
                                                        '<span class="value-time">' +
                                                            medianTimesData[i].timeValue.toFixed(2) + ' s' +
                                                        '</span>' +
                                                        '<span class="value-perc">' +
                                                            '(' +medianTimesData[i].percValue.toFixed(1) + ' %)' +
                                                        '</span>' +
                                                    '</div>' +
                                                '</div>' );

                        $MedianTimesValues.find('.label-dot').css ({ 'background-color' : medianTimesData[i].color });
                        $MedianTimesValuesArray.push($MedianTimesValues);

                        if (medianTimesData[i].percValue && medianTimesData[i].percValue > 0 ) {
                            var barWidth = medianTimesData[i].percValue * maxBarWidth / 100;
                            $MedianTimesBar = $( '<div class="bar"></div>').css({
                                    'background-color' : medianTimesData[i].color,
                                    'width': barWidth + 'px'
                                    });
                            $MedianTimesBarArray.push($MedianTimesBar);
                        }

                    }

                    $container.find('.list').append($MedianTimesValuesArray);
                    $container.find('.bars').append($MedianTimesBarArray);

                    break;

                /* SCRIPT */
                case 'script-high-error-rate':
                    var metricsData = [
                        {
                            classId: 'executions',
                            label: APMTranslation.apm.common.label.requests(),
                            value: params.executionsTotal
                        },
                        {
                            classId: 'failed',
                            label: APMTranslation.apm.common.label.failedrequests(),
                            value: params.failedTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp =
                        '<div class="script-high-error-rate">' +
                            '<div class="metrics">' +
                                me.buildMetricsMarkUp(metricsData) +
                            '</div>' +
                            '<div class="chart daily-error-rates">' +
                                '<div class="title">' +
                                    APMTranslation.apm.r2020a.dailyerrorrates() +
                                '</div>' +
                                '<div class="body">' +
                                '</div>' +
                            '</div>' +
                        '</div>';

                    $container.append(markUp);
                    var smellDetailsParams = {
                            smellFormat: params.format,
                            collectedMS: params.collectedMS,
                            scriptId : params.scriptId
                    };

                    APMAH.Services.refreshSmellDetailsData(smellDetailsParams, $container);

                    break;

                case 'script-deployments-exceed':
                    break;

                    /* SAVED SEARCH */
                case 'savedsearch-high-timeout-rate':
                    var metricsData = [
                        {
                            classId: 'executions',
                            label: APMTranslation.apm.common.label.requests(),
                            value: params.executionsTotal
                        },
                        {
                            classId: 'failed',
                            label: APMTranslation.apm.common.label.failedrequests(),
                            value: params.failedTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp =
                        '<div class="savedsearch-high-timeout-rate">' +
                            '<div class="metrics">' +
                                me.buildMetricsMarkUp(metricsData) +
                            '</div>' +
                            '<div class="chart daily-error-rates">' +
                                '<div class="title">' +
                                    APMTranslation.apm.r2020a.dailyerrorrates() +
                                '</div>' +
                                '<div class="body">' +
                                '</div>' +
                            '</div>' +
                        '</div>';

                    $container.append(markUp);

                    var smellDetailsParams = {
                            smellFormat: params.format,
                            collectedMS: params.collectedMS,
                            searchId: params.searchId
                    };

                    APMAH.Services.refreshSmellDetailsData(smellDetailsParams, $container);
                    break;

                case 'savedsearch-high-execution-time':
                    var metricsData = [
                        {
                            classId: 'requests',
                            label: APMTranslation.apm.common.label.requests(),
                            value: params.requestsTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp = '<div class="savedsearch-high-execution-time">' +
                                    '<div class="metrics">' +
                                        me.buildMetricsMarkUp(metricsData) +
                                    '</div>' +
                                '</div>';
                    $container.append(markUp);
                    break;

                    /* INTEGRATION */
                case 'integration-high-error-rate':
                    var recordType = APMAH.Services.listData.getName('recordType', params.recordType);
                    var metricsData = [
                        {
                            classId: 'recordtype',
                            label: APMTranslation.apm.common.label.recordtype(),
                            value: recordType ? recordType : params.recordType
                        },
                        {
                            classId: 'requests',
                            label: APMTranslation.apm.common.label.requests(),
                            value: params.requestsTotal
                        },
                        {
                            classId: 'failed',
                            label: APMTranslation.apm.common.label.failedrequests(),
                            value: params.failedTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp =
                        '<div class="savedsearch-high-timeout-rate">' +
                            '<div class="metrics">' +
                                me.buildMetricsMarkUp(metricsData) +
                            '</div>' +
                            '<div class="chart daily-error-rates">' +
                                '<div class="title">' +
                                    APMTranslation.apm.r2020a.dailyerrorrates() +
                                '</div>' +
                                '<div class="body">' +
                                '</div>' +
                            '</div>' +
                        '</div>';

                    $container.append(markUp);
                    var smellDetailsParams = {
                            smellFormat  : params.format,
                            collectedMS  : params.collectedMS,
                            action       : params.action,
                            integration: params.integration,
                            recordTypeKey: params.recordTypeKey
                    };

                    APMAH.Services.refreshSmellDetailsData(smellDetailsParams, $container);

                    break;

                case 'integration-high-median-time-record':
                    var recordType = APMAH.Services.listData.getName('recordType', params.recordType);
                    var metricsData = [
                        {
                            classId: 'recordtype',
                            label: APMTranslation.apm.common.label.recordtype(),
                            value: recordType ? recordType : params.recordType
                        },
                        {
                            classId: 'requests',
                            label: APMTranslation.apm.common.label.requests(),
                            value: params.requestsTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp = '<div class="integration-high-median-time-record">' +
                                    '<div class="metrics">' +
                                        me.buildMetricsMarkUp(metricsData) +
                                    '</div>' +
                                '</div>';
                    $container.append(markUp);
                    break;

                case 'integration-unsupported-wsdl':
                    var metricsData = [
                        {
                            classId: 'requests',
                            label: APMTranslation.apm.common.label.requests(),
                            value: params.requestsTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp = '<div class="integration-unsupported-wsdl">' +
                                    '<div class="metrics">' +
                                        me.buildMetricsMarkUp(metricsData) +
                                    '</div>' +
                                '</div>';
                    $container.append(markUp);
                    break;

                case 'integration-concurrency-limit-close':
                    var metricsData = [
                        {
                            classId: 'applications',
                            label: APMTranslation.apm.r2020a.affectedintegrations(),
                            value: params.applicationsTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp = '<div class="integration-concurrency-limit-close">' +
                                    '<div class="metrics">' +
                                        me.buildMetricsMarkUp(metricsData) +
                                    '</div>' +
                                '</div>';
                    $container.append(markUp);
                    break;

                case 'integration-high-account-concurrency':
                    var metricsData = [
                        {
                            classId: 'peakconcurrency',
                            label: APMTranslation.apm.cm.label.peakconcurrency(),
                            value: params.peakConcurrency
                        },
                        {
                            classId: 'applications',
                            label: APMTranslation.apm.r2020a.affectedintegrations(),
                            value: params.applicationsTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp = '<div class="integration-high-account-concurrency">' +
                                    '<div class="metrics">' +
                                        me.buildMetricsMarkUp(metricsData) +
                                    '</div>' +
                                '</div>';
                    $container.append(markUp);
                    break;

                case 'integration-high-user-concurrency':
                    var metricsData = [
                        {
                            classId: 'peakconcurrency',
                            label: APMTranslation.apm.cm.label.peakconcurrency(),
                            value: params.peakConcurrency
                        },
                        {
                            classId: 'applications',
                            label: APMTranslation.apm.r2020a.affectedintegrations(),
                            value: params.applicationsTotal
                        },
                        {
                            classId: 'users',
                            label: APMTranslation.apm.common.label.users(),
                            value: params.usersTotal
                        }
                    ];
                    var markUp = '<div class="integration-high-user-concurrency">' +
                                    '<div class="metrics">' +
                                        me.buildMetricsMarkUp(metricsData) +
                                    '</div>' +
                                '</div>';
                    $container.append(markUp);
                    break;

                    /* PROCESSOR */
                case 'processor-high-wait-time':
                    var metricsData = [
                        {
                            classId: 'jobs',
                            label: APMTranslation.apm.scpm.label.jobs(),
                            value: params.jobsTotal
                        }
                    ];
                    var markUp = '<div class="processor-high-wait-time">' +
                                    '<div class="metrics">' +
                                        me.buildMetricsMarkUp(metricsData) +
                                    '</div>' +
                                '</div>';
                    $container.append(markUp);
                    break;

                case 'processor-high-failure-rate':
                    var metricsData = [
                        {
                            classId: 'jobs',
                            label: APMTranslation.apm.scpm.label.jobs(),
                            value: params.jobsTotal
                        },
                        {
                            classId: 'failed',
                            label: APMTranslation.apm.r2020a.failedjobs(),
                            value: params.failedTotal
                        }
                    ];
                    var markUp = '<div class="processor-high-failure-rate">' +
                                    '<div class="metrics">' +
                                        me.buildMetricsMarkUp(metricsData) +
                                    '</div>' +
                                '</div>';
                    $container.append(markUp);
                    break;
                default:

                };


            },

            buildMetricsMarkUp : function (metricsData) {
                var markUp = '';
                for (var i in metricsData) {
                    markUp +=   '<div class="metric ' + metricsData[i].classId + '">' +
                                    '<div class="label">' +
                                        metricsData[i].label +
                                    '</div>' +
                                    '<div class="value">' +
                                        metricsData[i].value +
                                    '</div>' +
                                '</div>';
                }
                return markUp;
            },

            removeExpandedCellContent: function (params) {
                var $container = params.container;
                $container.empty();
            },

            clickExpandButton: function (btn, data) {
                var me = this; //GridControls

                var $body = $(btn).parentsUntil('table').last();
                var $row = $(btn).parentsUntil('.main-tbody').last();
                var rowIndex = $body.find('.tr-main').index($row);
                var $expandRowTd = $('.psgp-expandable-grid').find('.tr-expandable td').eq(rowIndex);
                var $btn = $(btn);

                if ($btn.hasClass('expanded')) {
                    //collapse
                    $btn.removeClass('expanded');
                    me.removeExpandedCellContent({
                        container: $expandRowTd
                    });
                } else {
                    //expand
                    $btn.addClass('expanded');
                    me.renderExpandedCellContent( $expandRowTd, data.expand.details );
                }
            }
        }

    return {
        $TitleBar: $TitleBar,
        $AccountOverviewPortlet: $AccountOverviewPortlet,
        $CustomerDebuggingDialog: $CustomerDebuggingDialog,
        renderTiles: renderTiles,
        GridControls: GridControls,
        renderRefreshDate: renderRefreshDate
    };
};