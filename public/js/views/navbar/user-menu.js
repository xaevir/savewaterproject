define(function(require) {

var userMenuTpl = require('text!templates/users/userNav.mustache')

return Backbone.View.extend({

  template: Hogan.compile(userMenuTpl),

  className: 'nav nav-pills nav-stacked user-menu', 
  tagName: 'ul',

  events: {
    'click a[href="#logout"]': 'logout',
    "click a": "preventDefault",
    "click a:not([href^='#'])": "pushState",
  },

  preventDefault: function(e) {
    e.preventDefault() 
  },

  pushState: function(e) {
    var linkEl = $(e.currentTarget);
    var href = linkEl.attr("href");
    var router = new Backbone.Router();
    router.navigate(href.substr(1), true)
  },

  logout: function(){
    window.dispatcher.trigger('session:logout') 
    console.log('user-menu.logout.trigger->session:logout')
  },

  initialize: function(options){
    _.bindAll(this, 'render') 
    window.user.on('change', this.render, this)
  },

  render: function(user) {
    var template;
    if (window.user.isLoggedIn()) {
      template = this.template.render({user: {name: window.user.get('username') }})
    } else {
      template = this.template.render({user: false});
      $('.dropdown-toggle').dropdown()
    }
    $(this.el).html(template)
    $('body').append(this.el)
    return this;
  },
})

});  
