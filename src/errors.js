// @flow

/**
 * The VR plugin errors.
 * @type {Object}
 */
const Error: {[state: string]: string} = {
  UNSUPPORTED_BROWSER: "Your browser doesn't support features to enable VR experience",
  PLAYSINLINE: 'playsinline must be true for VR experience',
  DRM: 'Cannot apply VR experience for DRM content',
  VIDEO_SIZE: 'Unable to obtain the video size for VR canvas'
};

export {Error};
