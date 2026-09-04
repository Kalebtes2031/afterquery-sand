const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript'
};

http.createServer((req, res) => {
  let pathname = req.url.split('?')[0];
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(root, pathname);
  fs.readFile(filePath, (error, buffer) => {
    if (error) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(buffer);
  });
}).listen(process.env.PORT || 3000, () => console.log('UI ready'));
