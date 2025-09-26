const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API代理配置
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
      onProxyReq: function(proxyReq, req, res) {
        // 在发送请求之前可以修改请求头
        proxyReq.setHeader('X-Special-Proxy-Header', 'sports-meeting');
      },
      onError: function(err, req, res) {
        console.error('代理请求错误:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
          error: '代理请求失败，请检查服务器是否正常运行',
          details: err.message
        }));
      },
    })
  );

  // 静态文件代理配置
  app.use(
    '/data',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
      onError: function(err, req, res) {
        console.error('静态文件代理错误:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({
          error: '静态文件访问失败，请检查服务器是否正常运行',
          details: err.message
        }));
      },
    })
  );
};