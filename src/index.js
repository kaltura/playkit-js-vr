// @flow
import {registerPlugin} from 'kaltura-player-js';
import {Vr} from './vr';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {Vr as Plugin};
export {VERSION, NAME};

const pluginName: string = 'vr';

registerPlugin(pluginName, Vr);
