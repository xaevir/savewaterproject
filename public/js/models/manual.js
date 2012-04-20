define(function(require) {

//var Files = require('collections/files')

return Backbone.Model.extend({

  idAttribute: "_id",

  isNew: function(){
    return this.get('filename') == null
  },


  url : function() {
    var base = '/manuals/'
    if (this.isNew()) return base;
    return base + this.get('filename');
  },

  validation: {
    category: {required: true},
    name: {required: true}
  },


})
})
