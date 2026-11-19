export const newSel = () => ({cells:new Set()});
export const key = (row, column) => row + ":" + column;
export const isSelected = (selection, row, column) => selection.cells.has(key(row, column));
export const colFull = (selection, table, column) => table.rows.every((_, row) => isSelected(selection, row, column));
export const rowFull = (selection, table, row) => table.cols.every((_, column) => isSelected(selection, row, column));
export const allFull = (selection, table) => table.rows.every((_, row) => rowFull(selection, table, row));

export function setCells(selection, cells, on){
  cells.forEach(([row, column]) => on ? selection.cells.add(key(row, column)) : selection.cells.delete(key(row, column)));
}

export function toggleCell(selection, row, column){
  setCells(selection, [[row, column]], !isSelected(selection, row, column));
  return {ok:true};
}

export function toggleCol(selection, table, column){
  setCells(selection, table.rows.map((_, row) => [row, column]), !colFull(selection, table, column));
  return {ok:true};
}

export function toggleRow(selection, table, row){
  setCells(selection, table.cols.map((_, column) => [row, column]), !rowFull(selection, table, row));
  return {ok:true};
}

export function toggleAll(selection, table){
  const on = !allFull(selection, table);
  table.rows.forEach((_, row) => setCells(selection, table.cols.map((_, column) => [row, column]), on));
  return {ok:true};
}

export function selectedCells(selection, table){
  const out = [];
  table.rows.forEach((_, row) => table.cols.forEach((_, column) => {
    if (isSelected(selection, row, column)) out.push([row, column]);
  }));
  return out;
}

export function evaluate(level, selections){
  const expected = level.expected();
  const errors = [];
  level.tables.forEach((table, index) => {
    const selected = selectedCells(selections[index], table);
    const desired = expected[index];
    const selectedKeys = new Set(selected.map(([row, column]) => key(row, column)));
    const expectedKeys = new Set(desired.map(([row, column]) => key(row, column)));
    if (selectedKeys.size === expectedKeys.size && [...selectedKeys].every(item => expectedKeys.has(item))) return;

    const uniq = (cells, position) => new Set(cells.map(cell => cell[position]));
    const selectedRows = uniq(selected, 0), desiredRows = uniq(desired, 0);
    const selectedColumns = uniq(selected, 1), desiredColumns = uniq(desired, 1);
    const diff = (a, b) => [...a].filter(item => !b.has(item));
    const tag = level.tables.length > 1 ? " (tabel " + table.name + ")" : "";
    if (desired.length === 0 && selected.length) { errors.push("Tabel " + table.name + " hoort niet in het resultaat."); return; }
    if (diff(selectedRows, desiredRows).length) errors.push("Je hebt te veel rijen teruggegeven" + tag + "; controleer de " + level.clause + ".");
    if (diff(selectedColumns, desiredColumns).length) errors.push("Je hebt te veel kolommen meegestuurd" + tag + "; controleer de SELECT-lijst.");
    if (diff(desiredRows, selectedRows).length) errors.push("Je mist rijen" + tag + "; controleer de " + level.clause + ".");
    if (diff(desiredColumns, selectedColumns).length) errors.push("Je mist kolommen" + tag + "; controleer de SELECT-lijst.");
    if (!errors.length) errors.push("De juiste rijen en kolommen zijn geraakt" + tag + ", maar sommige cellen kloppen niet. Kijk naar het snijpunt.");
  });
  return errors;
}
