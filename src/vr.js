// @flow
import {BasePlugin, Utils, FakeEvent, Env, Error as PKError} from 'playkit-js';
import * as THREE from 'three';
import {CustomVideoTexture} from './custom-video-texture';
import {StereoEffect} from './stereo-effect';
import './style.css';

/**
 * The VR canvas class.
 * @type {string}
 * @const
 */
const CANVAS_VR_CLASS: string = 'playkit-vr-canvas';

/**
 * The overlay action class.
 * @type {string}
 * @const
 */
const OVERLAY_ACTION_CLASS: string = 'playkit-overlay-action';

/**
 * VR class.
 * @classdesc
 */
class Vr extends BasePlugin {
  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   */
  static defaultConfig: Object = {
    moveMultiplier: 0.15,
    mobileVibrationValue: 0.02,
    startInStereo: false,
    cameraOptions: {
      fov: 75,
      aspect: 640 / 360,
      near: 0.1,
      far: 1000
    }
  };

  /**
   * @static
   * @public
   * @returns {boolean} - Whether the plugin is valid.
   */
  static isValid(): boolean {
    return Env.browser.name !== 'IE' || (Env.browser.major === '11' && (Env.os.version === '8.1' || Env.os.version === '10'));
  }

  _renderer: any;
  _scene: any;
  _camera: any;
  _texture: any;
  _effect: any;
  _stereoMode: boolean;
  _rafId: number;
  _pointerDown: boolean;
  _previousX: number;
  _previousY: number;
  _latitude: number;
  _longitude: number;

  /**
   * @constructor
   * @param {string} name - The plugin name.
   * @param {Player} player - The player instance.
   * @param {Object} config - The plugin config.
   */
  constructor(name: string, player: Player, config: Object) {
    super(name, player, config);
    this._initMembers();
    this._addBindings();
  }

  /**
   * _addBindings
   * @private
   * @returns {void}
   */
  _addBindings(): void {
    this.eventManager.listen(this.player, this.player.Event.SOURCE_SELECTED, event => {
      if (this.player.isVr()) {
        this.logger.debug('VR entry has detected');
        this.eventManager.listen(this.player, this.player.Event.MEDIA_LOADED, () => {
          if (this._vrSupport(event)) {
            this.eventManager.listen(this.player, this.player.Event.FIRST_PLAY, () => this._initComponents());
            this.eventManager.listen(this.player, this.player.Event.ENDED, () => this._cancelAnimationFrame());
            this.eventManager.listen(this.player, this.player.Event.PLAY, () => this._onPlay());
            this.eventManager.listen(this.player, this.player.Event.PLAYING, () => this._onPlaying());
            this.eventManager.listen(window, 'resize', () => this._updateCanvasSize());
            this._addMotionBindings();
          }
        });
      }
    });
  }

  _isIOSPlayer(): boolean {
    return (
      this.player.config.playback.playsinline === false &&
      this.player.env.browser.name === 'Mobile Safari' &&
      this.player.env.device.type === 'mobile'
    );
  }

  _vrSupport(event: any): boolean {
    let message = '';
    if (this._isIOSPlayer()) {
      message = 'playsinline must be true for VR experience';
    }
    if (event.payload.selectedSource[0].drmData) {
      message = 'Cannot apply VR experience for DRM content';
    }
    if (message) {
      this.eventManager.listen(this.player, this.player.Event.PLAYING, () => {
        this.logger.warn('The playback paused due to VR experience not supported');
        this.player.pause();
      });
      this.player.dispatchEvent(
        new FakeEvent(this.player.Event.ERROR, new PKError(PKError.Severity.CRITICAL, PKError.Category.VR, PKError.Code.VR_NOT_SUPPORTED, message))
      );
      return false;
    }
    return true;
  }

