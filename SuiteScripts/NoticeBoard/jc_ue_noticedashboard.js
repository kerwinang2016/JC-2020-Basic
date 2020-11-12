/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

 define(['N/record', 'N/log', 'N/file'],
	function (record, log, file){

		function afterSubmit(context){
			if(context.type == context.UserEventType.CREATE){
        createNoticeActivitiesRecord(context.newRecord);
			}
		}
    function createNoticeActivitiesRecord(newRecord){
      var custrecord_nb_tailors = newRecord.getValue('custrecord_nb_tailors');
      if(custrecord_nb_tailors.length > 0 && custrecord_nb_tailors[0] != ""){
        for(var i=0;i<custrecord_nb_tailors.length;i++){
          var actrecord = record.create({
            type: 'customrecord_noticeboard_activities'
          });
          actrecord.setValue('custrecord_nba_noticeboard',newRecord.id);
          actrecord.setValue('custrecord_nba_tailor',custrecord_nb_tailors[i]);
          actrecord.save();
        }
      }
    }
    function beforeSubmit(context){
      if(context.type == context.UserEventType.CREATE){
        updateFileFields(context.newRecord);
			}
    }
    function updateFileFields(newRecord){
      if(!newRecord.getValue('custrecord_nb_attachmentfile')) return;
      //custrecord_nb_filename, custrecord_nb_fileurl
      var fileRec = file.load({
        id: newRecord.getValue('custrecord_nb_attachmentfile')
      });
      newRecord.setValue('custrecord_nb_filename',fileRec.name);
      newRecord.setValue('custrecord_nb_fileurl',fileRec.url);
    }
		return {
       beforeSubmit: beforeSubmit,
		   afterSubmit: afterSubmit
		}
	}
 );
