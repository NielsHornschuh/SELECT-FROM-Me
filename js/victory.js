export function initVictory(){
  const confetti = document.querySelector("#confetti");
  if (!confetti) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const colors = ["#4c9aff", "#3ecf8e", "#c792ea", "#ffd166", "#ff6b6b"];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 90; index++){
    const piece = document.createElement("i");
    piece.style.setProperty("--left", Math.random() * 100 + "%");
    piece.style.setProperty("--delay", (Math.random() * 2.5).toFixed(2) + "s");
    piece.style.setProperty("--duration", (3 + Math.random() * 3).toFixed(2) + "s");
    piece.style.setProperty("--drift", ((Math.random() - 0.5) * 240).toFixed(0) + "px");
    piece.style.setProperty("--spin", (Math.random() * 720 + 360).toFixed(0) + "deg");
    piece.style.setProperty("--color", colors[index % colors.length]);
    piece.style.setProperty("--width", (6 + Math.random() * 6).toFixed(0) + "px");
    piece.style.setProperty("--height", (10 + Math.random() * 10).toFixed(0) + "px");
    fragment.appendChild(piece);
  }
  confetti.appendChild(fragment);
}
