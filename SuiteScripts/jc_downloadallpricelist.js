/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		['N/record', 'N/search', 'N/log', 'N/file', 'N/encode','./pdf-lib.js'],
		function( nr, search, log, file, encode, pdflib) {

			function onRequest(context) {
				try {

					log.audit('onRequest', 'Context Method : ' + context.request.method);
					var request = context.request;
					var response = context.response;
					// log.debug('filetype', filetype);
					// log.debug('imagecontents', imageContents);
					var fileObj1 = file.load({
            id: 364051
	        });
          var fContents1 = fileObj1.getContents();
          var fileObj2 = file.load({
            id: 364042
	        });
          var fContents2 = fileObj2.getContents();
          var pdf1 = pdflib.load(fContents1);
          var pdf2 = pdflib.load(fContents2);
          var combinedPDF = pdflib.create();
          var pdfcontent1 = combinedPDF.copyPages(pdf1,pdf1.getPageIndices());
          for(var i=0; i< pdfcontent1.length; i++){
            var page = pdfcontent1[i];
            combinedPDF.addPage(page);
          }
          var pdfcontent2 = combinedPDF.copyPages(pdf2,pdf2.getPageIndices());
          for(var i=0; i< pdfcontent2.length; i++){
            var page = pdfcontent2[i];
            combinedPDF.addPage(page);
          }
          response.write({output:combinedPDF});
          // var workbook = XLS.readFile(fContents, {type:'base64', WTF:false});
          // var result = {};
      		// workbook.SheetNames.forEach(function(sheetName) {
      		// 	var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      		// 	if(roa.length) result[sheetName] = roa;
      		// });
      		// var toJSONworkbook = JSON.stringify(result, 2, 2);
          // var reader = new FileReader();
          // reader.readAsBinaryString("https://store.jeromeclothiers.com/core/media/media.nl?id=267216&amp;c=3857857&amp;h=f360d619300c0116de38&amp;_xt=.xls");
          // reader.onload = function(e) {
          //    var data = e.target.result;
          //    var workbook = XLSX.read(data, {
          //      type: 'binary'
          //    });
          //
          //    workbook.SheetNames.forEach(function(sheetName) {
          //      // Here is your object
          //      var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
          //      var json_object = JSON.stringify(XL_row_object);
          //      log.debug('json_object',json_object);
          //
          //    })
          //
          //  };
          // log.debug('fContents', fContents);
	        // var id = fileObj.save();
					// log.debug('fileid',id);
          // var actual = JSON.parse()
					// response.write({output:fContents});
				} catch (e) {
					log.error('onRequest', 'ERROR : ' + e.message);
				}
			}
			return {
				onRequest : onRequest
			};
		});
