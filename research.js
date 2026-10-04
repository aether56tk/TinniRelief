/* TinniRelief Research Workspace
   Local-only, de-identified study workflow.
   This module does not infer clinical efficacy or diagnosis.
*/
(() => {
  const KEY = "tinnirelief.research.v1";
  const load = () => {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        studyId: x.studyId || "TINNI-LOCAL",
        protocolVersion: x.protocolVersion || "0.1",
        participants: Array.isArray(x.participants) ? x.participants : [],
        visits: Array.isArray(x.visits) ? x.visits : [],\n        baselines: Array.isArray(x.baselines) ? x.baselines : []
      };
    } catch { return {studyId:"TINNI-LOCAL",protocolVersion:"0.1",participants:[],visits:[]}; }
  };
  let db = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(db));
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const uid = () => "P-" + Math.random().toString(36).slice(2,8).toUpperCase();

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
            <div><strong id="researchCompleted">0</strong><small>completed</small></div>
            <div><strong id="researchExported">0</strong><small>exports</small></div>
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
      </section>`;
    document.querySelector("main")?.appendChild(p);
    return p;
  }

  function val(id) { return document.querySelector(id)?.value?.trim() ?? ""; }
  function num(id) { const n = Number(val(id)); return Number.isFinite(n) ? n : null; }

  function render() {
    const p = page();
    p.querySelector("#researchStudyId").value = db.studyId;
    p.querySelector("#researchProtocol").value = db.protocolVersion;
    p.querySelector("#researchParticipants").textContent = new Set(db.visits.map(v=>v.participant)).size;
    p.querySelector("#researchVisits").textContent = db.visits.length;
    p.querySelector("#researchCompleted").textContent = db.visits.filter(v=>v.status==="completed").length;
    p.querySelector("#researchExported").textContent = localStorage.getItem("tinnirelief.research.exports") || "0";

    const rows = db.visits.slice().reverse().slice(0,50);
    p.querySelector("#researchTable").innerHTML = rows.length ? rows.map(v =>
      `<div class="research-row"><div><strong>${esc(v.participant)}</strong><small>${esc(v.visit)} · ${esc(v.sessionType)}</small></div><div><span>${v.intensity ?? "—"}</span><small>intensity</small></div><div><span>${v.annoyance ?? "—"}</span><small>annoyance</small></div><div><span>${v.minutes ?? 0}</span><small>minutes</small></div><div><span>${esc(v.date)}</span><small>date</small></div></div>`
    ).join("") : '<p class="profile-empty">No research records yet.</p>';

    const byParticipant = {};
    db.visits.forEach(v => (byParticipant[v.participant] ||= []).push(v));
    const summaries = Object.entries(byParticipant).map(([id,vs]) => {
      const base = vs.find(v=>v.visit==="baseline" && v.intensity !== null);
      const latest = vs.slice().sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).find(v=>v.intensity !== null);
      const delta = base && latest ? (latest.intensity - base.intensity) : null;
      return {id, n:vs.length, delta};
    });
    p.querySelector("#researchSummary").innerHTML = summaries.length ? summaries.map(s =>
      `<div class="research-summary-row"><strong>${esc(s.id)}</strong><span>${s.n} records</span><span>Baseline→latest intensity: ${s.delta === null ? "insufficient data" : (s.delta > 0 ? "+" : "") + s.delta}</span></div>`
    ).join("") : '<p class="profile-empty">Add baseline and follow-up records to see descriptive change.</p>';
  }

  function exportCsv() {
    const header=["study_id","protocol_version","participant_code","visit","date","intensity","annoyance","sleep","stress","session_minutes","session_type","note","status","software"];
    const rows=[header,...db.visits.map(v=>[
      db.studyId,db.protocolVersion,v.participant,v.visit,v.date,v.intensity,v.annoyance,v.sleep,v.stress,v.minutes,v.sessionType,v.note,v.status,v.software
    ])];
    const csv=rows.map(r=>r.map(x=>'"'+String(x ?? "").replace(/"/g,'""')+'"').join(",")).join("\n")+"\n";
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    a.download="tinnirelief-research-"+new Date().toISOString().slice(0,10)+".csv";
    a.click(); URL.revokeObjectURL(a.href);
    const count=+(localStorage.getItem("tinnirelief.research.exports")||0)+1;
    localStorage.setItem("tinnirelief.research.exports",String(count)); render();
  }

  document.addEventListener("click", e => {
    const nav=e.target.closest('[data-page="research"]');
    if(nav){ document.querySelectorAll(".page").forEach(x=>x.classList.remove("active")); page().classList.add("active"); document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active")); nav.classList.add("active"); render(); window.scrollTo({top:0,behavior:"smooth"}); }
    if(e.target.closest("#researchSaveProtocol")){ db.studyId=val("#researchStudyId")||"TINNI-LOCAL"; db.protocolVersion=val("#researchProtocol")||"0.1"; save(); render(); toast("Protocol metadata saved"); }
    if(e.target.closest("#researchAddVisit")){
      const participant=val("#researchParticipant").toUpperCase();
      if(!participant){toast("Enter a participant code");return;}
      const v={participant,visit:val("#researchVisit"),date:new Date().toISOString().slice(0,10),intensity:num("#researchIntensity"),annoyance:num("#researchAnnoyance"),sleep:num("#researchSleep"),stress:num("#researchStress"),minutes:num("#researchMinutes")||0,sessionType:val("#researchSession"),note:val("#researchNote"),status:"completed",software:"TinniRelief/"+db.protocolVersion,createdAt:new Date().toISOString()};
      db.visits.push(v); save();
      ["researchParticipant","researchIntensity","researchAnnoyance","researchSleep","researchStress","researchMinutes","researchNote"].forEach(id=>{const x=document.querySelector("#"+id);if(x)x.value=""});
      render(); toast("Research record saved locally");
    }
    if(e.target.closest("#saveAudiologicalBaseline")){
      const participant=val("#audioParticipant").toUpperCase();
      if(!participant){toast("Enter a participant code");return;}
      const date=val("#audioDate")||new Date().toISOString().slice(0,10);
      const v={participant,date,laterality:val("#audioLaterality"),duration:val("#audioDuration"),character:val("#audioCharacter"),
        ptaRight:num("#ptaRight"),ptaLeft:num("#ptaLeft"),speechRight:num("#speechRight"),speechLeft:num("#speechLeft"),
        tympRight:val("#tympRight"),tympLeft:val("#tympLeft"),oae:val("#oae"),abr:val("#abr"),haUse:val("#haUse"),
        source:val("#audioSource"),note:val("#audioNote"),status:"completed",software:"TinniRelief/"+db.protocolVersion,createdAt:new Date().toISOString()};
      db.baselines.push(v);save();
      ["audioParticipant","ptaRight","ptaLeft","speechRight","speechLeft","audioSource","audioNote"].forEach(id=>{const x=document.querySelector("#"+id);if(x)x.value=""});
      render();toast("Audiological baseline saved locally");
    }
    if(e.target.closest("#researchExport")) exportCsv();
    if(e.target.closest("#researchClear")){if(confirm("Delete the local research workspace?")){db={studyId:"TINNI-LOCAL",protocolVersion:"0.1",participants:[],visits:[]};save();render();toast("Research workspace cleared")}}
  });

  document.addEventListener("DOMContentLoaded",()=>{const nav=document.querySelector(".bottom-nav"); if(nav && !nav.querySelector('[data-page="research"]')){const b=document.createElement("button");b.className="nav-item";b.dataset.page="research";b.innerHTML="▦<span>Research</span>";nav.appendChild(b);} page(); render();});
})();