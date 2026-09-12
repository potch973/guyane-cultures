(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function a(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(r){if(r.ep)return;r.ep=!0;const n=a(r);fetch(r.href,n)}})();const Z=[{id:"crop-salade",name:"Salade",nurseryDays:21,growthDays:35,harvestDays:14,notes:"Feuilles — saison fraîche idéale"},{id:"crop-choux",name:"Choux",nurseryDays:30,growthDays:70,harvestDays:21,notes:"Choux pommé"},{id:"crop-choux-chinois",name:"Choux chinois",nurseryDays:21,growthDays:45,harvestDays:14,notes:"Pak choï / pe-tsaï"},{id:"crop-bongo",name:"Bongo / Gombo",nurseryDays:14,growthDays:60,harvestDays:45,notes:"Okra tropical"},{id:"crop-aubergine",name:"Aubergine",nurseryDays:35,growthDays:75,harvestDays:40,notes:"Locale / violette"},{id:"crop-manioc",name:"Manioc",nurseryDays:0,growthDays:270,harvestDays:60,notes:"Boutures — culture longue"}],X=["NPK 10-10-20","NPK 15-15-21","NPK 12-12-17","Fumier composté","Fumier de volaille"],ee=["Glyphosate","Roundup"],te=["Labour","Désherbage","Jachère","Amendement","Irrigation"],ae=["Manuel","Motoculteur","Tracteur","Herbicide","Autre"],se=["planifié","en cours","terminé"],re=["libre","préparation","culture"],ne=["Catastrophe naturelle","Maladie/Ravageurs","Perte/Vol","Abandon","Erreur technique","Autre"],le=["Argileux","Sableux","Limoneux","Latéritique","Humifère","Mixte"];function p(t,e){const a=new Date(t);return a.setDate(a.getDate()+e),a.toISOString().slice(0,10)}function F(){const t=new Date,e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),r=`${e}-${a}-${s}`,n=[{id:"p1",name:"Parcelle Nord",surface:250,soilType:"Latéritique",status:"culture"},{id:"p2",name:"Parcelle Sud",surface:180,soilType:"Argileux",status:"préparation"},{id:"p3",name:"Jardin potager",surface:80,soilType:"Humifère",status:"libre"},{id:"p4",name:"Bas-fond",surface:320,soilType:"Limoneux",status:"culture"}],i=[{id:"prep1",parcelId:"p2",type:"Labour",method:"Motoculteur",status:"en cours",startDate:p(r,-5),endDate:p(r,2),notes:"Premier passage après pluies"},{id:"prep2",parcelId:"p3",type:"Amendement",method:"Manuel",status:"planifié",startDate:p(r,3),endDate:p(r,5),notes:"Fumier composté 2 t/ha"},{id:"prep3",parcelId:"p1",type:"Irrigation",method:"Autre",status:"terminé",startDate:p(r,-20),endDate:p(r,-18),notes:"Mise en place goutte-à-goutte"}],d=[{id:"c1",parcelId:"p1",cropId:"crop-aubergine",phase:"culture",plantsCount:120,surfaceUsed:200,nurseryStart:p(r,-70),plantDate:p(r,-35),harvestStart:p(r,40),harvestEnd:p(r,80),status:"actif",notes:"Variété locale Cayenne"},{id:"c2",parcelId:"p4",cropId:"crop-manioc",phase:"culture",plantsCount:400,surfaceUsed:300,nurseryStart:null,plantDate:p(r,-90),harvestStart:p(r,180),harvestEnd:p(r,240),status:"actif",notes:"Boutures manioc doux"},{id:"c3",parcelId:"p1",cropId:"crop-salade",phase:"nursery",plantsCount:200,surfaceUsed:20,nurseryStart:p(r,-7),plantDate:p(r,14),harvestStart:p(r,49),harvestEnd:p(r,63),status:"actif",notes:"Semis sous ombrière"},{id:"c4",parcelId:"p4",cropId:"crop-bongo",phase:"harvest",plantsCount:80,surfaceUsed:60,nurseryStart:p(r,-90),plantDate:p(r,-76),harvestStart:p(r,-16),harvestEnd:p(r,29),status:"actif",notes:"Récolte progressive"}],f=[{id:"t1",name:"NPK 15-15-21",category:"engrais",unit:"kg",stock:50,stockMax:100,notes:"Engrais de fond"},{id:"t2",name:"NPK 10-10-20",category:"engrais",unit:"kg",stock:25,stockMax:80,notes:""},{id:"t3",name:"Fumier composté",category:"engrais",unit:"kg",stock:200,stockMax:500,notes:"Produit local"},{id:"t4",name:"Glyphosate",category:"herbicide",unit:"L",stock:5,stockMax:20,notes:"Usage raisonné"},{id:"t5",name:"Roundup",category:"herbicide",unit:"L",stock:2,stockMax:10,notes:""}],u=[{id:"a1",treatmentId:"t1",parcelId:"p1",cultureId:"c1",date:p(r,-10),quantity:8,notes:"Apport croissance"},{id:"a2",treatmentId:"t4",parcelId:"p2",cultureId:null,date:p(r,-3),quantity:1.5,notes:"Désherbage avant labour"}],I=[];return{version:1,crops:structuredClone(Z),parcels:n,preparations:i,cultures:d,treatments:f,applications:u,failures:I,seededAt:r}}const z="guyane-cultures-v1";function ie(){try{const t=localStorage.getItem(z);if(!t){const e=F();return M(e),e}return JSON.parse(t)}catch{const t=F();return M(t),t}}function M(t){localStorage.setItem(z,JSON.stringify(t))}function oe(t){return JSON.stringify(t,null,2)}function ce(t){const e=JSON.parse(t);if(!e||typeof e!="object")throw new Error("JSON invalide");if(!Array.isArray(e.parcels)||!Array.isArray(e.crops))throw new Error("Structure manquante (parcels, crops requis)");return e.preparations||(e.preparations=[]),e.cultures||(e.cultures=[]),e.treatments||(e.treatments=[]),e.applications||(e.applications=[]),e.failures||(e.failures=[]),e.version=e.version||1,M(e),e}function ue(){const t=F();return M(t),t}function w(t="id"){return`${t}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`}function C(t,e){if(!t)return null;const a=new Date(t+"T12:00:00");return a.setDate(a.getDate()+Number(e)),a.toISOString().slice(0,10)}function de(t=new Date){const e=t.getMonth();return e>=3&&e<=7?{name:"Saison fraîche",period:"avril – août",icon:"🌧️",tip:"Idéal pour salades, choux et semis délicats. Pluies plus fréquentes."}:{name:"Saison chaude",period:"septembre – mars",icon:"☀️",tip:"Favorable au manioc, gombo, aubergine. Surveiller l'irrigation."}}function U(t,e,a){if(!t)return{};let s=e||null,r=a||null;s&&t.nurseryDays>0&&!r&&(r=C(s,t.nurseryDays)),!s&&r&&t.nurseryDays>0&&(s=C(r,-t.nurseryDays)),!r&&s&&t.nurseryDays===0&&(r=s);const n=r?C(r,t.growthDays):null,i=n?C(n,t.harvestDays):null;return{nurseryStart:s,plantDate:r,harvestStart:n,harvestEnd:i}}function K(t,e=new Date){if(t.status==="annulé")return"annulé";const a=e.toISOString().slice(0,10);return t.harvestStart&&a>=t.harvestStart?t.harvestEnd&&a>t.harvestEnd?"terminé":"harvest":t.plantDate&&a>=t.plantDate?"culture":t.nurseryStart&&a>=t.nurseryStart?"nursery":t.phase||"nursery"}const V=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];function $(t){if(!t)return"—";const e=new Date(t+"T12:00:00");return Number.isNaN(e.getTime())?t:`${e.getDate()} ${V[e.getMonth()]} ${e.getFullYear()}`}const pe=V.map(t=>t.slice(0,3)+".");let l=ie(),g="accueil",v=null,j=new Date().getFullYear(),N="tous";const o=()=>document.getElementById("content"),B=()=>document.getElementById("modal-root"),E=()=>document.getElementById("header-sub");function y(){M(l)}function c(t,e=!1){const a=document.getElementById("toast-root"),s=document.createElement("div");s.className="toast"+(e?" error":""),s.textContent=t,a.appendChild(s),requestAnimationFrame(()=>s.classList.add("show")),setTimeout(()=>{s.classList.remove("show"),setTimeout(()=>s.remove(),300)},2600)}function b(t){return l.parcels.find(e=>e.id===t)}function k(t){return l.crops.find(e=>e.id===t)}function O(t){return l.treatments.find(e=>e.id===t)}function H(t){const e={libre:["badge-libre","Libre"],préparation:["badge-preparation","En préparation"],culture:["badge-culture","En culture"],planifié:["badge-planifie","Prévu"],"en cours":["badge-encours","En cours"],terminé:["badge-termine","Terminé"],annulé:["badge-annule","Annulé"],nursery:["badge-nursery","Semis"],harvest:["badge-harvest","Récolte"],actif:["badge-culture","En cours"],terminé_culture:["badge-termine","Terminé"]},[a,s]=e[t]||["badge-planifie",t];return`<span class="badge ${a} status-pill">${s}</span>`}function h(){B().innerHTML=""}function q({title:t,bodyHtml:e,onMount:a,primary:s,secondary:r,danger:n}){var d,f,u,I,D;B().innerHTML=`
    <div class="modal-overlay" data-close="1">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2>${t}</h2>
          <button type="button" class="icon-btn" data-x aria-label="Fermer">✕</button>
        </div>
        <div class="modal-body">${e}</div>
        <div class="modal-footer">
          ${r?`<button type="button" class="btn btn-ghost" data-sec>${r.label}</button>`:""}
          ${n?`<button type="button" class="btn btn-danger" data-danger>${n.label}</button>`:""}
          ${s?`<button type="button" class="btn btn-primary" data-pri>${s.label}</button>`:""}
        </div>
      </div>
    </div>`;const i=B().querySelector(".modal-overlay");i.addEventListener("click",S=>{S.target.dataset.close&&h()}),(d=i.querySelector("[data-x]"))==null||d.addEventListener("click",h),(f=i.querySelector(".modal"))==null||f.addEventListener("click",S=>S.stopPropagation()),a&&a(i.querySelector(".modal-body")),(u=i.querySelector("[data-pri]"))==null||u.addEventListener("click",()=>{var S;return(S=s==null?void 0:s.onClick)==null?void 0:S.call(s,i)}),(I=i.querySelector("[data-sec]"))==null||I.addEventListener("click",()=>{r!=null&&r.onClick?r.onClick(i):h()}),(D=i.querySelector("[data-danger]"))==null||D.addEventListener("click",()=>{var S;return(S=n==null?void 0:n.onClick)==null?void 0:S.call(n,i)})}function P({title:t,message:e,confirmLabel:a="Oui",onConfirm:s}){q({title:t,bodyHtml:`<p class="confirm-text">${e}</p>`,secondary:{label:"Non, garder"},danger:{label:a,onClick:()=>{s(),h()}}})}function J(){if(localStorage.getItem("guyane-welcome-seen"))return;const t=document.createElement("div");t.className="welcome-overlay",t.innerHTML=`
    <div class="welcome-sheet">
      <h2>Bienvenue 🌿</h2>
      <p class="lead">Guyane Cultures t’aide à suivre tes parcelles, semis et récoltes — simplement, sur ton téléphone.</p>
      <div class="tip-card"><span class="step">1</span><strong>Crée une parcelle</strong><p>C’est ton terrain (ex. « Jardin potager »).</p></div>
      <div class="tip-card"><span class="step">2</span><strong>Prépare le sol</strong><p>Labour, désherbage, amendement…</p></div>
      <div class="tip-card"><span class="step">3</span><strong>Sème ou plante</strong><p>Les dates de récolte se calculent toutes seules.</p></div>
      <button type="button" class="btn btn-primary btn-lg" id="welcome-ok">C’est parti</button>
    </div>`,document.body.appendChild(t),t.querySelector("#welcome-ok").onclick=()=>{localStorage.setItem("guyane-welcome-seen","1"),t.remove(),c("Des exemples sont déjà là pour découvrir")}}function me(){var n,i,d,f;E().textContent="Mon jardin";const t=de(),e=l.cultures.filter(u=>u.status==="actif"),a=l.parcels.filter(u=>u.status==="libre").length,s=l.preparations.filter(u=>u.status!=="terminé").length,r=W().slice(0,4);o().innerHTML=`
    <div class="season-banner">
      <span class="season-icon">${t.icon}</span>
      <div>
        <strong>${t.name}</strong> · ${t.period}
        <p>${t.tip}</p>
      </div>
    </div>

    <div class="grid-stats">
      <div class="stat-card"><div class="num">${l.parcels.length}</div><div class="lbl">Parcelles</div></div>
      <div class="stat-card"><div class="num">${e.length}</div><div class="lbl">Cultures</div></div>
      <div class="stat-card"><div class="num">${a}</div><div class="lbl">Libres</div></div>
      <div class="stat-card"><div class="num">${s}</div><div class="lbl">Prépas</div></div>
    </div>

    <p class="muted mb-1">Que veux-tu faire ?</p>
    <div class="quick-row">
      <button type="button" class="quick-btn" data-go="new-parcel"><span class="qi">🗺️</span>+ Parcelle</button>
      <button type="button" class="quick-btn" data-go="new-prep"><span class="qi">🛠️</span>+ Préparation</button>
      <button type="button" class="quick-btn" data-go="new-semis"><span class="qi">🪴</span>+ Semis</button>
      <button type="button" class="quick-btn" data-go="new-plant"><span class="qi">🌱</span>+ Plantation</button>
    </div>

    <div class="section-head"><h3>Prochaines dates</h3></div>
    ${r.length?r.map(u=>`
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${u.color}"></div>
        <div>
          <div class="date">${$(u.date)}</div>
          <div class="title">${u.title}</div>
          <div class="muted">${u.sub||""}</div>
        </div>
      </div>`).join(""):'<div class="empty-state"><div class="emoji">📭</div><p>Rien de prévu pour l’instant.<br>Ajoute un semis pour commencer.</p></div>'}
  `,(n=o().querySelector('[data-go="new-parcel"]'))==null||n.addEventListener("click",()=>T()),(i=o().querySelector('[data-go="new-prep"]'))==null||i.addEventListener("click",()=>_()),(d=o().querySelector('[data-go="new-semis"]'))==null||d.addEventListener("click",()=>R("nursery")),(f=o().querySelector('[data-go="new-plant"]'))==null||f.addEventListener("click",()=>R("culture"))}function W(){const t=[];for(const a of l.cultures.filter(s=>s.status==="actif")){const s=k(a.cropId),r=b(a.parcelId),n=(s==null?void 0:s.name)||"Culture",i=(r==null?void 0:r.name)||"";a.nurseryStart&&t.push({date:a.nurseryStart,title:`Semis · ${n}`,sub:i,color:"var(--nursery)"}),a.plantDate&&t.push({date:a.plantDate,title:`Plantation · ${n}`,sub:i,color:"var(--culture)"}),a.harvestStart&&t.push({date:a.harvestStart,title:`Début récolte · ${n}`,sub:i,color:"var(--harvest)"})}for(const a of l.preparations.filter(s=>s.status!=="terminé")){const s=b(a.parcelId);t.push({date:a.startDate,title:`${a.type} · ${(s==null?void 0:s.name)||""}`,sub:a.method,color:"var(--prep)"})}const e=new Date().toISOString().slice(0,10);return t.filter(a=>a.date&&a.date>=e).sort((a,s)=>a.date.localeCompare(s.date))}function be(){E().textContent="Semis & plantations";const t=l.cultures.map(e=>({...e,phaseNow:K(e)})).filter(e=>N==="tous"?e.status==="actif":N==="annulés"?e.status==="annulé":e.status==="actif"&&e.phaseNow===N).sort((e,a)=>(a.plantDate||a.nurseryStart||"").localeCompare(e.plantDate||e.nurseryStart||""));o().innerHTML=`
    <div class="page-title">
      <span>Cultures</span>
    </div>
    <div class="cta-stack">
      <button type="button" class="btn btn-primary btn-lg" id="btn-semis">🪴 Nouveau semis</button>
      <button type="button" class="btn btn-secondary btn-lg" id="btn-plant">🌱 Nouvelle plantation</button>
    </div>
    <div class="filter-chips">
      ${[["tous","En cours"],["nursery","Semis"],["culture","Plantés"],["harvest","Récolte"],["annulés","Annulés"]].map(([e,a])=>`<button type="button" class="chip ${N===e?"active":""}" data-f="${e}">${a}</button>`).join("")}
    </div>
    ${t.length?t.map(ve).join(""):`
      <div class="empty-state">
        <div class="emoji">🌱</div>
        <p>Aucune culture ici.<br>Appuie sur <strong>Nouveau semis</strong> pour commencer.</p>
      </div>`}
  `,o().querySelector("#btn-semis").onclick=()=>R("nursery"),o().querySelector("#btn-plant").onclick=()=>R("culture"),o().querySelectorAll("[data-f]").forEach(e=>{e.onclick=()=>{N=e.dataset.f,m()}}),o().querySelectorAll("[data-culture]").forEach(e=>{var a,s,r;(a=e.querySelector("[data-done]"))==null||a.addEventListener("click",n=>{n.stopPropagation(),fe(e.dataset.culture)}),(s=e.querySelector("[data-fail]"))==null||s.addEventListener("click",n=>{n.stopPropagation(),ge(e.dataset.culture)}),(r=e.querySelector("[data-edit]"))==null||r.addEventListener("click",n=>{n.stopPropagation(),ye(e.dataset.culture)})})}function ve(t){const e=k(t.cropId),a=b(t.parcelId),s=t.phaseNow||K(t),r=t.status==="annulé";return`
    <div class="card" data-culture="${t.id}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
        <h3>${(e==null?void 0:e.name)||"Culture"}</h3>
        ${H(r?"annulé":s)}
      </div>
      <div class="card-meta">
        📍 ${(a==null?void 0:a.name)||"—"} · ${t.plantsCount||"—"} plants
        ${t.surfaceUsed?` · ${t.surfaceUsed} m²`:""}<br>
        ${t.nurseryStart?`🪴 Semis : ${$(t.nurseryStart)}<br>`:""}
        ${t.plantDate?`🌱 Plantation : ${$(t.plantDate)}<br>`:""}
        ${t.harvestStart?`🍅 Récolte : ${$(t.harvestStart)} → ${$(t.harvestEnd)}`:""}
        ${t.notes?`<br>💬 ${t.notes}`:""}
      </div>
      ${r?"":`
      <div class="card-actions">
        <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
        <button type="button" class="btn btn-sm btn-secondary" data-done>Terminer</button>
        <button type="button" class="btn btn-sm btn-danger" data-fail>Échec / Annuler</button>
      </div>`}
    </div>`}function fe(t){P({title:"Terminer la culture ?",message:"Elle passera en terminé et la parcelle redeviendra libre si plus rien n’y pousse.",confirmLabel:"Oui, terminer",onConfirm:()=>{const e=l.cultures.find(a=>a.id===t);e&&(e.status="terminé",e.phase="terminé",x(e.parcelId),y(),c("Culture terminée"),m())}})}function x(t){const e=l.cultures.some(r=>r.parcelId===t&&r.status==="actif"),a=l.preparations.some(r=>r.parcelId===t&&r.status!=="terminé"),s=b(t);s&&(!e&&!a?s.status="libre":!e&&a?s.status="préparation":s.status="culture")}function R(t){if(!l.parcels.length){c("Crée d’abord une parcelle",!0),T();return}if(!l.crops.length){c("Ajoute d’abord une plante au catalogue",!0);return}let e=1,a={cropId:"",parcelId:"",startDate:new Date().toISOString().slice(0,10),plantsCount:50};function s(){if(e===1)q({title:t==="nursery"?"Nouveau semis":"Nouvelle plantation",bodyHtml:`
          <p class="muted mb-1">Quelle plante ?</p>
          <div class="choice-grid" id="crop-choices">
            ${l.crops.map(r=>`
              <button type="button" class="choice-btn" data-id="${r.id}">
                <span class="ci">🥬</span>${r.name}
              </button>`).join("")}
          </div>`,secondary:{label:"Annuler"},primary:{label:"Suivant",onClick:()=>{if(!a.cropId){c("Choisis une plante",!0);return}e=2,s()}},onMount:r=>{r.querySelectorAll(".choice-btn").forEach(n=>{n.onclick=()=>{a.cropId=n.dataset.id,r.querySelectorAll(".choice-btn").forEach(i=>i.classList.remove("selected")),n.classList.add("selected")}})}});else if(e===2)q({title:"Où planter ?",bodyHtml:`
          <p class="muted mb-1">Quelle parcelle ?</p>
          <div id="parcel-choices" style="display:flex;flex-direction:column;gap:0.5rem">
            ${l.parcels.map(r=>`
              <button type="button" class="plus-item" data-id="${r.id}">
                <span class="pi">🗺️</span>
                <span>${r.name}<span class="sub">${r.surface} m² · ${r.status}</span></span>
              </button>`).join("")}
          </div>`,secondary:{label:"Retour",onClick:()=>{e=1,s()}},primary:{label:"Suivant",onClick:()=>{if(!a.parcelId){c("Choisis une parcelle",!0);return}e=3,s()}},onMount:r=>{r.querySelectorAll(".plus-item").forEach(n=>{n.onclick=()=>{a.parcelId=n.dataset.id,r.querySelectorAll(".plus-item").forEach(i=>{i.style.borderColor=""}),n.style.borderColor="var(--accent)"}})}});else{const r=k(a.cropId);q({title:"Dates & détails",bodyHtml:`
          <div class="form-group">
            <label>${t==="nursery"?"Date du semis":"Date de plantation"}</label>
            <input type="date" id="f-date" value="${a.startDate}" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Nombre de plants</label>
              <input type="number" id="f-plants" min="1" value="${a.plantsCount}" />
            </div>
            <div class="form-group">
              <label>Surface (m²)</label>
              <input type="number" id="f-surf" min="0" step="1" placeholder="optionnel" />
            </div>
          </div>
          <div class="form-group">
            <label>Note (optionnel)</label>
            <input type="text" id="f-notes" placeholder="Ex. variété locale" />
          </div>
          <div class="alert alert-info" id="date-preview">
            Les dates de récolte seront calculées automatiquement
            (${(r==null?void 0:r.nurseryDays)||0} j semis · ${(r==null?void 0:r.growthDays)||0} j croissance · ${(r==null?void 0:r.harvestDays)||0} j récolte).
          </div>`,secondary:{label:"Retour",onClick:()=>{e=2,s()}},primary:{label:"Enregistrer",onClick:i=>{const d=i.querySelector("#f-date").value;if(!d){c("Indique une date",!0);return}const f=Number(i.querySelector("#f-plants").value)||0,u=i.querySelector("#f-surf").value,I=i.querySelector("#f-notes").value.trim(),D=t==="nursery"?U(r,d,null):U(r,null,d),S={id:w("c"),parcelId:a.parcelId,cropId:a.cropId,phase:t,plantsCount:f,surfaceUsed:u?Number(u):null,nurseryStart:D.nurseryStart,plantDate:D.plantDate,harvestStart:D.harvestStart,harvestEnd:D.harvestEnd,status:"actif",notes:I};l.cultures.push(S);const G=b(a.parcelId);G&&(G.status="culture"),y(),h(),c(`${r.name} enregistré · récolte vers ${$(D.harvestStart)}`),g="cultures",m()}}})}}s()}function ye(t){const e=l.cultures.find(s=>s.id===t);if(!e)return;const a=k(e.cropId);q({title:`Modifier · ${(a==null?void 0:a.name)||""}`,bodyHtml:`
      <div class="form-group">
        <label>Parcelle</label>
        <select id="f-parcel">${l.parcels.map(s=>`<option value="${s.id}" ${s.id===e.parcelId?"selected":""}>${s.name}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label>Plante</label>
        <select id="f-crop">${l.crops.map(s=>`<option value="${s.id}" ${s.id===e.cropId?"selected":""}>${s.name}</option>`).join("")}</select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Début semis</label><input type="date" id="f-ns" value="${e.nurseryStart||""}" /></div>
        <div class="form-group"><label>Plantation</label><input type="date" id="f-pd" value="${e.plantDate||""}" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Début récolte</label><input type="date" id="f-hs" value="${e.harvestStart||""}" /></div>
        <div class="form-group"><label>Fin récolte</label><input type="date" id="f-he" value="${e.harvestEnd||""}" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Plants</label><input type="number" id="f-pl" value="${e.plantsCount||""}" /></div>
        <div class="form-group"><label>Surface m²</label><input type="number" id="f-su" value="${e.surfaceUsed||""}" /></div>
      </div>
      <div class="form-group"><label>Note</label><input type="text" id="f-no" value="${e.notes||""}" /></div>
      <button type="button" class="btn btn-secondary btn-block" id="f-recalc">♻️ Recalculer les dates depuis la plante</button>`,secondary:{label:"Annuler"},primary:{label:"Enregistrer",onClick:s=>{const r=e.parcelId;if(e.parcelId=s.querySelector("#f-parcel").value,e.cropId=s.querySelector("#f-crop").value,e.nurseryStart=s.querySelector("#f-ns").value||null,e.plantDate=s.querySelector("#f-pd").value||null,e.harvestStart=s.querySelector("#f-hs").value||null,e.harvestEnd=s.querySelector("#f-he").value||null,e.plantsCount=Number(s.querySelector("#f-pl").value)||0,e.surfaceUsed=s.querySelector("#f-su").value?Number(s.querySelector("#f-su").value):null,e.notes=s.querySelector("#f-no").value.trim(),r!==e.parcelId){x(r);const n=b(e.parcelId);n&&e.status==="actif"&&(n.status="culture")}y(),h(),c("Modifications enregistrées"),m()}},onMount:s=>{s.querySelector("#f-recalc").onclick=()=>{var f;(f=s.parentElement.querySelector("#f-crop"))!=null&&f.value||s.querySelector("#f-crop").value;const r=k(s.querySelector("#f-crop").value),n=s.querySelector("#f-ns").value,i=s.querySelector("#f-pd").value,d=U(r,n||null,i||null);d.nurseryStart&&(s.querySelector("#f-ns").value=d.nurseryStart),d.plantDate&&(s.querySelector("#f-pd").value=d.plantDate),d.harvestStart&&(s.querySelector("#f-hs").value=d.harvestStart),d.harvestEnd&&(s.querySelector("#f-he").value=d.harvestEnd),c("Dates recalculées")}}})}function ge(t){const e=l.cultures.find(s=>s.id===t);if(!e)return;const a=k(e.cropId);q({title:"Échec ou annulation",bodyHtml:`
      <p class="confirm-text">Annuler <strong>${(a==null?void 0:a.name)||"cette culture"}</strong> ? Le sol pourra redevenir libre.</p>
      <div class="form-group">
        <label>Raison</label>
        <select id="f-reason">${ne.map(s=>`<option>${s}</option>`).join("")}</select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="f-date" value="${new Date().toISOString().slice(0,10)}" />
      </div>
      <div class="form-row">
        <div class="form-group"><label>Plants perdus</label><input type="number" id="f-plants" min="0" value="${e.plantsCount||0}" /></div>
        <div class="form-group"><label>Surface perdue (m²)</label><input type="number" id="f-surf" min="0" value="${e.surfaceUsed||0}" /></div>
      </div>
      <div class="form-group"><label>Perte estimée (€)</label><input type="number" id="f-loss" min="0" step="0.01" placeholder="0" /></div>
      <div class="form-group"><label>Que s’est-il passé ?</label><textarea id="f-desc" placeholder="Décris brièvement…"></textarea></div>
      <div class="form-group"><label>Que faire ensuite ?</label><textarea id="f-corr" placeholder="Ex. traiter, resemer…"></textarea></div>`,secondary:{label:"Garder la culture"},danger:{label:"Confirmer l’annulation",onClick:s=>{const r={id:w("fail"),cultureId:e.id,parcelId:e.parcelId,cropId:e.cropId,reason:s.querySelector("#f-reason").value,date:s.querySelector("#f-date").value,plantsLost:Number(s.querySelector("#f-plants").value)||0,surfaceLost:Number(s.querySelector("#f-surf").value)||0,lossEuro:Number(s.querySelector("#f-loss").value)||0,description:s.querySelector("#f-desc").value.trim(),corrective:s.querySelector("#f-corr").value.trim()};l.failures.push(r),e.status="annulé",e.phase="annulé",x(e.parcelId),y(),h(),c("Culture annulée · parcelle mise à jour"),m()}}})}function he(){E().textContent="Calendrier annuel";const t=pe,e=Se(j);o().innerHTML=`
    <div class="page-title"><span>Planning</span></div>
    <div class="year-picker">
      <button type="button" id="y-prev" aria-label="Année précédente">‹</button>
      <span>${j}</span>
      <button type="button" id="y-next" aria-label="Année suivante">›</button>
    </div>
    <div class="legend">
      <span><i class="prep"></i> Préparation</span>
      <span><i class="nursery"></i> Semis</span>
      <span><i class="culture"></i> Culture</span>
      <span><i class="harvest"></i> Récolte</span>
      <span><i class="fertilizer"></i> Engrais</span>
      <span><i class="herbicide"></i> Herbicide</span>
    </div>
    <div class="card gantt-wrap" style="padding:0.4rem;overflow-x:auto">
      <table class="gantt-table">
        <thead><tr><th class="row-label">Activité</th>${t.map(a=>`<th>${a}</th>`).join("")}</tr></thead>
        <tbody>
          ${e.length?e.map(a=>`
            <tr>
              <td class="row-label" title="${a.label}">${a.label}</td>
              ${a.cells.map(s=>`<td class="gantt-cell ${s||""}"></td>`).join("")}
            </tr>`).join(""):`<tr><td colspan="13" style="padding:1.5rem;color:var(--text-muted)">Rien à afficher pour ${j}. Ajoute des cultures ou préparations.</td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="section-head"><h3>À venir</h3></div>
    ${W().slice(0,8).map(a=>`
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${a.color}"></div>
        <div>
          <div class="date">${$(a.date)}</div>
          <div class="title">${a.title}</div>
          <div class="muted">${a.sub||""}</div>
        </div>
      </div>`).join("")||'<p class="muted">Aucune date à venir.</p>'}
  `,o().querySelector("#y-prev").onclick=()=>{j--,m()},o().querySelector("#y-next").onclick=()=>{j++,m()}}function Se(t){const e=[];function a(s,r,n,i){if(!r)return;const d=new Date(r+"T12:00:00"),f=new Date((n||r)+"T12:00:00");for(let u=0;u<12;u++){const I=new Date(t,u,1),D=new Date(t,u+1,0);d<=D&&f>=I&&(!s[u]||i==="harvest"||i==="herbicide"?s[u]=i:s[u]?s[u]==="prep"&&(s[u]=i):s[u]=i)}}for(const s of l.preparations){const r=b(s.parcelId),n=Array(12).fill("");a(n,s.startDate,s.endDate||s.startDate,"prep"),n.some(Boolean)&&e.push({label:`${s.type} · ${(r==null?void 0:r.name)||"?"}`,cells:n})}for(const s of l.cultures.filter(r=>r.status!=="annulé")){const r=k(s.cropId),n=b(s.parcelId),i=Array(12).fill("");s.nurseryStart&&s.plantDate?a(i,s.nurseryStart,C(s.plantDate,-1)||s.nurseryStart,"nursery"):s.nurseryStart&&a(i,s.nurseryStart,s.nurseryStart,"nursery"),s.plantDate&&s.harvestStart?a(i,s.plantDate,C(s.harvestStart,-1)||s.plantDate,"culture"):s.plantDate&&a(i,s.plantDate,s.plantDate,"culture"),a(i,s.harvestStart,s.harvestEnd||s.harvestStart,"harvest"),i.some(Boolean)&&e.push({label:`${(r==null?void 0:r.name)||"?"} · ${(n==null?void 0:n.name)||"?"}`,cells:i})}for(const s of l.applications){const r=O(s.treatmentId);if(!r||!s.date)continue;const n=new Date(s.date+"T12:00:00");if(n.getFullYear()!==t)continue;const i=Array(12).fill("");i[n.getMonth()]=r.category==="herbicide"?"herbicide":"fertilizer";const d=b(s.parcelId);e.push({label:`${r.name} · ${(d==null?void 0:d.name)||""}`,cells:i})}return e}function $e(){if(v==="parcelles")return qe();if(v==="preparation")return De();if(v==="traitements")return ke();if(v==="catalogue")return Ie();if(v==="echecs")return we();if(v==="reglages")return Ce();E().textContent="Menu",o().innerHTML=`
    <div class="page-title"><span>Plus</span></div>
    <div class="plus-list">
      <button type="button" class="plus-item" data-v="parcelles">
        <span class="pi">🗺️</span><span>Parcelles<span class="sub">${l.parcels.length} terrain(s)</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="preparation">
        <span class="pi">🛠️</span><span>Préparation du sol<span class="sub">Labour, désherbage…</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="traitements">
        <span class="pi">🧴</span><span>Engrais & herbicides<span class="sub">Stock et applications</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="catalogue">
        <span class="pi">📚</span><span>Plantes cultivées<span class="sub">${l.crops.length} plantes · durées</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="echecs">
        <span class="pi">⚠️</span><span>Échecs & annulations<span class="sub">${l.failures.length} enregistré(s)</span></span><span class="chev">›</span>
      </button>
      <button type="button" class="plus-item" data-v="reglages">
        <span class="pi">⚙️</span><span>Réglages<span class="sub">Sauvegarde, réinitialiser…</span></span><span class="chev">›</span>
      </button>
    </div>
    <p class="muted mt-1" style="font-size:0.75rem;text-align:center">
      <!-- TODO: météo API · bot Discord · sync multi-utilisateurs · export PDF -->
    </p>
  `,o().querySelectorAll("[data-v]").forEach(t=>{t.onclick=()=>{v=t.dataset.v,m()}})}function L(){return'<button type="button" class="btn btn-ghost btn-sm" id="back-plus">‹ Retour</button>'}function A(){var t;(t=o().querySelector("#back-plus"))==null||t.addEventListener("click",()=>{v=null,m()})}function qe(){E().textContent="Parcelles",o().innerHTML=`
    <div class="page-title">${L()}<span>Parcelles</span></div>
    <button type="button" class="btn btn-primary btn-lg mb-1" id="new-p">+ Nouvelle parcelle</button>
    ${l.parcels.length?l.parcels.map(t=>`
      <div class="card" data-id="${t.id}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <h3>${t.name}</h3>
          ${H(t.status)}
        </div>
        <div class="card-meta">${t.surface} m² · Sol ${t.soilType}</div>
        <div class="card-actions">
          <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
          <button type="button" class="btn btn-sm btn-danger" data-del>Supprimer</button>
        </div>
      </div>`).join(""):`
      <div class="empty-state">
        <div class="emoji">🗺️</div>
        <p>Pas encore de parcelle.<br>Appuie sur <strong>+ Nouvelle parcelle</strong>.</p>
      </div>`}
  `,A(),o().querySelector("#new-p").onclick=()=>T(),o().querySelectorAll(".card[data-id]").forEach(t=>{t.querySelector("[data-edit]").onclick=()=>T(t.dataset.id),t.querySelector("[data-del]").onclick=()=>{const e=b(t.dataset.id);P({title:"Supprimer la parcelle ?",message:`« ${e==null?void 0:e.name} » sera retirée. Les cultures liées resteront dans l’historique mais sans terrain.`,confirmLabel:"Oui, supprimer",onConfirm:()=>{l.parcels=l.parcels.filter(a=>a.id!==t.dataset.id),y(),c("Parcelle supprimée"),m()}})}})}function T(t){const e=t?b(t):null;q({title:e?"Modifier la parcelle":"Nouvelle parcelle",bodyHtml:`
      <div class="form-group"><label>Nom</label>
        <input type="text" id="f-name" placeholder="Ex. Jardin potager" value="${(e==null?void 0:e.name)||""}" /></div>
      <div class="form-group"><label>Surface (m²)</label>
        <input type="number" id="f-surf" min="1" value="${(e==null?void 0:e.surface)||100}" /></div>
      <div class="form-group"><label>Type de sol</label>
        <select id="f-soil">${le.map(a=>`<option ${(e==null?void 0:e.soilType)===a?"selected":""}>${a}</option>`).join("")}</select></div>
      <div class="form-group"><label>État</label>
        <select id="f-status">${re.map(a=>`<option value="${a}" ${(e==null?void 0:e.status)===a?"selected":""}>${a}</option>`).join("")}</select></div>`,secondary:{label:"Annuler"},primary:{label:"Enregistrer",onClick:a=>{const s=a.querySelector("#f-name").value.trim();if(!s){c("Donne un nom à la parcelle",!0);return}const r={name:s,surface:Number(a.querySelector("#f-surf").value)||0,soilType:a.querySelector("#f-soil").value,status:a.querySelector("#f-status").value};e?Object.assign(e,r):l.parcels.push({id:w("p"),...r}),y(),h(),c(e?"Parcelle mise à jour":"Parcelle créée"),v||(v="parcelles",g="plus"),m()}}})}function De(){E().textContent="Préparation";const t=[...l.preparations].sort((e,a)=>(a.startDate||"").localeCompare(e.startDate||""));o().innerHTML=`
    <div class="page-title">${L()}<span>Préparation du sol</span></div>
    <button type="button" class="btn btn-primary btn-lg mb-1" id="new-prep">+ Nouvelle préparation</button>
    ${t.length?t.map(e=>{const a=b(e.parcelId);return`
      <div class="card" data-id="${e.id}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <h3>${e.type}</h3>
          ${H(e.status)}
        </div>
        <div class="card-meta">
          📍 ${(a==null?void 0:a.name)||"—"} · ${e.method}<br>
          ${$(e.startDate)}${e.endDate?` → ${$(e.endDate)}`:""}
          ${e.notes?`<br>💬 ${e.notes}`:""}
        </div>
        <div class="card-actions">
          ${e.status!=="terminé"?'<button type="button" class="btn btn-sm btn-primary" data-done>Marquer terminé</button>':""}
          <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
          <button type="button" class="btn btn-sm btn-danger" data-del>Supprimer</button>
        </div>
      </div>`}).join(""):`
      <div class="empty-state">
        <div class="emoji">🛠️</div>
        <p>Aucune préparation.<br>Appuie sur <strong>+ Nouvelle préparation</strong>.</p>
      </div>`}
  `,A(),o().querySelector("#new-prep").onclick=()=>_(),o().querySelectorAll(".card[data-id]").forEach(e=>{var s;const a=e.dataset.id;(s=e.querySelector("[data-done]"))==null||s.addEventListener("click",()=>{const r=l.preparations.find(n=>n.id===a);r&&(r.status="terminé",x(r.parcelId),y(),c("Préparation terminée"),m())}),e.querySelector("[data-edit]").onclick=()=>_(a),e.querySelector("[data-del]").onclick=()=>{P({title:"Supprimer cette préparation ?",message:"Elle disparaîtra de la liste.",confirmLabel:"Oui, supprimer",onConfirm:()=>{const r=l.preparations.find(n=>n.id===a);l.preparations=l.preparations.filter(n=>n.id!==a),r&&x(r.parcelId),y(),c("Supprimé"),m()}})}})}function _(t){if(!l.parcels.length){c("Crée d’abord une parcelle",!0),T();return}const e=t?l.preparations.find(a=>a.id===t):null;q({title:e?"Modifier la préparation":"Nouvelle préparation",bodyHtml:`
      <div class="form-group"><label>Parcelle</label>
        <select id="f-parcel">${l.parcels.map(a=>`<option value="${a.id}" ${(e==null?void 0:e.parcelId)===a.id?"selected":""}>${a.name}</option>`).join("")}</select></div>
      <div class="form-group"><label>Type de travail</label>
        <select id="f-type">${te.map(a=>`<option ${(e==null?void 0:e.type)===a?"selected":""}>${a}</option>`).join("")}</select></div>
      <div class="form-group"><label>Méthode</label>
        <select id="f-method">${ae.map(a=>`<option ${(e==null?void 0:e.method)===a?"selected":""}>${a}</option>`).join("")}</select></div>
      <div class="form-group"><label>État</label>
        <select id="f-status">${se.map(a=>`<option ${(e==null?void 0:e.status)===a?"selected":""}>${a}</option>`).join("")}</select></div>
      <div class="form-row">
        <div class="form-group"><label>Début</label><input type="date" id="f-start" value="${(e==null?void 0:e.startDate)||new Date().toISOString().slice(0,10)}" /></div>
        <div class="form-group"><label>Fin prévue</label><input type="date" id="f-end" value="${(e==null?void 0:e.endDate)||""}" /></div>
      </div>
      <div class="form-group"><label>Note</label><input type="text" id="f-notes" value="${(e==null?void 0:e.notes)||""}" placeholder="Optionnel" /></div>`,secondary:{label:"Annuler"},primary:{label:"Enregistrer",onClick:a=>{const s={parcelId:a.querySelector("#f-parcel").value,type:a.querySelector("#f-type").value,method:a.querySelector("#f-method").value,status:a.querySelector("#f-status").value,startDate:a.querySelector("#f-start").value,endDate:a.querySelector("#f-end").value||null,notes:a.querySelector("#f-notes").value.trim()};e?Object.assign(e,s):l.preparations.push({id:w("prep"),...s});const r=b(s.parcelId);r&&s.status!=="terminé"&&r.status==="libre"&&(r.status="préparation"),r&&s.status==="terminé"&&x(s.parcelId),y(),h(),c("Préparation enregistrée"),v="preparation",g="plus",m()}}})}function ke(){E().textContent="Engrais & herbicides",o().innerHTML=`
    <div class="page-title">${L()}<span>Engrais & herbicides</span></div>
    <div class="cta-stack">
      <button type="button" class="btn btn-primary btn-lg" id="new-t">+ Ajouter au stock</button>
      <button type="button" class="btn btn-secondary btn-lg" id="apply-t">💨 Appliquer sur une parcelle</button>
    </div>
    <div class="section-head"><h3>Mon stock</h3></div>
    ${l.treatments.map(t=>{const e=t.stockMax?Math.min(100,Math.round(t.stock/t.stockMax*100)):0,a=e<20;return`
        <div class="card" data-id="${t.id}">
          <div style="display:flex;justify-content:space-between">
            <h3>${t.name}</h3>
            <span class="badge ${t.category==="herbicide"?"badge-annule":"badge-planifie"}">${t.category==="herbicide"?"Herbicide":"Engrais"}</span>
          </div>
          <div class="card-meta">${t.stock} ${t.unit} restant${t.stockMax?` / ${t.stockMax}`:""}</div>
          <div class="stock-bar ${a?"stock-low":""}"><div class="fill" style="width:${e}%"></div></div>
          <div class="card-actions">
            <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
            <button type="button" class="btn btn-sm btn-danger" data-del>Retirer</button>
          </div>
        </div>`}).join("")||'<p class="muted">Stock vide.</p>'}
    <div class="section-head"><h3>Dernières applications</h3></div>
    ${[...l.applications].reverse().slice(0,8).map(t=>{const e=O(t.treatmentId),a=b(t.parcelId);return`<div class="timeline-item">
        <div class="timeline-dot" style="background:${(e==null?void 0:e.category)==="herbicide"?"var(--herbicide)":"var(--fertilizer)"}"></div>
        <div>
          <div class="date">${$(t.date)}</div>
          <div class="title">${(e==null?void 0:e.name)||"?"} · ${t.quantity} ${(e==null?void 0:e.unit)||""}</div>
          <div class="muted">${(a==null?void 0:a.name)||""}${t.notes?" — "+t.notes:""}</div>
        </div>
      </div>`}).join("")||'<p class="muted">Aucune application encore.</p>'}
  `,A(),o().querySelector("#new-t").onclick=()=>Q(),o().querySelector("#apply-t").onclick=()=>Ee(),o().querySelectorAll(".card[data-id]").forEach(t=>{t.querySelector("[data-edit]").onclick=()=>Q(t.dataset.id),t.querySelector("[data-del]").onclick=()=>{P({title:"Retirer du stock ?",message:"Ce produit disparaîtra de la liste (l’historique d’applications reste).",confirmLabel:"Oui, retirer",onConfirm:()=>{l.treatments=l.treatments.filter(e=>e.id!==t.dataset.id),y(),c("Retiré du stock"),m()}})}})}function Q(t){const e=t?O(t):null;q({title:e?"Modifier le produit":"Ajouter au stock",bodyHtml:`
      <div class="form-group"><label>Type</label>
        <select id="f-cat">
          <option value="engrais" ${(e==null?void 0:e.category)==="engrais"?"selected":""}>Engrais</option>
          <option value="herbicide" ${(e==null?void 0:e.category)==="herbicide"?"selected":""}>Herbicide</option>
        </select></div>
      <div class="form-group"><label>Nom</label>
        <input type="text" id="f-name" list="preset-names" value="${(e==null?void 0:e.name)||""}" placeholder="Choisir ou écrire…" />
        <datalist id="preset-names">${[...X,...ee].map(a=>`<option value="${a}">`).join("")}</datalist>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Quantité en stock</label><input type="number" id="f-stock" min="0" step="0.1" value="${(e==null?void 0:e.stock)??10}" /></div>
        <div class="form-group"><label>Unité</label>
          <select id="f-unit"><option ${(e==null?void 0:e.unit)==="kg"?"selected":""}>kg</option><option ${(e==null?void 0:e.unit)==="L"?"selected":""}>L</option><option ${(e==null?void 0:e.unit)==="sac"?"selected":""}>sac</option></select>
        </div>
      </div>
      <div class="form-group"><label>Stock max (pour la jauge)</label><input type="number" id="f-max" min="0" value="${(e==null?void 0:e.stockMax)??50}" /></div>
      <div class="form-group"><label>Note</label><input type="text" id="f-notes" value="${(e==null?void 0:e.notes)||""}" /></div>`,secondary:{label:"Annuler"},primary:{label:"Enregistrer",onClick:a=>{const s=a.querySelector("#f-name").value.trim();if(!s){c("Indique un nom",!0);return}const r={name:s,category:a.querySelector("#f-cat").value,stock:Number(a.querySelector("#f-stock").value)||0,unit:a.querySelector("#f-unit").value,stockMax:Number(a.querySelector("#f-max").value)||0,notes:a.querySelector("#f-notes").value.trim()};e?Object.assign(e,r):l.treatments.push({id:w("t"),...r}),y(),h(),c("Stock mis à jour"),v="traitements",g="plus",m()}}})}function Ee(){if(!l.treatments.length){c("Ajoute d’abord un produit au stock",!0);return}if(!l.parcels.length){c("Crée d’abord une parcelle",!0);return}q({title:"Appliquer un traitement",bodyHtml:`
      <div class="form-group"><label>Produit</label>
        <select id="f-t">${l.treatments.map(t=>`<option value="${t.id}">${t.name} (${t.stock} ${t.unit})</option>`).join("")}</select></div>
      <div class="form-group"><label>Parcelle</label>
        <select id="f-p">${l.parcels.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select></div>
      <div class="form-group"><label>Culture liée (optionnel)</label>
        <select id="f-c"><option value="">— Aucune —</option>
          ${l.cultures.filter(t=>t.status==="actif").map(t=>{var a;const e=k(t.cropId);return`<option value="${t.id}">${(e==null?void 0:e.name)||"?"} · ${((a=b(t.parcelId))==null?void 0:a.name)||""}</option>`}).join("")}
        </select></div>
      <div class="form-row">
        <div class="form-group"><label>Quantité utilisée</label><input type="number" id="f-q" min="0.1" step="0.1" value="1" /></div>
        <div class="form-group"><label>Date</label><input type="date" id="f-d" value="${new Date().toISOString().slice(0,10)}" /></div>
      </div>
      <div class="form-group"><label>Note</label><input type="text" id="f-n" placeholder="Optionnel" /></div>`,secondary:{label:"Annuler"},primary:{label:"Enregistrer",onClick:t=>{const e=t.querySelector("#f-t").value,a=Number(t.querySelector("#f-q").value)||0,s=O(e);if(!s||a<=0){c("Quantité invalide",!0);return}if(a>s.stock){c("Pas assez en stock",!0);return}s.stock=Math.round((s.stock-a)*100)/100,l.applications.push({id:w("a"),treatmentId:e,parcelId:t.querySelector("#f-p").value,cultureId:t.querySelector("#f-c").value||null,date:t.querySelector("#f-d").value,quantity:a,notes:t.querySelector("#f-n").value.trim()}),y(),h(),c(`Application enregistrée · reste ${s.stock} ${s.unit}`),m()}}})}function Ie(){E().textContent="Plantes",o().innerHTML=`
    <div class="page-title">${L()}<span>Plantes cultivées</span></div>
    <p class="muted mb-1">Durées utilisées pour calculer automatiquement semis → plantation → récolte.</p>
    <button type="button" class="btn btn-primary btn-lg mb-1" id="new-crop">+ Ajouter une plante</button>
    ${l.crops.map(t=>`
      <div class="card" data-id="${t.id}">
        <h3>${t.name}</h3>
        <div class="card-meta">
          🪴 Semis ${t.nurseryDays} j · 🌱 Croissance ${t.growthDays} j · 🍅 Récolte ${t.harvestDays} j
          ${t.notes?`<br>${t.notes}`:""}
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-sm btn-secondary" data-edit>Modifier</button>
          <button type="button" class="btn btn-sm btn-danger" data-del>Supprimer</button>
        </div>
      </div>`).join("")}
  `,A(),o().querySelector("#new-crop").onclick=()=>Y(),o().querySelectorAll(".card[data-id]").forEach(t=>{t.querySelector("[data-edit]").onclick=()=>Y(t.dataset.id),t.querySelector("[data-del]").onclick=()=>{P({title:"Supprimer cette plante ?",message:"Elle disparaîtra du catalogue. Les cultures déjà créées ne sont pas effacées.",confirmLabel:"Oui, supprimer",onConfirm:()=>{l.crops=l.crops.filter(e=>e.id!==t.dataset.id),y(),c("Plante retirée"),m()}})}})}function Y(t){const e=t?k(t):null;q({title:e?"Modifier la plante":"Nouvelle plante",bodyHtml:`
      <div class="form-group"><label>Nom</label><input type="text" id="f-name" value="${(e==null?void 0:e.name)||""}" placeholder="Ex. Tomate cerise" /></div>
      <div class="form-row">
        <div class="form-group"><label>Jours de semis</label><input type="number" id="f-n" min="0" value="${(e==null?void 0:e.nurseryDays)??21}" /></div>
        <div class="form-group"><label>Jours de croissance</label><input type="number" id="f-g" min="0" value="${(e==null?void 0:e.growthDays)??60}" /></div>
      </div>
      <div class="form-group"><label>Jours de récolte</label><input type="number" id="f-h" min="0" value="${(e==null?void 0:e.harvestDays)??21}" /></div>
      <div class="form-group"><label>Note</label><input type="text" id="f-notes" value="${(e==null?void 0:e.notes)||""}" /></div>`,secondary:{label:"Annuler"},primary:{label:"Enregistrer",onClick:a=>{const s=a.querySelector("#f-name").value.trim();if(!s){c("Donne un nom",!0);return}const r={name:s,nurseryDays:Number(a.querySelector("#f-n").value)||0,growthDays:Number(a.querySelector("#f-g").value)||0,harvestDays:Number(a.querySelector("#f-h").value)||0,notes:a.querySelector("#f-notes").value.trim()};e?Object.assign(e,r):l.crops.push({id:w("crop"),...r}),y(),h(),c("Plante enregistrée"),v="catalogue",g="plus",m()}}})}function we(){E().textContent="Échecs";const t=[...l.failures].reverse();o().innerHTML=`
    <div class="page-title">${L()}<span>Échecs & annulations</span></div>
    ${t.length?t.map(e=>{const a=k(e.cropId),s=b(e.parcelId);return`
        <div class="card">
          <div style="display:flex;justify-content:space-between">
            <h3>${(a==null?void 0:a.name)||"Culture"}</h3>
            ${H("annulé")}
          </div>
          <div class="card-meta">
            ${e.reason} · ${$(e.date)}<br>
            📍 ${(s==null?void 0:s.name)||"—"}
            ${e.plantsLost?` · ${e.plantsLost} plants`:""}
            ${e.surfaceLost?` · ${e.surfaceLost} m²`:""}
            ${e.lossEuro?`<br><span class="loss-amount">Perte ≈ ${e.lossEuro} €</span>`:""}
            ${e.description?`<br>${e.description}`:""}
            ${e.corrective?`<br>➡️ ${e.corrective}`:""}
          </div>
        </div>`}).join(""):`
      <div class="empty-state">
        <div class="emoji">✅</div>
        <p>Aucun échec enregistré.<br>Tant mieux ! Tu peux annuler une culture depuis l’onglet Cultures.</p>
      </div>`}
  `,A()}function Ce(){E().textContent="Réglages",o().innerHTML=`
    <div class="page-title">${L()}<span>Réglages</span></div>
    <div class="card">
      <h3>Sauvegarder mes données</h3>
      <p class="card-meta mb-1">Télécharge une copie de tout ton jardin (fichier sur ton téléphone).</p>
      <button type="button" class="btn btn-primary btn-block" id="btn-export">Télécharger la sauvegarde</button>
    </div>
    <div class="card">
      <h3>Restaurer une sauvegarde</h3>
      <p class="card-meta mb-1">Remplace les données actuelles par un fichier sauvegardé.</p>
      <input type="file" id="import-file" accept="application/json,.json" hidden />
      <button type="button" class="btn btn-secondary btn-block" id="btn-import">Choisir un fichier…</button>
    </div>
    <div class="card">
      <h3>Revoir l’accueil</h3>
      <button type="button" class="btn btn-secondary btn-block" id="btn-welcome">Afficher le guide de démarrage</button>
    </div>
    <div class="card">
      <h3>Remettre les exemples</h3>
      <p class="card-meta mb-1">Efface tout et recharge les données d’exemple.</p>
      <button type="button" class="btn btn-danger btn-block" id="btn-reset">Réinitialiser l’application</button>
    </div>
    <p class="muted" style="font-size:0.75rem;text-align:center;margin-top:1rem">
      Guyane Cultures v1 · données stockées sur cet appareil<br>
      <!-- TODO: météo API · bot Discord · sync multi-utilisateurs · export PDF -->
    </p>
  `,A(),o().querySelector("#btn-export").onclick=()=>{const t=new Blob([oe(l)],{type:"application/json"}),e=document.createElement("a");e.href=URL.createObjectURL(t),e.download=`guyane-cultures-${new Date().toISOString().slice(0,10)}.json`,e.click(),URL.revokeObjectURL(e.href),c("Sauvegarde téléchargée")},o().querySelector("#btn-import").onclick=()=>o().querySelector("#import-file").click(),o().querySelector("#import-file").onchange=async t=>{var a;const e=(a=t.target.files)==null?void 0:a[0];if(e)try{const s=await e.text();l=ce(s),c("Données restaurées"),m()}catch{c("Fichier invalide",!0)}},o().querySelector("#btn-welcome").onclick=()=>{localStorage.removeItem("guyane-welcome-seen"),J()},o().querySelector("#btn-reset").onclick=()=>{P({title:"Tout effacer ?",message:"Tes parcelles et cultures actuelles seront remplacées par les exemples de démonstration.",confirmLabel:"Oui, réinitialiser",onConfirm:()=>{l=ue(),localStorage.removeItem("guyane-welcome-seen"),c("Exemples rechargés"),v=null,g="accueil",m(),J()}})}}function m(){document.querySelectorAll(".nav-item").forEach(t=>{t.classList.toggle("active",t.dataset.tab===g)}),g==="accueil"?me():g==="cultures"?be():g==="planning"?he():$e()}function xe(){document.querySelectorAll(".nav-item").forEach(t=>{t.addEventListener("click",()=>{g=t.dataset.tab,g!=="plus"&&(v=null),m()})})}xe();m();J();
