import '../../src/index.js';
import {setup} from 'kaltura-player-js';
import * as TestUtils from './utils/test-utils';

const targetId = 'player-placeholder_vr.spec';

describe('VrPlugin', function () {
  let player;
  const config = {
    targetId,
    provider: {},
    sources: {
      progressive: [
        {
          mimetype: 'video/mp4',
          url: 'https://cfvod.kaltura.com/pd/p/1740481/sp/174048100/serveFlavor/entryId/1_kbyh1guy/v/1/flavorId/1_hq6oztva/name/a.mp4'
        }
      ]
    },
    plugins: {
      vr: {}
    }
  };

  function createPlayerPlaceholder(targetId) {
    TestUtils.createElement('DIV', targetId);
    let el = document.getElementById(targetId);
    el.style.height = '360px';
    el.style.width = '640px';
  }

  function setupPlayer(config) {
    player = setup(config);
    const el = document.getElementById(targetId);
    el.appendChild(player.getView());
  }

  before(function () {
    createPlayerPlaceholder(targetId);
  });

  afterEach(function () {
    player.destroy();
    player = null;
    TestUtils.removeVideoElementsFromTestPage();
  });

  after(function () {
    TestUtils.removeElement(targetId);
  });

  it('should play mp4 stream with vr plugin', done => {
    setupPlayer(config);
    player.addEventListener(player.Event.PLAYING, () => {
      done();
    });
    player.play();
  });
});
