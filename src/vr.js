// @flow
import {BasePlugin, Utils} from 'playkit-js'
import * as THREE from 'three'
import './style.css'

/**
 * The 360 canvas class.
 * @type {string}
 * @const
 */
const CANVAS_360_CLASS: string = 'playkit-360-canvas';
/**
 * The 360 canvas overlay id.
 * @type {string}
 * @const
 */
const CANVAS_360_OVERLAY_ID: string = 'playkit-360-canvas-overlay';

/**
 * Your class description.
 * @classdesc
 */
export default class Vr extends BasePlugin {
  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   */
  static defaultConfig: Object = {
    moveMultiplier: 0.15,
    mobileVibrationValue: 0.02,
    cameraOptions: {
      fov: 75,
      aspect: 640 / 360,
      near: 0.1,
      far: 2000
    }
  };

  /**
   * @static
   * @public
   * @returns {boolean} - Whether the plugin is valid.
   */
  static isValid(): boolean {
    return true;
  }

  _renderer: any;
  _canvas: any;
  _scene: any;
  _camera: any;
  _texture: any;
  _requestId: number;
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
    this.eventManager.listen(this.player, this.player.Event.SOURCE_SELECTED, () => {
      if (this.player.is360()) {
        this.logger.debug('360 entry has detected');
        this._appendCanvasOverlayAction();
        this.eventManager.listen(this.player, this.player.Event.FIRST_PLAY, this._initComponents.bind(this));
        this.eventManager.listen(this.player, this.player.Event.ENDED, this._cancelAnimationFrame.bind(this));
        this.eventManager.listen(this.player, this.player.Event.REPLAY, this._render.bind(this));
        this.eventManager.listen(window, 'resize', () => this._updateCanvasSize());
        this._addMotionBindings();
      }
    });
  }

  /**
   * _addMotionBindings
   * @private
   * @returns {void}
   */
  _addMotionBindings(): void {
    this.eventManager.listen(this._canvasOverlayAction, 'mousedown', (e) => this._onCanvasOverlayPointerDown(e));
    this.eventManager.listen(this._canvasOverlayAction, 'touchstart', (e) => this._onCanvasOverlayPointerDown(e));
    this.eventManager.listen(window, 'mousemove', (e) => this._onDocumentPointerMove(e));
    this.eventManager.listen(window, 'touchmove', (e) => this._onDocumentPointerMove(e), {passive: false});
    this.eventManager.listen(window, 'mouseup', this._onDocumentPointerUp.bind(this));
    this.eventManager.listen(window, 'touchend', this._onDocumentPointerUp.bind(this));
    this.eventManager.listen(window, 'devicemotion', this._onDeviceMotion.bind(this));
    this.eventManager.listen(window, 'deviceorientation', this._onMobileOrientation.bind(this));
  }

  /**
   * _appendCanvasOverlayAction
   * @private
   * @returns {void}
   */
  _appendCanvasOverlayAction(): void {
    this._canvasOverlayAction = document.createElement('div');
    this._canvasOverlayAction.id = CANVAS_360_OVERLAY_ID;
    this.player.getView().appendChild(this._canvasOverlayAction);
  }

  /**
   * _initComponents
   * @private
   * @returns {void}
   */
  _initComponents(): void {
    this.logger.debug('Init 360 components');
    const videoElement = this.player.getVideoElement();

    this._renderer = new THREE.WebGLRenderer();
    this._canvas = this._renderer.domElement;
    Utils.Dom.addClassName(this._canvas, CANVAS_360_CLASS);
    this.player.getView().insertBefore(this._canvas, videoElement.nextSibling);

    const cameraOptions = this.config.cameraOptions;
    const dimensions = this._getCanvasDimensions();
    const aspect = (dimensions.width && dimensions.height) ? dimensions.width / dimensions.height : cameraOptions.aspect;
    this._camera = new THREE.PerspectiveCamera(cameraOptions.fov, aspect, cameraOptions.near, cameraOptions.far);
    this._camera.target = new THREE.Vector3(0, 0, 0);

    this._texture = new THREE.VideoTexture(videoElement);
    this._texture.minFilter = this._texture.magFilter = THREE.LinearFilter;

    const geometry = new THREE.SphereGeometry(100, 100, 40);
    geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

    const material = new THREE.MeshBasicMaterial();
    material.map = this._texture;

    const sphere = new THREE.Mesh(geometry, material);

    this._scene = new THREE.Scene();
    this._scene.add(sphere);

    // this.effect = new THREE.StereoEffect(this._renderer);
    this._updateCanvasSize();
    this._render();
  }

  _render(): void {
    const videoElement = this.player.getVideoElement();
    if (this._texture && videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
      this._texture.needsUpdate = true;
    }
    this._requestId = requestAnimationFrame(this._render.bind(this));

    this._updateCamera();

    // if (this.vrMode) {
    //   this.effect.render(this._scene, this._camera);
    // } else {
    this._renderer.render(this._scene, this._camera);
    // }
  }

  _updateCamera(): void {
    // limiting latitude from -85 to 85 (cannot point to the sky or under your feet)
    this._latitude = Math.max(-89, Math.min(89, this._latitude));

    // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
    this._camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - this._latitude)) * Math.cos(THREE.Math.degToRad(this._longitude));
    this._camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - this._latitude));
    this._camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - this._latitude)) * Math.sin(THREE.Math.degToRad(this._longitude));
    this._camera.lookAt(this._camera.target);
  }

  _getCanvasDimensions(): Object {
    const view = this.player.getView();
    const video = this.player.getVideoElement();
    const pWidth = parseInt(video.videoWidth / video.videoHeight * view.offsetHeight);
    let videoRatio;
    let dimensions;
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
      const dimensions = this._getCanvasDimensions();
      this._renderer.setSize(dimensions.width, dimensions.height);
    }
  }

  /**
   * Destroys the plugin.
   * @override
   * @public
   * @returns {void}
   */
  destroy(): void {
    this.reset();
  }

  /**
   * Resets the plugin.
   * @override
   * @public
   * @returns {void}
   */
  reset(): void {
    this.player.getView().removeChild(this._canvas);
    this._canvasOverlayAction.parentNode.removeChild(this._canvasOverlayAction);
    this.eventManager.removeAll();
    this._initMembers();
    this._cancelAnimationFrame();
    this._addBindings();
  }

  _initMembers(): void {
    this._renderer = null;
    this._canvas = null;
    this._scene = null;
    this._camera = null;
    this._texture = null;
    this._requestId = null;
    this._pointerDown = false;
    this._previousX = NaN;
    this._previousY = NaN;
    this._latitude = 0;
    this._longitude = 180;
  }

  _cancelAnimationFrame(): void {
    cancelAnimationFrame(this._requestId);
    this._requestId = null;
  }

  _onCanvasOverlayPointerDown(event): void {
    this._pointerDown = true;
    this._previousX = event.clientX || event.touches[0].clientX;
    this._previousY = event.clientY || event.touches[0].clientY;
  }

  _onDocumentPointerMove(event): void {
    if (this._pointerDown) {
      if (event.clientX || (event.touches && event.touches.length === 1)) {
        this._longitude = (this._previousX - (event.clientX || event.touches[0].clientX)) * this.config.moveMultiplier + this._longitude;
        this._latitude = ((event.clientY || event.touches[0].clientY) - this._previousY) * this.config.moveMultiplier + this._latitude;
      }
      this._previousX = event.clientX || event.touches[0].clientX;
      this._previousY = event.clientY || event.touches[0].clientY;
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
      // this.logger.error('alpha:' + alpha);
      const mobileVibrationValue = this.config.mobileVibrationValue;
      if (portrait) {
        this._longitude = this._longitude - beta * mobileVibrationValue;
        this._latitude = this._latitude + alpha * mobileVibrationValue;
      } else { // landscape
        let orientationDegree = -90;
        if (orientation) {
          orientationDegree = orientation;
        }
        this._longitude = (orientationDegree === -90) ? this._longitude + alpha * mobileVibrationValue : this._longitude - alpha * mobileVibrationValue;
        this._latitude = (orientationDegree === -90) ? this._latitude + beta * mobileVibrationValue : this._latitude - beta * mobileVibrationValue;
      }
    }
  }
}
