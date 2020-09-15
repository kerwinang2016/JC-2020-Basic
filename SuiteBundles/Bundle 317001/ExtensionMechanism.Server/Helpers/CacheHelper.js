/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */

 /**
    Handles the cache
 */
 define(
    [
        'N/cache'
    ,   'N/file'
    ]
,   function(
        cache
    ,   file
    )
{

    return function cacheHelperGenerator(cache_type)
    {
        var cache_helper = {

            CACHE_NAME:     'EMB_CACHE'
        ,   TTL:            300
        ,   KEY_PREFIX:     'emb_'

        ,   MANIFEST_LOADER_CACHE: 'MANIFEST_LOADER'

        ,   cache_type: cache_type

        ,   get: function get(key)
            {
                var manifestsCache = this._getCache();
                var value = manifestsCache.get({
                    key: this.KEY_PREFIX + key
                ,   loader: this._getLoader()
                ,   ttl: this.TTL
                });
                return value;
            }

        ,   put: function put(key, value)
            {
                var manifestsCache = this._getCache();
                manifestsCache.put({
                    key:    this.KEY_PREFIX + key
                ,   value:  value
                ,   ttl:    this.TTL
                });
            }

        ,   _getCache: function _getCache()
            {
                var manifestsCache = cache.getCache({
                    name:   this.CACHE_NAME
                ,   scope:  cache.Scope.PROTECTED
                });

                return manifestsCache;
            }

        ,   _getLoader: function _getLoader()
            {
                var key_prefix = this.KEY_PREFIX;
                var loaders = {};
                loaders[this.MANIFEST_LOADER_CACHE] = function(data)
                {
                    var manifest_id = data.key.replace(key_prefix, '')
                    ,   manifest = file.load({id: manifest_id});

                    return {
                        path: manifest.path.replace('/manifest.json', '')
                    ,   contents: manifest.getContents()
                    };
                };

                return loaders[this.cache_type];
            }

        };

        return cache_helper;
    };

});
