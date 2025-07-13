import { Vector2 } from "engine";
import { Viewport } from "./viewport";

export class Layout {
  private viewport: Viewport;
  private properties: LayoutProperties;

  constructor(
    viewport: Viewport,
    properties: LayoutProperties = defaultProperties,
  ) {
    this.viewport = viewport;
    this.properties = properties;
  }

  public visibleCells(): [Vector2, Vector2] {
    const delta: Vector2 = [
      Math.ceil(this.viewport.size[0] / this.properties.cellSize[0]),
      Math.ceil(this.viewport.size[1] / this.properties.cellSize[1]),
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
      this.viewport.anchor[0] +
      this.properties.leftBarWidth,
      this.properties.topBarHeight +
      position[1] * this.properties.cellSize[1] -
      this.viewport.anchor[1] +
      this.properties.topBarHeight,
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
