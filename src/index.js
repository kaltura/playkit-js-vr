// @flow
import {registerPlugin} from 'playkit-js';
import {Vr} from './vr';

declare var __VERSION__: string;
declare var __NAME__: string;

export {Vr as Plugin};
export {__VERSION__ as VERSION, __NAME__ as NAME};

const pluginName: string = 'vr';

registerPlugin(pluginName, Vr);
