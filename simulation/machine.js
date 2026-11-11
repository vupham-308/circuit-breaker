/* Máy phân loại: hình ẩn dụ cho luồng code, không phải cấu trúc phần cứng thật. */
(() => {
  const host = document.querySelector('.figure');
  host.querySelectorAll('svg').forEach(svg => svg.remove());
  const rollers = (x, y, count) => Array.from({ length: count }, (_, i) =>
    `<g><path d="M${x + i * 17} ${y}v35" stroke="#15261d" stroke-width="12"/><path d="M${x + i * 17 - 2} ${y}v35" stroke="url(#roller)" stroke-width="8"/><circle cx="${x + i * 17}" cy="${y + 36}" r="2" fill="#b6c8ad"/></g>`).join('');
  const bolts = (x, y, w, h) => [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([a,b]) => `<circle cx="${a}" cy="${b}" r="3" fill="#293d30" stroke="#afc4a6"/><path d="m${a-1} ${b-1} 2 2" stroke="#d1dfc8"/>`).join('');
  const svg = `<svg id="sorter" viewBox="0 0 760 430" role="img" aria-label="Bộ chuyển hướng Circuit Breaker: nối ray tới product-service hoặc rẽ xuống fallback">
  <defs>
    <linearGradient id="roller" x2="1" y2="0"><stop stop-color="#617565"/><stop offset=".4" stop-color="#d2ddc5"/><stop offset="1" stop-color="#425c49"/></linearGradient>
    <linearGradient id="housing" x2="0" y2="1"><stop stop-color="#71876b"/><stop offset="1" stop-color="#344d3c"/></linearGradient>
    <linearGradient id="parcel" x2="0" y2="1"><stop stop-color="#f1dfb0"/><stop offset="1" stop-color="#b2a078"/></linearGradient>
    <filter id="machine-shadow"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <ellipse cx="380" cy="367" rx="315" ry="25" fill="#090e0b" opacity=".6" filter="url(#machine-shadow)"/>
  <path d="M40 131 676 131 724 162 88 162Z" fill="#64775f" stroke="#9eb195"/>
  <path d="M88 162H724V347H88Z" fill="#293f31" stroke="#748e72"/><path d="M40 131 88 162V347L40 315Z" fill="#1f3227" stroke="#748e72"/>
  <path d="M101 330H709M101 338H709" stroke="#849b7a" opacity=".4"/>
  <path d="M101 346v15h22v-15m546 0v15h22v-15" fill="#192c20" stroke="#8ba181"/>
  ${bolts(103, 176, 603, 150)}
  <!-- Hai đoạn băng tải cố định; khoảng giữa dành cho ray chuyển hướng. -->
  <path d="M72 200H698V250H72Z" fill="#14281c" stroke="#9ab18d"/>
  ${rollers(83, 204, 12)}
  ${rollers(381, 204, 19)}
  <path d="M72 198H698M72 246H698" stroke="#a8bd9e" stroke-width="4"/><path d="M72 252H698" stroke="#1d3023" stroke-width="6"/>
  <!-- Nhánh fallback bắt đầu tại đầu ra thứ hai của ray chuyển hướng. -->
  <path d="M338 260 366 273H503V308H346L321 281Z" fill="#1a3021" stroke="#9db68e" stroke-width="2"/>
  <path d="M356 281H490M350 300H490" stroke="#718e69"/>
  <g id="fallback-coupling"><path d="M449 273h15v35h-15z" fill="#9caf8c" stroke="#e0ebd4"/><path d="M467 273h15v35h-15z" fill="#819874" stroke="#e0ebd4"/><path d="M464 279h3v23h-3z" fill="#c6d8b5"/></g>
  <path d="M506 270h61v46h-61z" fill="#344d38" stroke="#bed0af"/><path d="m506 270 12-9h61l-12 9z" fill="#849875" stroke="#bed0af"/><path d="m567 270 12-9v46l-12 9z" fill="#536c49" stroke="#bed0af"/>
  <!-- Platine, course circulaire, deux butées et rail pivotant. -->
  <path d="M279 197H373V257L347 285 279 251Z" fill="#152b1d" stroke="#819978"/>
  <path d="M365 224A80 80 0 0 1 347 275" fill="none" stroke="#4a6546" stroke-width="8"/>
  <path d="M365 224A80 80 0 0 1 347 275" fill="none" stroke="#9ab18b" stroke-width="1"/>
  <path d="M366 209v30m-29 26 20 17" stroke="#a7bd9a" stroke-width="5"/>
  ${bolts(284, 202, 81, 46)}
  <g id="switch-rail" transform="rotate(0 285 224)">
    <path d="M285 213H365V235H285Z" fill="url(#housing)" stroke="#c9dabd"/>
    <path d="M292 216v16m12-16v16m12-16v16m12-16v16m12-16v16m12-16v16" stroke="#203a29" stroke-width="5"/>
    <path d="M285 213H365M285 235H365" stroke="#d8e7cb" stroke-width="3"/>
  </g>
  <circle cx="285" cy="224" r="8" fill="#56734f" stroke="#d4e4c6"/><circle cx="285" cy="224" r="3" fill="#192d1f" stroke="#abc59c"/>
  <!-- Le cadran d'état nomme la connexion, pas l'ouverture d'une porte. -->
  <rect x="263" y="113" width="133" height="71" rx="5" fill="url(#housing)" stroke="#9db88e"/>
  <rect x="270" y="120" width="119" height="23" rx="3" fill="#12291a" stroke="#97af87"/>
  <text id="sorter-state" x="329" y="136" text-anchor="middle" fill="#d2edba" font-family="monospace" font-size="12">CLOSED</text>
  <text id="switch-caption" x="329" y="157" text-anchor="middle" fill="#e0edda" font-family="system-ui,sans-serif" font-size="10">Nối tới product-service</text>
  <g id="probe-display" opacity=".35"><rect id="probe-0" x="291" y="165" width="20" height="12" rx="2" fill="#304a34" stroke="#a9c397"/><rect id="probe-1" x="319" y="165" width="20" height="12" rx="2" fill="#304a34" stroke="#a9c397"/><rect id="probe-2" x="347" y="165" width="20" height="12" rx="2" fill="#304a34" stroke="#a9c397"/></g>
  <!-- Feign: moteur d'expédition monté sur le châssis. -->
  <path d="M474 166h62v30h-62z" fill="url(#housing)" stroke="#b9cfac"/><path d="M481 172h48v17h-48z" fill="#233b29" stroke="#92ac83"/><path d="M487 174v13m7-13v13m7-13v13m7-13v13m7-13v13m7-13v13" stroke="#a6bc98"/>
  <path d="M483 197v8m44-8v8" stroke="#d0e0c3" stroke-width="4"/>
  <!-- Product: quai de réception et voyant de disponibilité. -->
  <path d="M622 171h70v83h-70z" fill="#36513b" stroke="#afc8a1"/><path d="m622 171 11-13h70l-11 13z" fill="#7e9572" stroke="#b9cfac"/><path d="m692 171 11-13v84l-11 12z" fill="#4c6746" stroke="#b9cfac"/>
  <path d="M632 199h49v43h-49z" fill="#102519" stroke="#92ac83"/><path d="M638 200v41m8-41v41m8-41v41m8-41v41m8-41v41" stroke="#4f6b47"/>
  <circle id="product-lamp" cx="678" cy="183" r="4" fill="#d1eab6" stroke="#e8f2dd"/>
  <!-- Registre 5 appels, intégré à la façade de la machine. -->
  <rect x="116" y="277" width="136" height="34" rx="3" fill="#152b1c" stroke="#9cb98b"/>
  ${Array.from({length:5},(_,i)=>`<rect id="memory-${i}" x="${124+i*25}" y="284" width="19" height="18" rx="2" fill="#304a34" stroke="#718f64"/>`).join('')}
  <path id="active-route" fill="none" stroke="#c9e99c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" opacity=".85" pointer-events="none"/>
  <g id="request-parcel" opacity="0"><path id="parcel-face" d="M-11-13H11V9H-11Z" fill="url(#parcel)" stroke="#f5edcf"/><path d="M-11-13 -5-18H17L11-13Z" fill="#ebdfbe" stroke="#f5edcf"/><path d="M11-13 17-18V4L11 9Z" fill="#998861" stroke="#f5edcf"/><path d="M-2-13V9m0-22 6-5" stroke="#7d795d" stroke-width="3"/><path id="parcel-error" d="M-5-8 5 2M5-8-5 2" fill="none" stroke="#54251d" stroke-width="3" opacity="0"/></g>
  <g font-family="system-ui,sans-serif" font-size="11" text-anchor="middle" fill="#d1dfc9"><text x="117" y="390">Client / OrderController</text><text x="324" y="390">Bộ chuyển hướng</text><text x="504" y="390">OpenFeign</text><text x="660" y="390">Product-service</text><text x="535" y="333">fallback()</text></g>
  </svg>`;
  host.querySelector('.cardhead').insertAdjacentHTML('afterend', svg);
  host.querySelector('.cardfoot').insertAdjacentHTML('beforebegin', `
    <div class="machine-outcome" aria-live="polite">
      <strong id="machine-result">Chưa gửi request</strong>
      <div id="machine-route">Client → proxy → Feign → product-service</div>
      <div class="machine-facts">
        <span id="machine-network">Gọi product: —</span>
        <span id="machine-fallback">Fallback: —</span>
        <span id="machine-counter">Mạch productService: 0/5</span>
      </div>
    </div>`);
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  function clearOutcome() {
    cancelAnimationFrame(frame);
    $('request-parcel').setAttribute('opacity','0');
    $('active-route').setAttribute('d','');
    $('machine-result').textContent='Chưa gửi request';
    $('machine-result').style.color='var(--ink)';
    $('machine-route').textContent='Client → proxy → ProductClient → Feign → product-service';
    $('machine-network').textContent='Gọi product: —';
    $('machine-fallback').textContent='Fallback: —';
  }
  function followPath(points, failed, duration = 2400) {
    cancelAnimationFrame(frame);
    const parcel = $('request-parcel');
    const lengths = points.slice(1).map((p,i) => Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
    const total = lengths.reduce((a,b)=>a+b,0);
    const start = performance.now();
    const tick = now => {
      const t = Math.min(1,(now-start)/duration);
      let d = t*total, i=0;
      while(i<lengths.length-1 && d>lengths[i]) d-=lengths[i++];
      const ratio = lengths[i] ? d/lengths[i] : 0;
      const x=points[i][0]+(points[i+1][0]-points[i][0])*ratio;
      const y=points[i][1]+(points[i+1][1]-points[i][1])*ratio;
      parcel.setAttribute('transform',`translate(${x} ${y})`);
      parcel.setAttribute('opacity','1');
      if(t===1) {
        $('parcel-face').setAttribute('fill',failed?'#e59e8d':'#c9e99c');
        $('parcel-error').setAttribute('opacity',failed?'1':'0');
      }
      if(t<1 && !document.hidden) frame=requestAnimationFrame(tick);
    };
    $('parcel-face').setAttribute('fill','url(#parcel)');
    $('parcel-error').setAttribute('opacity','0');
    if(reduced.matches) { tick(start+duration); return; }
    frame=requestAnimationFrame(tick);
  }
  window.sorterMachine = {
    update(state, calls, serviceUp, probes = []) {
      $('sorter-state').textContent = state;
      $('switch-rail').setAttribute('transform',`rotate(${state==='OPEN'?39.5:0} 285 224)`);
      $('switch-rail').style.transition = reduced.matches?'none':'transform .45s ease';
      $('switch-caption').textContent=state==='OPEN'?'Rẽ sang fallback':state==='HALF_OPEN'?'Cho thử tới product':'Nối tới product-service';
      $('probe-display').setAttribute('opacity',state==='HALF_OPEN'||probes.length?'1':'.35');
      for(let i=0;i<3;i++) $('probe-'+i).setAttribute('fill',i<probes.length?(probes[i]?'#c9e99c':'#e59e8d'):'#304a34');
      $('product-lamp').setAttribute('fill',serviceUp?'#c9e99c':'#e59e8d');
      for(let i=0;i<5;i++) $('memory-'+i).setAttribute('fill',i<calls.length?(calls[i]?'#c9e99c':'#e59e8d'):'#304a34');
      $('machine-counter').textContent=`productService: ${calls.length}/5 · ${calls.filter(x=>!x).length} lỗi trong cửa sổ`;
    },
    reset: clearOutcome,
    request({blocked=false, success=true}={}) {
      let route=[[92,224],[650,224]];
      if(blocked) route=[[92,224],[285,224],[347,275],[356,290],[536,290]];
      else if(!success) route=[[92,224],[650,224],[373,224],[347,275],[356,290],[536,290]];
      $('active-route').setAttribute('d',route.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' '));
      $('active-route').setAttribute('stroke',!success&&!blocked?'#e59e8d':'#c9e99c');
      const result=$('machine-result');
      result.textContent=blocked?'FALLBACK · request bị chặn tại proxy':success?'THÀNH CÔNG · nhận dữ liệu sản phẩm':'FALLBACK · đã xử lý lỗi kết nối';
      $('machine-route').textContent=blocked?'Client → proxy CHẶN → fallback → client':success?'Client → proxy → ProductClient → Feign → product-service':'Product lỗi → proxy ghi nhận thất bại → fallback → client';
      $('machine-fallback').textContent=blocked?'Fallback: ĐÃ CHẠY · CallNotPermittedException':success?'Fallback: không cần':'Fallback: ĐÃ CHẠY · RetryableException';
      result.style.color='var(--mint)';
      $('machine-network').textContent=blocked?'Gọi product: KHÔNG (bị chặn)':'Gọi product: CÓ';
      followPath(route,false);
    }
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);$('request-parcel').setAttribute('opacity','0')}});
})();
