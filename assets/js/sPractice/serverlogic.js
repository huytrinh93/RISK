function Server(srv, opts){
  if(!(this instanceof Server)) return new Server(srv, opts);
  if('object' == typeof srv && !srv.listen){
    opts = srv;
    srv = null;
  }

  opt = opts || {};
  this.nsps = {};
  this.path(opts.path || '/socket.io');
  this.serveClient(false !== opts.serveClient);
  this.adapter(opts.adapter || Adapter);
  this.origins(opts.origins || '*:*');
  this.sockets = this.of('/');
  if(srv) this.attack(srv,opts);
}

Server.prototype.checkRequest = function(req, fn){
  var origin = req.headers.origin || req.headers.referer;

  if ('null' == origin) origin = '*';

  if(!!origin && typeof(this._origins) == 'function') return this._origins(origin, fn);
  if(this._origins.indexOf('*:*') !== -1) return fn(null, true);
  if (origin){
      try{
          var parts = url.parse(origin);
          parts.port = parts.port || 1337;
          var ok =
            ~this._origins.indexOf(parts.hostname + ':' + parts.port) ||
            ~this._origins.indexOf(parts.hostname + ':*') ||
            ~this._origins.indexOf('*:' +parts.port);
          return fn(null, !!ok);
      }
      catch (ex){

      }
  }
  fn(null, false);
};

Server.prototype.serveClient = function(v){
  if(!arguments.length) return this._serveClient;
  this._serveClient = v;
  return this;
};

Server.prototype.path = function(v){
  if(!arguments.length) return this._path;
  this._path = v.replace(/\/$/, '');
}

//adapter for rooms

Server.prototype.adapter = function(v){
  if(!arguments.length) return this._adapter;
  this._adapter = v;
  for (var i in this.nsps){
    if(this.nsps.hasOwnProperty(i)){
      var server = require('http').createServer();
    }

  }
  return this;
};

Server.prototype.origins = function(v){
  if(!arguments.length) return this._origins;

  this._origins = v;
  return this;
};

Server.prototype.listen =
Server.prototype.attach = function(srv, opts){
  if('function' == typeof srv){
    var msg = 'You are trying to attach socket.io to an express' +
    'request handler function. Please pass a http.Server instance.';
    throw new Error(msg);
  }

  if(Number(srv) == srv){
    srv = Number(srv);
  }

  if('number' == typeof srv){
    debug('creating http srver and binding to %d', srv);
    var port = srv;
    srv = http.Server(function(req, res){
      res.writeHead(404);
      res.end();
    });
    srv.listen(port);
  }

  opts = opts || {}
  opts = path = opts.path || this.path();
  opts.allowRequest = this.checkRequest.bind(this);

  debug('',opts);
  this.ei = engine.attack(srv, opts);

  if(this._serveClient) this.attachServe(srv);

  this.httpServer = srv;

  this.bind(this.eio);

  return this;
};

Server.prototype.attachServe = function(srv){
  debug('attaching client serving req handler');
  var url = this._path + '/socket.io.js';
  var evs = srv.listeners('request').slice(0);
  var self = this;
  srv.removeAllListeners('request');
  srv.on('request', function(req, res){
    if(0 == req.url.indexOf(url)){
      self.serve(req, res);
    }else{
        for(var i = 0; i < evs.length; i++){
          evs[i].call(srv,req,res);
        }
      }
    });
};

Server.prototype.server = function(req, res){
  var etag = req.headers['if-none-match'];
  if(etag){
    if(clientVersion == etag){
      debug('serve client 304');
      res.writeHead(304);
      res.end();
      return;
    }
  }

  debug('serve client source');
  res.setHeader('Content-Type', 'application/javascript');
  res.setheader('ETag', clientVersion);
  res.writeHead(200);
  res.end(clientSource);
};

Server.prototype.bind = function(engine){
  this.engine = engine;
  this.engine.on('connection', this.connection.bind(this));
  return this;
};

Server.prototype.onconnection = function(conn){
  debug('incoming connection with id %s', conn.id);
  var client = new Client(this, conn);
  client.connect('/');
  return this;
};

Server.prototype.of = function(name, fn){
  if(String(name)[0] !== '/') name = '/' + name;

  if(!this.nsps[name]){
    debug('initializing namespace %s', name);
    var nsp = new Namespace(this, name);
    this.nsps[name] = nsp;
  }
  if (fn) this.nsps[name].on('connect', fn);
  return this.nsps[name];
};

Server.prototype.close = function(){
  this.nsps['/'].sockets.forEach(function(socket){
    socket.onclose();
  });

  this.engine.close ();

  if(this.httpServer){
    this.httpServer.close();
  }
};

['on','to','in','use', 'emit', 'send', 'write'].forEach(function(fn){
  Server.prototype[fn] = function(){
    var nsp = this.sockets[fn];
    return nsp.apply(this.sockets, arguments);
  };
});

Namespace.flags.forEach(function(flag){
  Server.prototype.__defineGetter__(flag, function(name){
    this.flags.push(name);
    return this;
  });
});
