/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
    [
        './FileApiSS2'
    ,   'N/log'
    ,   'N/error'
    ,   'N/runtime'
    ]
,   function(
        FileApi
    ,   log
    ,   error_module
    ,   runtime
    )
{
    var service = {
        
        onRequest: function(context)
        {
            var	retobj = {
                header: {
                    status: {
                        code: 'SUCCESS',
                        message: 'success'
                    }
                },
                result: {}
            };
            
            try
            {
                var request = context.request;
                //request = Utils.requestToNLApiRequest(request);
                
                var folders
                ,	operation
                ,	parent_id;
                
                if(request.method === 'GET')
                {
                    var folder_id = request.parameters.folder;
                    operation = request.parameters.operation;
                    
                    if(operation && operation === 'get_folder')
				    {
                        if(folder_id)
                        {
                            retobj.result.folder = FileApi.getFolder(folder_id);
                        }
                        else
                        {
                            throw error_module.create({
                                name: 'SCE_FILE_SERVICE_ERROR'
                            ,   message: 'folder is a required parameter, received ' + folder_id
                            });
                        }
				    }
                }
                else if(request.method === 'POST')
                {
                    var request_body = JSON.parse(request.body);
                    operation = request_body.operation;

                    if(!operation)
                    {
                        var files = request_body;
                        FileApi.writeFiles(files);
                    }
                    else if(operation && operation === 'create_folder')
                    {
                        var folder_name = request_body.folder_name;

                        parent_id = request_body.parent_id;

                        if(!folder_name || !parent_id)
                        {
                            throw error_module.create({
                                name: 'SCE_FILE_SERVICE_ERROR'
                            ,   message: 'folder_name and parent_id are required'
                            });
                        }

                        retobj.result.folder_id = FileApi.createFolder(folder_name, parent_id);
                    }
                    else if(operation && operation === 'create_folders')
                    {
                        folders = request_body.folders;

                        if(!folders || !folders.folder_id)
                        {
                            throw error_module.create({
                                name: 'SCE_FILE_SERVICE_ERROR'
                            ,   message: 'Root folder_id is required'
                            });
                        }

                        retobj.result.folders = FileApi.createFolders(folders);
                    }
                    else if(operation === 'get_files')
                    {
                        retobj.result.files = [];

                        var paths = request_body.files
                        ,	optional = request_body.optional || [];
                        
                        if(!paths)
                        {
                            throw error_module.create({
                                name: 'SCE_FILE_SERVICE_ERROR'
                            ,   message: 'paths parameter is required'
                            });
                        }

                        retobj.result.files = FileApi.getFiles(paths, optional);
                    }
                }
                else if(request.method === 'PUT')
                {
                    var body = request.body;
                    body = JSON.parse(body);
                    operation = body.operation;

                    if(!operation || (operation !== 'copy' && operation !== 'move')){
                        throw error_module.create({
                            name: 'SCE_FILE_SERVICE_ERROR'
                        ,   message: 'operation param is required. Possible values: copy, move'
                        });
                    }
                    
                    var src_paths = body.src_paths
                    ,	dst_names = body.dst_names;
				
                    if(!src_paths)
                    {
                        throw error_module.create({
                            name: 'SCE_FILE_SERVICE_ERROR'
                        ,   message: 'src_paths param is required'
                        });
                    }

                    if(!dst_names)
                    {
                        throw error_module.create({
                            name: 'SCE_FILE_SERVICE_ERROR'
                        ,   message: 'dst_names param is required'
                        });
                    }

                    if(operation === 'copy')
                    {
                       FileApi.copyFiles(src_paths, dst_names);
                    }
                    else if(operation === 'move')
                    {
                       FileApi.moveFiles(src_paths, dst_names);
                    }
                }
            }
            catch(error)
            {
                log.error({
                    title: 'SCE_FILE_SERVICE_ERROR'
                ,   details: error
                });
                
                retobj.header.status.code = error.name;
                retobj.header.status.message = error.message;
            }
            
            var script = runtime.getCurrentScript();
            retobj.governance = script.getRemainingUsage();

            // rest services
            if(!context.response)
            {
                return retobj;
            }

            context.response.setHeader({name: 'Content-Type', value: 'application/json'});
            context.response.write({output: JSON.stringify(retobj)});
        }
    };
    
    return service;
});