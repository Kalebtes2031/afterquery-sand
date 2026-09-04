const http=require('http');
const {URL}=require('url');
const seed=[
{id:'HT-104',origin:'Ethiopia',destination:'Kenya',commodity:'Washed coffee',weightKg:840,status:'pending',priority:'High',notes:'Export documents received; customs review is due today.'},
{id:'HT-107',origin:'Kenya',destination:'Uganda',commodity:'Tea leaves',weightKg:1260,status:'approved',priority:'Normal',notes:'Transit permit matched to carrier.'},
{id:'HT-112',origin:'Rwanda',destination:'Tanzania',commodity:'Arabica coffee',weightKg:640,status:'pending',priority:'Normal',notes:'Origin certificate is attached.'},
{id:'HT-118',origin:'Uganda',destination:'Rwanda',commodity:'Sesame',weightKg:910,status:'rejected',priority:'Low',notes:'Packing list did not match declared bags.'},
{id:'HT-121',origin:'Ethiopia',destination:'Tanzania',commodity:'Cut flowers',weightKg:420,status:'pending',priority:'High',notes:'Cold-chain handoff needs confirmation.'},
{id:'HT-125',origin:'Tanzania',destination:'Kenya',commodity:'Cashew nuts',weightKg:1520,status:'approved',priority:'Normal',notes:'Inspection completed at origin.'}
];
let shipments=structuredClone(seed);
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data));};
const readBody=req=>new Promise(resolve=>{let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch{resolve({})}})});
const server=http.createServer(async(req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,PUT,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();}
  if(req.method==='GET'&&u.pathname==='/api/health')return json(res,200,{ok:true});
  if(req.method==='GET'&&u.pathname==='/api/shipments'){
    let rows=shipments.slice(); const status=u.searchParams.get('status'), region=u.searchParams.get('region'), q=u.searchParams.get('q');
    if(status)rows=rows.filter(x=>x.status!==status);
    if(region)rows=rows.filter(x=>x.origin===region);
    if(q){const z=q.toLowerCase();rows=rows.filter(x=>[x.id,x.origin,x.destination,x.commodity].some(v=>v.toLowerCase().includes(z)));}
    return json(res,200,{shipments:rows,total:rows.length});
  }
  const m=u.pathname.match(/^\/api\/shipments\/([^/]+)$/); if(req.method==='GET'&&m){const x=shipments.find(v=>v.id===m[1]);return x?json(res,200,x):json(res,404,{error:'Shipment not found'});}
  const a=u.pathname.match(/^\/api\/shipments\/([^/]+)\/(approve|reject)$/); if(req.method==='PUT'&&a){const x=shipments.find(v=>v.id===a[1]);if(!x)return json(res,404,{error:'Shipment not found'});if(x.status!=='pending')return json(res,409,{error:'Only pending shipments can be changed'});const body=await readBody(req);if(a[2]==='approve'){x.status='approved';return json(res,200,x);}const reason=String(body.reason||'').trim();x.status='rejected';x.notes=reason||'Rejected during review.';return json(res,200,x);}
  if(req.method==='GET'&&u.pathname==='/api/summary'){const s={pending:0,approved:0,rejected:0,totalWeightKg:0};for(const x of shipments){s[x.status]++;s.totalWeightKg+=x.weightKg;}return json(res,200,s);}
  json(res,404,{error:'Not found'});
});
server.listen(process.env.PORT||5000,()=>console.log('API ready'));
