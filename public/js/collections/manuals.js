define(function(require) {
  var Manual = require('models/manual')
  
  return Backbone.Collection.extend({

    model: Manual,

    url : '/manuals',

  })
})
