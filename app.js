var express = require('express')
  , http = require('http')
  , RedisStore = require('connect-redis')(express)
  , hogan = require('hogan.js')
  , fs = require('fs')
  , mongo = require('mongoskin')
  , nodemailer = require("nodemailer")
  , bcrypt = require('bcrypt')
  , imagemagick = require('imagemagick')
  , check = require('validator').check
  , GridStore = require('mongodb').GridStore

var smtpTransport = nodemailer.createTransport("SMTP",{
    host: "localhost",
})


var staticServer = express.static(__dirname + '/public')

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/pages');
  //app.set('view engine', 'mustache');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.cookieParser('robin'));
  app.use(express.session({ secret: "batman", store: new RedisStore }));
  app.use(app.router);
})

app.configure('development', function(){
  app.use(express.errorHandler())
  db = mongo.db('localhost/savewater?auto_reconnect');
});

app.configure('production', function(){
  app.use(express.errorHandler())
  db = mongo.db('localhost/savewater?auto_reconnect');
})

/* redirect from www */
app.get('/*', function(req, res, next) {
  if (req.headers.host.match(/^www/) !== null ) res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url, 301);
  else next();
});

app.get('/css/*', function(req, res, next) {
  staticServer(req, res, next)  
})

app.get('/js/*', function(req, res, next) {
  staticServer(req, res, next)  
})

app.get('/img/*', function(req, res, next) {
  staticServer(req, res, next)  
})

app.get('/fonts/*', function(req, res, next) {
  staticServer(req, res, next)  
})

app.get('/files/:slug', function(req, res){
  db.gridfs().open(req.params.slug, 'r', function(err, file) {
    res.header('Content-Type', file.contentType);
    res.header('Content-Length', file.length);
    file.stream(true).pipe(res)
  })
})

var cache = {};
options = {cache: false}
options.cache = true
options.views =  __dirname + '/pages/'

function read(path, fn) {
  var str = cache[path];

  // cached
  if (options.cache && str) return fn(null, str);

  // read
  path = options.views + path 
  fs.readFile(path, 'utf8', function(err, str){
    if (err) return fn(err);
    if (options.cache) cache[path] = str;
    fn(null, str);
  });
}

/**
 * Hogan support.
 */

render = function(path, locals, fn){
  var engine = hogan
  read(path, function(err, str){
    if (err) return fn(err);
    try {
      var tmpl = engine.compile(str);
      fn(null, tmpl.render(locals));
    } catch (err) {
      fn(err);
    }
  })
}

function getUser(session){
  var user = false 
  if (session.user) {
    user = {
      username: session.user.username, 
      _id:  session.user._id
    }
    user = JSON.stringify(user)
  }
  return user
}

/* force xhr */
app.get('/*', function(req, res, next) { 
  if (!(req.xhr)){
    render('layout.mustache', {user: getUser(req.session), year: new Date().getFullYear() }, function(err, html){
      res.send(html)
    })
  }
  else 
    next()
})

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', function(req, res){
  render('home.mustache', {}, function(err, html){
    res.send({body: html, title: 'Save Water Project - dual flush toilets'})
  })
})

app.get('/faq', function(req, res){
  render('faq.html', {}, function(err, html){
    res.send({body: html, title: 'Frequently Asked Questions - Save Water Project'})
  })
})

app.get('/about', function(req, res){
  render('about.html', {}, function(err, html){
    res.send({body: html, title: 'About Us - Save Water Project'})
  })
})

app.post('/session', function(req, res) {
  var key
  var spec = {}
  try {
    check(req.body.login).isEmail()
    key = 'email'
  } catch(e) {
    key = 'username'
  }
  spec[key] = req.body.login  

  db.collection('users').findOne(spec, function(err, user){
    if (!user)
      return res.send({message: 'user not found'});
    bcrypt.compare(req.body.password, user.password, function(err, match) {
      if (!match) 
        return res.send({message: 'user not found'});
      req.session.user = user;
      user.password = '';
      res.send(user)
    })
  })
})

app.del('/session', function(req, res) {
  req.session.destroy(function(){
      res.send({success: true, 
                message: 'user logged out'
      })
  });
});

app.get('/signup', restrict, function(req, res) { });

app.post('/signup', restrict, function(req, res){ 
  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(req.body.password, salt, function(err, hash){
      req.body.password = hash;
      db.collection('users').insert(req.body, function(err, result){
        var user = result[0]
        req.session.user = user;
        user.password = '';
        res.send(user);
      })
    })
  }) 
})

app.get("/is-username-valid", function(req, res) {
  db.collection('users').findOne({username: req.body.username}, function(err, user){
    return user 
      ? res.send(false) 
      : res.send(true);
  })
})

app.get("/check-email", function(req, res){
  db.collection('users').findOne({email: req.body.email}, function(err, user){
    return user
      ? res.send(false)
      : res.send(true);
  })
})

app.post('/contact', function(req, res) {
  // Message object
  var message = {
      
      // sender info
      from: 'Savewater Contact Page <contact@savewaterproject.com>',
      
      // Comma separated list of recipients
      to: 'chambers205@gmail.com',
      
      // Subject of the message
      subject: 'Feedback from contact page', //
  }

  // TODO add cache from mailer code
  //
  
  render('email.mustache', req.body, function(err, html){
    message.html = html 
    // send mail with defined transport object
    smtpTransport.sendMail(message, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
        res.send({
          success: true, 
          message: 'email sent'
        })

    });
  })
})

