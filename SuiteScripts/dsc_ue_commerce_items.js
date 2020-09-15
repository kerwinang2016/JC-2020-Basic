/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'],
    function (record, search) {
        function afterSubmit(context) {
            try {

                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                    var itemRecord = context.newRecord;
                    var commercecategoryarray = [2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17];

                    var iteminternalid = itemRecord.getValue('internalid');
                    for (var i = 0; i < commercecategoryarray.length; i++) {
                        var objRecorditem = record.load({
                            type: "commercecategory",
                            id: commercecategoryarray[i],
                            isDynamic: true,
                        });
                        log.debug('objRecorditem'+[i],objRecorditem)
                        objRecorditem.selectNewLine({
                            sublistId: 'items'
                        });
                        objRecorditem.setCurrentSublistValue({
                            sublistId: 'items',
                            fieldId: 'item',
                            value: iteminternalid
                        });
                        objRecorditem.commitLine({
                            sublistId: 'items'
                        });

                        objRecorditem.save();
                    }
                }
            } catch (e) {
                log.debug('Error Message : ', e.message);
            }

        }
        return {
            afterSubmit: afterSubmit
        };
    });