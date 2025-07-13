import { CellUpdateBuilder, Table } from "engine";
import { TableRenderer } from "renderer";

const canvas = document.getElementById("spreadsheet")! as HTMLCanvasElement;
const cx = canvas.getContext("2d")!;

const table = new Table();
table.initCell([0, 0]);
table.updateCell([0, 0], CellUpdateBuilder.content().data("Hello world! Cells engine is working fine."))
const renderer = new TableRenderer(table, cx);

renderer.requestResize();

window.addEventListener("resize", () => renderer.requestResize());
