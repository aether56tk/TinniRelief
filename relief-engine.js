(() => {
  state.reliefProfile = state.reliefProfile || {
    goal: "relax",
    preferredSounds: [],
    preferredMinutes: 10,
    comfortVolume: 35
  };

  let selectedNeed = "moderate";

  const needs = {
    bothered: { title:"A gentler reset", reason:"Start with a low-stimulation sound and a short session. Keep the level comfortable.", sound:"ocean", program:"relax" },
    moderate: { title:"A balanced sound space", reason:"A short sound-enrichment session can give your attention a steady, comfortable background.", sound:"rain", program:"enrich" },
    mild: { title:"A light background", reason:"Use a subtle environment while continuing your activity rather than increasing the sound.", sound:"wind", program:"enrich" },
    sleep: { title:"Wind down", reason:"Choose a low-stimulation nighttime environment and let the session stay in the background.", sound:"night", program:"sleep" },
    focus: { title:"Shift attention", reason:"Use a changing natural environment as a background while you return to your task.", sound:"forest", program:"attention" }
  };

  function chooseSound(preferred) {
    const fav = state.reliefProfile.preferredSounds || [];
    return fav.find(id => sounds.some(s => s.id === id)) || preferred;
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
    state.reliefProfile.goal = selectedNeed;
    state.reliefProfile.preferredMinutes = selectedNeed === "sleep" ? 30 : selectedNeed === "focus" ? 8 : 10;
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

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-relief]");
    if (b) {
      selectedNeed = b.dataset.relief;
      renderRelief();
      return;
    }
    if (e.target.closest("#reliefStart")) startRelief();
  });

  window.renderReliefEngine = () => { renderRelief(); renderPatterns(); };
  renderRelief();
  renderPatterns();
})();