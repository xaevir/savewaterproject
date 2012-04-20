define(function(require) {

var Files = require('collections/files')

return Backbone.Model.extend({

  idAttribute: "_id",

  isNew: function(){
    return this.get('slug') == null
  },

  initialize: function() {
    var files = new Files 
    files.parent = this
    this.set({'files': files})
    //this.set({'files': new Backbone.Collection})
    //this.files = new Files;
  },

  url : function() {
    var base = '/toilets/'
    if (this.isNew()) return base;
    return base + this.get('slug');
  },

  defaults: {
    name: '',
    description: '',
    category: '',
    subcategory: '',
    mainImage: '',
  },

  validation: {
    name: {required: true},
    description: {required: true},
    category: {required: true},
  },

  parse: function(res){
    // creating from collection, this model does not get instantiated first 
    // repeating the above initialize method. Hack
    var files = new Files(res.files)
    files.parent = this
    res.files = files 
    return res
  },

})
})
