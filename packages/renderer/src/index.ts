import { ArraySlice, Cell, Table, Vector2 } from "engine";
import { defaultProperties, Layout } from "./layout";
import { OffscreenRenderer } from "./offscreen";
import { Viewport } from "./viewport";
import { RenderLoop } from "./loop";

const DEFAULT_TABLE_CELL_SIZE: Vector2 = [128, 28];
const DEFAULT_LEFT_BAR_SIZE = 48;
const DEFAULT_TOP_BAR_SIZE = 28;

export class TableRenderer {
  private _table: Table;
  private _data: ArraySlice<Cell | null>[];
  private loop: RenderLoop;
  private canvas: HTMLCanvasElement;
  private size: Vector2;
  private scale: number;
  private viewport: Viewport;
  private layout: Layout;

  private renderers: { cell: OffscreenRenderer };

  constructor(table: Table, cx: CanvasRenderingContext2D, scale = 2) {
    this._table = table;
    this.canvas = cx.canvas;
    this.loop = new RenderLoop(cx);
    this.scale = scale;
    this.size = [0, 0];
    this.viewport = new Viewport();
    this.layout = new Layout(this.viewport, {
      ...defaultProperties,
      cellSize: [
        DEFAULT_TABLE_CELL_SIZE[0] * scale,
        DEFAULT_TABLE_CELL_SIZE[1] * scale,
      ],
      topBarHeight: DEFAULT_TOP_BAR_SIZE * scale,
      leftBarWidth: DEFAULT_LEFT_BAR_SIZE * scale
    });
    this.renderers = {
      cell: new OffscreenRenderer([
        DEFAULT_TABLE_CELL_SIZE[0] * scale,
        DEFAULT_TABLE_CELL_SIZE[1] * scale,
      ]),
    };
    this._data = [];

    this.prepareLoop();
    this.attachListeners();
    this.prepareRenderers();
    this.loop.run();
  }

  private prepareLoop() {
    this.loop.add(this.clear.bind(this));
    this.loop.add(this.drawCells.bind(this));
    this.loop.add(this.drawBars.bind(this));
  }

  private attachListeners() {
    this.canvas.addEventListener("wheel", (e) => {
      const delta = [e.deltaX * this.scale, e.deltaY * this.scale] as Vector2;
      this.viewport.moveBy(delta);
    });
    this.viewport.addEventListener("change", () => this.loop.requestRender());
    this.layout.addEventListener("change", () => this.refreshData());
  }

  private prepareRenderers() {
    this.renderers.cell.draw((cx) => {
      cx.strokeStyle = "black";
      cx.fillStyle = "white";
      cx.lineWidth = this.scale;

      cx.rect(
        0,
        0,
        DEFAULT_TABLE_CELL_SIZE[0] * this.scale,
        DEFAULT_TABLE_CELL_SIZE[1] * this.scale,
      );
      cx.fill();
      cx.stroke();
    });
  }

  private refreshData() {
    this._data = this._table.cellRange(this.layout.startCell, this.layout.endCell);
  }

  public requestResize() {
    this.loop.enq(this.resize.bind(this));
    this.loop.requestRender();
  }

  private resize() {
    const { height, width } = this.canvas.getBoundingClientRect();
    this.size = [width * this.scale, height * this.scale];
    this.canvas.width = this.size[0];
    this.canvas.height = this.size[1];
    this.viewport.resize(this.size);
  }

  private clear(cx: CanvasRenderingContext2D) {
    cx.clearRect(0, 0, this.size[0], this.size[1]);
  }

  private drawBars(cx: CanvasRenderingContext2D) {
    cx.fillStyle = "white";
    cx.strokeStyle = "black";
    cx.textBaseline = "middle";
    cx.textAlign = "center";
    cx.lineWidth = this.scale;

    cx.rect(0, 0, this.size[0], DEFAULT_TOP_BAR_SIZE * this.scale);
    cx.fill();
    cx.stroke();
    cx.rect(0, 0, DEFAULT_LEFT_BAR_SIZE * this.scale, this.size[1]);
    cx.fill();
    cx.stroke();

    cx.fillStyle = "black";

    const [from, to] = this.layout.visibleCells();

    for (let x = from[0]; x < to[0]; x++) {
      const { anchor, contentAnchor } = this.layout.forTopBar(x);

      cx.beginPath();
      cx.moveTo(anchor[0] + DEFAULT_TABLE_CELL_SIZE[0] * this.scale, anchor[1]);
      cx.lineTo(anchor[0] + DEFAULT_TABLE_CELL_SIZE[0] * this.scale, anchor[1] + DEFAULT_TOP_BAR_SIZE * this.scale);
      cx.stroke();

      cx.fillText((x + 1).toString(), contentAnchor[0], contentAnchor[1]);
    }

    for (let y = from[1]; y < to[1]; y++) {
      const { anchor, contentAnchor } = this.layout.forLeftBar(y);

      cx.beginPath();
      cx.moveTo(anchor[0], anchor[1] + DEFAULT_TABLE_CELL_SIZE[1] * this.scale);
      cx.lineTo(anchor[0] + DEFAULT_LEFT_BAR_SIZE * this.scale, anchor[1] + DEFAULT_TABLE_CELL_SIZE[1] * this.scale);
      cx.stroke();

      cx.fillText((y + 1).toString(), contentAnchor[0], contentAnchor[1]);
    }

    cx.fillStyle = "white";
    cx.rect(0, 0, DEFAULT_LEFT_BAR_SIZE * this.scale, DEFAULT_TABLE_CELL_SIZE[1] * this.scale);
    cx.fill();
    cx.stroke();
  }

  private drawCells(cx: CanvasRenderingContext2D) {
    const [from, to] = this.layout.visibleCells();

    for (let x = from[0]; x < to[0]; x++) {
      for (let y = from[1]; y < to[1]; y++) {
        const layout = this.layout.forCell([x, y]);
        this.drawCell(layout.cellAnchor, cx);
        this.drawCellContents(
          [x, y],
          layout.contentAnchor,
          layout.availableContentArea,
          cx
        );
      }
    }
  }

  private drawCell(position: Vector2, cx: CanvasRenderingContext2D) {
    cx.strokeStyle = "black";
    cx.fillStyle = "white";
    cx.lineWidth = this.scale;

    cx.drawImage(
      this.renderers.cell.image(),
      position[0],
      position[1],
      DEFAULT_TABLE_CELL_SIZE[0] * this.scale,
      DEFAULT_TABLE_CELL_SIZE[1] * this.scale,
    );
  }

  private drawCellContents(position: Vector2, viewportPosition: Vector2, size: Vector2, cx: CanvasRenderingContext2D) {
    const text = this._data[position[0]]?.index(position[1])?.data?.toString();
    if (!text) return;

    cx.fillStyle = "black";
    cx.font = `${size[1]}px monospace`;
    cx.textAlign = "left";
    cx.textBaseline = "middle";
    cx.fillText(
      text,
      viewportPosition[0],
      viewportPosition[1],
    );
  }
}
