import { DataFormat } from "./data";

export class Cell {
  private _position: CellPosition;
  private _format: DataFormat;
  private _data: unknown;

  constructor(position: CellPosition, format: DataFormat) {
    this._position = position;
    this._format = format;
    this._data = null;
  }

  get position() {
    return this._position;
  }

  get format() {
    return this._format;
  }

  set format(value) {
    this._format = value;
  }

  get data(): number | string | null {
    switch (this.format) {
      case DataFormat.Number: return this._data as number;
      case DataFormat.Text: return this._data as string;
    }
  }

  set data(value: unknown) {
    switch (this.format) {
      case DataFormat.Text: if (typeof value !== "string") throw new Error("Invalid value data format.")
      case DataFormat.Number: if (typeof value !== "number") throw new Error("Invalid value data format.")
    }
    this._data = value;
  }
}

export type CellPosition = [number, number];


export class CellUpdateBuilder {
  public static content() {
    return new CellContentUpdate();
  }

  public static format() {
    return new CellFormatUpdate();
  }
}

export type AnyCellUpdate = CellFormatUpdate | CellContentUpdate;

export class CellFormatUpdate {
  private _data: DataFormat | null = null;
  private _next: AnyCellUpdate | null = null;

  public data(data: DataFormat) {
    this._data = data;

    return this;
  }

  public chain(update: AnyCellUpdate) {
    this._next = update;

    return this;
  }

  public unwrap(): [DataFormat | null, AnyCellUpdate | null] {
    return [this._data, this._next];
  }
}

export class CellContentUpdate {
  private _data: unknown | null = null;
  private _next: AnyCellUpdate | null = null;

  public data(data: unknown) {
    this._data = data;

    return this;
  }

  public chain(update: AnyCellUpdate) {
    this._next = update;

    return this;
  }

  public unwrap(): [unknown | null, AnyCellUpdate | null] {
    return [this._data, this._next];
  }
}
