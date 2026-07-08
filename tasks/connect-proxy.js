'use strict';

// Replaces the abandoned grunt-connect-proxy plugin (last published 2015,
// permanently pinned to a grunt ~0.4.1 peer dependency, which blocked the
// grunt 1.6.2 upgrade needed to fix CVE-2020-7729/CVE-2022-1537/CVE-2022-0436).
// Only used by the local `grunt dev` server to proxy CouchDB view requests
// (see connect.proxies in Gruntfile.js) - not part of `dist`, `test`, or
// anything published. Re-implements just the pieces that config actually
// uses, directly against http-proxy (which grunt-connect-proxy itself just
// wrapped).

var httpProxy = require('http-proxy');

var proxies = [];

function matchContext(context, url) {
  var contexts = Array.isArray(context) ? context : [context];
  return contexts.some(function (c) {
    return url.lastIndexOf(c, 0) === 0;
  });
}

function proxyRequest(req, res, next) {
  var proxy = proxies.filter(function (p) {
    return matchContext(p.context, req.url);
  })[0];

  if (!proxy) {
    next();
    return;
  }

  proxy.rules.forEach(function (rule) {
    if (rule.from.test(req.url)) {
      req.url = req.url.replace(rule.from, rule.to);
    }
  });
  proxy.server.web(req, res);
}

module.exports = function (grunt) {
  grunt.registerTask('configureProxies', 'Configure connect proxies from connect.proxies', function () {
    proxies = (grunt.config('connect.proxies') || []).map(function (proxyOption) {
      var rules = Object.keys(proxyOption.rewrite || {}).map(function (from) {
        return { from: new RegExp(from), to: proxyOption.rewrite[from] };
      });

      var server = httpProxy.createProxyServer({
        target: { host: proxyOption.host, port: proxyOption.port },
        secure: !!proxyOption.https,
        xfwd: !!proxyOption.xforward,
        changeOrigin: !!proxyOption.changeOrigin
      });
      server.on('error', function (err) {
        grunt.log.error('Proxy error: ', err.code);
      });

      grunt.log.writeln('Proxy created for: ' + proxyOption.context + ' to ' + proxyOption.host + ':' + proxyOption.port);
      return { server: server, context: proxyOption.context, rules: rules };
    });
  });
};

module.exports.proxyRequest = proxyRequest;
