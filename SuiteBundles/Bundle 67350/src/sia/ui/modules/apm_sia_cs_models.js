/**
 * Copyright © 2019, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Feb 2015     jyeh             Initial
 * 2.00       29 Jun 2018     jmarimla         Translation readiness
 * 3.00       18 Oct 2018     jmarimla         Frht id
 *
 */

function APMModels() {
	Ext4.define('PSGP.APM.SIA.Model.suitescriptDetailData', {
	    extend : 'Ext4.data.Model',
	    fields : [
	        {
	            name : 'date',
	            type : 'string'
	        }, {
	            name : 'scripttype',
	            type : 'string'
	        }, {
	            name : 'script',
	            type : 'string'
	        }, {
	            name : 'triggertype',
	            type : 'string'
	        }, {
	            name : 'scriptid',
	            type : 'string'
	        }, {
	            name : 'deployment',
	            type : 'int',
	            useNull : true
	        }, {
	            name : 'totaltime',
	            type : 'float'
	        },  {
	            name : 'usagecount',
	            type : 'int'
	        },  {
	            name : 'records',
	            type : 'int'
	        }, {
	            name : 'urlrequests',
	            type : 'int'
	        }, {
	            name : 'searches',
	            type : 'int'
	        }, {
	            name : 'threadid',
	            type : 'int'
	        }, {
	            name : 'id',
	            type : 'string'
	        }, {
	            name : 'ssaend',
	            type : 'string'
	        }, {
	            name : 'ssastart',
	            type : 'string'
	        }, {
	            name : 'scriptwfurl',
	            type : 'string'
	        }, {
	            name : 'deploymenturl',
	            type : 'string'
	        }, {
	            name : 'operationId',
	            type : 'string'
	        }, {
	            name : 'frhtId',
	            type : 'string'
	        }
	    ]
	});
}
