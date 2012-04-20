define(function(require) {

var UserMenu = require('views/navbar/user-menu')

return Backbone.View.extend({
  
  el: '.navbar',

  events: {
    "click a": "preventDefault",
    "click a:not([href^='#'])": "pushState",
  },

  initialize: function(){
    _.bindAll(this, 'render') 
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

  render: function() {
    var userMenu = new UserMenu({ el: this.$(".user-menu") });
    userMenu.render()
  },

})
})
