# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.1](https://github.com/kaltura/playkit-js-vr/compare/v2.0.0...v2.0.1) (2020-11-03)


### Bug Fixes

* **FEC-10557:** [android chrome][360] drag the video cause to all screen movement ([#51](https://github.com/kaltura/playkit-js-vr/issues/51)) ([677531a](https://github.com/kaltura/playkit-js-vr/commit/677531a))


### Build System

* remove plugins that already exist on preset-env ([#52](https://github.com/kaltura/playkit-js-vr/issues/52)) ([163f7a9](https://github.com/kaltura/playkit-js-vr/commit/163f7a9))



## [2.0.0](https://github.com/kaltura/playkit-js-vr/compare/v1.4.0...v2.0.0) (2020-09-08)


### Bug Fixes

* **FEC-10404:** media doesn't work properly on Safari browser - no video displayed - Regression bug ([#46](https://github.com/kaltura/playkit-js-vr/issues/46)) ([3ef8a39](https://github.com/kaltura/playkit-js-vr/commit/3ef8a39))


### Build System

* **FEC-10064:** add automatic release notes ([#49](https://github.com/kaltura/playkit-js-vr/issues/49)) ([706dd15](https://github.com/kaltura/playkit-js-vr/commit/706dd15))


### Features

* **FEC-10347:** expose kaltura player as a global variable instead of UMD ([#47](https://github.com/kaltura/playkit-js-vr/issues/47)) ([d55e371](https://github.com/kaltura/playkit-js-vr/commit/d55e371))


### Tests

* faster unit tests ([#48](https://github.com/kaltura/playkit-js-vr/issues/48)) ([9669e72](https://github.com/kaltura/playkit-js-vr/commit/9669e72))


### BREAKING CHANGES

* **FEC-10347:** This package is not UMD anymore



### [1.4.1](https://github.com/kaltura/playkit-js-vr/compare/v1.4.0...v1.4.1) (2020-08-10)


### Bug Fixes

* **FEC-10404:** media doesn't work properly on Safari browser - no video displayed - Regression bug ([#46](https://github.com/kaltura/playkit-js-vr/issues/46)) ([3ef8a39](https://github.com/kaltura/playkit-js-vr/commit/3ef8a39))



## [1.4.0](https://github.com/kaltura/playkit-js-vr/compare/v1.3.0...v1.4.0) (2020-08-06)


### Bug Fixes

* **FEC-9602:** after entering and exiting full screen, replay icon is not responding ([#40](https://github.com/kaltura/playkit-js-vr/issues/40)) ([33e89ec](https://github.com/kaltura/playkit-js-vr/commit/33e89ec))
* UI.UI_CLICKED doesn't exist for player ([#34](https://github.com/kaltura/playkit-js-vr/issues/34)) ([06fa049](https://github.com/kaltura/playkit-js-vr/commit/06fa049))
* **FEC-9422:** movement with 360 doesn't work ([#33](https://github.com/kaltura/playkit-js-vr/issues/33)) ([e63c28a](https://github.com/kaltura/playkit-js-vr/commit/e63c28a))


### Build System

* **FEC-10064:** add automatic release notes ([#38](https://github.com/kaltura/playkit-js-vr/issues/38)) ([2f70871](https://github.com/kaltura/playkit-js-vr/commit/2f70871))
* **FEC-9495:** update after deploy stage to ping Jenkins ([#35](https://github.com/kaltura/playkit-js-vr/issues/35)) ([02b1626](https://github.com/kaltura/playkit-js-vr/commit/02b1626))
* github bad certificate ([#37](https://github.com/kaltura/playkit-js-vr/issues/37)) ([c288fed](https://github.com/kaltura/playkit-js-vr/commit/c288fed))


### Features

* **FEC-10057:** move the plugin manager to kaltura player ([#45](https://github.com/kaltura/playkit-js-vr/issues/45)) ([75a2132](https://github.com/kaltura/playkit-js-vr/commit/75a2132)), closes [kaltura/kaltura-player-js#332](https://github.com/kaltura/playkit-js-vr/issues/332)
* **FEC-10290:** upgrade NPM packages ([#44](https://github.com/kaltura/playkit-js-vr/issues/44)) ([7c1b7c9](https://github.com/kaltura/playkit-js-vr/commit/7c1b7c9))



<a name="1.3.3"></a>
## [1.3.3](https://github.com/kaltura/playkit-js-vr/compare/v1.3.2...v1.3.3) (2020-06-10)


### Bug Fixes

* **FEC-9602:** after entering and exiting full screen, replay icon is not responding ([#40](https://github.com/kaltura/playkit-js-vr/issues/40)) ([33e89ec](https://github.com/kaltura/playkit-js-vr/commit/33e89ec))



<a name="1.3.2"></a>
## [1.3.2](https://github.com/kaltura/playkit-js-vr/compare/v1.3.1...v1.3.2) (2019-11-12)


### Bug Fixes

* UI.UI_CLICKED doesn't exist for player ([#34](https://github.com/kaltura/playkit-js-vr/issues/34)) ([06fa049](https://github.com/kaltura/playkit-js-vr/commit/06fa049))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/kaltura/playkit-js-vr/compare/v1.3.0...v1.3.1) (2019-11-03)


### Bug Fixes

* **FEC-9422:** movement with 360 doesn't work ([#33](https://github.com/kaltura/playkit-js-vr/issues/33)) ([e63c28a](https://github.com/kaltura/playkit-js-vr/commit/e63c28a))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/kaltura/playkit-js-vr/compare/v1.1.8...v1.3.0) (2019-04-24)


### Bug Fixes

* **FEC-9051:** added umdNameDefine true to support requireJS in VR ([35b8ec2](https://github.com/kaltura/playkit-js-vr/commit/35b8ec2))


### Features

* **FEC-8923:** change VR listener for resize event to use new resize event ([#16](https://github.com/kaltura/playkit-js-vr/issues/16)) ([6e93ca8](https://github.com/kaltura/playkit-js-vr/commit/6e93ca8))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/kaltura/playkit-js-vr/compare/v1.1.8...v1.2.0) (2019-04-07)


### Features

* **FEC-8923:** change VR listener for resize event to use new resize event ([#16](https://github.com/kaltura/playkit-js-vr/issues/16)) ([6e93ca8](https://github.com/kaltura/playkit-js-vr/commit/6e93ca8))



<a name="1.1.8"></a>
## [1.1.8](https://github.com/kaltura/playkit-js-vr/compare/v1.1.7...v1.1.8) (2018-12-24)


### Bug Fixes

* **FEC-8783:** change media, 2nd video isn't draggable ([#15](https://github.com/kaltura/playkit-js-vr/issues/15)) ([c8e53d1](https://github.com/kaltura/playkit-js-vr/commit/c8e53d1))



<a name="1.1.7"></a>
## [1.1.7](https://github.com/kaltura/playkit-js-vr/compare/v1.1.6...v1.1.7) (2018-08-22)


### Bug Fixes

* **FEC-8489:** black screen on full screen in some android devices ([#14](https://github.com/kaltura/playkit-js-vr/issues/14)) ([69693f2](https://github.com/kaltura/playkit-js-vr/commit/69693f2))



<a name="1.1.6"></a>
## [1.1.6](https://github.com/kaltura/playkit-js-vr/compare/v1.1.5...v1.1.6) (2018-08-08)


### Bug Fixes

* **FEC-8458:** black screen on win 10 IE11 ([#13](https://github.com/kaltura/playkit-js-vr/issues/13)) ([46f1cdd](https://github.com/kaltura/playkit-js-vr/commit/46f1cdd))



<a name="1.1.5"></a>
## [1.1.5](https://github.com/kaltura/playkit-js-vr/compare/v1.1.4...v1.1.5) (2018-07-04)


### Bug Fixes

* **FEC-8363:** VR is not working on iOS < 11.3 ([#9](https://github.com/kaltura/playkit-js-vr/issues/9)) ([2e3abcb](https://github.com/kaltura/playkit-js-vr/commit/2e3abcb))



<a name="1.1.4"></a>
## [1.1.4](https://github.com/kaltura/playkit-js-vr/compare/v1.1.3...v1.1.4) (2018-07-03)


### Bug Fixes

* **FEC-8363:** VR is not working on iOS < 11.3 ([#7](https://github.com/kaltura/playkit-js-vr/issues/7)) ([179d745](https://github.com/kaltura/playkit-js-vr/commit/179d745))
* **FEC-8372:** change media to VR content not playing as VR ([#8](https://github.com/kaltura/playkit-js-vr/issues/8)) ([faf5d64](https://github.com/kaltura/playkit-js-vr/commit/faf5d64))



<a name="1.1.3"></a>
## [1.1.3](https://github.com/kaltura/playkit-js-vr/compare/v1.1.2...v1.1.3) (2018-06-28)


### Bug Fixes

* **FEC-8344:** 2 vertical lines with frames of the video appear on left and right sides of the player on IE11 ([#6](https://github.com/kaltura/playkit-js-vr/issues/6)) ([02ba0bc](https://github.com/kaltura/playkit-js-vr/commit/02ba0bc))
* **FEC-8360:** no error for VR content on iPhone chrome with playsinline false ([#5](https://github.com/kaltura/playkit-js-vr/issues/5)) ([7e0ccec](https://github.com/kaltura/playkit-js-vr/commit/7e0ccec))



<a name="1.1.2"></a>
## [1.1.2](https://github.com/kaltura/playkit-js-vr/compare/v1.1.1...v1.1.2) (2018-06-28)


### Bug Fixes

* **FEC-8342, FEC-8345:** video is not playing 360 after pre-roll ([#3](https://github.com/kaltura/playkit-js-vr/issues/3)) ([648e5fe](https://github.com/kaltura/playkit-js-vr/commit/648e5fe))
* **FEC-8357,FEC-8348:** VR is not working on Safari and Samsung Native Browser ([#4](https://github.com/kaltura/playkit-js-vr/issues/4)) ([4893428](https://github.com/kaltura/playkit-js-vr/commit/4893428))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/kaltura/playkit-js-vr/compare/v1.1.0...v1.1.1) (2018-06-24)


### Bug Fixes

* **FEC-8339:** when selecting full screen the video page displayed black ([#2](https://github.com/kaltura/playkit-js-vr/issues/2)) ([b5c3393](https://github.com/kaltura/playkit-js-vr/commit/b5c3393))



<a name="1.1.0"></a>
# 1.1.0 (2018-06-20)


### Features

* **FEC-8046:** 360 Support ([#1](https://github.com/kaltura/playkit-js-vr/issues/1)) ([65d7856](https://github.com/kaltura/playkit-js-vr/commit/65d7856))
