import { Table, Vector2 } from "engine";
import { RenderLoop } from "./loop";
import { Viewport } from "./viewport";
import { Layout } from "./layout";
import { TableDataWindow } from "./data";

export class RenderingBundle {
  constructor(public table: Table, public loop: RenderLoop, public canvas: HTMLCanvasElement, public scale: number, public size: Vector2, public viewport: Viewport, public layout: Layout, public data: TableDataWindow) { }
}
