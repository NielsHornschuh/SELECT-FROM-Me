import {LEVELS, ALL_TABLES} from "./data.js";
import {newSel,evaluate,selectedCells} from "./selection.js";
import {$,esc,el} from "./dom.js";
import {renderTable} from "./table.js";

let level = 0;
let selections = [];
let selectedTable = 0;
let solved = false;

function showMessage(type, text){
  const message = $("msg");
  message.className = type;
  message.innerHTML = text;
}

function renderTableTabs(){
  const tabs = $("table-tabs");
  tabs.innerHTML = "";
  ALL_TABLES.forEach((table, index) => {
    const tab = el("button", "table-tab", table.name);
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(index === selectedTable));
    tab.onclick = () => { selectedTable = index; render(); };
    tabs.appendChild(tab);
  });
}

function render(){
  const current = LEVELS[level];
  $("lvl").textContent = "Level " + (level + 1) + " / " + LEVELS.length;
  $("query").innerHTML = esc(current.query).replace(/\b(SELECT|FROM|WHERE|AND|JOIN|ON)\b/g, '<span class="kw">$1</span>');
  $("hint").textContent = current.hint;
  renderTableTabs();
  const holder = $("tables");
  holder.innerHTML = "";
  const table = ALL_TABLES[selectedTable];
  holder.appendChild(renderTable(table, selections[selectedTable], render));
  $("run").style.display = solved ? "none" : "";
  $("next").style.display = solved ? "" : "none";
}

function startLevel(index){
  level = index;
  solved = false;
  selections = ALL_TABLES.map(newSel);
  $("msg").className = "";
  render();
}

export function initGame(){
  if (!$("run")) return;

  $("run").onclick = () => {
    const activeSelections = LEVELS[level].tables.map(table => selections[ALL_TABLES.indexOf(table)]);
    const errors = evaluate(LEVELS[level], activeSelections);
    if (errors.length) return showMessage("err", errors.map(esc).join("<br>"));

    solved = true;
    const last = level === LEVELS.length - 1;
    showMessage("ok", last
      ? "Query correct. Alle " + LEVELS.length + " levels gehaald. Je bent nu officieel een database."
      : "Query correct. Resultaat klopt exact.");
    $("next").textContent = last ? "Game voltooien" : "Volgend level";
    render();
  };

  $("reset").onclick = () => startLevel(level);
  $("next").onclick = () => {
    if (level === LEVELS.length - 1) {
      window.location.href = "victory.html";
      return;
    }
    startLevel(level + 1);
  };
  startLevel(0);
}
