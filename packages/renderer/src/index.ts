import { Table, Vector2 } from "engine";
import { Layout } from "./layout";
import { OffscreenRenderer } from "./offscreen";
import { Viewport } from "./viewport";
import { RenderLoop } from "./loop";
import { RenderingBundle } from "./bundle";
import { TableDataWindow } from "./data";

export class TableRenderer {
  private _table: Table;
  private _data: TableDataWindow;
  private loop: RenderLoop;
  private canvas: HTMLCanvasElement;
  private size: Vector2;
  private viewport: Viewport;
  private layout: Layout;
  private properties: RendererProperties;

  private renderers: { cell: OffscreenRenderer };

  constructor(table: Table, cx: CanvasRenderingContext2D, properties: RendererProperties) {
    this._table = table;
    this.canvas = cx.canvas;
    this.loop = new RenderLoop(cx);
    this.size = [0, 0];
    this.properties = properties;
    this.viewport = new Viewport(properties.scale);
    this.layout = new Layout(this.viewport, properties);
    this.renderers = {
      cell: new OffscreenRenderer(properties.cellSize),
    };
    this._data = new TableDataWindow(this._table, this.layout);

    this.prepareLoop();
    this.prepareRenderers();
    this.loop.run();
  }

  private prepareLoop() {
    this.loop.add(this.clear.bind(this));
    this.loop.add(this.drawCells.bind(this));
    this.loop.add(this.drawBars.bind(this));
  }

  private prepareRenderers() {
    this.renderers.cell.draw((cx) => {
      cx.strokeStyle = "black";
      cx.fillStyle = "white";
      cx.lineWidth = this.properties.scale;

      cx.rect(
        0,
        0,
        this.properties.cellSize[0],
        this.properties.cellSize[1],
      );
      cx.fill();
      cx.stroke();
    });
  }

  public requestResize() {
    this.loop.enq(this.resize.bind(this));
    this.loop.requestRender();
  }

  private resize() {
    const { height, width } = this.canvas.getBoundingClientRect();
    this.size = [width * this.properties.scale, height * this.properties.scale];
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
    cx.lineWidth = this.viewport.scale;

    cx.rect(0, 0, this.size[0], this.properties.topGutterSize);
    cx.fill();
    cx.stroke();
    cx.rect(0, 0, this.properties.leftGutterSize, this.size[1]);
    cx.fill();
    cx.stroke();

    cx.fillStyle = "black";
    cx.font = `${12 * this.viewport.scale}px monospace`;

    const [from, to] = this.layout.visibleCells();

    for (let x = from[0]; x < to[0]; x++) {
      const { anchor, contentAnchor } = this.layout.forTopBar(x);

      cx.beginPath();
      cx.moveTo(anchor[0] + this.properties.cellSize[0], anchor[1]);
      cx.lineTo(anchor[0] + this.properties.cellSize[0], anchor[1] + this.properties.topGutterSize);
      cx.stroke();

      cx.fillText((x + 1).toString(), contentAnchor[0], contentAnchor[1]);
    }

    for (let y = from[1]; y < to[1]; y++) {
      const { anchor, contentAnchor } = this.layout.forLeftBar(y);

      cx.beginPath();
      cx.moveTo(anchor[0], anchor[1] + this.properties.cellSize[1]);
      cx.lineTo(anchor[0] + this.properties.leftGutterSize, anchor[1] + this.properties.cellSize[1]);
      cx.stroke();

      cx.fillText((y + 1).toString(), contentAnchor[0], contentAnchor[1]);
    }

    cx.fillStyle = "white";
    cx.rect(0, 0, this.properties.leftGutterSize, this.properties.cellSize[1]);
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
    cx.lineWidth = this.viewport.scale;

    cx.drawImage(
      this.renderers.cell.image(),
      position[0],
      position[1],
      this.properties.cellSize[0],
      this.properties.cellSize[1],
    );
  }

  private drawCellContents(position: Vector2, viewportPosition: Vector2, size: Vector2, cx: CanvasRenderingContext2D) {
    const text = this._data.data[position[0]]?.index(position[1])?.data?.toString();
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

  public bundle(): RenderingBundle {
    return new RenderingBundle(this._table, this.loop, this.canvas, this.viewport.scale, this.size, this.viewport, this.layout, this._data);
  }
}


export * from "./interactivity";


export class RendererProperties {
  constructor(private _cellSize: Vector2,
    private _topGutterSize: number,
    private _leftGutterSize: number,
    private _maxCellContentHeight: number,
    private _scale: number,
    private _cellPadding: Vector2) {

  }

  get cellSize(): Vector2 {
    return [this._cellSize[0] * this.scale, this._cellSize[1] * this.scale];
  }

  get cellSizeUnscaled(): Vector2 {
    return this._cellSize;
  }

  get topGutterSize() {
    return this._topGutterSize * this.scale;
  }

  get topGutterSizeUnscaled() {
    return this._topGutterSize;
  }

  get leftGutterSize() {
    return this._leftGutterSize * this.scale;
  }

  get leftGutterSizeUnscaled() {
    return this._leftGutterSize;
  }

  get maxCellContentHeight() {
    return this._maxCellContentHeight * this.scale;
  }

  get cellPadding() {
    return [this._cellPadding[0] * this.scale, this._cellPadding[1] * this.scale];
  }

  get scale() {
    return this._scale;
  }
}
