import {allFull,colFull,rowFull,isSelected,toggleAll,toggleCol,toggleRow,toggleCell} from "./selection.js";
import {el,esc} from "./dom.js";

export function act(result, node, rerender){
  if (!result.ok){
    const message = document.getElementById("msg");
    if (message){ message.className = "info"; message.innerHTML = esc(result.msg); }
    node.classList.remove("shake");
    void node.offsetWidth;
    node.classList.add("shake");
    return;
  }
  rerender();
}

export function renderTable(table, selection, rerender){
  const box = el("div", "tbl");
  box.appendChild(el("h3", "mono", table.name));
  const wrap = el("div", "scroll"), tableElement = el("table", "mono");
  const head = el("tr");
  const corner = el("th", "corner");
  const checkbox = el("span", "box" + (allFull(selection, table) ? " on" : ""));
  checkbox.title = "Hele tabel";
  checkbox.onclick = () => act(toggleAll(selection, table), checkbox, rerender);
  corner.appendChild(checkbox);
  head.appendChild(corner);

  table.cols.forEach((name, column) => {
    const th = el("th", "col" + (colFull(selection, table, column) ? " on" : ""), name);
    th.onclick = () => act(toggleCol(selection, table, column), th, rerender);
    head.appendChild(th);
  });
  tableElement.appendChild(head);

  table.rows.forEach((row, rowIndex) => {
    const tr = el("tr"), rowBox = el("td", "rowbox");
    const checkbox = el("span", "box" + (rowFull(selection, table, rowIndex) ? " on" : ""));
    checkbox.onclick = () => act(toggleRow(selection, table, rowIndex), checkbox, rerender);
    rowBox.appendChild(checkbox);
    tr.appendChild(rowBox);
    row.forEach((value, column) => {
      const td = el("td", "cell", value);
      if (isSelected(selection, rowIndex, column)) td.classList.add("loose");
      td.onclick = () => act(toggleCell(selection, rowIndex, column), td, rerender);
      tr.appendChild(td);
    });
    tableElement.appendChild(tr);
  });
  wrap.appendChild(tableElement);
  box.appendChild(wrap);
  return box;
}
