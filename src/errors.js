// @flow

/**
 * The VR plugin errors.
 * @type {Object}
 */
const Error: {[error: string]: {message: string, id: string}} = {
  UNSUPPORTED_BROWSER: {message: "Your browser doesn't support features to enable VR experience", id: 'vr.unsupported_browser_error_message'},
  PLAYSINLINE: {message: 'Configuration playsinline must be true for VR experience on iPhone device.', id: 'vr.playsinline_error_message'},
  DRM: {message: 'Cannot apply VR experience for DRM content', id: 'vr.drm_error_message'},
  VIDEO_SIZE: {message: 'Unable to obtain the video size for VR canvas', id: 'vr.video_size_error_message'}
};

export {Error};
