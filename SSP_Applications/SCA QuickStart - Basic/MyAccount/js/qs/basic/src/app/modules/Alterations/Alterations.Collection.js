// Client.Collection.js
// -----------------------
// Clients collection
define('Alterations.Collection', ['Alterations.Model'], function(Model) {
  'use strict';
  return Backbone.Collection.extend({
    url: _.getAbsoluteUrl('services/alterations.ss'),
    model: Model,
    initialize: function() {
      // The first time the collection is filled with data
      // we store a copy of the original collection
      this.once('sync reset', function() {
        if (!this.original) {
          this.original = this.clone();
        }
      });
    },
    parse: function(response) {
      this.totalRecordsFound = response.totalRecordsFound;
      this.recordsPerPage = response.recordsPerPage;
      return response.records;
    },
    update: function(options) {
      var range = options.range || {},
        filter = options.filter || {};

      this.fetch({
        data: {
          parent: options.parent,
          page: options.page,
          internalid: options.internalid
        },
        reset: true,
        killerId: options.killerId
      });
    }
  });
});
