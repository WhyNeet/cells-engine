import { Table, Vector2 } from "engine";
import { RenderingBundle } from "../bundle";
import { Viewport } from "../viewport";
import { Layout } from "../layout";
import { RenderLoop } from "../loop";
import { TableDataWindow } from "../data";

export class SpreadsheetInteractivity extends EventTarget {
  private _table: Table;
  private _data: TableDataWindow;
  private canvas: HTMLCanvasElement;
  private scale: number;
  private viewport: Viewport;
  private layout: Layout;
  private loop: RenderLoop;
  private _selectedCell: Vector2 | null;
  private _editedCell: Vector2 | null;

  constructor(bundle: RenderingBundle) {
    super();

    this._table = bundle.table;
    this.canvas = bundle.canvas;
    this.scale = bundle.scale;
    this.viewport = bundle.viewport;
    this.layout = bundle.layout;
    this.loop = bundle.loop;
    this._data = bundle.data;
    this._selectedCell = null;
    this._editedCell = null;

    this.attachListeners();
  }

  private attachListeners() {
    this.canvas.addEventListener("wheel", (e) => {
      const delta = [e.deltaX * this.scale, e.deltaY * this.scale] as Vector2;
      this.viewport.moveBy(delta);
    });
    this.canvas.addEventListener("mousedown", (e) => this.handleClick([e.clientX, e.clientY]));
    this.canvas.addEventListener("keydown", (e) => this.handleKey(e.key));
    this.canvas.addEventListener("dblclick", () => this.handleDoubleClick());
    this.viewport.addEventListener("change", () => this.loop.requestRender());
    this.layout.addEventListener("change", () => this._data.refreshData());
  }

  private handleClick(position: Vector2) {
    const { top, left } = this.canvas.getBoundingClientRect();
    const relativePosition: Vector2 = [position[0] - left, position[1] - top];
    const cellPosition = this.layout.mousePositionToCell(relativePosition);

    this._selectedCell = cellPosition;

    if (this._editedCell) this.dispatchEvent(new Event("editEnd"));

    this.dispatchEvent(new Event("select"));
  }

  private handleDoubleClick() {
    const cell = this.selectedCell!;
    this._editedCell = cell;

    this.dispatchEvent(new Event("editStart"));
  }

  private handleKey(key: string) {
    switch (key) {
      case "Escape":
        this.stopEditing();
        break;
    }
  }

  public stopEditing() {
    if (!this._editedCell) return;

    this._editedCell = null;
    this.dispatchEvent(new Event("editEnd"));
  }

  get selectedCell() {
    return this._selectedCell;
  }

  get editedCell() {
    return this._editedCell;
  }
}
