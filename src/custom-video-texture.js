// @flow
import * as THREE from 'three';

class CustomVideoTexture extends THREE.Texture {
  constructor(ctx2d: CanvasRenderingContext2D) {
    super(ctx2d.canvas);
    this._ctx2d = ctx2d;
  }

  render(videoElement: HTMLVideoElement, dimensions: Dimensions) {
    this._ctx2d.canvas.width = dimensions.width;
    this._ctx2d.canvas.height = dimensions.height;
    this._ctx2d.drawImage(videoElement, 0, 0, dimensions.width, dimensions.height);
  }
}

export {CustomVideoTexture};
