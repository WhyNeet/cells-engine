import { Table, Vector2 } from "engine";
import { defaultProperties, Layout } from "./layout";
import { OffscreenRenderer } from "./offscreen";
import { Viewport } from "./viewport";

const DEFAULT_TABLE_CELL_SIZE: Vector2 = [128, 28];

export class TableRenderer {
  private _table: Table;
  private cx: CanvasRenderingContext2D;
  private size: Vector2;
  private scale: number;
  private viewport: Viewport;
  private layout: Layout;

  private renderers: { cell: OffscreenRenderer };

  constructor(table: Table, cx: CanvasRenderingContext2D, scale = 2) {
    this._table = table;
    this.cx = cx;
    this.scale = scale;
    this.size = [0, 0];
    this.viewport = new Viewport();
    this.layout = new Layout(this.viewport, {
      ...defaultProperties,
      cellSize: [
        DEFAULT_TABLE_CELL_SIZE[0] * scale,
        DEFAULT_TABLE_CELL_SIZE[1] * scale,
      ],
    });
    this.renderers = {
      cell: new OffscreenRenderer([
        DEFAULT_TABLE_CELL_SIZE[0] * scale,
        DEFAULT_TABLE_CELL_SIZE[1] * scale,
      ]),
    };
    this.prepareRenderers();
    this.resize();
    this.attachListeners();
  }

  private attachListeners() {
    this.cx.canvas.addEventListener("wheel", (e) => {
      const delta = [e.deltaX * this.scale, e.deltaY * this.scale] as Vector2;
      this.viewport.moveBy(delta);
    });
    this.viewport.addEventListener("change", () => this.draw());
  }

  private prepareRenderers() {
    this.renderers.cell.draw((cx) => {
      cx.strokeStyle = "black";
      cx.fillStyle = "white";
      cx.lineWidth = this.scale;

      cx.strokeRect(
        0,
        0,
        DEFAULT_TABLE_CELL_SIZE[0] * this.scale,
        DEFAULT_TABLE_CELL_SIZE[1] * this.scale,
      );
    });
  }

  public resize() {
    const { height, width } = this.cx.canvas.getBoundingClientRect();
    this.size = [width * this.scale, height * this.scale];
    this.cx.canvas.width = this.size[0];
    this.cx.canvas.height = this.size[1];
    this.viewport.resize(this.size);
  }

  public draw() {
    this.cx.clearRect(0, 0, this.size[0], this.size[1]);

    this.drawCells();
  }

  private drawCells() {
    const [from, to] = this.layout.visibleCells();

    for (let x = from[0]; x < to[0]; x++) {
      for (let y = from[1]; y < to[1]; y++) {
        const layout = this.layout.forCell([x, y]);
        this.drawCell(layout.cellAnchor);
      }
    }
  }

  private drawCell(position: Vector2) {
    this.cx.strokeStyle = "black";
    this.cx.fillStyle = "white";
    this.cx.lineWidth = this.scale;

    this.cx.drawImage(
      this.renderers.cell.image(),
      position[0],
      position[1],
      DEFAULT_TABLE_CELL_SIZE[0] * this.scale,
      DEFAULT_TABLE_CELL_SIZE[1] * this.scale,
    );
  }
}
