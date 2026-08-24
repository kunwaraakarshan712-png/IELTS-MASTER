 (function(){
  const whatsappNumber = '9779707450833';
  // Prefilled messages for different CTA locations
  const waMessages = {
    hero: "Hi, I'm interested in the IELTS Master Course for Rs. 500. Please send me the enrollment details.",
    pricing: "Hi, I'd like to reserve my seat for the IELTS Master Course for Rs. 500. Please send me the payment and course details.",
    final: "Hi, I'm ready to join the IELTS Master Course for Rs. 500. Please tell me how to enroll.",
    sticky: "Hi, I'd like to join the IELTS Master Course. Please send me the course and enrollment details.",
    faq: "Hi, I have a question about the IELTS Master Course.",
    general: "Hi, I'd like to know more about IELTS Master."
  };
  // Band slider
  const bandSlider = document.getElementById('bandSlider');
  const bandInfo = document.getElementById('bandInfo');
  const bandTexts = {
    5: 'Band 5 — Basic organisation, task response may be limited; noticeable errors and limited vocabulary.',
    6: 'Band 6 — Better development, more consistent organisation, fewer errors; wider vocabulary.',
    7: 'Band 7 — Clear development, strong coherence and flexible vocabulary; good grammatical control.',
    8: 'Band 8 — Precision, flexibility, strong control and consistency; very few errors.'
  };
  function updateBand(){
    const v = bandSlider.value;
    bandInfo.textContent = bandTexts[v] || '';
  }
  if(bandSlider) bandSlider.addEventListener('input', updateBand);
  if(bandSlider) bandSlider.addEventListener('change', function(){ try{ sendAnalyticsEvent('band_slider', { value: bandSlider.value }); }catch(e){} });
  updateBand();

  // Band calculator
  function roundOverall(avg){
    const floor = Math.floor(avg);
    const dec = avg - floor;
    if(dec >= 0.75) return Math.ceil(avg);
    if(dec >= 0.25) return floor + 0.5;
    return floor + 0.0;
  }
  document.getElementById('calcBand').addEventListener('click', function(){
    const L = parseFloat(document.getElementById('inpListening').value) || 0;
    const R = parseFloat(document.getElementById('inpReading').value) || 0;
    const W = parseFloat(document.getElementById('inpWriting').value) || 0;
    const S = parseFloat(document.getElementById('inpSpeaking').value) || 0;
    const avg = (L+R+W+S)/4;
    const overall = roundOverall(avg);
    const res = `Average: ${avg.toFixed(3)} — Overall (rounded): ${overall.toFixed(1)}\nNote: This calculator is for guidance only. Official results determined by IELTS.`;
    document.getElementById('bandResult').textContent = res;
    try{ sendAnalyticsEvent('calc_band', { L, R, W, S, avg: Number(avg.toFixed(3)), overall }); }catch(e){}
  });

  // Raw score converter (approximate via linear interpolation)
  function convertRaw(raw, type){
    // Approximate: map 0->0, 40->9 (non-linear in reality). This gives an indicative band.
    const linear = (raw/40)*9;
    // Round to nearest 0.5 using IELTS rules
    const floor = Math.floor(linear);
    const dec = linear - floor;
    let rounded;
    if(dec >= 0.75) rounded = Math.ceil(linear);
    else if(dec >= 0.25) rounded = floor + 0.5;
    else rounded = floor + 0.0;
    return {raw, approxScore: rounded.toFixed(1), note: 'Approximate conversion — actual conversions vary by test version.'};
  }
  document.getElementById('calcRaw').addEventListener('click', function(){
    const raw = parseInt(document.getElementById('rawCorrect').value,10) || 0;
    const type = document.getElementById('rawType').value;
    const out = convertRaw(raw,type);
    document.getElementById('rawResult').textContent = `Correct: ${out.raw} → Approx. band ${out.approxScore}. ${out.note}`;
    try{ sendAnalyticsEvent('calc_raw', { raw: out.raw, type, approx: out.approxScore }); }catch(e){}
  });

  // Speaking timer
  let timerInterval=null; let timerRemaining=0;
  const timerDisplay = document.getElementById('timerDisplay');
  function formatTime(s){const mm=Math.floor(s/60);const ss=s%60;return `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`}
  function startTimer(sec){timerRemaining = sec; clearInterval(timerInterval); timerDisplay.textContent = formatTime(timerRemaining);
    timerInterval = setInterval(()=>{timerRemaining--; timerDisplay.textContent=formatTime(timerRemaining); if(timerRemaining<=0){clearInterval(timerInterval);} },1000);
  }
  document.querySelectorAll('.timer-controls button').forEach(btn=>btn.addEventListener('click', e=>{
    const action = e.target.getAttribute('data-action');
    if(action==='start'){const dur = parseInt(e.target.getAttribute('data-duration'),10); startTimer(dur); try{ sendAnalyticsEvent('timer_start',{duration:dur}); }catch(e){} }
    if(action==='pause'){clearInterval(timerInterval); try{ sendAnalyticsEvent('timer_pause',{}); }catch(e){} }
    if(action==='reset'){clearInterval(timerInterval);timerRemaining=0;timerDisplay.textContent='00:00'; try{ sendAnalyticsEvent('timer_reset',{}); }catch(e){} }
  }));

  // Checklist localStorage
  const saveBtn = document.getElementById('saveChecklist');
  saveBtn.addEventListener('click', ()=>{
    const checks = {};
    document.querySelectorAll('input[type=checkbox][data-check]').forEach(ch=>checks[ch.getAttribute('data-check')] = ch.checked);
    localStorage.setItem('ielts_checklist', JSON.stringify(checks));
    document.getElementById('saveMsg').textContent = 'Checklist saved ✓';
    setTimeout(()=>document.getElementById('saveMsg').textContent='',2000);
    try{ sendAnalyticsEvent('checklist_saved', checks); }catch(e){}
  });
  // load checklist
  try{const saved = JSON.parse(localStorage.getItem('ielts_checklist')||'{}');Object.keys(saved).forEach(k=>{const el=document.querySelector(`input[data-check="${k}"]`);if(el)el.checked=saved[k]});}catch(e){}

  // Copy number
  document.getElementById('copyNumber').addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText('+977 9707450833');
      const msg = document.getElementById('copyMsg');
      msg.textContent='Number copied ✓';
      msg.setAttribute('role','status');
      setTimeout(()=>{msg.textContent='';msg.removeAttribute('role')},2000);
      try{ sendAnalyticsEvent('copy_number', { method: 'clipboard' }); }catch(e){}
    }catch(e){document.getElementById('copyMsg').textContent='Copy failed';}
  });

  // --- Analytics loader & tracker ---
  const gaId = (document.querySelector('meta[name="ga-id"]')||{}).getAttribute('content') || '';
  if(gaId && gaId.trim()){
    // load gtag
    (function(id){
      const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments)}
      window.gtag = window.gtag || gtag;
      window.gtag('js', new Date());
      window.gtag('config', id);
    })(gaId.trim());
  }

  async function sendAnalyticsEvent(name, payload){
    // gtag
    try{ if(window.gtag) window.gtag('event', name, payload); }catch(e){}
    const body = { name, payload, page: location.pathname, ts: new Date().toISOString() };
    // Try Vercel /api endpoint first, then Netlify functions endpoint
    const endpoints = ['/api/track','/.netlify/functions/track'];
    for(const ep of endpoints){
      try{
        const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if(res && (res.status===200 || res.status===204)) return;
      }catch(e){ /* continue */ }
    }
  }

  // Centralized WhatsApp opener + analytics
  function openWhatsAppWith(key){
    const msg = waMessages[key] || waMessages['general'];
    const text = encodeURIComponent(msg);
    const url = `https://wa.me/${whatsappNumber}?text=${text}`;
    try{console.log('whatsapp_click', {key, url, time: new Date().toISOString()});}catch(e){}
    sendAnalyticsEvent('whatsapp_click', { cta: key });
    window.open(url,'_blank');
  }
  document.getElementById('floatWhatsApp').addEventListener('click', ()=>openWhatsAppWith('general'));

  // Delegate clicks for any whatsapp-cta elements (links/buttons)
  document.addEventListener('click', function(e){
    const el = e.target.closest && e.target.closest('.whatsapp-cta');
    if(!el) return;
    e.preventDefault();
    const key = el.getAttribute('data-key') || 'general';
    openWhatsAppWith(key);
  });

  // Mobile menu toggle (simple)
  document.querySelector('.mobile-menu').addEventListener('click', ()=>{
    const links = document.querySelector('.links');
    if(links.style.display==='flex') links.style.display='none'; else links.style.display='flex';
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click', function(e){e.preventDefault(); const id=this.getAttribute('href').slice(1); const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }));

  // Reveal on scroll + count-up numbers
  try{
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          // If it contains countups, animate
          entry.target.querySelectorAll && entry.target.querySelectorAll('.countup').forEach(el=>{
            const target = parseFloat(el.getAttribute('data-target')) || parseFloat(el.textContent) || 0;
            if(!el._count_started){
              el._count_started = true;
              let current = 0; const steps = 30; const stepTime = 16; const increment = target/steps;
              const iv=setInterval(()=>{ current += increment; if(current >= target){ el.textContent = target.toFixed( (target%1===0)?0:1 ); clearInterval(iv); } else { el.textContent = (Math.round(current*10)/10).toFixed((target%1===0)?0:1); } }, stepTime);
            }
          });
        }
      });
    },{threshold:0.18});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
    // Also observe top-level elements with countup not inside reveal
    document.querySelectorAll('.countup').forEach(el=>{
      if(el.closest('.reveal')) return; io.observe(el);
    });
  }catch(e){/* graceful */}

})();