  /**
   * _addMotionBindings
   * @private
   * @returns {void}
   */
  _addMotionBindings(): void {
    const overlayAction = Utils.Dom.getElementBySelector(`#${this.config.rootElement} .${OVERLAY_ACTION_CLASS}`);
    this.eventManager.listen(overlayAction, 'mousedown', e => this._onOverlayActionPointerDown(e));
    this.eventManager.listen(overlayAction, 'touchstart', e => this._onOverlayActionPointerDown(e));
    this.eventManager.listen(window, 'mousemove', e => this._onDocumentPointerMove(e));
    this.eventManager.listen(window, 'touchmove', e => this._onDocumentPointerMove(e), {passive: false});
    this.eventManager.listen(window, 'mouseup', this._onDocumentPointerUp.bind(this));
    this.eventManager.listen(window, 'touchend', this._onDocumentPointerUp.bind(this));
    if (window.DeviceMotionEvent) {
      this.eventManager.listen(window, 'devicemotion', this._onDeviceMotion.bind(this));
    }
  }

  /**
   * _initComponents
   * @private
   * @returns {void}
   */
  _initComponents(): void {
    this.logger.debug('Init VR components');
    const videoElement = this.player.getVideoElement();

    this._renderer = new THREE.WebGLRenderer({
      devicePixelRatio: window.devicePixelRatio,
      alpha: false,
      clearColor: 0xffffff,
      antialias: true
    });
    const canvas = this._renderer.domElement;
    Utils.Dom.addClassName(canvas, CANVAS_VR_CLASS);
    Utils.Dom.insertBefore(this.player.getView(), canvas, videoElement.nextSibling);

    const cameraOptions = this.config.cameraOptions;
    const dimensions = this._getCanvasDimensions();
    const aspect = dimensions.width && dimensions.height ? dimensions.width / dimensions.height : cameraOptions.aspect;
    this._camera = new THREE.PerspectiveCamera(cameraOptions.fov, aspect, cameraOptions.near, cameraOptions.far);
    this._camera.target = new THREE.Vector3(0, 0, 0);

    this._texture = this._getVideoTexture(videoElement, dimensions);
    this._texture.minFilter = this._texture.magFilter = THREE.LinearFilter;
    this._texture.generateMipmaps = false;
    this._texture.format = THREE.RGBFormat;

    const geometry = new THREE.SphereBufferGeometry(256, 32, 32);
    geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
    const material = new THREE.MeshBasicMaterial({map: this._texture, overdraw: true});
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 0, 0);

    this._scene = new THREE.Scene();
    this._scene.add(sphere);

