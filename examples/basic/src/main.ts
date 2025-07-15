import { CellUpdateBuilder, Table, type Vector2 } from "engine";
import { SpreadsheetInteractivity, TableRenderer, RendererProperties } from "renderer";

const canvas = document.getElementById("spreadsheet")! as HTMLCanvasElement;
const cx = canvas.getContext("2d")!;

const table = new Table();
table.initCell([0, 0]);
table.updateCell([0, 0], CellUpdateBuilder.content().data("Hello world! Cells engine is working fine."))
const renderer = new TableRenderer(table, cx, new RendererProperties([128, 28], 28, 48, 20, 2, [8, 6]));
const interactivity = new SpreadsheetInteractivity(renderer.bundle());

const selection = document.getElementById("selection")!;
selection.style.display = "none";

const editInput = document.getElementById("edit-input")! as HTMLInputElement;
editInput.style.display = "none";

let cellPos: Vector2 | null = null;

interactivity.addEventListener("select", () => {
  cellPos = interactivity.selectedCell;

  if (cellPos) {
    selection.style.display = "block";
    selection.style.top = (cellPos[1] * 28 - renderer.view.anchorUnscaled[1]) + "px";
    selection.style.left = (cellPos[0] * 128 - renderer.view.anchorUnscaled[0]) + "px";
  }
  else selection.style.display = "none";
});

interactivity.addEventListener("editStart", () => {
  if (!cellPos) return;

  editInput.value = table.cellAt(cellPos)?.data?.toString() ?? "";
  editInput.selectionStart = 0;
  editInput.selectionEnd = 0;
  editInput.style.display = "block";
  editInput.focus();
});

editInput.addEventListener("input", (e) => {
  if (!cellPos) return;

  const value = (e.currentTarget! as HTMLInputElement).value;
  const cell = table.cellAt(cellPos) ?? table.initCell(cellPos);

  cell.data = value;
});

interactivity.addEventListener("editEnd", () => {
  editInput.style.display = "none";
  renderer.requestRedraw();
});

renderer.view.addEventListener("change", () => {
  if (!cellPos) return;
  selection.style.top = (cellPos[1] * 28 - renderer.view.anchorUnscaled[1]) + "px";
  selection.style.left = (cellPos[0] * 128 - renderer.view.anchorUnscaled[0]) + "px";
});


renderer.requestResize();

window.addEventListener("resize", () => renderer.requestResize());
