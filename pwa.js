let deferredInstall = null;

function showInstallBanner() {
  const banner = document.querySelector("#installBanner");
  if (banner && !localStorage.getItem("tinnireliefInstallDismissed")) banner.classList.remove("hidden");
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstall = event;
  showInstallBanner();
});

document.addEventListener("click", async event => {
  if (event.target.closest("#installBtn") && deferredInstall) {
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    document.querySelector("#installBanner")?.classList.add("hidden");
  }
  if (event.target.closest("#installDismiss")) {
    localStorage.setItem("tinnireliefInstallDismissed","1");
    document.querySelector("#installBanner")?.classList.add("hidden");
  }
});

window.addEventListener("appinstalled", () => {
  document.querySelector("#installBanner")?.classList.add("hidden");
  localStorage.removeItem("tinnireliefInstallDismissed");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
