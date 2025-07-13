export type RenderWorkUnit = (cx: CanvasRenderingContext2D) => void;

export class RenderLoop {
  private cx: CanvasRenderingContext2D;
  private pipeline: RenderWorkUnit[];
  private execQueue: RenderWorkUnit[];
  private shouldRender: boolean;
  private isRunning: boolean;

  constructor(cx: CanvasRenderingContext2D) {
    this.cx = cx;
    this.pipeline = [];
    this.execQueue = [];
    this.shouldRender = true;
    this.isRunning = false;
  }

  public add(fn: RenderWorkUnit) {
    this.pipeline.push(fn);
  }

  public enq(fn: RenderWorkUnit) {
    this.execQueue.push(fn);
  }

  public requestRender() {
    this.shouldRender = true;
  }

  public run() {
    this.isRunning = true;
    this.loop();
  }

  public stop() {
    this.isRunning = false;
  }

  private loop() {
    if (!this.isRunning) return;
    if (this.shouldRender) {
      this.runExecQueue();
      this.runPipeline();
      this.shouldRender = false;
    }

    requestAnimationFrame(() => this.loop());
  }

  private runExecQueue() {
    if (!this.execQueue.length) return;
    for (const fn of this.execQueue) fn(this.cx);
    this.execQueue = [];
  }

  private runPipeline() {
    for (const fn of this.pipeline) fn(this.cx);
  }
}
