// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// declare global: tern, server

var server;

this.onmessage = function(e) {
  var data = e.data;
  switch (data.tag) {
  case "init": return startServer(data.defs, data.plugins, data.scripts);
  case "add": return server.addFile(data.name, data.text);
  case "del": return server.delFile(data.name);
  case "req": return server.request(data.body, function(err, reqData) {
    postMessage({id: data.id, body: reqData, err: err && String(err)});
  });
  case "getFile":
    var c = pending[data.id];
    delete pending[data.id];
    return c(data.err, data.text);
  default: throw new Error("Unknown message tag: " + data.tag);
  }
};

var nextId = 0, pending = {};
function getFile(file, c) {
  postMessage({tag: "getFile", name: file, id: ++nextId});
  pending[nextId] = c;
}

function startServer(defs, plugins, scripts) {
  if (scripts) importScripts.apply(null, scripts);

  server = new tern.Server({
    getFile: getFile,
    async: true,
    defs: defs,
    plugins: plugins
  });
}

var console = {
  log: function(v) { postMessage({tag: "debug", message: v}); }
};
