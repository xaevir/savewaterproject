define(function(require) {

var tpl = require('text!templates/products/subnav.html')

return Backbone.View.extend({

  className: 'subnav',

  events: {
    "click a": "scroll",
  },

  scroll: function(e){
    e.preventDefault() 
    var anchor = $(e.currentTarget)
    // highlight
    var el = $(anchor).parent()
    if (el.hasClass('active')) return
    $('.subnav li').removeClass('active');
    el.addClass('active');
    var target = $(anchor).data("target");
    var position = $('#'+target).offset().top - 50
    $('html, body').animate({
      'scrollTop': position 
    }, 700)
  },

  initialize: function(options){
    _.bindAll(this, 'render', 'processScroll', 'setOffsetTop') 
  },

  isFixed: 0,

  render: function(){
    $(this.el).html(tpl);
    $(window).on('scroll', this.processScroll)
    return this
  },
 
  setOffsetTop: function(){
    this.topOffset = $(this.el).offset().top
  },

  processScroll: function() {
    var scrollTop = $(window).scrollTop()
    if (scrollTop >= this.topOffset && !this.isFixed) {
      this.isFixed = 1;
      $(this.el).addClass('subnav-fixed');
    } else if (scrollTop <= this.topOffset && this.isFixed) {
      this.isFixed = 0;
      $(this.el).removeClass('subnav-fixed');
    }
  }

})
})
