define(function(require) {

var tpl = require('text!templates/products/contextual-menu.mustache')

return Backbone.View.extend({

  template: Hogan.compile(tpl),

  initialize: function(options){
    _.bindAll(this, 'render') 
  },

  render: function() {
    var locals =this.model.toJSON()
    var template = this.template.render(locals)
    $(this.el).append(template)
    return this
  },

})
})
