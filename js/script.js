/* =====================================================
   1. LEVEL-DATA
   Elke level heeft een query, tabellen en een functie
   "expected" die de verwachte cellen teruggeeft.
   Een cel is een paar [rij, kolom], per tabel.
   ===================================================== */
const studenten = {name:"studenten", cols:["id","naam","email","klas","stad","jaar"], rows:[[1,"Anna","anna@campus.nl","D1A","Breda",1],[2,"Bram","bram@campus.nl","D1B","Tilburg",1],[3,"Carla","carla@campus.nl","D2A","Eindhoven",2],[4,"Daan","daan@campus.nl","D3A","Utrecht",3],[5,"Eva","eva@campus.nl","D2B","Amsterdam",2],[6,"Fatima","fatima@campus.nl","D1A","Breda",1],[7,"Gijs","gijs@campus.nl","D3B","Roosendaal",3],[8,"Hanne","hanne@campus.nl","D2A","Den Bosch",2],[9,"Iris","iris@campus.nl","D1B","Tilburg",1],[10,"Joris","joris@campus.nl","D3A","Breda",3]]};
const vakken = {name:"vakken", cols:["id","naam","niveau","punten","docent","lokaal"], rows:[[1,"SQL basis","beginner",3,1,"B101"],[2,"Webdesign","beginner",4,2,"C204"],[3,"Data analyse","gevorderd",5,3,"B203"],[4,"JavaScript","gevorderd",4,4,"C201"],[5,"UX onderzoek","beginner",3,5,"A105"],[6,"Databases","gevorderd",5,6,"B204"],[7,"Projectmanagement","beginner",4,7,"A201"],[8,"Cybersecurity","gevorderd",5,8,"B301"]]};
const docenten = {name:"docenten", cols:["id","naam","vak_id","email","kamer","ervaring"], rows:[[1,"De Vries",1,"devries@campus.nl","A101",12],[2,"Jansen",2,"jansen@campus.nl","A102",8],[3,"Bakker",3,"bakker@campus.nl","B201",15],[4,"Smit",4,"smit@campus.nl","B202",6],[5,"Visser",5,"visser@campus.nl","C101",10],[6,"Meijer",6,"meijer@campus.nl","C102",18],[7,"Mulder",7,"mulder@campus.nl","A203",7],[8,"Bos",8,"bos@campus.nl","B302",11]]};
const inschrijvingen = {name:"inschrijvingen", cols:["id","student_id","vak_id","status","cijfer","semester"], rows:[[1,1,1,"actief",8.5,"2026-1"],[2,2,1,"actief",7.2,"2026-1"],[3,3,3,"afgerond",9.0,"2025-2"],[4,4,4,"actief",6.8,"2026-1"],[5,5,2,"actief",7.8,"2026-1"],[6,6,5,"afgerond",8.0,"2025-2"],[7,7,6,"actief",7.4,"2026-1"],[8,8,3,"afgerond",9.5,"2025-2"],[9,9,7,"actief",6.5,"2026-1"],[10,10,8,"actief",8.7,"2026-1"],[11,1,6,"afgerond",8.2,"2025-2"],[12,3,8,"actief",7.9,"2026-1"]]};
const lokalen = {name:"lokalen", cols:["id","gebouw","lokaal","capaciteit","type","verdieping"], rows:[[1,"A","A101",24,"werkcollege",1],[2,"A","A201",36,"collegezaal",2],[3,"B","B101",20,"practicum",1],[4,"B","B203",48,"collegezaal",2],[5,"B","B301",18,"project",3],[6,"C","C201",32,"collegezaal",2],[7,"C","C204",40,"practicum",2],[8,"C","C301",60,"aula",3]]};

// Hulpfunctie: alle cellen van gekozen rijen x gekozen kolommen
const cellsOf = (rows, cols) => rows.flatMap(r => cols.map(c => [r, c]));
const all = t => cellsOf(t.rows.map((_, i) => i), t.cols.map((_, i) => i));

