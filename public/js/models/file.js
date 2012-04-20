define(function(require) {

return Backbone.Model.extend({

  isNew: function(){
    return this.get('name') == null
  },

  url : function() {
    var base = '/files/'
    if (this.isNew()) return base;
    return base + this.get('name');
  },

  defaults: {
    name: '',
    type: '',
    medium: '',
    thumb: '',
  },


})
})
