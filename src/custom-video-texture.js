// @flow
import * as THREE from 'three';

class CustomVideoTexture extends THREE.Texture {
  constructor(ctx2d: CanvasRenderingContext2D, dimensions: Dimensions) {
    super(ctx2d.canvas);
    this._ctx2d = ctx2d;
    this._dimensions = dimensions;
    this._ctx2d.canvas.width = this._dimensions.width;
    this._ctx2d.canvas.height = this._dimensions.height;
  }

  render(videoElement: HTMLVideoElement) {
    this._ctx2d.drawImage(videoElement, 0, 0, this._dimensions.width, this._dimensions.height);
  }
}

export {CustomVideoTexture};
