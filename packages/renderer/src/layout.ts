import { Vector2 } from "engine";
import { Viewport } from "./viewport";
import { arrayEq } from "./util";

export class Layout extends EventTarget {
  private viewport: Viewport;
  private properties: LayoutProperties;

  private lastSize: [Vector2, Vector2];

  constructor(
    viewport: Viewport,
    properties: LayoutProperties = defaultProperties,
  ) {
    super();
    this.viewport = viewport;
    this.properties = properties;
    this.lastSize = [this.startCell, this.endCell];

    this.viewport.addEventListener("change", this.handleViewportChange.bind(this));
  }

  private handleViewportChange() {
    const currentSize = [this.startCell, this.endCell];

    if (!arrayEq(currentSize[0], this.lastSize[0]) || !arrayEq(currentSize[1], this.lastSize[1])) {
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
      this.properties.leftBarWidth +
      position[0] * this.properties.cellSize[0] -
      this.viewport.anchor[0],
      this.properties.topBarHeight +
      position[1] * this.properties.cellSize[1] -
      this.viewport.anchor[1],
    ];
    const contentAreaY =
      this.properties.cellSize[1] - this.properties.cellPadding.y * 2;
    return {
      cellAnchor,
      contentAnchor: [
        cellAnchor[0] + this.properties.cellPadding.left,
        cellAnchor[1] + this.properties.cellPadding.y + contentAreaY / 2,
      ],
      availableContentArea: [
        this.properties.cellSize[0] - this.properties.cellPadding.left,
        Math.min(contentAreaY, this.properties.maxContentHeight),
      ],
    };
  }

  public forTopBar(index: number): { anchor: Vector2, contentAnchor: Vector2 } {
    const anchor: Vector2 = [this.properties.leftBarWidth + this.properties.cellSize[0] * index - this.viewport.anchor[0], 0];
    const contentAnchor: Vector2 = [this.properties.leftBarWidth + this.properties.cellSize[0] * index - this.viewport.anchor[0] + this.properties.cellSize[0] / 2, this.properties.topBarHeight / 2];

    return { anchor, contentAnchor };
  }

  public forLeftBar(index: number): { anchor: Vector2, contentAnchor: Vector2 } {
    const anchor: Vector2 = [0, this.properties.topBarHeight + this.properties.cellSize[1] * index - this.viewport.anchor[1]];
    const contentAnchor: Vector2 = [this.properties.leftBarWidth / 2, this.properties.topBarHeight + this.properties.cellSize[1] * index - this.viewport.anchor[1] + this.properties.cellSize[1] / 2];

    return {
      anchor,
      contentAnchor
    };
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

export const defaultProperties: LayoutProperties = {
  cellPadding: {
    left: 8,
    y: 10,
  },
  topBarHeight: 16,
  leftBarWidth: 16,
  cellSize: [128, 32],
  maxContentHeight: 32,
};

export interface LayoutProperties {
  topBarHeight: number;
  leftBarWidth: number;
  cellSize: Vector2;
  cellPadding: {
    left: number;
    y: number;
  };
  maxContentHeight: number;
}
