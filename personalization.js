(() => {
  state.favorites = Array.isArray(state.favorites) ? state.favorites : [];
  state.profiles = Array.isArray(state.profiles) ? state.profiles : [];

  let favoritesOnly = false;

  const originalCard = renderSoundCard;
  renderSoundCard = function(s) {
    const card = originalCard(s);
    const marked = state.favorites.includes(s.id);
    return card.replace(
      '<span class="sound-play">',
      '<span class="favorite-toggle" role="button" tabindex="0" aria-label="' + (marked ? 'Remove from favorites' : 'Add to favorites') + '" data-favorite="' + s.id + '">' + (marked ? '♥' : '♡') + '</span><span class="sound-play">'
    );
  };

  const originalLibrary = renderLibrary;
  renderLibrary = function(cat) {
    const category = cat || "All";
    let list = category === "All" ? sounds.slice() : sounds.filter(s => s.cat === category);
    if (favoritesOnly) list = list.filter(s => state.favorites.includes(s.id));
    $("#libraryGrid").innerHTML = list.map(renderSoundCard).join("");
    const empty = !list.length;
    if (empty) {
      $("#libraryGrid").innerHTML = '<div class="card empty-favorites"><h3>No favorite sounds yet</h3><p>Tap the heart on any sound to add it here.</p></div>';
    }
  };

  function refreshFavoriteControl() {
    const row = $("#categoryFilters");
    if (!row) return;
    let b = $("#favoritesFilter");
    if (!b) {
      b = document.createElement("button");
      b.id = "favoritesFilter";
      b.className = "favorites-filter";
      b.textContent = "♡ Favorites";
      row.appendChild(b);
      b.addEventListener("click", () => {
        favoritesOnly = !favoritesOnly;
        b.classList.toggle("active", favoritesOnly);
        b.textContent = favoritesOnly ? "♥ Favorites" : "♡ Favorites";
        renderLibrary(document.querySelector("#categoryFilters .active:not(#favoritesFilter)")?.dataset.cat || "All");
      });
    }
  }

  function toggleFavorite(id) {
    const i = state.favorites.indexOf(id);
    if (i >= 0) {
      state.favorites.splice(i, 1);
      toast("Removed from favorites");
    } else {
      state.favorites.push(id);
      toast("Added to favorites");
    }
    save();
    renderQuick();
    renderLibrary(document.querySelector("#categoryFilters .active:not(#favoritesFilter)")?.dataset.cat || "All");
  }

  function snapshotProfile() {
    return {
      master: master ? master.gain.value : (+$("#masterVolume").value / 100),
      layers: [...activeNodes.entries()].map(([id, x]) => ({
        id,
        volume: x.gain ? x.gain.gain.value : 0.35,
        pan: x.pan ? x.pan.pan.value : 0,
        tone: x.filter ? x.filter.frequency.value : 12000
      }))
    };
  }

  function renderProfiles() {
    const el = $("#profileList");
    if (!el) return;
    if (!state.profiles.length) {
      el.innerHTML = '<p class="profile-empty">Save a mixer setup and it will appear here.</p>';
      return;
    }
    el.innerHTML = state.profiles.map((p, i) =>
      '<div class="profile-row"><div><strong>♫ ' + p.name + '</strong><small>' + p.layers.length + ' layer' + (p.layers.length === 1 ? '' : 's') + '</small></div><div class="profile-actions"><button class="secondary" data-profile-load="' + i + '">Use</button><button class="text-btn" data-profile-delete="' + i + '">Delete</button></div></div>'
    ).join("");
  }

  function saveProfile() {
    if (!activeNodes.size) {
      toast("Add at least one sound first");
      return;
    }
    const name = prompt("Name this personal profile", "My Listening Profile");
    if (!name) return;
    const snap = snapshotProfile();
    state.profiles.unshift({name: name.trim(), ...snap});
    state.profiles = state.profiles.slice(0, 20);
    save();
    renderProfiles();
    toast("Personal profile saved");
  }

  function loadProfile(profile) {
    [...activeNodes.keys()].forEach(stopSound);
    profile.layers.slice(0, 4).forEach(layer => playSound(layer.id));
    if (master) master.gain.value = profile.master;
    const masterSlider = $("#masterVolume");
    if (masterSlider) masterSlider.value = Math.round(profile.master * 100);
    profile.layers.slice(0, 4).forEach(layer => {
      const x = activeNodes.get(layer.id);
      if (!x) return;
      if (x.gain) x.gain.gain.value = layer.volume;
      if (x.pan) x.pan.pan.value = layer.pan;
      if (x.filter) x.filter.frequency.value = layer.tone;
    });
    renderAll();
    renderProfiles();
    updatePlayer();
    showPage("mixer");
    toast("Loaded " + profile.name);
  }

  function installProfileUI() {
    const usage = $(".usage-card");
    if (!usage || $("#profileCard")) return;
    const card = document.createElement("div");
    card.className = "card profile-card";
    card.id = "profileCard";
    card.innerHTML = '<div class="card-title"><span>Personal Sound Profiles</span><span>Local</span></div><p class="profile-help">Save the exact sounds, volume, pan, tone, and master level of a setup for quick reuse.</p><button class="primary" id="saveProfile">Save current setup</button><div id="profileList"></div>';
    usage.insertAdjacentElement("afterend", card);
    $("#saveProfile").addEventListener("click", saveProfile);
    renderProfiles();
  }

  document.addEventListener("click", e => {
    const fav = e.target.closest("[data-favorite]");
    if (fav) {
      e.preventDefault();
      e.stopImmediatePropagation();
      toggleFavorite(fav.dataset.favorite);
      return;
    }
    const load = e.target.closest("[data-profile-load]");
    if (load) {
      e.preventDefault();
      loadProfile(state.profiles[+load.dataset.profileLoad]);
      return;
    }
    const del = e.target.closest("[data-profile-delete]");
    if (del) {
      e.preventDefault();
      state.profiles.splice(+del.dataset.profileDelete, 1);
      save();
      renderProfiles();
      toast("Profile deleted");
    }
  }, true);

  refreshFavoriteControl();
  installProfileUI();
  renderAll();
  renderProfiles();
})();