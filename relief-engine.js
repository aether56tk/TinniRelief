(() => {
  state.reliefProfile = state.reliefProfile || {
    goal: "relax",
    preferredSounds: [],
    preferredMinutes: 10,
    comfortVolume: 35
  };

  let selectedNeed = state.reliefProfile.goal === "sleep" ? "sleep" : state.reliefProfile.goal === "focus" ? "focus" : "moderate";

  const needs = {
    bothered: { title:"A gentler reset", reason:"Start with a low-stimulation sound and a short session. Keep the level comfortable.", sound:"ocean", program:"relax" },
    moderate: { title:"A balanced sound space", reason:"A short sound-enrichment session can give your attention a steady, comfortable background.", sound:"rain", program:"enrich" },
    mild: { title:"A light background", reason:"Use a subtle environment while continuing your activity rather than increasing the sound.", sound:"wind", program:"enrich" },
    sleep: { title:"Wind down", reason:"Choose a low-stimulation nighttime environment and let the session stay in the background.", sound:"night", program:"sleep" },
    focus: { title:"Shift attention", reason:"Use a changing natural environment as a background while you return to your task.", sound:"forest", program:"attention" }
  };

  function renderProfile() {
    const p = state.reliefProfile;
    const goal = $("#profileGoal"), mins = $("#profileMinutes"), vol = $("#profileVolume"), out = $("#profileVolumeOut"), box = $("#profileSounds");
    if (!goal || !mins || !vol || !box) return;
    goal.value = ["sleep","focus","enrich"].includes(p.goal) ? p.goal : "relax";
    mins.value = String(p.preferredMinutes || 10);
    vol.value = Math.round(p.comfortVolume || 35);
    out.textContent = vol.value + "%";
    box.innerHTML = sounds.map(s => '<label class="profile-sound"><input type="checkbox" value="' + s.id + '"' + (p.preferredSounds.includes(s.id) ? " checked" : "") + '><span>' + s.icon + " " + s.name + "</span></label>").join("");
  }

  function saveProfile() {
    const p = state.reliefProfile;
    p.goal = $("#profileGoal").value;
    p.preferredMinutes = +$("#profileMinutes").value;
    p.comfortVolume = +$("#profileVolume").value;
    p.preferredSounds = [...document.querySelectorAll("#profileSounds input:checked")].map(x => x.value).slice(0,8);
    if (master) master.gain.value = p.comfortVolume / 100;
    $("#masterVolume").value = p.comfortVolume;
    selectedNeed = p.goal === "sleep" ? "sleep" : p.goal === "focus" ? "focus" : p.goal === "enrich" ? "moderate" : "bothered";
    save();
    renderRelief();
    toast("Relief profile saved");
  }

  function learnSound(id) {
    state.soundUsage = state.soundUsage || {};
    state.soundUsage[id] = (state.soundUsage[id] || 0) + 1;
    save();
  }

  function learnProgram(id) {
    state.programUsage = state.programUsage || {};
    state.programUsage[id] = (state.programUsage[id] || 0) + 1;
    save();
  }

  function learnedSound(preferred) {
    const usage = state.soundUsage || {};
    const feedback = state.sessionFeedback || [];
    const preferredIds = state.reliefProfile.preferredSounds || [];
    const scored = sounds.map(s => ({
      id: s.id,
      score: (usage[s.id] || 0) + (preferredIds.includes(s.id) ? 3 : 0) + (s.id === preferred ? 2 : 0) + feedback.filter(x=>x.sound===s.id && x.rating==="comfortable").length * 2 - feedback.filter(x=>x.sound===s.id && x.rating==="uncomfortable").length * 3
    })).sort((a,b) => b.score - a.score);
    return scored[0]?.id || preferred;
  }

  function chooseSound(preferred) {
    return learnedSound(preferred);
  }

  function averages() {
    const logs = state.logs.slice(0,14);
    if (!logs.length) return null;
    const avg = key => logs.reduce((a,l) => a + (+l[key] || 0),0) / logs.length;
    return {
      intensity: avg("intensity"),
      annoy: avg("annoy"),
      sleep: avg("sleep"),
      stress: avg("stress"),
      count: logs.length
    };
  }

  function renderLearning() {
    const el = $("#learningSummary");
    if (!el) return;
    const usage = state.soundUsage || {};
    const feedback = state.sessionFeedback || [];
    const top = Object.entries(usage).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const comfortable = feedback.filter(x=>x.rating==="comfortable").length;
    const neutral = feedback.filter(x=>x.rating==="neutral").length;
    const uncomfortable = feedback.filter(x=>x.rating==="uncomfortable").length;
    const total = comfortable + neutral + uncomfortable;
    const last = state.reliefProfile.lastRecommendation;
    const recommendation = last ? ((sounds.find(s=>s.id===last.sound)||{}).name || last.sound) : "your saved preferences";
    el.innerHTML = (top.length
      ? top.map(([id,n]) => {
          const s=sounds.find(x=>x.id===id);
          return '<div class="learning-row"><span>'+((s&&s.icon)||"🎧")+' '+((s&&s.name)||id)+'</span><strong>'+n+' uses</strong></div>';
        }).join("")
      : '<p class="profile-empty">Use a few sounds and sessions and TinniRelief will learn your preferences locally.</p>')
      + '<div class="learning-insight"><strong>Why suggestions change</strong><p>Suggestions combine saved preferences, repeated use, and optional comfort feedback. No clinical outcome is inferred.</p>'
      + (total ? '<small>Feedback: '+comfortable+' comfortable · '+neutral+' neutral · '+uncomfortable+' uncomfortable</small>' : '<small>No session feedback yet.</small>')
      + '<small>Last suggested sound: '+recommendation+'</small></div>';
  }

  function renderPatterns() {
    const el = $("#patternList");
    if (!el) return;
    const a = averages();
    if (!a || a.count < 3) {
      el.innerHTML = '<p class="profile-empty">Add at least 3 check-ins to see simple personal patterns.</p>';
      return;
    }
    const items = [];
    if (a.stress >= 7 && a.annoy >= 6) items.push(["Stress & annoyance", "Your recent entries show both were relatively higher on average."]);
    if (a.sleep <= 4 && a.intensity >= 6) items.push(["Sleep & intensity", "Your recent entries show lower sleep quality alongside higher intensity."]);
    if (a.intensity <= 3) items.push(["Recent intensity", "Your recent average intensity has been relatively low."]);
    if (a.sleep >= 7) items.push(["Sleep quality", "Your recent average sleep rating has been relatively high."]);
    if (!items.length) items.push(["Your recent baseline", "Your check-ins do not show a strong simple pattern across these measures yet."]);
    el.innerHTML = items.map(x => '<div class="pattern-row"><strong>'+x[0]+'</strong><p>'+x[1]+'</p></div>').join("");
  }

  function renderRelief() {
    const n = needs[selectedNeed];
    const a = averages();
    let reason = n.reason;
    if (a && a.count >= 3) {
      if (a.stress >= 7) reason += " Your recent stress ratings are also relatively high.";
      else if (a.sleep <= 4) reason += " Your recent sleep ratings suggest keeping tonight's approach low-stimulation.";
    }
    $("#reliefTitle").textContent = n.title;
    $("#reliefReason").textContent = reason;
    $("#reliefStatus").textContent = "Personalized";
    document.querySelectorAll(".relief-choice").forEach(b => b.classList.toggle("active", b.dataset.relief === selectedNeed));
  }

  function startRelief() {
    const n = needs[selectedNeed];
    const sound = chooseSound(n.sound);
    learnSound(sound);
    learnProgram(n.program);
    state.reliefProfile.goal = selectedNeed;
    state.reliefProfile.preferredMinutes = state.reliefProfile.preferredMinutes || (selectedNeed === "sleep" ? 30 : selectedNeed === "focus" ? 8 : 10);
    state.reliefProfile.lastRecommendation = { need:selectedNeed, sound, program:n.program, date:today() };
    save();
    track("sessionsStarted");
    [...activeNodes.keys()].forEach(stopSound);
    const p = programs.find(x => x.id === n.program);
    if (p) {
      window.activeProgram = p;
      window.activePhase = 0;
      $("#activeSession").classList.remove("hidden");
      $("#activeTitle").textContent = p.title;
      sessionTotal = sessionRemaining = state.reliefProfile.preferredMinutes * 60;
      setSessionPhase();
      updateTimer();
      $("#timerToggle").textContent = "▶ Start";
      showPage("sessions");
      setTimeout(() => $("#activeSession").scrollIntoView({behavior:"smooth"}),100);
    } else {
      playSound(sound);
      showPage("mixer");
    }
    toast("Personal suggestion ready");
  }

  $("#profileVolume")?.addEventListener("input", e => $("#profileVolumeOut").textContent = e.target.value + "%");
  $("#saveProfile")?.addEventListener("click", saveProfile);

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-relief]");
    if (b) {
      selectedNeed = b.dataset.relief;
      renderRelief();
      return;
    }
    if (e.target.closest("#reliefStart")) startRelief();
  });

  window.renderReliefEngine = () => { renderRelief(); renderPatterns(); renderProfile(); renderLearning(); };
  renderRelief();
  renderPatterns();
  renderProfile();
  renderLearning();
})();