const _ = require('lodash');
const { Element } = require('./Element');
const { Connection } = require('./Connection');

class Session {

  static get Element() {
    return Element;
  }

  static get Connection() {
    return Connection;
  }

  constructor(options) {
    const Connection = this.constructor.Connection;

    this.connection = options.connection || new Connection({serverUrl: options.serverUrl});
    this.desiredCapabilities = _.omit(options, value => typeof value === 'object');
    this.id = null;
  }

  create() {
    return this.connection
      .post({
        path: 'session', 
        data: {
          desiredCapabilities: this.desiredCapabilities
        }
      })
      .then(res => {
        this.id = res.body.sessionId;
        return res.body;
      });
  }

  destroy() {
    return this.connection
      .delete({path: `session/${this.id}`})
      .then(res => {
        this.id = null;
      });
  }

  setImplicitWaitTimeout(timeout) {
    return this.post({
      path: 'timeouts/implicit_wait', 
      data: {
        ms: timeout
      }
    });
  }

  windowRect() {
    return this
      .get({
        path: 'window/rect', 
      })
      .then(res => {
        return res.body.value;
      });
  }

  elements({using, selector}) {
    return this.post({
      path: 'elements', 
      data: {
        using,
        value: selector
      }
    }).then(res => this.wrapElements(res));
  }

  resetApp() {
    return this.post({
      path: 'appium/app/reset', 
      data: {}
    });
  }

  hideKeyboard() {
    return this.post({
      path: 'appium/device/hide_keyboard', 
      data: {}
    });
  }

  get({path}) {
    return this.connection.get({
      path: this.path(path)
    });
  }

  post({path, data}) {
    return this.connection.post({
      path: this.path(path), 
      data
    });
  }

  path(path) {
    return `session/${this.id}/${path}`;
  }

  wrapElements(res) {
    const Element = this.constructor.Element;
    return res.body.value.map(el => new Element({json: el, session: this}));
  }
}

module.exports = {
  Session
};