    this._effect = new StereoEffect(this._renderer);
    this._updateCanvasSize();
  }

  _getVideoTexture(videoElement: HTMLVideoElement, dimensions): any {
    if (this.player.env.browser.name === 'IE') {
      // a workaround for ie11 texture issue
      // see https://github.com/mrdoob/three.js/issues/7560
      const ctx2d = Utils.Dom.createElement('canvas').getContext('2d');
      return new CustomVideoTexture(ctx2d, dimensions);
    }
    return new THREE.VideoTexture(videoElement);
  }

  _render(): void {
    const videoElement = this.player.getVideoElement();
    if (this._texture && videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
      this._texture.needsUpdate = true;
      if (this._texture instanceof CustomVideoTexture) {
        this._texture.render(videoElement);
      }
    }
    this._rafId = requestAnimationFrame(this._render.bind(this));

    this._updateCamera();

    if (this._stereoMode) {
      this._effect.render(this._scene, this._camera);
    } else {
      this._renderer.render(this._scene, this._camera);
    }
  }

  _updateCamera(): void {
    if (this._camera) {
      // limiting latitude from -89 to 89 (cannot point to the sky or under your feet)
      this._latitude = Math.max(-89, Math.min(89, this._latitude));

      // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
      this._camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - this._latitude)) * Math.cos(THREE.Math.degToRad(this._longitude));
      this._camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - this._latitude));
      this._camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - this._latitude)) * Math.sin(THREE.Math.degToRad(this._longitude));
      this._camera.lookAt(this._camera.target);
    }
  }

  _getCanvasDimensions(): Dimensions {
    const view = this.player.getView();
    const video = this.player.getVideoElement();
    const pWidth = parseInt((video.videoWidth / video.videoHeight) * view.offsetHeight);
    let videoRatio;
    let dimensions: Dimensions;
    if (view.offsetWidth < pWidth) {
      videoRatio = video.videoHeight / video.videoWidth;
      dimensions = {
        width: view.offsetWidth,
        height: videoRatio * view.offsetWidth
      };
    } else {
      videoRatio = video.videoWidth / video.videoHeight;
      dimensions = {
        width: videoRatio * view.offsetHeight,
        height: view.offsetHeight
      };
    }
    return dimensions;
  }

  _updateCanvasSize(): void {
    if (this._renderer) {
      const dimensions: Dimensions = this._getCanvasDimensions();
      this._renderer.setSize(dimensions.width, dimensions.height);
    }
  }

  _onPlay(): void {
    if (!this._rafId) {
      // first play or replay
      this._render();
    }
  }

  _onPlaying(): void {
    this._updateCanvasSize();
  }

  /**
   * Destroys the plugin.
   * @override
   * @public
   * @returns {void}
   */
  destroy(): void {
    this._clean();
  }

  /**
   * Resets the plugin.
   * @override
   * @public
   * @returns {void}
   */
  reset(): void {
    this._clean();
    this._initMembers();
    this._addBindings();
  }

  toggleVrStereoMode(): void {
    this._stereoMode = !this._stereoMode;
    this.player.dispatchEvent(new FakeEvent(this.player.Event.VR_STEREO_MODE_CHANGED, {mode: this._stereoMode}));
    this._updateCanvasSize();
  }

  getVrStereoMode(): boolean {
    return this._stereoMode;
  }

  _clean(): void {
    this._cancelAnimationFrame();
    this.eventManager.removeAll();
    if (this._renderer) {
      Utils.Dom.removeChild(this.player.getView(), this._renderer.domElement);
    }
  }

  _initMembers(): void {
    this._renderer = null;
    this._scene = null;
    this._camera = null;
    this._texture = null;
    this._effect = null;
    this._stereoMode = this.config.startInStereo;
    this._rafId = null;
    this._pointerDown = false;
    this._previousX = NaN;
    this._previousY = NaN;
    this._latitude = 0;
    this._longitude = 180;
  }

  _cancelAnimationFrame(): void {
    cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  _onOverlayActionPointerDown(event): void {
    this._pointerDown = true;
    this._previousX = event.clientX || event.touches[0].clientX;
    this._previousY = event.clientY || event.touches[0].clientY;
  }

  _onDocumentPointerMove(event): void {
    if (this._pointerDown) {
      if (event.clientX || (event.touches && event.touches.length === 1)) {
        this._longitude = (this._previousX - (event.clientX || event.touches[0].clientX)) * this.config.moveMultiplier + this._longitude;
        this._latitude = ((event.clientY || event.touches[0].clientY) - this._previousY) * this.config.moveMultiplier + this._latitude;
        this._previousX = event.clientX || event.touches[0].clientX;
        this._previousY = event.clientY || event.touches[0].clientY;
      }
      event.preventDefault();
    }
  }

  _onDocumentPointerUp(): void {
    this._pointerDown = false;
  }

  _onDeviceMotion(event): void {
    if (event.rotationRate) {
      const alpha = event.rotationRate.alpha;
      const beta = event.rotationRate.beta;
      const portrait = window.innerHeight > window.innerWidth;
      const orientation = event.orientation || window.orientation;
      const mobileVibrationValue = this.config.mobileVibrationValue;
      if (portrait) {
        this._longitude = this._longitude - beta * mobileVibrationValue;
        this._latitude = this._latitude + alpha * mobileVibrationValue;
      } else {
        // landscape
        let orientationDegree = -90;
        if (orientation) {
          orientationDegree = orientation;
        }
        this._longitude = orientationDegree === -90 ? this._longitude + alpha * mobileVibrationValue : this._longitude - alpha * mobileVibrationValue;
        this._latitude = orientationDegree === -90 ? this._latitude + beta * mobileVibrationValue : this._latitude - beta * mobileVibrationValue;
      }
    }
  }
}

export {Vr};
