define(function(require) {

var AlertView = require('views/site/alert')
  , tpl = require('text!templates/manuals/item.mustache')


var ItemView = Backbone.View.extend({

  tagName:  "li",

  events: {
    "click a.remove": "remove",
  },

  template: Hogan.compile(tpl),

  remove: function() {
    var params = {}
    params.data = JSON.stringify(this.model.toJSON())
    params.contentType = "application/json"
    this.model.destroy(params)
    $(this.el).remove()
    this.notice('Removed', 'info')
  },

  initialize: function(){
    _.bindAll(this) 
    if (window.user.isLoggedIn())
      $(this.el).mouseenter(this.handlerIn).mouseleave(this.handlerOut);
  },

  handlerIn: function(){
   $(this.el).append('<div class="hover-options"><a class="remove" href="#">delete</a></div>')
  
  },

  handlerOut: function(){
    $('.hover-options', this.el).remove()
  },

  render: function() {
    var locals = this.model.toJSON()
    if (window.user.isLoggedIn())
      locals.loggedIn = true
    var template = this.template.render(locals)
    $(this.el).html(template);
    return this;
  },

  notice: function(msg, type){
    var successAlert = new AlertView({
      message: '<strong>'+msg+'</strong>',
      type: type 
    })
    successAlert.fadeOut()
  },
});


var ListView = Backbone.View.extend({

  tagName: 'ul',

  initialize: function(options) {
    this.products = options.products
    _.bindAll(this); 
  },

  addOne: function(model) {
    var view = new ItemView({model: model});
    $(this.el).append(view.render().el)
  },

  render: function() {
    _.each(this.products, this.addOne, this);
    return this
  },
})

var CategoryView = Backbone.View.extend({

  className: 'section',

  initialize: function(options) {
    this.header = options.header 
  },

  render: function() {
    $(this.el).append('<h1>'+this.header+'</h1>')
    return this
  },

})

return  Backbone.View.extend({
  
  className: 'items',

  initialize: function() {
    _.bindAll(this) 
    this.collection.on('add', this.addOne, this)

  },

  addOne: function(model){
    var view = new ItemView({ model: model })
    var metadata = model.get('metadata')
    var id = metadata.category.replace(/[^a-zA-z0-9_]+/g, '-')
    var template =  view.render().el
    $('ul', '#'+id).append(template)
  },

  group: function(collection){
    var result = {};
    collection.each(function(model){
      var metadata = model.get('metadata') 
      var key = metadata.category;
      (result[key] || (result[key] = [])).push(model);
    }) 
    return result 
  },

  groups:[
    'Espresso Machines', 
    'Espresso Grinders', 
  ],
  
  render: function() {
    $(this.el).append('<h1 id="jumboheader">User Manuals</h1>')
    var groups = this.group(this.collection)
    _.each(this.groups, function(el){
      var categoryView = new CategoryView({
        header: el,
        id: el.replace(/[^a-zA-z0-9_]+/g, '-')
      })
      $(this.el).append(categoryView.render().el)
      var listView = new ListView({products: groups[el]})
      $(categoryView.el).append(listView.render().el)
    }, this) 
    return this
  }

})
})
