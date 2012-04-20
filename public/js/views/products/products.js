define(function(require) {

var AlertView = require('views/site/alert')
  , tpl = require('text!templates/products/product-item.mustache')

var ItemView = Backbone.View.extend({

  tagName:  "li",

  template: Hogan.compile(tpl),

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
    var template = this.template.render(this.model.toJSON())
    $(this.el).html(template);
    return this;
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
    this.id = options.id
  },

  render: function() {
    //$(this.el).append('<h1>'+this.header+'</h1>')
    return this
  },

})

var SubcategoryView = Backbone.View.extend({

  className: 'sub-section',

  initialize: function(options) {
    this.header = options.header 
    this.id = options.id
  },

  render: function() {
    $(this.el).append('<h2>'+this.header+'</h2>')
    return this
  },
})


return  Backbone.View.extend({
  
  className: 'items',

  initialize: function() {
    _.bindAll(this) 
  },

  getCategories: function(){ 
    return {
      'dual-flush-toilets':  {
        label: 'Dual Flush Toilets',
        products: []
      },
      _array: [
        'dual-flush-toilets', 
      ],
    } 
  },

  categorize: function(product){
    var category = product.get('category').slug
    var subcategory = product.get('subcategory') ? product.get('subcategory').slug : '';
    if(subcategory)
      this.categories[category].subcats[subcategory].products.push(product)
    else
      this.categories[category].products.push(product)
  },

  addCategory: function(category_array_el) {
    category = this.categories[category_array_el]
    var categoryView = new CategoryView({header: category.label, id: category_array_el})
    $(this.el).append(categoryView.render().el)
    if (!category.subcats){
      var listView = new ListView({products: category.products })
      $(categoryView.el).append(listView.render().el)
    }
    else{
      _.each(category.subcats._array, function(subcat_el){
        subcat = category.subcats[subcat_el]
        this.addSubcategory(subcat, categoryView, subcat_el)
      }, this) 
    }
  },

  addSubcategory: function(subcategory, parentView, subcat_el){
    var subcategoryView = new SubcategoryView({header: subcategory.label, id: subcat_el})
    $(parentView.el).append(subcategoryView.render().el)
    var listView = new ListView({products: subcategory.products })
    $(subcategoryView.el).append(listView.render().el)
  },

  render: function() {
    // reset categories.products[]
    this.preRender() 
    this.categories = this.getCategories()
    this.collection.each(this.categorize, this);
    _.each(this.categories._array, this.addCategory, this)
    return this
  },

  preRender: function(){
    //$(this.el).append('<h1 id="jumboheader">Our Dual Flush Toilets</h1>')
  }

})


})
