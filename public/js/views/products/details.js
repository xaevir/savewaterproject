define(function(require) {

var tpl = require('text!templates/products/product-details.mustache')
  , AlertView = require('views/site/alert')
  , Product = require('models/product')
//  , File = require('views/products/file')

_.extend(Backbone.Validation.callbacks, {
  valid: function(view, attr, selector) {
    var el = view.$('[' + selector + '~=' + attr + ']')
    var errorEl = el.next() 
    if (errorEl.hasClass('error'))  
      errorEl.remove()
  },
  invalid: function(view, attr, error, selector) {
    // TODO add multiple errors
    var el = view.$('[' + selector + '~=' + attr + ']')
    if (el.next().hasClass('error')) return 
    el.after('<label class="error">' + error + '</label>')
  }
});

return Backbone.View.extend({

  template: Hogan.compile(tpl),

  className: 'well',

  events: {
    'submit form' : 'submit',
  },

  initialize: function(options){
    _.bindAll(this); 
    Backbone.Validation.bind(this);
//    this.model.on('validated:valid', this.save, this) 
    this.model.on('sync', this.synched, this)
  },

  render: function(){
    var locals = this.model.toJSON()
    var template = this.template.render(locals)
    $(this.el).html(template);
    return this; 
  },

  newProduct: function(){
    this.model = new Product()  
    this.render()
  },

  editProduct: function(model){
    this.model = model 
    this.render()
  },

  submit: function(e) {
    e.preventDefault()
    var params = this.$('form').serializeObject();
    this.model.set(params)
    if (this.model.isNew()) 
      this.collection.create(this.model);
    else 
      this.model.save();
  },

  synched: function(){
    this.newProduct()
    var successAlert = new AlertView({
      message: '<strong>Saved</strong>',
      type: 'info'
    })
    successAlert.fadeOut()
  },

  close: function(){
    this.remove()
  },

});

});
