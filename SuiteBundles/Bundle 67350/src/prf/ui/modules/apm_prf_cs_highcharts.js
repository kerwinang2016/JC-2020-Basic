/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Aug 2018     rwong            Initial
 * 2.00       10 Aug 2018     jmarimla         Frht chart
 * 3.00       04 Sep 2018     jmarimla         Frht button icons
 * 4.00       28 Sep 2018     jmarimla         Drilldown timeline
 * 5.00       04 Oct 2018     rwong            Api Calls backend
 * 6.00       26 Oct 2018     jmarimla         Chart labels
 * 7.00       30 Oct 2018     jmarimla         Tooltip
 * 8.00       14 Dec 2018     jmarimla         Update labels
 * 9.00       15 Jan 2019     jmarimla         Chart min height
 * 10.00      17 Jan 2019     jmarimla         Destory chart
 *
 */
APMPRF = APMPRF || {};

APMPRF._Highcharts = function() {

    Highcharts.setOptions({
        lang: {
            drillUpText: APMTranslation.apm.common.highcharts.drilluptext(),
            loading: APMTranslation.apm.common.label.loading() + '...',
            months: [
                APMTranslation.apm.common.month.january(),
                APMTranslation.apm.common.month.february(),
                APMTranslation.apm.common.month.march(),
                APMTranslation.apm.common.month.april(),
                APMTranslation.apm.common.month.may(),
                APMTranslation.apm.common.month.june(),
                APMTranslation.apm.common.month.july(),
                APMTranslation.apm.common.month.august(),
                APMTranslation.apm.common.month.september(),
                APMTranslation.apm.common.month.october(),
                APMTranslation.apm.common.month.november(),
                APMTranslation.apm.common.month.december()
            ],
            noData: APMTranslation.apm.common.highcharts.nodata(),
            resetZoom: APMTranslation.apm.common.highcharts.resetzoom(),
            resetZoomTitle: APMTranslation.apm.common.highcharts.resetzoomtitle(),
            shortMonths: [
                APMTranslation.apm.common.shortmonth.january(),
                APMTranslation.apm.common.shortmonth.february(),
                APMTranslation.apm.common.shortmonth.march(),
                APMTranslation.apm.common.shortmonth.april(),
                APMTranslation.apm.common.shortmonth.may(),
                APMTranslation.apm.common.shortmonth.june(),
                APMTranslation.apm.common.shortmonth.july(),
                APMTranslation.apm.common.shortmonth.august(),
                APMTranslation.apm.common.shortmonth.september(),
                APMTranslation.apm.common.shortmonth.october(),
                APMTranslation.apm.common.shortmonth.november(),
                APMTranslation.apm.common.shortmonth.december()
            ],
            weekdays: [
                APMTranslation.apm.common.weekday.sunday(),
                APMTranslation.apm.common.weekday.monday(),
                APMTranslation.apm.common.weekday.tuesday(),
                APMTranslation.apm.common.weekday.wednesday(),
                APMTranslation.apm.common.weekday.thursday(),
                APMTranslation.apm.common.weekday.friday(),
                APMTranslation.apm.common.weekday.saturday()
            ],
        }
    });

    var frhtChartData = null;

    frhtTypes = {
            'script': {
                color: 'rgba(122, 176, 217, 0.8)',
                label: 'Script',
                drilldown: true,
                viewCalls: true,
                columns: ['date', 'executionTime', 'entryPoint', 'context', 'bundle', 'recordType', 'email', 'scriptType', 'scriptId', 'triggerType']
            },
            'search': {
                color: 'rgba(243, 235, 94, 0.8)',
                label: 'Search',
                drilldown: false,
                viewCalls: false,
                columns: ['date', 'executionTime', 'recordType', 'email']
            },
            'workflow': {
                color: 'rgba(250, 182, 93, 0.8)',
                label: 'Workflow',
                drilldown: true,
                viewCalls: false,
                columns: ['date', 'executionTime', 'entryPoint', 'workflowId', 'context', 'recordType', 'email', 'triggerType']
            },
            'record': {
                color: 'rgba(217, 94, 94, 0.8)',
                label: 'Record',
                drilldown: true,
                viewCalls: false,
                columns: ['date', 'executionTime', 'context', 'recordType', 'email', 'operation']
            },
            'request': {
                color: 'rgba(131, 217, 122, 0.8)',
                label: 'Request',
                drilldown: true,
                viewCalls: false,
                columns: ['date', 'executionTime', 'method', 'email']
            },
            'default': {
                color: 'rgba(192, 192, 192, 0.8)',
                label: 'unknown',
                drilldown: false,
                viewCalls: false,
                columns: ['date', 'executionTime']
            }
        };
        
        var frhtColumns = {
        		'date': {
        			label: 'Date & Time'
        		},
        		'executionTime' : {
        			label: 'Execution Time',
        			formatter: function (value) {
        				return value + ' s';
        			}
        		},
        		'scriptsTotal': {
        			label: 'Scripts'
        		},
        		'searchesTotal': {
        			label: 'Searches'
        		},
        		'workflowsTotal': {
        			label: 'Workflows'
        		},
        		'operation': {
        			label: 'Operation'
        		},
        		'recordType': {
        			label: 'Record Type'
        		},
        		'context': {
        			label: 'Context'
        		},
        		'entryPoint': {
        			label: 'EntryPoint'
        		},
        		'scriptType': {
        			label: 'Script Type'
        		},
        		'triggerType': {
        			label: 'Trigger Type'
        		},
        		'email': {
        			label: 'User'
        		},
        		'bundle': {
        			label: 'Bundle'
        		},
        		'scriptId': {
        			label: 'Script Id'
        		},
        		'workflowId': {
        			label: 'Workflow Id'
        		},
        		'method': {
        			label: 'Method'
        		},
        		'default' : {
        			
        		}
        }

    function renderFrhtLogsChart(chartData) {
        var $container = APMPRF.Components.$FrhtChartSubPanel.psgpSubPanel('getBody');

        _frhtChartData = chartData;

        var chartCategories = [];
        var chartSeries = [];
        if (chartData && chartData.length > 0) {
            for (var i = 0; i < chartData.length; i++) {
                var dataIdx = parseInt(i);
                var type = chartData[i].type;

                var frhtConfig = frhtTypes[type];
                frhtConfig = frhtConfig ? frhtConfig : frhtTypes['default'];

                chartCategories.push(i);
                chartSeries.push({
                    x: dataIdx,
                    color: frhtConfig.color,
                    low: chartData[i].startDateMS,
                    high: chartData[i].endDateMS
                });
            }
        } else {
            $container.height(100);
            if ($container.highcharts()) $container.highcharts().destroy();
            $container.empty();
            APMPRF.Components.$NoDataAvailable.clone().appendTo($container);
            return;
        }

        //determine height based on number of yCategories
        var xLabelHeight = 180;
        var yHeight = 25 * (chartCategories.length ? chartCategories.length : 0)
        var totalHeight = xLabelHeight + yHeight;
        totalHeight = totalHeight > 300 ? totalHeight : 300;
        $container.height(totalHeight);

        var chartConfig = {
            chart: {
                zoomType: 'xy',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                plotBorderColor: '#555555',
                plotBorderWidth: 0,
                animation: false,
                type: 'columnrange',
                inverted: true,
                zoomType: 'y'
            },
            title: {
                text: '',
                style: {
                    color: '#666666',
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            xAxis: {
            	title: {
            		text: 'Profiler Type',
                    style: {
                    	color: '#666',
                        fontFamily: 'Arial',
                        fontSize: '14px',
                        fontWeight: 'normal'
                    }
                },
                labels: {
                    style: {
                        color: '#666',
                        fontFamily: 'Arial',
                        fontSize: '11px'
                    },
                    formatter: function() {
                    	var point = this.value;
                        var logDetails = chartData[point];
                        var type = logDetails.type;
                        var hierarchy = logDetails.hierarchy;
                        var frhtConfig = frhtTypes[type];
                        frhtConfig = frhtConfig ? frhtConfig : frhtTypes['default'];

                        var typeLabel = frhtConfig.label;
                        //if (hierarchy == 'child') typeLabel = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + typeLabel;

                        var viewCallsFunc = 'APMPRF.Highcharts.viewCalls(' + point + ')';
                        var drillDownFunc = 'APMPRF.Highcharts.drillDownTimeline(' + point + ')';

                        var label = '<div class="apm-prf-frhtchart-xaxis-label">' +
                            '<div class="xaxis-label">' + typeLabel + '</div>';
                        
                        if (frhtConfig.viewCalls) {
                        	label += '<a href="#" onclick="' + viewCallsFunc + ';return false;"><div class="xaxis-icon-vc">' + '</div></a>';
                        }
                        if (frhtConfig.drilldown) {
                        	label += '<a href="#" onclick="' + drillDownFunc + ';return false;"><div class="xaxis-icon-dd">' + '</div></a>';
                        }
                        
                        label += '</div>';

                        return label;
                    },
                    useHTML: true
                },
                lineColor: '#666666',
                lineWidth: 1,
                tickColor: '#666666',
                tickLength: 0,
                categories: chartCategories
            },
            yAxis: {
            	title: {
            		text: 'Time',
                    style: {
                    	color: '#666',
                        fontFamily: 'Arial',
                        fontSize: '14px',
                        fontWeight: 'normal'
                    }
                },
                labels: {
                    formatter: function() {
                        var label = this.axis.defaultLabelFormatter.call(this);
                        if (label.endsWith('AM')) {
                            label = label.replace(/AM$/, APMTranslation.apm.common.time.am());
                        }
                        if (label.endsWith('PM')) {
                            label = label.replace(/PM$/, APMTranslation.apm.common.time.pm());
                        }
                        return label;
                    },
                    style: {
                        color: '#666',
                        fontFamily: 'Arial',
                        fontSize: '11px'
                    }
                },
                lineColor: '#444444',
                lineWidth: 1,
                tickColor: '#444444',
                type: 'datetime',
                dateTimeLabelFormats: {
                    millisecond: '%l:%M:%S.%L %p',
                    second: '%l:%M:%S %p',
                    minute: '%l:%M %p',
                    hour: '%l:%M %p',
                    day: '%m/%d<br>%l:%M %p',
                    week: '%m/%d<br>%l:%M %p',
                    month: '%m/%d<br>%l:%M %p',
                    year: '%l:%M %p'
                },
                startOnTick: false,
                endOnTick: false
            },
            tooltip: {
                crosshairs: {
                    width: 1,
                    color: '#bbbbbb',
                    dashStyle: 'solid'
                },
                formatter: function() {
                	var pointIndex = this.x;
                    var chartPoint = chartData[pointIndex];

                    var type = chartPoint.type;
                    var frhtConfig = frhtTypes[type];
                    frhtConfig = frhtConfig ? frhtConfig : frhtTypes['default'];
                    var columns = frhtConfig.columns;

                    var table = '<table>';
                    table += '<tr><td align="center" colspan="3"><b>' + frhtConfig.label + '</b></td></tr>';
                    for (var i in columns) {
                    	var columnData = frhtColumns[columns[i]] ? frhtColumns[columns[i]]: frhtColumns['default'];
                    	var label = columnData.label ? columnData.label : ''; 
                    	var value = chartPoint[columns[i]] ?  chartPoint[columns[i]] : '';
                    	value = columnData.formatter ? columnData.formatter(value) : value;
                    	table += '<tr>';
                        table += '<td align="center">' + label + '</td><td>:</td><td align="center">' + value + '</td>';
                        table += '</tr>';
                    }
                    table += '</table>';

                    return table;
                },
                shared: true,
                useHTML: true
            },
            series: [{
                name: 'timeline',
                animation: false,
                data: chartSeries
            }]

        }

        $container.highcharts(chartConfig);
    }

    function viewCalls(dataIdx) {
        //console.log(dataIdx);
        var frhtData = _frhtChartData[dataIdx];
        var params = {
            frhtId: frhtData.id
        };
        APMPRF.Components.showApiCallsPopup(params);
    }

    function drillDownTimeline(dataIdx) {
        var frhtData = _frhtChartData[dataIdx];
        var globalSettings = APMPRF.Services.getGlobalSettings();
        globalSettings.parentId = frhtData.id;
        globalSettings.type = frhtData.type;
        APMPRF.Services.refreshData();
    }

    return {
        frhtTypes: frhtTypes,
        renderFrhtLogsChart: renderFrhtLogsChart,
        viewCalls: viewCalls,
        drillDownTimeline: drillDownTimeline
    };
};