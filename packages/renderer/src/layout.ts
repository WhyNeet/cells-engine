import { Vector2 } from "engine";
import { Viewport } from "./viewport";
import { arrayEq } from "./util";
import { RendererProperties } from ".";

export class Layout extends EventTarget {
  private viewport: Viewport;
  private properties: RendererProperties;

  private lastSize: [Vector2, Vector2];

  constructor(viewport: Viewport, properties: RendererProperties) {
    super();
    this.viewport = viewport;
    this.properties = properties;
    this.lastSize = [this.startCell, this.endCell];

    this.viewport.addEventListener(
      "change",
      this.handleViewportChange.bind(this),
    );
  }

  private handleViewportChange() {
    const currentSize = [this.startCell, this.endCell];

    if (
      !arrayEq(currentSize[0], this.lastSize[0]) ||
      !arrayEq(currentSize[1], this.lastSize[1])
    ) {
      this.dispatchEvent(new Event("change"));
    }

    this.lastSize = [this.startCell, this.endCell];
  }

  public visibleCells(): [Vector2, Vector2] {
    const delta: Vector2 = [
      Math.ceil(this.viewport.size[0] / this.properties.cellSize[0]) + 1,
      Math.ceil(this.viewport.size[1] / this.properties.cellSize[1]) + 1,
    ];
    const anchor: Vector2 = [
      Math.floor(this.viewport.anchor[0] / this.properties.cellSize[0]),
      Math.floor(this.viewport.anchor[1] / this.properties.cellSize[1]),
    ];
    return [anchor, [anchor[0] + delta[0], anchor[1] + delta[1]]];
  }

  public forCell(position: Vector2): {
    cellAnchor: Vector2;
    contentAnchor: Vector2;
    availableContentArea: Vector2;
  } {
    const cellAnchor: Vector2 = [
      this.properties.leftGutterSize +
      position[0] * this.properties.cellSize[0] -
      this.viewport.anchor[0],
      this.properties.topGutterSize +
      position[1] * this.properties.cellSize[1] -
      this.viewport.anchor[1],
    ];
    const contentAreaY =
      this.properties.cellSize[1] - this.properties.cellPadding[1] * 2;
    return {
      cellAnchor,
      contentAnchor: [
        cellAnchor[0] + this.properties.cellPadding[0],
        cellAnchor[1] + this.properties.cellPadding[1] + contentAreaY / 2,
      ],
      availableContentArea: [
        this.properties.cellSize[0] - this.properties.cellPadding[0],
        Math.min(contentAreaY, this.properties.maxCellContentHeight),
      ],
    };
  }

  public forTopBar(index: number): { anchor: Vector2; contentAnchor: Vector2 } {
    const anchor: Vector2 = [
      this.properties.leftGutterSize +
      this.properties.cellSize[0] * index -
      this.viewport.anchor[0],
      0,
    ];
    const contentAnchor: Vector2 = [
      this.properties.leftGutterSize +
      this.properties.cellSize[0] * index -
      this.viewport.anchor[0] +
      this.properties.cellSize[0] / 2,
      this.properties.topGutterSize / 2,
    ];

    return { anchor, contentAnchor };
  }

  public forLeftBar(index: number): {
    anchor: Vector2;
    contentAnchor: Vector2;
  } {
    const anchor: Vector2 = [
      0,
      this.properties.topGutterSize +
      this.properties.cellSize[1] * index -
      this.viewport.anchor[1],
    ];
    const contentAnchor: Vector2 = [
      this.properties.leftGutterSize / 2,
      this.properties.topGutterSize +
      this.properties.cellSize[1] * index -
      this.viewport.anchor[1] +
      this.properties.cellSize[1] / 2,
    ];

    return {
      anchor,
      contentAnchor,
    };
  }

  public mousePositionToCell(position: Vector2): Vector2 | null {
    const cellPosition: Vector2 = [
      position[0] -
      this.properties.leftGutterSizeUnscaled -
      (this.viewport.anchor[0] % this.properties.cellSize[0]),
      position[1] -
      this.properties.topGutterSizeUnscaled -
      (this.viewport.anchor[1] % this.properties.cellSize[1]),
    ];
    if (cellPosition[0] < 0 || cellPosition[1] < 0) return null;
    return [Math.floor(cellPosition[0] / this.properties.cellSizeUnscaled[0]), Math.floor(cellPosition[1] / this.properties.cellSizeUnscaled[1])];
  }

  get startCell(): Vector2 {
    return [
      Math.floor(this.viewport.anchor[0] / this.properties.cellSize[0]),
      Math.floor(this.viewport.anchor[1] / this.properties.cellSize[1]),
    ];
  }

  get endCell(): Vector2 {
    return [
      Math.ceil(
        (this.viewport.anchor[0] + this.viewport.size[0]) /
        this.properties.cellSize[0],
      ),
      Math.ceil(
        (this.viewport.anchor[1] + this.viewport.size[1]) /
        this.properties.cellSize[1],
      ),
    ];
  }
}
