define(function(require) {
  var Product = require('models/product')
  
  return Backbone.Collection.extend({

    model: Product,

    url : 'toilets',

    categories :  [
      {slug: 'dual-flush-toilets', name: 'Dual Flush Toilets'}, 
     ],
  })
})
