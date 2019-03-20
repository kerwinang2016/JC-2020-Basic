/**
 * Copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Feb 2015     jyeh             Initial
 * 2.00       24 Mar 2015     jmarimla         Changed portlet name
 * 3.00       28 Mar 2015     jyeh
 * 4.00       09 Apr 2015     jyeh
 * 5.00       22 Apr 2015     jmarimla         callPerfInstanceChartRESTlet in afterrender of container
 * 6.00       25 Aug 2015     jmarimla         Create title toolbar
 * 7.00       04 Sep 2015     rwong            Added Suitescripttime and Workflowtime
 * 8.00       19 May 2016     rwong            Added loading mask to the timeline chart
 * 9.00       29 Jun 2018     jmarimla         Translation readiness
 *
 */

function APMMainPanel() {
	Ext4.define('PSGP.APM.SIA.Component.MainPanel', {
	    extend: 'PSGP.APM.Component.Container',
	    id: 'psgp-apm-sia-mainpanel',
	    params : {
	        threadid: '',
	        threadid2 : ''
	    },
	    minWidth: 1024,
	    items: [
	        Ext4.create('PSGP.APM.Component.PageToolbar', {
	            items: [
	                 Ext4.create('PSGP.APM.Component.PageTitle', {
	                     value: ''
	                 })
	            ]
	        }),
	        Ext4.create('PSGP.APM.Component.EmptyPanel', {
	            layout: 'column',
	            items: [
	                Ext4.create('PSGP.APM.Component.EmptyPanel', {
	                    margin: '10, 20, 10, 20',
	                    columnWidth: 1,
	                    items: [
	                        Ext4.create('PSGP.APM.Component.PortletPanel', {
	                        id: 'psgp-apm-sia-portlet-suitescriptdetail',
	                        title: APMTranslation.apm.ptd.label.pagetimedetails(),
	                        items: [
	                            Ext4.create('PSGP.APM.Component.EmptyPanel', {
	                                id: 'psgp-apm-sia-panel-page-email-time',
	                                layout: 'hbox',
	                                margin: '0, 30, 10, 30',
	                                items: [
	                                    {
	                                        xtype: 'container',
	                                        flex: 1,
	                                        border: false,
	                                        align: 'left',
	                                        items: [
	                                            Ext4.create('PSGP.APM.Component.SummaryField', {
	                                                id: 'psgp-apm-sia-display-summary-page',
	                                                fieldLabel: APMTranslation.apm.ptd.label.page(),
	                                                margin: '10 20 10 20',
	                                                value : null
	                                            })
	                                        ]
	                                    },
	                                    {
	                                        xtype: 'container',
	                                        flex: 1,
	                                        border: false,
	                                        align: 'left',
	                                        items: [
	                                            Ext4.create('PSGP.APM.Component.SummaryField', {
	                                                id: 'psgp-apm-sia-display-summary-email',
	                                                fieldLabel: APMTranslation.apm.common.label.email(),
	                                                margin: '10 20 10 20',
	                                                value : null
	                                            })
	                                        ]
	                                    },
	                                    {
	                                        xtype: 'container',
	                                        flex: 1,
	                                        border: false,
	                                        align: 'left',
	                                        items: [
	                                            Ext4.create('PSGP.APM.Component.SummaryField', {
	                                                id: 'psgp-apm-sia-display-summary-time',
	                                                fieldLabel: APMTranslation.apm.ptd.label.time(),
	                                                margin: '10 20 10 20',
	                                                value : null
	                                            })
	                                        ]
	                                    }
	                                ]
	                            }),

	                            Ext4.create('PSGP.APM.Component.EmptyPanel', {
	                                id: 'psgp-apm-sia-suitescript workflow',
	                                layout: 'hbox',
	                                margin: '0, 30, 10, 30',
	                                items: [
	                                    {
	                                        xtype: 'container',
	                                        flex: 1,
	                                        border: false,
	                                        align: 'left',
	                                        items: [
	                                            Ext4.create('PSGP.APM.Component.SummaryField', {
	                                                id: 'psgp-apm-sia-display-summary-suitescripttime',
	                                                fieldLabel: APMTranslation.apm.ns.context.suitescript(),
	                                                margin: '10 20 10 20',
	                                                value : null
	                                            })
	                                        ]
	                                    },
	                                    {
	                                        xtype: 'container',
	                                        flex: 1,
	                                        border: false,
	                                        align: 'left',
	                                        items: [
	                                            Ext4.create('PSGP.APM.Component.SummaryField', {
	                                                id: 'psgp-apm-sia-display-summary-workflowtime',
	                                                fieldLabel: APMTranslation.apm.ns.context.workflow(),
	                                                margin: '10 20 10 20',
	                                                value : null
	                                            })
	                                        ]
	                                    },
	                                    {
	                                        xtype: 'container',
	                                        flex: 1,
	                                        border: false,
	                                        align: 'left',
	                                        items: [
	                                            Ext4.create('PSGP.APM.Component.SummaryField', {
	                                                id: 'psgp-apm-sia-display-summary-blank',
	                                                fieldLabel: '',
	                                                margin: '10 20 10 20',
	                                                value : null
	                                            })
	                                        ]
	                                    }

	                                ]
	                            }),

	                            Ext4.create('PSGP.APM.Component.SubPanel', {
	                                id: 'psgp-apm-sia-subpanel-timeline',
	                                title: APMTranslation.apm.common.label.timeline(),
	                                emptyText: APMTranslation.apm.common.label.norecordstoshow(),
	                                margin: '10, 10, 10, 10',
	                                layout: 'fit',
	                                items: [
	                                        Ext4.create('Ext4.container.Container',
	                                        {
	                                            id: 'psgp-apm-sia-no-data-container',
	                                            border: 1,
	                                            layout: 'column',
	                                            style: {borderColor:'#DDDDDF', borderStyle:'solid', borderWidth:'1px'},
	                                            margin: '5, 5, 10, 0',
	                                            items: [
	                                                Ext4.create('Ext4.container.Container', {
	                                                    id: 'psgp-apm-sia-suitescriptdetail-chart-nodata',
	                                                    hidden: true,
	                                                    layout: 'hbox',
	                                                    items: [
	                                                        Ext4.create('Ext4.panel.Panel', {
	                                                            cls: 'apm-suitescriptdetail-chart-warning',
	                                                            height: 35,
	                                                            width: 40,
	                                                            border: false,
	                                                            margin: '5, 0, 0, 0'
	                                                        }),
	                                                        Ext4.create('Ext4.form.Label', {
	                                                            columnWidth: 1,
	                                                            border: false,
	                                                            margin: '5, 0, 0, 0',
	                                                            text: APMTranslation.apm.common.label.norecordstoshow()
	                                                        })
	                                                    ]
	                                                })
	                                            ]
	                                        }),
	                                        Ext4.create('Ext4.container.Container', {
	                                            id: 'psgp-apm-sia-timeline-chart',
	                                            height: 500,
	                                            border: false,
	                                            margin: '5, 5, 10, 0',
	                                            listeners: {
	                                                afterrender: function () {
	                                                    Ext4.getCmp('psgp-apm-sia-subpanel-timeline').setLoading(MASK_CONFIG);
	                                                    PSGP.APM.SIA.dataStores.callPerfInstanceChartRESTlet();
	                                                }
	                                            },
	                                            items: []
	                                        })
	                                ],
	                                listeners: {
	                                    expand : {
	                                        fn: function() {console.log ('expanded');
	                                            PSGP.APM.SIA.Highcharts.resizeAllCharts();
	                                        }
	                                    }
	                                }
	                            }),

	                            Ext4.create('PSGP.APM.Component.SubPanel', {
	                                id: 'psgp-apm-sia-suitescriptdetail-grid-panel',
	                                title: APMTranslation.apm.ptd.label.suitescriptworkflowdetails(),
	                                titleAlign: 'left',
	                                height: 400,
	                                margin: '10, 10, 10, 10',
	                                header: {
	                                    border: false
	                                },
	                                layout: 'fit',
	                                items: [
	                                    Ext4.create('PSGP.APM.SIA.Component.Grid.SuiteScriptDetail', {
	                                        id: 'psgp-apm-sia-grid-suitescriptdetail',
	                                        margin: '5, 5, 0, 0',
	                                        flex: 1
	                                    })
	                                ]
	                            })
	                        ]
	                        })
	                    ]
	                })
	            ]
	        })
	    ]
	});

}
