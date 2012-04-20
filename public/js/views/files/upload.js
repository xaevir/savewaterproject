define(function(require) {

var tpl = require('text!templates/files/upload.html')
  , AlertView = require('views/site/alert')         
  , File = require('models/file')

return Backbone.View.extend({

  events: {
    'change input[type="file"]':  'fileUpload',
  },

  initialize: function(options){
    _.bindAll(this); 
  },

  fileUpload: function(e){
    this.inputEl = $(e.currentTarget)
    this.inputEl.addClass("loading")
    var valid = this.model.isValid(true)
    if (!valid) {
      this.render()
      this.notice('Please add the product name and details first', 'error')
      return
    }
    $.ajax('/upload/'+ this.model._id, {
      //data: JSON.stringify(this.model.toJSON()),
      files: this.inputEl,
      iframe: true,
      dataType: "json",
      success: this.successUpload
    })
  },

  successUpload: function(res){
    var file = new File(res.data)
    this.inputEl.removeClass("loading")
    this.inputEl.val('')
    var files = this.model.get('files')
    files.add(file)
    this.model.save() 
    this.model.trigger('change:files:added', file)
    this.notice('Uploaded', 'info')
  },

  render: function(){
    $(this.el).html(tpl);
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

});
