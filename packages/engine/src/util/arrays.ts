export class ArraySlice<T> {
  private source: T[];
  private from: number;
  private to: number;

  constructor(source: T[], from: number, to: number) {
    this.source = source;
    if (from > to) throw new Error("[ArraySlice] Array slice start must be before end.");
    if (from < 0) throw new Error("[ArraySlice] Array slice cannot start at a negative index.");
    this.from = from;
    this.to = to;
  }

  public index(index: number): T | null {
    const idx = this.from + index;
    if (idx >= this.to) return null;

    return this.source[idx];
  }
}
