import { AnyCellUpdate, Cell, CellContentUpdate, CellFormatUpdate } from "./cell";
import { DataFormat } from "./data";
import { ArraySlice, Vector2 } from "./util";

export class Table {
  private _cells: Cell[][];

  constructor() {
    this._cells = [];
  }

  public cellAt(position: Vector2): Cell | null {
    return this._cells[position[0]]?.[position[1]] ?? null;
  }

  public cellRange(from: Vector2, to: Vector2): ArraySlice<Cell | null>[] {
    const rows = [];

    for (let i = from[1]; i < to[1]; i++) {
      const slice = new ArraySlice(this._cells[i] ?? Array(to[0] - from[0]).map(() => null), from[0], to[0]);
      rows.push(slice);
    }

    return rows;
  }

  public initCell(position: Vector2) {
    if (!this._cells[position[0]]) this._cells[position[0]] = [];

    const row = this._cells[position[0]];
    row[position[1]] = new Cell(position, DataFormat.Text);
  }

  public updateCell(position: Vector2, update: AnyCellUpdate) {
    const cellAt = this.cellAt(position);
    if (!cellAt) throw new Error(`Cell at position \`${position}\` is not initialized.`);
    const cell = cellAt!;

    function updateInternal(update: AnyCellUpdate) {
      if (update instanceof CellFormatUpdate) {
        const [data, next] = update.unwrap();
        if (!data) throw new Error("Empty update data.");
        cell.format = data;
        if (next) updateInternal(next);
      } else if (update instanceof CellContentUpdate) {
        const [data, next] = update.unwrap();
        if (!data) throw new Error("Empty update data.");
        cell.data = data as unknown;
        if (next) updateInternal(next);
      }
    }

    updateInternal(update);
  }
}
