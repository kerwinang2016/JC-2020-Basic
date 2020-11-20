/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(
		['N/record', 'N/search', 'N/log', 'N/file', 'N/encode'],
		function( nr, search, log, file, encode) {

			function onRequest(context) {
				try {

					log.audit('onRequest', 'Context Method : ' + context.request.method);
					var request = context.request;
					var response = context.response;
					var imageContents = request.parameters.imageContents;
					var filename = request.parameters.filename;
					var filetype = request.parameters.filetype;
					// log.debug('filetype', filetype);
					// log.debug('imagecontents', imageContents);
					var fileObj = file.create({
	            name: filename,
	            fileType: filetype.indexOf('jpeg') != -1?file.Type.JPGIMAGE:file.Type.PNGIMAGE,
	            contents: imageContents,
							folder: 1873,
							encoding: file.Encoding.UTF_8,
							isOnline: true
	        });
	        var id = fileObj.save();
					// log.debug('fileid',id);
					response.write({output:id.toString()});
				} catch (e) {
					log.error('onRequest', 'ERROR : ' + e.message);
				}
			}
			return {
				onRequest : onRequest
			};
		});
