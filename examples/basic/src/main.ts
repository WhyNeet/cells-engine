import { CellUpdateBuilder, Table } from "engine";
import { SpreadsheetInteractivity, TableRenderer, RendererProperties } from "renderer";

const canvas = document.getElementById("spreadsheet")! as HTMLCanvasElement;
const cx = canvas.getContext("2d")!;

const table = new Table();
table.initCell([0, 0]);
table.updateCell([0, 0], CellUpdateBuilder.content().data("Hello world! Cells engine is working fine."))
const renderer = new TableRenderer(table, cx, new RendererProperties([128, 28], 28, 48, 20, 2, [8, 6]));
const interactivity = new SpreadsheetInteractivity(renderer.bundle());

renderer.requestResize();

window.addEventListener("resize", () => renderer.requestResize());
