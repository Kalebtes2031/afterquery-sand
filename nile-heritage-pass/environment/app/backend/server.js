const http = require('http');
const PORT = Number(process.env.PORT || 5000);

const passes = [
  { id:'ETH-101', name:'Lalibela Heritage Pass', country:'Ethiopia', currency:'ETB', price:850, status:'Active', expires:'2026-09-06T18:00:00+03:00', venue:'Lalibela', visitors:2 },
  { id:'KE-204', name:'Lamu Old Town Pass', country:'Kenya', currency:'KES', price:1500, status:'Active', expires:'2026-09-05T17:00:00+03:00', venue:'Lamu', visitors:2 },
  { id:'TZ-309', name:'Stone Town Heritage Pass', country:'Tanzania', currency:'TZS', price:45000, status:'Active', expires:'2026-09-07T19:00:00+03:00', venue:'Zanzibar', visitors:3 },
  { id:'GH-412', name:'Cape Coast Castle Pass', country:'Ghana', currency:'GHS', price:220, status:'Expired', expires:'2026-09-02T16:00:00+00:00', venue:'Cape Coast', visitors:1 },
];

function send(res, status, body, type='application/json') {
  res.writeHead(status, {'Content-Type': type, 'Access-Control-Allow-Origin':'*'});
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}
const server=http.createServer((req,res)=>{
  if(req.url==='/api/health') return send(res,200,{ok:true});
  if(req.url==='/api/passes') return send(res,200,{passes});
  if(req.url==='/') return send(res,200,'Nile Heritage Pass API','text/plain');
  return send(res,404,{error:'not found'});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`backend on ${PORT}`));
