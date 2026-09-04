const http=require('http'),fs=require('fs'),path=require('path');
const PORT=Number(process.env.PORT||3000), root=__dirname;
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css'};
http.createServer((req,res)=>{let p=req.url==='/'?'/index.html':req.url;let f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f))return res.writeHead(404).end('not found');res.writeHead(200,{'Content-Type':types[path.extname(f)]||'text/plain'});fs.createReadStream(f).pipe(res)}).listen(PORT,'0.0.0.0',()=>console.log(`frontend on ${PORT}`));
