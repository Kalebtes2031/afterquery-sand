const http=require('http'), fs=require('fs'), path=require('path');
const root=path.join(__dirname,'public');
http.createServer((req,res)=>{
  let p=req.url.split('?')[0]; if(p==='/')p='/index.html';
  const f=path.join(root,p);
  fs.readFile(f,(e,b)=>{ if(e){res.writeHead(404);return res.end('Not found');} res.writeHead(200,{'Content-Type':p.endsWith('.css')?'text/css':'text/html'});res.end(b);});
}).listen(process.env.PORT||3000,()=>console.log('UI ready'));
