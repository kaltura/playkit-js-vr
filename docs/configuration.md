## Configuration

VR plugin configuration parameters are provided whenever a player instance is created.

```js
var config = {
  plugins: {
    vr: {
      // VR configuration here
    }
  }
};
var player = KalturaPlayer.setup(config);
```

#### Configuration Structure

The configuration uses the following structure:

```js
{
  toggleStereo: boolean,
  startInStereo: boolean,
  moveMultiplier: number,
  deviceMotionMultiplier: number,
  cameraOptions: Object
}
```

#### Default Configuration Values

```js
{
 toggleStereo: false, // in mobile device is true
 startInStereo: false,
 moveMultiplier: 0.15,
 deviceMotionMultiplier: 1,
 cameraOptions: {
      fov: 75,
      aspect: video.width/video.height,
      near: 0.1,
      far: 1000
 }
}
```

##

> ### config.toggleStereo
>
> ##### Type: `boolean`
>
> ##### Default: `true` for mobile device, otherwise `false`.
>
> ##### Description: Whether a stereo mode toggle button will display in the control bar.

##

> ### config.startInStereo
>
> ##### Type: `boolean`
>
> ##### Default: `false`
>
> ##### Description: Whether the playback will start with the stereo mode.

##

> ### config.moveMultiplier
>
> ##### Type: `number`
>
> ##### Default: `0.15`
>
> ##### Description: Specifies the sensitivity of the mouse/touch movement.

##

> ### config.deviceMotionMultiplier
>
> ##### Type: `number`
>
> ##### Default: `1`
>
> ##### Description: Specifies the sensitivity of the device motion.

##

> ### config.cameraOptions
>
> ##### Type: `Object`
>
> ##### Default:
>
> ```js
> {
> fov: 75,
> aspect: video.width/video.height,
> near: 0.1,
> far: 1000
> }
> ```
>
> ##### Description: Defines parameters that control the [camera options](https://threejs.org/docs/#api/cameras/PerspectiveCamera).
>
> > ### config.cameraOptions.fov
> >
> > ##### Type: `number`
> >
> > ##### Default: `75`
> >
> > ##### Description: Camera frustum vertical field of view, from bottom to top of view, in degrees.
> >
> > ##
> >
> > ### config.cameraOptions.aspect
> >
> > ##### Type: `number`
> >
> > ##### Default: `video.width/video.height`
> >
> > ##### Description: Camera frustum aspect ratio, usually the canvas width / canvas height.
> >
> > ##
> >
> > ### config.cameraOptions.near
> >
> > ##### Type: `number`
> >
> > ##### Default: `0.1`
> >
> > ##### Description: Camera frustum near plane. The valid range is greater than 0 and less than the current value of the far plane.
> >
> > ##
> >
> > ### config.cameraOptions.far
> >
> > ##### Type: `number`
> >
> > ##### Default: `1000`
> >
> > ##### Description: Camera frustum far plane. The valid range is between the current value of the near plane and infinity.
