import { ArraySlice, Cell, Table } from "engine";
import { Layout } from "./layout";

export class TableDataWindow {
  private _table: Table;
  private _data: ArraySlice<Cell | null>[];
  private layout: Layout

  constructor(table: Table, layout: Layout) {
    this._table = table;
    this._data = [];
    this.layout = layout;
  }

  public refreshData() {
    this._data = this._table.cellRange(this.layout.startCell, this.layout.endCell);
  }

  get data() {
    return this._data;
  }
}
