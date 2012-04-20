define(function(require) {

var AlertView = require('views/site/alert')
  , tpl = require('text!templates/products/product.mustache')

return Backbone.View.extend({

  className:  "product",

  template: Hogan.compile(tpl),

  initialize: function(){
    _.bindAll(this) 
  },

  getPdfs: function(files){
    return files.reduce(function(memo, file) {
      if (file.get('type') == 'application/pdf') 
        memo.push(file.toJSON())
      return memo
    }, [])
  },

  render: function() {
    var locals = this.model.toJSON()
    locals.pdfs = this.getPdfs(this.model.get('files'))
    var template = this.template.render(locals)
    $(this.el).html(template);
    return this;
  },

});

})