app.get('/toilets', function(req, res) { 
  db.collection('toilets').find().sort({order: 1}).toArray(function(err, toilets) {
    res.send(toilets);
  })
})

app.post('/toilets', restrict, function(req, res) {
  req.body.slug = toSlug(req.body.name)
  db.collection('toilets').insert(req.body, function(err, result){
    var product = result[0]
    res.send(product)
  })
})

app.put('/toilets/:slug', restrict, function(req, res) {
  // Hack: this is repeated from post action
  req.body.slug = toSlug(req.body.name)
  req.body._id = db.ObjectID.createFromHexString(req.body._id)
  db.collection('toilets').save(req.body)
  res.send(req.body)
})

app.get('/toilets/:slug', function(req, res) {
  db.collection('toilets').findOne({slug: req.params.slug}, function(err, product){
    res.send(product);
  })
})

app.get('/toilets/:slug/edit', function(req, res) {})

app.get('/toilets/new', function(req, res) {})

function toSlug(text, options){
  return text.replace(/[^a-zA-z0-9_]+/g, '-')
}

function splitFilename(filename){
  var regex = /^(.+)\.([a-zA-Z]+)/
  var match = regex.exec(filename);
  var name = match[1]
  var extension = match[2]
  return {name: name, extension: extension}
}

function toSlugFile(filename){
  var split = splitFilename(filename)
  name = toSlug(split.name) 
  extension = split.extension.toLowerCase() 
  return name+'.'+extension
}

app.del('/files/:slug', restrict, function(req, res){
  GridStore.unlink(db.db, req.params.slug, function(err, gs) {
    console.log('orginal deleted')
    GridStore.unlink(db.db, req.body.thumb, function(err, gs) {
      console.log('thumbnail removed')
      GridStore.unlink(db.db, req.body.medium, function(err, gridStore) {
        console.log('medium removed')
        res.send({
          success: true, 
          message: 'file removed', 
          data: {name: req.params.slug }
        })
      })
    })
  })
})

app.post('/upload/:product_id', restrict, function(req, res){
  req.files.file.name = toSlugFile(req.files.file.name)

  var file = req.files.file

  var regex = /^(.+)\.([a-zA-Z]+)/
  var match = regex.exec(file.name);
  var nameNoExt = match[1]
  var extension = match[2]

  if (file.type == 'application/pdf') {
    var thumbName = nameNoExt+'_thumb_pdf.png'
    var mediumName = nameNoExt+'_medium_pdf.png'
    var image_input = file.path + '[0]' 
    var input = file.path
    var output = '/tmp/'+file.name+'.png'
    var mediumSize = '300x400>'
    var thumbnailSize = '177x281>'
    var fs_opts = {"content_type": file.type, product_id: req.params.product_id, main_file: file.name}
    var fs_opts_thumb = {"content_type": 'image/png',  product_id: req.params.product_id, main_file: file.name}
    var fs_opts_medium = {"content_type": 'image/png', product_id: req.params.product_id, main_file: file.name}
  } else {
    var thumbName = nameNoExt+'_thumb.'+extension
    var mediumName = nameNoExt+'_medium.'+extension
    var input = image_input = file.path
    var output = '/tmp/'+file.name
    var mediumSize = '400x500>'
    var thumbnailSize = '177x281>'
    var fs_opts = fs_opts_thumb =  fs_opts_medium = {"content_type": file.type, product_id: req.params.product_id, main_file: file.name}
  }
 

  var gs_original = new GridStore(db.db, file.name, "w", fs_opts)
  var gs_medium = new GridStore(db.db, mediumName, "w", fs_opts_medium)
  var gs_thumb = new GridStore(db.db, thumbName, "w", fs_opts_thumb)

  startWithMedium()

  function startWithMedium(){
    imagemagick.convert([image_input, '-resize', mediumSize, '-quality', '100', output], function(err, metadata){
      gs_medium.open(function(err, gs) {
        gs.writeFile(output, function(err, reply) {
          fs.unlink(output, function (err) {
            console.log('image resized to 400x500 and saved')
            gs.close(function(err, reply){
              createThumb() 
            })
          })
        })
      })
    })
  }

  function createThumb(){
    imagemagick.convert([image_input, '-resize', thumbnailSize, '-quality', '100', output], function(err, metadata){
      gs_thumb.open(function(err, gs) {
        gs.writeFile(output, function(err, reply) {
          fs.unlink(output, function (err) {
            console.log('image thumbnail created and saved')
            gs.close(function(err, reply){
              saveOriginal()
            })
          })
        })
      })
    })
  }

  function saveOriginal(){
    gs_original.open(function(err, gs) {
      gs.writeFile(input, function(err, reply) {
        fs.unlink(input, function (err) {
          console.log('original saved')
          gs.close(function(err, reply){
            done(file.name)
          })
        })
      })
    })
  }
 
  function done(name) {
    console.log('image manipulation done and saved')
    res.send({
      success: true, 
      message: file.type+' resized and saved',
      data: {
        name: name, 
        type: file.type,
        medium: mediumName,
        thumb: thumbName,
      }
    })    
  }
})

app.listen(3000);

console.log("Express server listening on port 3000");
