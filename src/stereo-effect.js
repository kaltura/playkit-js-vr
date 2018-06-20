// @flow
import * as THREE from 'three';

class StereoEffect {
  _renderer: any;
  _stereo: any;

  constructor(renderer: any) {
    this._renderer = renderer;
    this._stereo = new THREE.StereoCamera();
    this._stereo.aspect = 0.5;
  }

  setEyeSeparation(eyeSep: number) {
    this._stereo.eyeSep = eyeSep;
  }

  setSize(width: number, height: number) {
    this._renderer.setSize(width, height);
  }

  render(scene: any, camera: any) {
    scene.updateMatrixWorld();

    if (camera.parent === null) {
      camera.updateMatrixWorld();
    }

    this._stereo.update(camera);

    const size = this._renderer.getSize();

    if (this._renderer.autoClear) {
      this._renderer.clear();
    }
    this._renderer.setScissorTest(true);

    this._renderer.setScissor(0, 0, size.width / 2, size.height);
    this._renderer.setViewport(0, 0, size.width / 2, size.height);
    this._renderer.render(scene, this._stereo.cameraL);

    this._renderer.setScissor(size.width / 2, 0, size.width / 2, size.height);
    this._renderer.setViewport(size.width / 2, 0, size.width / 2, size.height);
    this._renderer.render(scene, this._stereo.cameraR);

    this._renderer.setScissorTest(false);
  }
}

export {StereoEffect};
