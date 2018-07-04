// @flow
import {BasePlugin, Utils, FakeEvent, Env, Error as PKError} from 'playkit-js';
import * as THREE from 'three';
import {CustomVideoTexture} from './custom-video-texture';
import {StereoEffect} from './stereo-effect';
import {Error} from './errors';
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
 * Time interval (in milliseconds) to try ubtaining the vr canvas size
 * @type {number}
 * @const
 */
const CALCULATE_CANVAS_SIZE_INTERVAL: number = 100;

/**
 * How many times to try ubtaining the vr canvas size until failure (600 is a minute for an interval of 100 ms)
 * @type {number}
 * @const
 */
const CALCULATE_CANVAS_SIZE_LIMIT: number = 600;

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
    deviceMotionMultiplier: 1,
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
    return true;
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
  _calculateCanvasSizeInterval: ?number;
  _crossOriginSet: boolean;

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
        if (this._isVrSupported(event.payload.selectedSource[0])) {
          this.eventManager.listen(this.player, this.player.Event.LOAD_START, () => this._addMotionBindings());
          this.eventManager.listen(this.player, this.player.Event.FIRST_PLAY, () => this._initComponents());
          this.eventManager.listen(this.player, this.player.Event.ENDED, () => this._cancelAnimationFrame());
          this.eventManager.listen(this.player, this.player.Event.PLAY, () => this._onPlay());
          this.eventManager.listen(this.player, this.player.Event.PLAYING, () => this._onPlaying());
          this.eventManager.listen(window, 'resize', () => this._updateCanvasSize());
          this._setCrossOrigin();
        }
      }
    });
  }

  _setCrossOrigin(): void {
    const env = this.player.env;
    if (
      typeof this.player.crossOrigin !== 'string' &&
      (env.os.name === 'iOS' || env.browser.name === 'Safari' || env.browser.name === 'Android Browser')
    ) {
      this._crossOriginSet = true;
      this.player.crossOrigin = this.player.CorsType.ANONYMOUS;
    }
  }

  _isIOSPlayer(): boolean {
    return this.player.config.playback.playsinline === false && this.player.env.device.model === 'iPhone';
  }

  _isUnSpportedBrowser(): boolean {
    const env = this.player.env;
    return (
      (env.browser.name === 'Safari' && env.browser.major < 11) ||
      (env.os.name === 'iOS' && env.os.version < 11.3) ||
      // Safari desktop < 11 and iOS < 11.3 have CORS issue
      // see https://bugs.webkit.org/show_bug.cgi?id=135379
      (env.browser.name === 'IE' && !(env.browser.major === '11' && (env.os.version === '8.1' || env.os.version === '10')))
    );
    // IE !== 11 on Win-8.1 or Win-10
  }

  _isVrSupported(source: PKMediaSourceObject): boolean {
    let message = '';
    if (this._isUnSpportedBrowser()) {
      message = Error.UNSUPPORTED_BROWSER;
    }
    if (this._isIOSPlayer()) {
      message = Error.PLAYSINLINE;
    }
    if (source.drmData) {
      message = Error.DRM;
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
    if (overlayAction) {
      this.eventManager.listen(overlayAction, 'mousedown', e => this._onOverlayActionPointerDown(e));
      this.eventManager.listen(overlayAction, 'touchstart', e => this._onOverlayActionPointerDown(e));
      this.eventManager.listen(window, 'mousemove', e => this._onDocumentPointerMove(e));
      this.eventManager.listen(window, 'touchmove', e => this._onDocumentPointerMove(e), {passive: false});
      this.eventManager.listen(window, 'mouseup', this._onDocumentPointerUp.bind(this));
      this.eventManager.listen(window, 'touchend', this._onDocumentPointerUp.bind(this));
    }
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

  _getVideoTexture(videoElement: HTMLVideoElement, dimensions: Dimensions): any {
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

    if (this._stereoMode && this._effect) {
      this._effect.render(this._scene, this._camera);
    } else if (this._renderer) {
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

  _clearCalculateInterval(): void {
    if (this._calculateCanvasSizeInterval) {
      clearInterval(this._calculateCanvasSizeInterval);
      this._calculateCanvasSizeInterval = null;
    }
  }

  _setRendererSize(dimensions: Dimensions): void {
    this._renderer.setSize(dimensions.width, dimensions.height, false);
    this.logger.debug('Update the VR canvas dimensions', dimensions);
  }

  /**
   * In some browsers (android browser for example) the videoWidth is unknown but in some time after playing.
   * For this case we have to retry gathering this value by an interval, and limit it until a failure.
   * @private
   */
  _updateCanvasSizeByInterval(): void {
    let calculateCanvasSizeIntervalCounter = 0;
    let dimensions: Dimensions;
    this._clearCalculateInterval();
    this._calculateCanvasSizeInterval = setInterval(() => {
      dimensions = this._getCanvasDimensions();
      if (dimensions.width) {
        this._clearCalculateInterval();
        this._setRendererSize(dimensions);
      } else if (++calculateCanvasSizeIntervalCounter >= CALCULATE_CANVAS_SIZE_LIMIT) {
        // the video size is unavailable. cannot set the canvas size.
        this.player.pause();
        this._clean();
        this.player.dispatchEvent(
          new FakeEvent(
            this.player.Event.ERROR,
            new PKError(PKError.Severity.CRITICAL, PKError.Category.VR, PKError.Code.VR_NOT_SUPPORTED, Error.VIDEO_SIZE)
          )
        );
      }
    }, CALCULATE_CANVAS_SIZE_INTERVAL);
  }

  _updateCanvasSize(): void {
    if (this._renderer) {
      const dimensions: Dimensions = this._getCanvasDimensions();
      if (dimensions.width) {
        this._setRendererSize(dimensions);
      } else {
        this._updateCanvasSizeByInterval();
      }
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

  /**
   * Toggling the VR mode
   * @returns {void}
   * @public
   */
  toggleVrStereoMode(): void {
    this._stereoMode = !this._stereoMode;
    this.player.dispatchEvent(new FakeEvent(this.player.Event.VR_STEREO_MODE_CHANGED, {mode: this._stereoMode}));
    this._updateCanvasSize();
  }

  /**
   * Checking if the VR stereo mode is active.
   * @returns {boolean} - Whether is active.
   * @public
   */
  isInStereoMode(): boolean {
    return this._stereoMode;
  }

  _clean(): void {
    this._cancelAnimationFrame();
    this.eventManager.removeAll();
    if (this._renderer) {
      Utils.Dom.removeChild(this.player.getView(), this._renderer.domElement);
    }
    if (this._crossOriginSet) {
      this.player.crossOrigin = null;
    }
    this._clearCalculateInterval();
  }

  _initMembers(): void {
    this._renderer = null;
    this._scene = null;
    this._camera = null;
    this._texture = null;
    this._effect = null;
    this._stereoMode = this.config.startInStereo;
    this._rafId = NaN;
    this._pointerDown = false;
    this._previousX = NaN;
    this._previousY = NaN;
    this._latitude = 0;
    this._longitude = 180;
    this._crossOriginSet = false;
  }

  _cancelAnimationFrame(): void {
    cancelAnimationFrame(this._rafId);
    this._rafId = NaN;
  }

  _onOverlayActionPointerDown(event: any): void {
    this._pointerDown = true;
    this._previousX = event.clientX || event.touches[0].clientX;
    this._previousY = event.clientY || event.touches[0].clientY;
  }

  _onDocumentPointerMove(event: any): void {
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

  _getMobileVibrationValue(): number {
    if (this.player.env.browser.name === 'Android Browser') {
      return 1;
    }
    return 0.01;
  }

  _onDeviceMotion(event: any): void {
    if (event.rotationRate) {
      const alpha = event.rotationRate.alpha;
      const beta = event.rotationRate.beta;
      const portrait = window.innerHeight > window.innerWidth;
      const orientation = event.orientation || window.orientation;
      const mobileVibrationValue = this.config.deviceMotionMultiplier * this._getMobileVibrationValue();
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
