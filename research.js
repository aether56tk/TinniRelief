/* TinniRelief Research Workspace
   Local-only, de-identified study workflow.
   This module does not infer clinical efficacy or diagnosis.
*/
(() => {
  const KEY = "tinnirelief.research.v1";
  const FREQS = [250, 500, 1000, 2000, 4000, 8000];
  const BC_FREQS = [250, 500, 1000, 2000, 4000];

  const load = () => {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        studyId: x.studyId || "TINNI-LOCAL",
        protocolVersion: x.protocolVersion || "0.1",
        participants: Array.isArray(x.participants) ? x.participants : [],
        visits: Array.isArray(x.visits) ? x.visits : [],
        baselines: Array.isArray(x.baselines) ? x.baselines : [],
        audiograms: Array.isArray(x.audiograms) ? x.audiograms : []
      };
    } catch {
      return {studyId:"TINNI-LOCAL",protocolVersion:"0.1",participants:[],visits:[],baselines:[],audiograms:[]};
    }
  };

  let db = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(db));
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const val = id => document.querySelector(id)?.value?.trim() ?? "";
  const num = id => { const n = Number(val(id)); return Number.isFinite(n) ? n : null; };
  const nOrNull = v => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const cleanCode = v => String(v || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g,"-").slice(0,30);

  function thresholdInputs(prefix, freqs) {
    return freqs.map(f => `
      <label>${f} Hz<input id="${prefix}${f}" type="number" min="-10" max="130" step="5" placeholder="—"></label>
    `).join("");
  }

  function readThresholds(prefix, freqs) {
    const out = {};
    freqs.forEach(f => { out[f] = num("#" + prefix + f); });
    return out;
  }

  function clearInputs(ids) {
    ids.forEach(id => { const x=document.querySelector("#"+id); if(x) x.value=""; });
  }

  function page() {
    let p = document.querySelector("#research");
    if (p) return p;
    p = document.createElement("section");
    p.id = "research";
    p.className = "page";
    p.innerHTML = `
      <div class="page-heading">
        <p class="eyebrow">RESEARCH WORKSPACE</p>
        <h1>Study-ready, not study-claimed.</h1>
        <p>Collect structured, de-identified research records locally. This workspace is a data-management tool, not evidence of treatment efficacy.</p>
      </div>

      <div class="research-grid">
        <section class="card">
          <div class="card-title"><span>Study protocol</span><span>Local</span></div>
          <label class="research-label">Study ID<input id="researchStudyId" value="${esc(db.studyId)}" maxlength="40"></label>
          <label class="research-label">Protocol version<input id="researchProtocol" value="${esc(db.protocolVersion)}" maxlength="20"></label>
          <button class="primary wide" id="researchSaveProtocol">Save protocol metadata</button>
          <div class="research-note"><strong>Research boundary</strong><br>Use participant codes only. Do not store names, phone numbers, addresses, or other direct identifiers here.</div>
        </section>
        <section class="card">
          <div class="card-title"><span>Dataset snapshot</span><span>Local</span></div>
          <div class="research-stats">
            <div><strong id="researchParticipants">0</strong><small>participants</small></div>
            <div><strong id="researchVisits">0</strong><small>visits</small></div>
            <div><strong id="researchBaselines">0</strong><small>baselines</small></div>
            <div><strong id="researchAudiograms">0</strong><small>audiograms</small></div>
          </div>
          <button class="secondary wide" id="researchExport">Export research dataset</button>
        </section>
      </div>

      <section class="card research-form-card">
        <div class="card-title"><span>Audiological baseline</span><span>Optional · Research only</span></div>
        <p class="profile-help">Enter measurements only when they are available from a documented audiological assessment. Do not use this section to diagnose a user.</p>
        <div class="research-form">
          <label>Participant code<input id="audioParticipant" placeholder="P-001" maxlength="30"></label>
          <label>Assessment date<input id="audioDate" type="date"></label>
          <label>Tinnitus laterality<select id="audioLaterality"><option>Not recorded</option><option>Right</option><option>Left</option><option>Bilateral</option><option>Central/other</option></select></label>
          <label>Tinnitus duration<select id="audioDuration"><option>Not recorded</option><option>&lt; 3 months</option><option>3–6 months</option><option>6–12 months</option><option>&gt; 1 year</option><option>&gt; 5 years</option></select></label>
          <label>Tinnitus character<select id="audioCharacter"><option>Not recorded</option><option>Tonality</option><option>Noise-like</option><option>Mixed/other</option></select></label>
          <label>PTA right (dB HL)<input id="ptaRight" type="number" min="-10" max="130" step="0.1" placeholder="—"></label>
          <label>PTA left (dB HL)<input id="ptaLeft" type="number" min="-10" max="130" step="0.1" placeholder="—"></label>
          <label>Speech score right (%)<input id="speechRight" type="number" min="0" max="100" step="1" placeholder="—"></label>
          <label>Speech score left (%)<input id="speechLeft" type="number" min="0" max="100" step="1" placeholder="—"></label>
          <label>Tympanometry right<select id="tympRight"><option>Not recorded</option><option>Type A</option><option>Type As</option><option>Type Ad</option><option>Type B</option><option>Type C</option><option>Other</option></select></label>
          <label>Tympanometry left<select id="tympLeft"><option>Not recorded</option><option>Type A</option><option>Type As</option><option>Type Ad</option><option>Type B</option><option>Type C</option><option>Other</option></select></label>
          <label>OAE status<select id="oae"><option>Not recorded</option><option>Present</option><option>Absent</option><option>Partial/other</option></select></label>
          <label>ABR status<select id="abr"><option>Not recorded</option><option>Within expected limits</option><option>Abnormal</option><option>Not completed</option></select></label>
          <label>Hearing-aid use<select id="haUse"><option>None</option><option>Current</option><option>Previous</option><option>Unknown</option></select></label>
          <label>Assessment source<input id="audioSource" placeholder="e.g. clinic assessment" maxlength="80"></label>
        </div>
        <label class="research-label">Audiological note<textarea id="audioNote" rows="3" placeholder="Protocol-relevant assessment note; avoid names or direct identifiers."></textarea></label>
        <button class="primary" id="saveAudiologicalBaseline">Save audiological baseline</button>
      </section>

      <section class="card research-form-card">
        <div class="card-title"><span>Audiogram data entry</span><span>AC + BC</span></div>
        <p class="profile-help">Enter measured air-conduction and bone-conduction thresholds by frequency. Leave unavailable thresholds blank. The plot uses a conventional dB HL display with lower thresholds toward the top.</p>
        <div class="research-form audiogram-meta">
          <label>Participant code<input id="agParticipant" placeholder="P-001" maxlength="30"></label>
          <label>Assessment date<input id="agDate" type="date"></label>
          <label>Visit label<select id="agVisit"><option>Baseline</option><option>Follow-up</option><option>Other</option></select></label>
          <label>Earphone / transducer<input id="agTransducer" placeholder="e.g. TDH-39" maxlength="60"></label>
        </div>
        <div class="audiogram-entry-grid">
          <div class="audiogram-ear-card">
            <div class="card-title"><span>Right ear — Air conduction</span><span>○</span></div>
            <div class="threshold-grid">${thresholdInputs("agRAC", FREQS)}</div>
          </div>
          <div class="audiogram-ear-card">
            <div class="card-title"><span>Left ear — Air conduction</span><span>×</span></div>
            <div class="threshold-grid">${thresholdInputs("agLAC", FREQS)}</div>
          </div>
          <div class="audiogram-ear-card">
            <div class="card-title"><span>Right ear — Bone conduction</span><span>&lt;</span></div>
            <div class="threshold-grid">${thresholdInputs("agRBC", BC_FREQS)}</div>
          </div>
          <div class="audiogram-ear-card">
            <div class="card-title"><span>Left ear — Bone conduction</span><span>&gt;</span></div>
            <div class="threshold-grid">${thresholdInputs("agLBC", BC_FREQS)}</div>
          </div>
        </div>
        <label class="research-label">Audiogram note<textarea id="agNote" rows="2" placeholder="Masking, reliability, transducer, or protocol-relevant note."></textarea></label>
        <div class="audiogram-actions">
          <button class="primary" id="saveAudiogram">Save audiogram + plot</button>
          <button class="secondary" id="clearAudiogram">Clear threshold fields</button>
        </div>
      </section>

      <section class="card">
        <div class="card-title"><span>Latest audiogram</span><span id="audiogramStatus">No record selected</span></div>
        <div id="audiogramPlot" class="audiogram-plot-wrap">
          <div class="profile-empty">Save an audiogram to generate the plot.</div>
        </div>
        <div id="audiogramLegend" class="audiogram-legend"></div>
      </section>

      <section class="card">
        <div class="card-title"><span>Participant / visit record</span><span>De-identified</span></div>
        <div class="research-form">
          <label>Participant code<input id="researchParticipant" placeholder="P-001" maxlength="30"></label>
          <label>Visit<select id="researchVisit"><option value="baseline">Baseline</option><option value="intervention">Intervention</option><option value="followup">Follow-up</option></select></label>
          <label>Tinnitus intensity (0–10)<input id="researchIntensity" type="number" min="0" max="10" step="1" placeholder="—"></label>
          <label>Annoyance (0–10)<input id="researchAnnoyance" type="number" min="0" max="10" step="1" placeholder="—"></label>
          <label>Sleep quality (0–10)<input id="researchSleep" type="number" min="0" max="10" step="1" placeholder="—"></label>
          <label>Stress (0–10)<input id="researchStress" type="number" min="0" max="10" step="1" placeholder="—"></label>
          <label>Session minutes<input id="researchMinutes" type="number" min="0" step="1" placeholder="0"></label>
          <label>Session type<select id="researchSession"><option>Sound enrichment</option><option>Relaxation</option><option>Attention shift</option><option>Sleep support</option><option>Other</option></select></label>
        </div>
        <label class="research-label">Research note<textarea id="researchNote" rows="3" placeholder="Protocol-relevant observation only. Avoid direct identifiers."></textarea></label>
        <button class="primary" id="researchAddVisit">Add record</button>
      </section>

      <section class="card">
        <div class="card-title"><span>Records</span><button class="text-btn" id="researchClear">Clear workspace</button></div>
        <div id="researchTable"></div>
      </section>

      <section class="card">
        <div class="card-title"><span>Derived summaries</span><span>Descriptive only</span></div>
        <div id="researchSummary"></div>
        <p class="research-disclaimer">Changes shown here are descriptive summaries of the stored records. They are not proof of treatment effectiveness and should not replace a prespecified statistical analysis.</p>
      </section>
    `;
    document.querySelector("main")?.appendChild(p);
    return p;
  }

  function renderAudiogramSvg(a) {
    const W=920,H=430,L=78,R=25,T=35,B=60;
    const x0=L,x1=W-R,y0=T,y1=H-B;
    const xMap=f => x0 + (Math.log2(f/250)/Math.log2(8000/250))*(x1-x0);
    const yMap=db => y0 + ((db+10)/130)*(y1-y0);
    const gridFreqs=[250,500,1000,2000,4000,8000];
    const yTicks=[-10,0,10,20,30,40,50,60,70,80,90,100,110,120];
    const line=(x1_,y1_,x2_,y2_,cls="")=>`<line x1="${x1_}" y1="${y1_}" x2="${x2_}" y2="${y2_}" class="${cls}"/>`;
    const text=(x,y,s,cls="")=>`<text x="${x}" y="${y}" class="${cls}">${esc(s)}</text>`;
    const poly=(vals,cls,offset=0)=>{
      const pts=[];
      FREQS.forEach(f=>{const v=vals?.[f]; if(v!==null && v!==undefined && Number.isFinite(Number(v))) pts.push(`${xMap(f)},${yMap(Number(v))+offset}`);});
      return pts.length>1 ? `<polyline points="${pts.join(" ")}" class="${cls}"/>` : "";
    };
    const markers=(vals,shape,cls)=>{
      return FREQS.map(f=>{
        const v=vals?.[f]; if(v===null || v===undefined || !Number.isFinite(Number(v))) return "";
        const x=xMap(f),y=yMap(Number(v));
        if(shape==="circle") return `<circle cx="${x}" cy="${y}" r="6" class="${cls}"/>`;
        if(shape==="x") return `<path d="M ${x-6} ${y-6} L ${x+6} ${y+6} M ${x+6} ${y-6} L ${x-6} ${y+6}" class="${cls}"/>`;
        if(shape==="lt") return `<path d="M ${x+5} ${y-6} L ${x-5} ${y} L ${x+5} ${y+6}" class="${cls}"/>`;
        return `<path d="M ${x-5} ${y-6} L ${x+5} ${y} L ${x-5} ${y+6}" class="${cls}"/>`;
      }).join("");
    };
    const bcLine=(vals,cls)=>{
      const pts=[];
      BC_FREQS.forEach(f=>{const v=vals?.[f];if(v!==null&&v!==undefined&&Number.isFinite(Number(v)))pts.push(`${xMap(f)},${yMap(Number(v))}`);});
      return pts.length>1?`<polyline points="${pts.join(" ")}" class="${cls}"/>`:"";
    };
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Audiogram plot">
      <rect x="${x0}" y="${y0}" width="${x1-x0}" height="${y1-y0}" class="ag-bg"/>`;
    gridFreqs.forEach(f=>{const x=xMap(f);s+=line(x,y0,x,y1,"ag-grid");s+=text(x,y1+28,f>=1000?(f/1000)+"k":f,"ag-label ag-center");});
    yTicks.forEach(v=>{const y=yMap(v);s+=line(x0,y,x1,y,"ag-grid");s+=text(x0-12,y+4,v,"ag-label ag-right");});
    s+=text(18,(y0+y1)/2,"dB HL","ag-axis ag-rotate");
    s+=text((x0+x1)/2,H-12,"Frequency (Hz)","ag-axis ag-center");
    s+=poly(a.acRight,"ag-right-line")+poly(a.acLeft,"ag-left-line");
    s+=bcLine(a.bcRight,"ag-right-line")+bcLine(a.bcLeft,"ag-left-line");
    s+=markers(a.acRight,"circle","ag-right-mark")+markers(a.acLeft,"x","ag-left-mark");
    s+=markers(a.bcRight,"lt","ag-right-mark")+markers(a.bcLeft,"gt","ag-left-mark");
    s+=`</svg>`;
    return s;
  }

  function latestAudiogram() {
    return db.audiograms.slice().sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt))).pop() || null;
  }

  function render() {
    const p=page();
    p.querySelector("#researchStudyId").value=db.studyId;
    p.querySelector("#researchProtocol").value=db.protocolVersion;
    const participants=new Set([...db.visits.map(v=>v.participant),...db.baselines.map(v=>v.participant),...db.audiograms.map(v=>v.participant)]);
    p.querySelector("#researchParticipants").textContent=participants.size;
    p.querySelector("#researchVisits").textContent=db.visits.length;
    p.querySelector("#researchBaselines").textContent=db.baselines.length;
    p.querySelector("#researchAudiograms").textContent=db.audiograms.length;

    const rows=db.visits.slice().reverse().slice(0,50);
    p.querySelector("#researchTable").innerHTML=rows.length?rows.map(v=>
      `<div class="research-row"><div><strong>${esc(v.participant)}</strong><small>${esc(v.visit)} · ${esc(v.sessionType)}</small></div><div><span>${v.intensity ?? "—"}</span><small>intensity</small></div><div><span>${v.annoyance ?? "—"}</span><small>annoyance</small></div><div><span>${v.minutes ?? 0}</span><small>minutes</small></div><div><span>${esc(v.date)}</span><small>date</small></div></div>`
    ).join(""):'<p class="profile-empty">No research visit records yet.</p>';

    const byParticipant={};
    db.visits.forEach(v=>(byParticipant[v.participant] ||= []).push(v));
    const summaries=Object.entries(byParticipant).map(([id,vs])=>{
      const base=vs.find(v=>v.visit==="baseline"&&v.intensity!==null);
      const latest=vs.slice().sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).find(v=>v.intensity!==null);
      const delta=base&&latest?(latest.intensity-base.intensity):null;
      return {id,n:vs.length,delta};
    });
    p.querySelector("#researchSummary").innerHTML=summaries.length?summaries.map(s=>
      `<div class="research-summary-row"><strong>${esc(s.id)}</strong><span>${s.n} records</span><span>Baseline→latest intensity: ${s.delta===null?"insufficient data":(s.delta>0?"+":"")+s.delta}</span></div>`
    ).join(""):'<p class="profile-empty">Add baseline and follow-up records to see descriptive change.</p>';

    const a=latestAudiogram();
    const plot=p.querySelector("#audiogramPlot");
    const status=p.querySelector("#audiogramStatus");
    const legend=p.querySelector("#audiogramLegend");
    if(a){
      plot.innerHTML=renderAudiogramSvg(a);
      status.textContent=`${a.participant} · ${a.visit} · ${a.date}`;
      legend.innerHTML='<span>○ Right AC</span><span>× Left AC</span><span>&lt; Right BC</span><span>&gt; Left BC</span><span>Thresholds are manually entered</span>';
    }else{
      plot.innerHTML='<div class="profile-empty">Save an audiogram to generate the plot.</div>';
      status.textContent="No record selected";
      legend.innerHTML="";
    }
  }

  function exportCsv(){
    const header=[
      "record_type","study_id","protocol_version","participant_code","visit","date",
      "intensity","annoyance","sleep","stress","session_minutes","session_type","note","status","software",
      "laterality","tinnitus_duration","tinnitus_character","pta_right","pta_left","speech_right","speech_left",
      "tymp_right","tymp_left","oae","abr","hearing_aid_use","assessment_source",
      ...FREQS.flatMap(f=>["ac_right_"+f+"hz","ac_left_"+f+"hz"]),
      ...BC_FREQS.flatMap(f=>["bc_right_"+f+"hz","bc_left_"+f+"hz"]),
      "transducer","audiogram_note"
    ];
    const rows=[header];
    db.visits.forEach(v=>rows.push([
      "visit",db.studyId,db.protocolVersion,v.participant,v.visit,v.date,v.intensity,v.annoyance,v.sleep,v.stress,v.minutes,v.sessionType,v.note,v.status,v.software,
      "","","","","","","","","","","","","",
      ...FREQS.flatMap(()=>["",""]),...BC_FREQS.flatMap(()=>["",""]),"",""
    ]));
    db.baselines.forEach(v=>rows.push([
      "audiological_baseline",db.studyId,db.protocolVersion,v.participant,"baseline",v.date,"","","","","","","",v.status,v.software,
      v.laterality,v.duration,v.character,v.ptaRight,v.ptaLeft,v.speechRight,v.speechLeft,v.tympRight,v.tympLeft,v.oae,v.abr,v.haUse,v.source,
      ...FREQS.flatMap(()=>["",""]),...BC_FREQS.flatMap(()=>["",""]),"",""
    ]));
    db.audiograms.forEach(v=>rows.push([
      "audiogram",db.studyId,db.protocolVersion,v.participant,v.visit,v.date,"","","","","","","",v.status,v.software,
      "","","","","","","","","","","","",
      ...FREQS.flatMap(f=>[v.acRight?.[f] ?? "",v.acLeft?.[f] ?? ""]),
      ...BC_FREQS.flatMap(f=>[v.bcRight?.[f] ?? "",v.bcLeft?.[f] ?? ""]),
      v.transducer,v.note
    ]));
    const csv=rows.map(r=>r.map(x=>'"'+String(x ?? "").replace(/"/g,'""')+'"').join(",")).join("\n")+"\n";
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    a.download="tinnirelief-research-"+new Date().toISOString().slice(0,10)+".csv";
    a.click();URL.revokeObjectURL(a.href);
  }

  function saveAudiologicalBaseline(){
    const participant=cleanCode(val("#audioParticipant"));
    if(!participant){toast("Enter a participant code");return;}
    const v={
      participant,date:val("#audioDate")||new Date().toISOString().slice(0,10),
      laterality:val("#audioLaterality"),duration:val("#audioDuration"),character:val("#audioCharacter"),
      ptaRight:num("#ptaRight"),ptaLeft:num("#ptaLeft"),speechRight:num("#speechRight"),speechLeft:num("#speechLeft"),
      tympRight:val("#tympRight"),tympLeft:val("#tympLeft"),oae:val("#oae"),abr:val("#abr"),haUse:val("#haUse"),
      source:val("#audioSource"),note:val("#audioNote"),status:"completed",software:"TinniRelief/"+db.protocolVersion,createdAt:new Date().toISOString()
    };
    db.baselines.push(v);save();
    clearInputs(["audioParticipant","ptaRight","ptaLeft","speechRight","speechLeft","audioSource","audioNote"]);
    render();toast("Audiological baseline saved locally");
  }

  function saveAudiogram(){
    const participant=cleanCode(val("#agParticipant"));
    if(!participant){toast("Enter a participant code");return;}
    const v={
      participant,date:val("#agDate")||new Date().toISOString().slice(0,10),visit:val("#agVisit"),
      transducer:val("#agTransducer"),acRight:readThresholds("agRAC",FREQS),acLeft:readThresholds("agLAC",FREQS),
      bcRight:readThresholds("agRBC",BC_FREQS),bcLeft:readThresholds("agLBC",BC_FREQS),
      note:val("#agNote"),status:"completed",software:"TinniRelief/"+db.protocolVersion,createdAt:new Date().toISOString()
    };
    const any=Object.values(v.acRight).some(x=>x!==null)||Object.values(v.acLeft).some(x=>x!==null)||Object.values(v.bcRight).some(x=>x!==null)||Object.values(v.bcLeft).some(x=>x!==null);
    if(!any){toast("Enter at least one threshold");return;}
    db.audiograms.push(v);save();render();toast("Audiogram saved and plotted");
  }

  document.addEventListener("click",e=>{
    const nav=e.target.closest('[data-page="research"]');
    if(nav){
      document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
      page().classList.add("active");
      document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
      nav.classList.add("active");render();window.scrollTo({top:0,behavior:"smooth"});
    }
    if(e.target.closest("#researchSaveProtocol")){
      db.studyId=val("#researchStudyId")||"TINNI-LOCAL";db.protocolVersion=val("#researchProtocol")||"0.1";save();render();toast("Protocol metadata saved");
    }
    if(e.target.closest("#researchAddVisit")){
      const participant=cleanCode(val("#researchParticipant"));
      if(!participant){toast("Enter a participant code");return;}
      db.visits.push({
        participant,visit:val("#researchVisit"),date:new Date().toISOString().slice(0,10),
        intensity:num("#researchIntensity"),annoyance:num("#researchAnnoyance"),sleep:num("#researchSleep"),stress:num("#researchStress"),
        minutes:num("#researchMinutes")||0,sessionType:val("#researchSession"),note:val("#researchNote"),status:"completed",
        software:"TinniRelief/"+db.protocolVersion,createdAt:new Date().toISOString()
      });
      save();clearInputs(["researchParticipant","researchIntensity","researchAnnoyance","researchSleep","researchStress","researchMinutes","researchNote"]);
      render();toast("Research record saved locally");
    }
    if(e.target.closest("#saveAudiologicalBaseline"))saveAudiologicalBaseline();
    if(e.target.closest("#saveAudiogram"))saveAudiogram();
    if(e.target.closest("#clearAudiogram")){
      clearInputs(["agParticipant","agTransducer","agNote",...FREQS.flatMap(f=>["agRAC"+f,"agLAC"+f]),...BC_FREQS.flatMap(f=>["agRBC"+f,"agLBC"+f])]);
      toast("Audiogram fields cleared");
    }
    if(e.target.closest("#researchExport"))exportCsv();
    if(e.target.closest("#researchClear")){
      if(confirm("Delete the local research workspace?")){
        db={studyId:"TINNI-LOCAL",protocolVersion:"0.1",participants:[],visits:[],baselines:[],audiograms:[]};
        save();render();toast("Research workspace cleared");
      }
    }
  });

  document.addEventListener("DOMContentLoaded",()=>{
    const nav=document.querySelector(".bottom-nav");
    if(nav&&!nav.querySelector('[data-page="research"]')){
      const b=document.createElement("button");b.className="nav-item";b.dataset.page="research";b.innerHTML="▦<span>Research</span>";nav.appendChild(b);
    }
    page();render();
  });
})();