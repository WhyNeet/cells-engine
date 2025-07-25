import { Vector2 } from "engine";

export class Viewport extends EventTarget {
  private _size: Vector2;
  private _anchor: Vector2;
  private _scale: number;

  constructor(scale: number) {
    super();
    this._size = [0, 0];
    this._anchor = [0, 0];
    this._scale = scale;
  }

  public resize(size: Vector2) {
    this._size = size;
    this.dispatchEvent(new Event("change"));
  }

  public moveTo(anchor: Vector2) {
    this._anchor = anchor;
    this.dispatchEvent(new Event("change"));
  }

  public moveBy(delta: Vector2) {
    this._anchor[0] = Math.max(this._anchor[0] + delta[0], 0);
    this._anchor[1] = Math.max(this._anchor[1] + delta[1], 0);
    this.dispatchEvent(new Event("change"));
  }

  get size() {
    return this._size;
  }
  get anchor() {
    return this._anchor;
  }
  get anchorUnscaled(): Vector2 {
    return [this._anchor[0] / this.scale, this._anchor[1] / this.scale];
  }

  get scale() {
    return this._scale;
  }
}