const LEVELS = [
  {query:"SELECT * FROM studenten;", hint:"Tip: de checkbox linksboven selecteert de hele tabel.", clause:"FROM-clausule",
   tables:[studenten], expected:()=>[all(studenten)]},
  {query:"SELECT naam, klas, stad FROM studenten;", hint:"Tip: klik op een kolomnaam om die hele kolom te selecteren.", clause:"SELECT-lijst",
   tables:[studenten], expected:()=>[cellsOf(studenten.rows.map((_, i) => i),[1,3,4])]},
  {query:"SELECT * FROM vakken WHERE niveau = gevorderd;", hint:"Tip: gebruik de checkbox links van een rij.", clause:"WHERE-clausule",
   tables:[vakken], expected:()=>[cellsOf([2,3,5,7],[0,1,2,3,4,5])]},
  {query:"SELECT student_id, cijfer FROM inschrijvingen WHERE cijfer >= 8;", hint:"Tip: klik losse cellen op het snijpunt van rij en kolom.", clause:"WHERE-clausule",
   tables:[inschrijvingen], expected:()=>[cellsOf([0,2,5,7,9,10],[1,4])]},
  {query:"SELECT lokaal, capaciteit FROM lokalen WHERE capaciteit > 30;", hint:"Tip: selecteer de volledige rijen die aan de voorwaarde voldoen.", clause:"WHERE-clausule",
   tables:[lokalen], expected:()=>[cellsOf([1,3,5,6,7],[2,3])]},
  {query:"SELECT docenten.naam, vakken.naam FROM docenten JOIN vakken ON docenten.vak_id = vakken.id;", hint:"Tip: selecteer alleen de kolommen die in de SELECT-lijst staan.", clause:"ON-clausule",
   tables:[docenten, vakken], expected:()=>[cellsOf([0,1,2,3,4,5,6,7],[1]), cellsOf([0,1,2,3,4,5,6,7],[1])]},
  {query:"SELECT studenten.naam, inschrijvingen.status FROM studenten JOIN inschrijvingen ON studenten.id = inschrijvingen.student_id WHERE status = actief;", hint:"Tip: selecteer uit beide tabellen alleen de gegevens die een match hebben.", clause:"ON-clausule",
   tables:[studenten, inschrijvingen], expected:()=>[cellsOf([0,1,2,3,4,6,8,9],[1]), cellsOf([0,1,3,4,6,8,9,11],[3])]}
];

const ALL_TABLES = [...new Set(LEVELS.flatMap(lv => lv.tables))];

/* =====================================================
   2. STATE EN LOGICA (geen DOM hier)
   Per tabel bewaren we maar een ding: de set geselecteerde
   cellen ("rij:kol"). Kop, rijvakje en hoek zijn afgeleid:
   ze staan aan als alle cellen onder hen aan staan.
   ===================================================== */
let level = 0;
let sels = [];   // een selectie-object per tabel
let selectedTable = 0;
let solved = false;

const newSel = () => ({cells:new Set()});

const key = (r, c) => r + ":" + c;
const isSelected = (s, r, c) => s.cells.has(key(r, c));

// Afgeleide status: staat de hele kolom, rij of tabel aan?
const colFull = (s, t, c) => t.rows.every((_, r) => isSelected(s, r, c));
const rowFull = (s, t, r) => t.cols.every((_, c) => isSelected(s, r, c));
const allFull = (s, t) => t.rows.every((_, r) => rowFull(s, t, r));

// Zet een groep cellen aan of uit. Andere cellen blijven ongemoeid.
function setCells(s, list, on){
  list.forEach(([r, c]) => on ? s.cells.add(key(r, c)) : s.cells.delete(key(r, c)));
}

function toggleCell(s, r, c){
  setCells(s, [[r, c]], !isSelected(s, r, c));
  return {ok:true};
}
// Kop klikken: staat de kolom vol, dan alles uit. Anders alles aan (ook bij half gevuld).
function toggleCol(s, t, c){
  setCells(s, t.rows.map((_, r) => [r, c]), !colFull(s, t, c));
  return {ok:true};
}
function toggleRow(s, t, r){
  setCells(s, t.cols.map((_, c) => [r, c]), !rowFull(s, t, r));
  return {ok:true};
}
function toggleAll(s, t){
  const on = !allFull(s, t);
  t.rows.forEach((_, r) => setCells(s, t.cols.map((_, c) => [r, c]), on));
  return {ok:true};
}

// Alle geselecteerde cellen van een tabel als lijst van [rij, kol]
function selectedCells(s, t){
  const out = [];
  t.rows.forEach((_, r) => t.cols.forEach((_, c) => { if (isSelected(s, r, c)) out.push([r, c]); }));
  return out;
}

