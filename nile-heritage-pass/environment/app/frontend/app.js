const fmtMoney=(n)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'ETB',maximumFractionDigits:0}).format(n);
const fmtDate=(iso)=>new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'UTC'}).format(new Date(iso))+' EAT';
function render(data){
 const active=data.filter(x=>x.status!=='Expired').length;
 document.querySelector('#active-count').textContent=active;
 document.querySelector('#visitor-count').textContent=data.reduce((a,x)=>a+x.visitors,0);
 document.querySelector('#country-count').textContent=new Set(data.map(x=>x.country)).size;
 document.querySelector('#next-expiry').textContent=fmtDate(data.filter(x=>x.status!=='Expired').sort((a,b)=>new Date(a.expires)-new Date(b.expires))[0].expires);
 document.querySelector('#rows').innerHTML=data.map(x=>`<tr><td><strong>${x.name}</strong><small>${x.id}</small></td><td>${x.country}</td><td>${x.venue}</td><td class="money">${fmtMoney(x.price)}</td><td>${fmtDate(x.expires)}</td><td><span class="status ${x.status.toLowerCase()}">${x.status}</span></td></tr>`).join('');
}
fetch('http://localhost:5000/api/passes').then(r=>r.json()).then(x=>render(x.passes));