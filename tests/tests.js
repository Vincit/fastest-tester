const expect = require('expect.js');
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { Tester, AndroidTester } = require('../');

describe('Fastest tester', () => {
  const newElementId = () => `element-${uuid.v4()}`;

  const port = 12345;
  const sessionId = uuid.v4();
  const elementId = newElementId();

  const options = {
    serverUrl: `http://localhost:${port}`,
    packageName: 'fi.foo.bar'
  };

  let server;

  before(done => {
    server = express();
    server.use(bodyParser.json());

    server.requests = [];
    server.responses = [];

    server.use((req, res) => {
      server.requests.push({
        method: req.method,
        path: req.path,
        body: req.body
      });

      res.send(server.responses.shift());
    });

    server.server = server.listen(port, done);
  });

  after(done => {
    server.server.close(done);
  });

  beforeEach(() => {
    server.requests = [];
    server.responses = [];
  });

  describe('Tester', () => {
    let tester;

    before(() => {
      tester = new Tester(options);
      server.responses = [{sessionId}];
      return tester.init().then(() => {
        expect(server.requests).to.eql([{
          method: 'POST',
          path: '/wd/hub/session',
          body: { 
            desiredCapabilities: { 
              packageName: 'fi.foo.bar' 
            }
          }
        }]);
      });
    });

    test({
      exec: () => tester.setImplicitWaitTimeout(12345),

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/timeouts/implicit_wait`,
        body: { ms: 12345 } 
      }]
    });

    test({
      exec: () => tester.resetApp(),

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/appium/app/reset`,
        body: {} 
      }]
    });

    test({
      exec: () => tester.hideKeyboard(),

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/appium/device/hide_keyboard`,
        body: {} 
      }]
    });

    test({
      exec: () => tester.windowRect(),

      handleThen: (res, requests) => {
        expect(server.requests).to.eql(requests);
        expect(res).to.eql({
          x: 10,
          y: 20,
          width: 30,
          height: 40
        });
      },

      responses: [{
        value: {
          x: 10,
          y: 20,
          width: 30,
          height: 40
        }
      }],

      requests: [{ 
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/window/rect`,
        body: {} 
      }]
    });

    test({
      exec: () => tester.elements({using: 'xpath', selector: 'something'}),

      responses: [{
        value: [
          { element: newElementId() },
          { element: newElementId() }
        ]
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'something'}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('something'),

      responses: [{
        value: [
          { element: newElementId() },
          { element: newElementId() }
        ]
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'something'}
      }]
    });

    test({
      exec: () => tester.elementsById('something'),

      responses: [{
        value: [
          { element: newElementId() },
          { element: newElementId() }
        ]
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'id', value: 'something'}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').click(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/click`,
        body: {}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').setValue('value'),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/value`,
        body: { value: ['v', 'a', 'l', 'u', 'e'] }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').clear(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/clear`,
        body: {}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').rect(),

      handleThen: (res, requests) => {
        expect(server.requests).to.eql(requests);
        expect(res).to.eql({
          x: 1,
          y: 2, 
          width: 3,
          height: 4
        });
      },

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: {
          x: 1,
          y: 2, 
          width: 3,
          height: 4
        }
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/rect`,
        body: {}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').text(),

      handleThen: (res, requests) => {
        expect(server.requests).to.eql(requests);
        expect(res).to.eql('foo bar');
      },

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: 'foo bar'
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/text`,
        body: {}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flick({xoffset: 1, yoffset: 2, speed: 3}),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: 1, 
          yoffset: 2, 
          speed: 3
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flickUp(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: 0, 
          yoffset: -2000, 
          speed: 8000
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flickUp(10, 20),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: 0, 
          yoffset: -10, 
          speed: 20
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flickDown(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: 0, 
          yoffset: 2000, 
          speed: 8000
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flickDown(10, 20),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: 0, 
          yoffset: 10, 
          speed: 20
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flickLeft(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: -2000, 
          yoffset: 0, 
          speed: 8000
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flickLeft(10, 20),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: -10, 
          yoffset: 0, 
          speed: 20
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flickRight(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: 2000, 
          yoffset: 0, 
          speed: 8000
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('path').flickRight(10, 20),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {}],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'path'}
      }, {
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/touch/flick`,
        body: {
          element: elementId,
          xoffset: 10, 
          yoffset: 0, 
          speed: 20
        }
      }]
    });

    test({
      exec: () => tester.elementsByXpath('displayed element').isDisplayed(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: true
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'displayed element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/displayed`,
        body: {}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('hidden element').isDisplayed(),

      handleThen: () => { 
        throw new Error('should not get here'); 
      },

      handleCatch: err => {
        expect(err.message).to.equal('element "hidden element[0]" is not displayed');
      },

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'hidden element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/displayed`,
        body: {}
      }]
    });

    test({
      name: "tester.elementsByXpath('visible element').waitDisplayed()",

      exec: () => {
        return tester
          .setImplicitWaitTimeout(200)
          .elementsByXpath('visible element')
          .waitDisplayed();
      },

      responses: [{}, {
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }, {
        value: false,
      }, {
        value: true,
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/timeouts/implicit_wait`,
        body: { ms: 200 } 
      }, { 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'visible element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/displayed`,
        body: {}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/displayed`,
        body: {}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/displayed`,
        body: {}
      }]
    });

    test({
      name: "tester.elementsByXpath('hidden element').waitDisplayed()",

      exec: () => {
        return tester
          .setImplicitWaitTimeout(120)
          .elementsByXpath('visible element')
          .waitDisplayed();
      },

      handleThen: () => {
        throw new Error('should not get here');
      },

      handleCatch: (err) => {
        expect(err.message).to.equal('element "visible element[0]" is not displayed');
      },

      responses: [{}, {
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }, {
        value: false,
      }, {
        value: false,
      }, {
        value: false,
      }]
    });

    test({
      exec: () => tester.elementsByXpath('enabled element').isEnabled(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: true
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'enabled element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/enabled`,
        body: {}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('disabled element').isEnabled(),

      handleThen: () => { 
        throw new Error('should not get here'); 
      },

      handleCatch: err => {
        expect(err.message).to.equal('element "disabled element[0]" is not enabled');
      },

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }],
      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'disabled element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/enabled`,
        body: {}
      }]
    });

    test({
      name: "tester.elementsByXpath('enabled element').waitEnabled()",

      exec: () => {
        return tester
          .setImplicitWaitTimeout(200)
          .elementsByXpath('enabled element')
          .waitEnabled();
      },

      responses: [{}, {
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }, {
        value: false,
      }, {
        value: true,
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/timeouts/implicit_wait`,
        body: { ms: 200 } 
      }, { 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'enabled element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/enabled`,
        body: {}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/enabled`,
        body: {}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/enabled`,
        body: {}
      }]
    });

    test({
      name: "tester.elementsByXpath('disabled element').waitEnabled()",

      exec: () => {
        return tester
          .setImplicitWaitTimeout(120)
          .elementsByXpath('disabled element')
          .waitDisplayed();
      },

      handleThen: () => {
        throw new Error('should not get here');
      },

      handleCatch: (err) => {
        expect(err.message).to.equal('element "disabled element[0]" is not displayed');
      },

      responses: [{}, {
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }, {
        value: false,
      }, {
        value: false,
      }, {
        value: false,
      }]
    });

    test({
      exec: () => tester.elementsByXpath('selected element').isSelected(),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: true
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'selected element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/selected`,
        body: {}
      }]
    });

    test({
      exec: () => tester.elementsByXpath('unselected element').isSelected(),

      handleThen: () => { 
        throw new Error('should not get here'); 
      },

      handleCatch: err => {
        expect(err.message).to.equal('element "unselected element[0]" is not selected');
      },

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }],
      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/selected`,
        body: {using: 'xpath', value: 'unselected element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/selected`,
        body: {}
      }]
    });

    test({
      name: "tester.elementsByXpath('selected element').waitSelected()",

      exec: () => {
        return tester
          .setImplicitWaitTimeout(200)
          .elementsByXpath('selected element')
          .waitSelected();
      },

      responses: [{}, {
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }, {
        value: false,
      }, {
        value: true,
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/timeouts/implicit_wait`,
        body: { ms: 200 } 
      }, { 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'selected element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/selected`,
        body: {}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/selected`,
        body: {}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/selected`,
        body: {}
      }]
    });

    test({
      name: "tester.elementsByXpath('unselected element').waitSelected()",

      exec: () => {
        return tester
          .setImplicitWaitTimeout(120)
          .elementsByXpath('unselected element')
          .waitSelected();
      },

      handleThen: () => {
        throw new Error('should not get here');
      },

      handleCatch: (err) => {
        expect(err.message).to.equal('element "unselected element[0]" is not selected');
      },

      responses: [{}, {
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: false
      }, {
        value: false,
      }, {
        value: false,
      }, {
        value: false,
      }]
    });

    test({
      name: "tester.elementsByXpath('stopping element').waitStop()",

      exec: () => {
        return tester
          .setImplicitWaitTimeout(200)
          .elementsByXpath('stopping element')
          .waitStop();
      },

      responses: [{}, {
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: {
          x: 1,
          y: 1
        }
      }, {
        value: {
          x: 2, 
          y: 1
        }
      }, {
        value: {
          x: 2,
          y: 1
        },
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/timeouts/implicit_wait`,
        body: { ms: 200 } 
      }, { 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'xpath', value: 'stopping element'}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/rect`,
        body: {}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/rect`,
        body: {}
      }, {
        method: 'GET',
        path: `/wd/hub/session/${sessionId}/element/${elementId}/rect`,
        body: {}
      }]
    });

    test({
      name: "tester.elementsByXpath('moving element').waitStop()",

      exec: () => {
        return tester
          .setImplicitWaitTimeout(120)
          .elementsByXpath('moving element')
          .waitStop();
      },

      handleThen: () => {
        throw new Error('should not get here');
      },

      handleCatch: (err) => {
        expect(err.message).to.equal('element "moving element[0]" did not stop moving');
      },

      responses: [{}, {
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }, {
        value: {
          x: 1,
          y: 1
        }
      }, {
        value: {
          x: 1, 
          y: 2
        }
      }, {
        value: {
          x: 1,
          y: 3
        }
      }, {
        value: {
          x: 2,
          y: 1
        }
      }]
    });

  })
  
  describe('AndroidTester', () => {
    let tester;

    before(() => {
      tester = new AndroidTester(options);
      server.responses = [{sessionId}];
      return tester.init();
    });

    it('should extend Tester', () => {
      expect(tester).to.be.a(Tester);
    });

    test({
      exec: () => tester.viewsById('some_id'),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'id', value: 'fi.foo.bar:id/some_id'}
      }]
    });

    test({
      exec: () => tester.viewById('some_id'),

      responses: [{
        value: [
          { element: elementId },
          { element: newElementId() }
        ]
      }],

      requests: [{ 
        method: 'POST',
        path: `/wd/hub/session/${sessionId}/elements`,
        body: {using: 'id', value: 'fi.foo.bar:id/some_id'}
      }]
    });

  });

  function test({
    only = false, 
    name, 
    exec, 
    responses = [{}], 
    requests,
    handleThen,
    handleCatch
  }) {
    (only ? it.only : it)(name || exec.toString().substr(6), done => {
      server.responses = responses;

      exec().then(res => {
        try {
          (handleThen || defaultHandleThen)(res, requests);
          done();
        } catch (err) {
          done(err);
        }
      }).catch(err => {
        try {
          (handleCatch || defaultHandleCatch)(err);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  }

  function defaultHandleThen(res, requests) {
    expect(server.requests).to.eql(requests);
  }

  function defaultHandleCatch(err) {
    throw err;
  }
});