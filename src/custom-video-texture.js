import * as THREE from 'three';

class CustomVideoTexture extends THREE.Texture {
  constructor(ctx2d, dimensions) {
    super(ctx2d.canvas);
    this._ctx2d = ctx2d;
    this._dimensions = dimensions;
    this._ctx2d.canvas.width = this._dimensions.width;
    this._ctx2d.canvas.height = this._dimensions.height;
  }

  render(videoElement) {
    this._ctx2d.drawImage(videoElement, 0, 0, this._dimensions.width, this._dimensions.height);
  }
}

export {CustomVideoTexture};
