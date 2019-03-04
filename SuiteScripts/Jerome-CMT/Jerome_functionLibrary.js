/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Dec 2015     rdutt
 *
 */


Function.isUndefinedNullOrEmpty = function(obj) {
	return (obj == null || !obj || obj == '' || obj == undefined);
}