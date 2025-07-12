import { Vector2 } from "engine";

export class OffscreenRenderer {
  private cx: CanvasRenderingContext2D;

  constructor(size: Vector2) {
    this.cx = document.createElement("canvas").getContext("2d")!;
    this.cx.canvas.width = size[0];
    this.cx.canvas.height = size[1];
  }

  public draw(f: (cx: CanvasRenderingContext2D) => void) {
    f(this.cx);
  }

  public image() {
    return this.cx.canvas;
  }
}
