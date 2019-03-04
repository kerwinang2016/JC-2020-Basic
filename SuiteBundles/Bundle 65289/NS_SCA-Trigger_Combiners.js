var combinerTriggerSuccess = {
    status: 200,
    code: 'SUCCESS_COMBINER_TRIGGERED',
    message: 'Combiner was triggered successfully'
};
var invalidCombinerFolderError = {
    status: 400,
    code: 'ERR_INVALID_FOLDER',
    message: 'Invalid combiner folder, not present in config'
};
var combinerFileNotFoundError = {
    status: 400,
    code: 'ERR_COMBINER_NOT_FOUND',
    message: 'Combiner file not found'
};
var combinerSubmitFailedError = {
    status: 400,
    code: 'ERR_COMBINER_SUBMIT_FAILED',
    message: 'Error occurred when submitting combiner file'
};

var SLASH = '/';
function slash(path) {
    return (path.substr(-1) === SLASH)? path : path+SLASH;
}
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function service(request, response) {

    'use strict';

    var method = request.getMethod();

    switch (method) {
        case 'POST':

            var config = JSON.parse(request.getParameter('config')),
                combine = JSON.parse(request.getParameter('combine')) || [];

            var basePath = 'Web Site Hosting Files'+SLASH+slash(config.hosting_files_folder)+'SSP Applications'+SLASH+config.combiners.publisher+SLASH,
                result = {};

            var app, sspAppPath, application, toCombine, toCombineFinal, excluded, i, element, index, folder, combinerPath, combinerFile, nlCombinerFile, folderRec, combinerRes;
            for(app in combine) {
                application = config.combiners.applications[app];
                sspAppPath = basePath+slash(application.folder);
                if(result[app] === void 0) {
                    result[app] = {};
                }
                toCombine = combine[app];
                if(toCombine === 'all') {
                    toCombineFinal = application.combine || [];
                } else if(toCombine instanceof Array) {
                    excluded = [];
                    toCombineFinal = [];
                    for(i = 0; i < toCombine.length; i++) {
                        element = toCombine[i];
                        if(~application.combine.indexOf(element)) {
                            toCombineFinal.push(element);
                        } else {
                            excluded.push(element);
                        }
                    }
                }
                for(index in excluded) {
                    result[app][excluded[index]] = invalidCombinerFolderError;
                }
                for(index in toCombineFinal) {
                    folder = toCombineFinal[index];
                    combinerPath = sspAppPath+slash(folder);
                    combinerFile = ((folder.split(SLASH)[0] === 'templates')? 'templates' : 'combiner')+'.config';
                    combinerPath += combinerFile;
                    nlCombinerFile = nlapiLoadFile(combinerPath);
                    if(nlCombinerFile) {
                        folderRec = nlapiLoadRecord('folder', nlCombinerFile.getFolder());
                        if(folderRec && folderRec.getFieldValue('foldertype') !== 'IGNITETEMPLATES') { // is equal to 'DEFAULT'
                            folderRec.setFieldValue('foldertype', 'IGNITETEMPLATES');
                            nlapiSubmitRecord(folderRec);
                        }
                        if(nlapiSubmitFile(nlCombinerFile) !== 0) {
                            combinerRes = clone(combinerTriggerSuccess);
                        } else {
                            combinerRes = clone(combinerSubmitFailedError);
                        }
                    } else {
                        combinerRes = clone(combinerFileNotFoundError);
                    }
                    combinerRes.path = combinerPath;
                    result[app][folder] = combinerRes;
                }
            }

            response.write(JSON.stringify(result));

            break;
    }

}