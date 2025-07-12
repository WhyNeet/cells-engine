import { Table } from "engine";
import { TableRenderer } from "renderer";

const canvas = document.getElementById("spreadsheet")! as HTMLCanvasElement;
const cx = canvas.getContext("2d")!;

const table = new Table();
const renderer = new TableRenderer(table, cx);

renderer.resize();

console.time("Draw");
renderer.draw();
console.timeEnd("Draw");
