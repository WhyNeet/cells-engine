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
      Math.ceil(this.viewport.anchor[0] / this.properties.cellSize[0]),
      Math.ceil(this.viewport.anchor[1] / this.properties.cellSize[1]),
    ];
    return [anchor, [anchor[0] + delta[0], anchor[1] + delta[1]]];
  }

  public forCell(position: Vector2): {
    cellAnchor: Vector2;
    contentAnchor: Vector2;
  } {
    const cellAnchor: Vector2 = [
      this.properties.leftBarWidth + position[0] * this.properties.cellSize[0] - this.viewport.anchor[0],
      this.properties.topBarHeight + position[1] * this.properties.cellSize[1] - this.viewport.anchor[1],
    ];
    return {
      cellAnchor,
      contentAnchor: [
        cellAnchor[0] + this.properties.cellPadding.left,
        cellAnchor[1] + this.properties.cellPadding.y,
      ],
    };
  }
}

export const defaultProperties: LayoutProperties = {
  cellPadding: {
    left: 1,
    y: 1,
  },
  topBarHeight: 32,
  leftBarWidth: 32,
  cellSize: [128, 32],
};

export interface LayoutProperties {
  topBarHeight: number;
  leftBarWidth: number;
  cellSize: Vector2;
  cellPadding: {
    left: number;
    y: number;
  };
}
