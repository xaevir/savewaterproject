define(function(require) {

var tpl = require('text!templates/manuals/manual.mustache')
  , AlertView = require('views/site/alert')         
  , Manual = require('models/manual')
  , Products = require('collections/products')

return Backbone.View.extend({

  events: {
    'change input[type="file"]':  'fileUpload',
    'change select':  'setCategory',
    'change input[type="text"]':  'setName',
  },

  template: Hogan.compile(tpl),

  initialize: function(options){
    _.bindAll(this); 
    this.model = new Manual()
    Backbone.Validation.bind(this)
  },

  setName: function(e){
    var input = $(e.currentTarget)
    var name = input.val()
    this.model.set({name: name})
  },

  setCategory: function(e){
    this.selectEl = $(e.currentTarget)
    var category = this.selectEl.val()
    this.model.set({category: category})
  },

  fileUpload: function(e){
    this.inputEl = $(e.currentTarget)
    this.inputEl.addClass("loading")

    var valid = this.model.isValid(true)
    if (!valid) {
      this.render()
      this.notice('Please select a category and name', 'error')
      return
    }

    var data = this.model.toJSON() 

    $.ajax('/manuals', {
      data: data,
      processData: false,
      type: 'POST',
      files: this.inputEl,
      iframe: true,
      dataType: "json",
      success: this.successUpload,
      context: this
    })
  },

  successUpload: function(res){
    var manual = new Manual(res.data)
    this.render()
    this.collection.add(manual)
    this.notice('Uploaded', 'info')
  },

  render: function(){
    var products = new Products() 
    var locals = {categories: products.categories}
    var template = this.template.render(locals)
    $(this.el).html(template)
    return this; 
  },

  notice: function(msg, type){
    var successAlert = new AlertView({
      message: '<strong>'+msg+'</strong>',
      type: type 
    })
    successAlert.fadeOut()
  },
})
})
