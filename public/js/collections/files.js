define(function(require) {
  var File = require('models/file')
  
  return Backbone.Collection.extend({

    model: File,

    url : '/files',

  })
})
