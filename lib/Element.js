const _ = require('lodash');
const ELEMENT_ID_REGEX = /element-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

class Element {

  constructor({json, session}) {
    this.session = session;
    
    // WebDriver spec only says that the element id must be in
    // one of the object's own properties.
    this.id = Object.keys(json).map(key => json[key]).find(value => {
      return ELEMENT_ID_REGEX.test(value);
    });
  }

  text() {
    return this.get({
      path: 'text'
    }).then(res => {
      return res.body.value;
    });
  }

  rect() {
    return this.get({
      path: 'rect'
    }).then(res => {
      return res.body.value;
    });
  }

  isDisplayed() {
    return this.get({
      path: 'displayed'
    }).then(res => {
      return res.body.value;
    });
  }

  isEnabled() {
    return this.get({
      path: 'enabled'
    }).then(res => {
      return res.body.value;
    });
  }

  isSelected() {
    return this.get({
      path: 'selected'
    }).then(res => {
      return res.body.value;
    });
  }

  click() {
    return this.post({
      path: 'click',
      data: {}
    });
  }

  flick({xoffset, yoffset, speed}) {
    return this.session.post({
      path: 'touch/flick',
      data: {
        element: this.id,
        xoffset, 
        yoffset,
        speed
      }
    });
  }

  flickUp(offset, speed) {
    // Pixels.
    offset = offset || 2000;
    // Pixels per second.
    speed = speed || 8000

    return this.flick({xoffset: 0, yoffset: -offset, speed});
  }

  flickDown(offset, speed) {
    // Pixels.
    offset = offset || 2000;
    // Pixels per second.
    speed = speed || 8000

    return this.flick({xoffset: 0, yoffset: offset, speed});
  }

  flickLeft(offset, speed) {
    // Pixels.
    offset = offset || 2000;
    // Pixels per second.
    speed = speed || 8000
    
    return this.flick({xoffset: -offset, yoffset: 0, speed});
  }

  flickRight(offset, speed) {
    // Pixels.
    offset = offset || 2000;
    // Pixels per second.
    speed = speed || 8000
    
    return this.flick({xoffset: offset, yoffset: 0, speed});
  }

  setValue(text) {
    return this.post({
      path: 'value',
      data: {
        value: _.map(text, _.identity)
      }
    });
  }

  clear() {
    return this.post({
      path: 'clear',
      data: {}
    });
  }

  get({path}) {
    return this.session.get({
      path: this.path(path)
    });
  }

  post({path, data}) {
    return this.session.post({
      path: this.path(path), 
      data
    });
  }

  path(path) {
    return `element/${this.id}/${path}`;
  }

  toJSON() {
    return {
      ELEMENT: this.id
    };
  }

  toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}

module.exports = {
  Element
};