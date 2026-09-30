(() => {
const $=s=>document.querySelector(s);
let breathTimer=null,sleepTimer=null,sleepEnd=0;
const presets=[
{name:"Rainy Focus",layers:["rain","wind"],desc:"Rain + soft wind"},
{name:"Ocean Calm",layers:["ocean","stream"],desc:"Waves + flowing water"},
{name:"Forest Retreat",layers:["forest","stream"],desc:"Forest + stream"},
{name:"Night Sleep",layers:["night","brown"],desc:"Night ambience + brown noise"},
{name:"Café Background",layers:["cafe","rain"],desc:"Café + rain"}
];
function presetUI(){const el=$("#presetList");if(!el)return;el.innerHTML=presets.map((p,i)=>'<button data-preset="'+i+'"><span>♫ '+p.name+'</span><small>'+p.desc+'</small></button>').join("")}
function loadPreset(p){[...activeNodes.keys()].forEach(stopSound);p.layers.forEach(id=>playSound(id));showPage("mixer");toast(p.name+" loaded")}
document.addEventListener("click",e=>{
 const p=e.target.closest("[data-preset]");if(p){loadPreset(presets[+p.dataset.preset]);return}
 const st=e.target.closest("[data-sleep]");if(st){setSleep(+st.dataset.sleep);return}
});
function setSleep(min){clearTimeout(sleepTimer);sleepEnd=Date.now()+min*60000;$("#sleepStatus").textContent="Fades in "+min+" minutes";sleepTimer=setTimeout(()=>{fadeMaster();$("#sleepStatus").textContent="Fading out…"},min*60000)}
function fadeMaster(){if(!master){$("#sleepStatus").textContent="No audio active";return}const now=master.gain.value;master.gain.cancelScheduledValues(audioCtx.currentTime);master.gain.setValueAtTime(now,audioCtx.currentTime);master.gain.linearRampToValueAtTime(0,audioCtx.currentTime+30);setTimeout(()=>{[...activeNodes.keys()].forEach(stopSound);renderAll();updatePlayer();$("#sleepStatus").textContent="Sleep fade complete"},31000)}
$("#cancelSleep")?.addEventListener("click",()=>{clearTimeout(sleepTimer);sleepEnd=0;$("#sleepStatus").textContent="No timer set";toast("Sleep timer cancelled")});
$("#safeVolume")?.addEventListener("change",e=>{if(!master)return;master.gain.value=e.target.checked?Math.min(master.gain.value,.5):master.gain.value;toast(e.target.checked?"Soft volume ceiling on":"Soft volume ceiling off")});
$("#exportData")?.addEventListener("click",()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tinnirelief-data-"+today()+".json";a.click();URL.revokeObjectURL(a.href);toast("Data exported")});
$("#importData")?.addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const incoming=JSON.parse(reader.result);if(!incoming||!Array.isArray(incoming.logs)||!Array.isArray(incoming.mixes))throw Error();localStorage.setItem("tinniRelief",JSON.stringify(incoming));location.reload()}catch{toast("Invalid TinniRelief data file")}};reader.readAsText(file)});
$("#wipeData")?.addEventListener("click",()=>{if(confirm("Erase all locally stored TinniRelief data?")){localStorage.removeItem("tinniRelief");location.reload()}});
$("#breathStart")?.addEventListener("click",()=>{if(breathTimer){clearTimeout(breathTimer);breathTimer=null;$("#breathStart").textContent="Start";$("#breathText").textContent="Paused";$("#breathOrb").className="breath-orb";return}let pattern=$("#breathPattern").value.split("-").map(Number),step=0,cycles=0;$("#breathStart").textContent="Stop";function next(){if(!breathTimer)return;const orb=$("#breathOrb"),txt=$("#breathText");let phase=step===0?"Inhale":step===1?"Exhale":"Hold";if($("#breathPattern").value==="4-7-8")phase=step===0?"Inhale":step===1?"Hold":"Exhale";txt.textContent=phase;orb.className="breath-orb "+phase.toLowerCase();let dur=pattern[step%pattern.length]*1000;step++;if(step>=pattern.length){step=0;cycles++;}breathTimer=setTimeout(next,dur)}breathTimer=setTimeout(next,0)});
presetUI();
})();
