import {tutorialPracticeTable} from "./data.js";
import {newSel,selectedCells} from "./selection.js";
import {$} from "./dom.js";
import {renderTable} from "./table.js";

function initPracticeTable(){
  if (!$("tutorial-tables")) return;

  const holder = $("tutorial-tables");
  const feedback = $("tutorial-selection-feedback");
  const selection = newSel();

  function render(){
    holder.innerHTML = "";
    holder.appendChild(renderTable(tutorialPracticeTable, selection, render));
    const count = selectedCells(selection, tutorialPracticeTable).length;
    feedback.textContent = count === 0
      ? "Nog niets geselecteerd."
      : count + " " + (count === 1 ? "cel" : "cellen") + " geselecteerd.";
  }

  $("tutorial-selection-reset").onclick = () => {
    selection.cells.clear();
    render();
  };
  render();
}

function initTutorialSteps(){
  if (!$("tutorial-progress")) return;

  const steps = [...document.querySelectorAll(".tutorial-step")];
  const progress = $("tutorial-progress");
  const back = $("tutorial-back");
  const next = $("tutorial-next");
  const start = $("start-game");
  let current = 0;

  function render(){
    steps.forEach((step, index) => { step.hidden = index !== current; });
    progress.textContent = (current + 1) + " / " + steps.length;
    back.disabled = current === 0;
    const last = current === steps.length - 1;
    next.hidden = last;
    start.hidden = !last;
  }

  back.onclick = () => {
    if (current > 0) { current--; render(); }
  };
  next.onclick = () => {
    if (current < steps.length - 1) { current++; render(); }
  };
  render();
}

export function initTutorial(){
  initPracticeTable();
  initTutorialSteps();
}
