define(function(require) {

var Router = require('router')
  , User = require('models/user')
  , UserMenu = require('views/navbar/user-menu')         
  , NavBar = require('views/navbar/navbar')         

  var initialize = function(){
     
    window.dispatcher = _.clone(Backbone.Events)
  
    window.user = new User()
    if (window.config.user)  
      window.user.set(window.config.user)

    var userMenu = new UserMenu()
    userMenu.render()

    var navBar = new NavBar()
    navBar.render()

    var router = new Router()
    Backbone.history.start({pushState: true});
  }

  return {
    initialize: initialize
  };
});
