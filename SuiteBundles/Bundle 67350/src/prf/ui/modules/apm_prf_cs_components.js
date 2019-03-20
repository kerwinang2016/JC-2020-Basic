/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Aug 2018     rwong            Initial
 * 2.00       10 Aug 2018     jmarimla         Frht chart and grid
 * 3.00       04 Sep 2018     jmarimla         Frht button icons
 * 4.00       28 Sep 2018     jmarimla         Drilldown timeline
 * 5.00       26 Oct 2018     jmarimla         Kpi labels
 * 6.00       14 Dec 2018     jmarimla         Update labels
 *
 */
APMPRF = APMPRF || {};

APMPRF._Components = function() {

    var $TitleBar = $('<div>').psgpSuiteletTitle({
        title: "Profiler"
    });

    var $ColumnPanel = $('<div>').psgpColumnPanel({
        columndef: [{
            width: '99%',
            padding: '0px 0px 0px 0px'
        }, {
            width: '1%',
            padding: '0px 0px 0px 0px'
        }]
    });

    var $ProfilerDetailsPortlet = $('<div>').psgpPortlet({
        title: 'Profiler Details'
    });

    var $Breadcrumbs = $('<div class="apm-prf-breadcrumbs">');

    var $KPIDetails = $('<div>')

    var $FrhtChartSubPanel = $('<div class="apm-prf-subpanel-frhtchart">').psgpSubPanel({
        title: 'Timeline'
    });

    var $FrhtGridSubPanel = $('<div class="apm-prf-subpanel-frhtgrid">').psgpSubPanel({
        title: 'Timing Details'
    });

    var frhtGridOptions = {
        url: APMPRF.Services.getURL('frhtLogs'),
        exportCSV: true,
        sort: {
            remote: false
        },
        columns: [{
                dataIndex: 'date',
                sortable: false,
                text: 'Date & Time'
            },
//            {
//                dataIndex: 'Id',
//                sortable: false,
//                text: 'ID'
//            },
//            {
//                dataIndex: 'parentId',
//                sortable: false,
//                text: 'Parent ID'
//            },
            {
                dataIndex: 'type',
                sortable: false,
                text: 'Type'
            },
            {
                dataIndex: 'executionTime',
                sortable: false,
                text: 'Execution Time',
                renderer: function(value, record) {
                    return (value) ? value.toFixed(3) + ' s' : 0;
                }
            },
            {
                dataIndex: 'scriptsTotal',
                sortable: false,
                text: 'Scripts'
            },
            {
                dataIndex: 'searchesTotal',
                sortable: false,
                text: 'Searches'
            },
            {
                dataIndex: 'workflowsTotal',
                sortable: false,
                text: 'Workflows'
            },
            {
                dataIndex: 'operation',
                sortable: false,
                text: 'Operation'
            },
            {
                dataIndex: 'recordType',
                sortable: false,
                text: 'Record Type'
            },
            {
                dataIndex: 'context',
                sortable: false,
                text: 'Context'
            },
            {
                dataIndex: 'entryPoint',
                sortable: false,
                text: 'Entry Point'
            },
            {
                dataIndex: 'scriptType',
                sortable: false,
                text: 'Script Type'
            },
            {
                dataIndex: 'triggerType',
                sortable: false,
                text: 'Trigger Type'
            },
            {
                dataIndex: 'viewCalls',
                text: '',
                width: '40px',
                renderer: function(value, record) {
                	var type = record.type;
                	var frhtConfig = APMPRF.Highcharts.frhtTypes[type];
                    frhtConfig = frhtConfig ? frhtConfig : APMPRF.Highcharts.frhtTypes['default'];
                    var enableBtn = frhtConfig.viewCalls;
                	if (enableBtn) {
                		var $markUp = $('<div><div class="apm-prf-frhtgrid-viewcalls-icon"></div></div>');
                        $markUp.find('.apm-prf-frhtgrid-viewcalls-icon').attr('param-oper', value);
                        return $markUp.html();
                	} else {
                		return '';
                	}
                },
                resizable: false,
                sortable: false
            },
            {
                dataIndex: 'drillDown',
                text: '',
                width: '40px',
                renderer: function(value, record) {
                	var type = record.type;
                	var frhtConfig = APMPRF.Highcharts.frhtTypes[type];
                    frhtConfig = frhtConfig ? frhtConfig : APMPRF.Highcharts.frhtTypes['default'];
                    var enableBtn = frhtConfig.drilldown;
                	if (enableBtn) {
                		var $markUp = $('<div><div class="apm-prf-frhtgrid-drilldown-icon"></div></div>');
                        $markUp.find('.apm-prf-frhtgrid-drilldown-icon').attr('param-oper', value);
                        return $markUp.html();
                	} else {
                		return '';
                	}
                },
                resizable: false,
                sortable: false
            }

        ],
        listeners: {
            afterRefreshData: function(grid) {
                var rows = grid.element.find('tbody tr');
                var gData = grid.options.data;
                var gParams = grid.options.params;
                rows.each(function(index) {
                    var me = this;
                    $(me).find('.apm-prf-frhtgrid-viewcalls-icon').attr('param-rowIndex', $(this).index());
                    $(me).find('.apm-prf-frhtgrid-drilldown-icon').attr('param-rowIndex', $(this).index());
                });
                rows.hover(
                    function() {
                        $(this).find('.apm-prf-frhtgrid-viewcalls-icon').addClass('showicon');
                        $(this).find('.apm-prf-frhtgrid-drilldown-icon').addClass('showicon');
                    },
                    function() {
                        $(this).find('.apm-prf-frhtgrid-viewcalls-icon').removeClass('showicon');
                        $(this).find('.apm-prf-frhtgrid-drilldown-icon').removeClass('showicon');
                    }
                );
                rows.find('.apm-prf-frhtgrid-viewcalls-icon').click(function() {
                    var me = this;
                    var idx = $(me).attr('param-rowIndex');
                    APMPRF.Highcharts.viewCalls(idx);
                });
                rows.find('.apm-prf-frhtgrid-drilldown-icon').click(function() {
                    var me = this;
                    var idx = $(me).attr('param-rowIndex');
                    APMPRF.Highcharts.drillDownTimeline(idx);
                });
                if (APMPRF.Highcharts) {
                    APMPRF.Highcharts.renderFrhtLogsChart(grid.options.data);
                }
            }
        }
    };
    var $FrhtGrid = $('<div class="apm-prf-frht-grid">').psgpGrid(frhtGridOptions);
    $FrhtGridSubPanel.psgpSubPanel('getBody').append($FrhtGrid);

    $ProfilerDetailsPortlet.psgpPortlet('getBody')
        .append($Breadcrumbs)
        .append($KPIDetails)
        .append($FrhtChartSubPanel)
        .append($FrhtGridSubPanel);

    function refreshKPI(kpiData) {
        var kpiConfig = [{
	            id: 'operationId',
	            label: 'Path Id'
	        },
	        {
	            id: 'parentId',
	            label: 'Parent Profiler Id'
	        },
	        {
	            id: 'startDate',
	            label: 'Start Time and Date'
	        },
            {
                id: 'scripts',
                label: 'Scripts'
            },
            {
                id: 'searches',
                label: 'Searches'
            },
            {
                id: 'workflows',
                label: 'Workflows'
            },
            {
                id: 'records',
                label: 'Records'
            },
            {
                id: 'requests',
                label: 'Requests'
            }
        ];

        var blockMarkUp =
            '<div class="apm-prf-kpi-block">' +
            '<div class="label"></div>' +
            '<div class="value"></div>' +
            '</div>';

        var rowMarkUp = '<div class="apm-prf-kpi-row"></div>';

        var $kpiContainer = $('<div class="apm-prf-kpi-container"></div>');

        var maxColumns = 3;
        for (var i = 0; i < kpiConfig.length; i = i + maxColumns) {
            var $row = $(rowMarkUp);

            for (var j = 0; j < maxColumns; j++) {
                if (i + j < kpiConfig.length) {
                    var $block = $(blockMarkUp);
                    $block.find('.label').text(kpiConfig[i + j].label);
                    $block.find('.value').text(kpiData[kpiConfig[i + j].id]);
                    $row.append($block);
                }
            }

            $kpiContainer.append($row);
        }

        $KPIDetails.empty();
        $KPIDetails.append($kpiContainer);
    }

    $NoDataAvailable = $('<div class="apm-prf-nodataavailable"><div class="icon"></div><div class="message">' + APMTranslation.apm.common.label.nodataavailable() + '</div></div>');

    function showApiCallsPopup(params) {
        var $obj;

        var markUp = '' +
            '<div class="apm-prf-apicalls">' +
            '<div class="grid">' +
            '</div>' +
            '</div>';
        $obj = $(markUp);

        var gridOptions = {
            url: APMPRF.Services.getURL('apiCalls'),
            sort: {
                dataIndex: 'startTimeMS',
                dir: false,
                remote: false
            },
            columns: [{
                    dataIndex: 'startTimeMS',
                    text: 'Start Time',
                    renderer: function(value, record) {
                        return record.startTime;
                    }
                },
                {
                    dataIndex: 'name',
                    text: 'Name'
                },
                {
                    dataIndex: 'executionTime',
                    text: 'Execution Time',
                    renderer: function(value, record) {
                        return (value) ? value.toFixed(3) + ' s' : 0;
                    }
                }
            ]
        };

        $obj.psgpDialog({
            title: 'API Calls',
            width: 900
        });
        $obj.parents('.ui-dialog').css({
            "position": "absolute",
            "top": ($(window).height() - $obj.parents('.ui-dialog').height()) / 2 + $(window).scrollTop() + "px",
            "left": ($(window).width() - $obj.parents('.ui-dialog').width()) / 2 + $(window).scrollLeft() + "px"
        });

        var $grid = $obj.find('.grid').psgpGrid(gridOptions);

        $grid.psgpGrid('refreshDataRemote', params);
    }

    function refreshBreadcrumbs() {
        var breadcrumbs = APMPRF.Services.getGlobalSettings().breadcrumbs;
        var frhtTypes = APMPRF.Highcharts.frhtTypes;
        var markup = '';
        for (var i in breadcrumbs) {
            var frhtConfig = frhtTypes[breadcrumbs[i].type];
            frhtConfig = frhtConfig ? frhtConfig : frhtTypes['default'];
            var breadcrumbsFunc = 'APMPRF.Components.getBreadcrumbsData(' + i + ')';
            if (i == 0) {
                if (breadcrumbs.length > 1) {
                    markup += '<a href="#" onclick="' + breadcrumbsFunc + ';return false;">TOP</a>'
                }
            } else if (i == (breadcrumbs.length - 1)) {
                markup += ' > ';
                markup += frhtConfig.label;
            } else {
                markup += ' > ';
                markup += '<a href="#" onclick="' + breadcrumbsFunc + ';return false;">' + frhtConfig.label + '</a>';
            }
        }
        $Breadcrumbs.empty();
        $Breadcrumbs.html(markup);
    }

    function getBreadcrumbsData(idx) {
        console.log(idx);
        var currentCrumb = APMPRF.Services.getGlobalSettings().breadcrumbs[idx];
        if (idx == 0) {
            APMPRF.Services.getGlobalSettings().breadcrumbs = [];
        } else {
            APMPRF.Services.getGlobalSettings().breadcrumbs = APMPRF.Services.getGlobalSettings().breadcrumbs.slice(0, idx);
        }
        var globalSettings = APMPRF.Services.getGlobalSettings();
        globalSettings.parentId = currentCrumb.parentId;
        globalSettings.type = currentCrumb.type;
        console.log(APMPRF.Services.getGlobalSettings().breadcrumbs);
        APMPRF.Services.refreshData();
    }

    return {
        $TitleBar: $TitleBar,
        $ColumnPanel: $ColumnPanel,
        $ProfilerDetailsPortlet: $ProfilerDetailsPortlet,
        $KPIDetails: $KPIDetails,
        $FrhtGrid: $FrhtGrid,
        $FrhtChartSubPanel: $FrhtChartSubPanel,
        $NoDataAvailable: $NoDataAvailable,
        showApiCallsPopup: showApiCallsPopup,
        refreshKPI: refreshKPI,
        refreshBreadcrumbs: refreshBreadcrumbs,
        getBreadcrumbsData: getBreadcrumbsData
    };

};