// Vergelijk selectie met verwachte output en maak foutmeldingen
function evaluate(lv, sels){
  const exp = lv.expected();
  const errors = [];
  lv.tables.forEach((t, i) => {
    const S = selectedCells(sels[i], t), E = exp[i];
    const key = ([r, c]) => r + ":" + c;
    const sk = new Set(S.map(key)), ek = new Set(E.map(key));
    if (sk.size === ek.size && [...sk].every(k => ek.has(k))) return;
    const uniq = (arr, n) => new Set(arr.map(x => x[n]));
    const sR = uniq(S, 0), eR = uniq(E, 0), sC = uniq(S, 1), eC = uniq(E, 1);
    const diff = (a, b) => [...a].filter(x => !b.has(x));
    const tag = lv.tables.length > 1 ? " (tabel " + t.name + ")" : "";
    if (E.length === 0 && S.length) { errors.push("Tabel " + t.name + " hoort niet in het resultaat."); return; }
    if (diff(sR, eR).length) errors.push("Je hebt te veel rijen teruggegeven" + tag + "; controleer de " + lv.clause + ".");
    if (diff(sC, eC).length) errors.push("Je hebt te veel kolommen meegestuurd" + tag + "; controleer de SELECT-lijst.");
    if (diff(eR, sR).length) errors.push("Je mist rijen" + tag + "; controleer de " + lv.clause + ".");
    if (diff(eC, sC).length) errors.push("Je mist kolommen" + tag + "; controleer de SELECT-lijst.");
    if (!errors.length) errors.push("De juiste rijen en kolommen zijn geraakt" + tag + ", maar sommige cellen kloppen niet. Kijk naar het snijpunt.");
  });
  return errors;
}

/* =====================================================
   3. DOM-RENDERING (leest alleen de state)
   ===================================================== */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

function showMsg(type, text){ const m = $("msg"); m.className = type; m.innerHTML = text; }
function shake(node){ node.classList.remove("shake"); void node.offsetWidth; node.classList.add("shake"); }

function act(result, node){
  if (!result.ok){ showMsg("info", esc(result.msg)); shake(node); return; }
  $("msg").className = ""; render();
}

function renderTable(t, s){
  const box = el("div", "tbl");
  box.appendChild(el("h3", "mono", t.name));
  const wrap = el("div", "scroll"), table = el("table", "mono");
  const head = el("tr");
  const corner = el("th", "corner");
  const cb = el("span", "box" + (allFull(s, t) ? " on" : "")); cb.title = "Hele tabel";
  cb.onclick = () => act(toggleAll(s, t), cb);
  corner.appendChild(cb); head.appendChild(corner);
  t.cols.forEach((name, c) => {
    const th = el("th", "col" + (colFull(s, t, c) ? " on" : ""), name);
    th.onclick = () => act(toggleCol(s, t, c), th);
    head.appendChild(th);
  });
  table.appendChild(head);
  t.rows.forEach((row, r) => {
    const tr = el("tr"), rb = el("td", "rowbox");
    const b = el("span", "box" + (rowFull(s, t, r) ? " on" : ""));
    b.onclick = () => act(toggleRow(s, t, r), b);
    rb.appendChild(b); tr.appendChild(rb);
    row.forEach((v, c) => {
      const td = el("td", "cell", v);
      if (isSelected(s, r, c)) td.classList.add("loose");
      td.onclick = () => act(toggleCell(s, r, c), td);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  wrap.appendChild(table); box.appendChild(wrap);
  return box;
}

function renderTableTabs(){
  const tabs = $("table-tabs");
  tabs.innerHTML = "";
  ALL_TABLES.forEach((t, i) => {
    const tab = el("button", "table-tab", t.name);
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(i === selectedTable));
    tab.onclick = () => { selectedTable = i; render(); };
    tabs.appendChild(tab);
  });
}

function render(){
  const lv = LEVELS[level];
  $("lvl").textContent = "Level " + (level + 1) + " / " + LEVELS.length;
  $("query").innerHTML = esc(lv.query).replace(/\b(SELECT|FROM|WHERE|AND|JOIN|ON)\b/g, '<span class="kw">$1</span>');
  $("hint").textContent = lv.hint;
  renderTableTabs();
  const holder = $("tables");
  holder.innerHTML = "";
  const table = ALL_TABLES[selectedTable];
  holder.appendChild(renderTable(table, sels[selectedTable]));
  $("run").style.display = solved ? "none" : "";
  $("next").style.display = solved ? "" : "none";
}

function startLevel(n){
  level = n; solved = false;
  sels = ALL_TABLES.map(newSel);
  $("msg").className = ""; render();
}

$("run").onclick = () => {
  const activeSels = LEVELS[level].tables.map(t => sels[ALL_TABLES.indexOf(t)]);
  const errors = evaluate(LEVELS[level], activeSels);
  if (errors.length) return showMsg("err", errors.map(esc).join("<br>"));
  solved = true;
  const last = level === LEVELS.length - 1;
  showMsg("ok", last ? "Query correct. Alle " + LEVELS.length + " levels gehaald. Je bent nu officieel een database." : "Query correct. Resultaat klopt exact.");
  if (last) $("next").textContent = "Opnieuw beginnen"; else $("next").textContent = "Volgend level";
  render();
};
$("reset").onclick = () => startLevel(level);
$("next").onclick = () => startLevel(level === LEVELS.length - 1 ? 0 : level + 1);

startLevel(0);
