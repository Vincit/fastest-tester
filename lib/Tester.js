const { Session } = require('./Session');

class Tester {

  static get Session() {
    return Session;
  }

  constructor(options) {
    const Session = this.constructor.Session;

    this.session = options.session || new Session(options);
    this.currentElements = [];
    this.currentElementIndex = 0;
    this.currentElementsSelector = null;
    this.executeChain = null;
    this.timeout = 10000;

    this.promise = new Promise((resolve, reject) => {
      this.executeChain = resolve;
    });
  }

  get currentElement() {
    if (this.currentElementIndex >= this.currentElements.length) {
      throw new Error(`could not find element "${this.currentElementsSelector}[${this.currentElementIndex}]"`);
    } else {
      return this.currentElements[this.currentElementIndex];
    }
  }

  /**
   * Set how long to wait for various things to happen before throwing an error.
   * 
   * For example if no elements are found for a specific selector an error is thrown
   * after trying to find them for `timeout` milliseconds.
   * 
   * @param {number} timeout
   *    Timeout in milliseconds.
   */
  setImplicitWaitTimeout(timeout) {
    return this.then(() => {
      this.timeout = value(timeout);
      return this.session.setImplicitWaitTimeout(this.timeout);
    });
  }

  /**
   * Select the `index`th result element of the previous `elements` call as the current element.
   * 
   * @returns {WebDriverChain}
   */
  at(index) {
    return this.then(() => {
      this.currentElementIndex = value(index);
    });
  }

  /**
   * Select the `index`th last result element of the previous `elements` call as the current element.
   * 
   * @returns {WebDriverChain}
   */
  reverseAt(index) {
    return this.then(() => {
      this.currentElementIndex = this.currentElements.length - value(index) - 1;
    });
  }

  /**
   * This must be called once to start things off.
   * 
   * @returns {Promise}
   *    When this promise is resolved, the test chain execution is started.
   */
  init() {
    return this.session.create().then(() => this.executeChain());
  }

  /**
   * This must be called once after the tests to release resources.
   * 
   * @returns {Promise}
   */
  quit() {
    return this.then(() => this.session.destroy());
  }

  /**
   * Finds elements.
   * 
   * @param {string} using
   *    The algorithm to use. Must be one of ['xpath', 'class name', 'id'].
   * 
   * @param {string} selector
   *    The element selector.
   * 
   * @returns {WebDriverChain}
   */
  elements({using, selector}) {
    return this.then(() => {
      return this.session.elements({using: value(using), selector: value(selector)}).then(elements => {
        this.currentElements = elements;
        this.currentElementIndex = 0;
        this.currentElementsSelector = selector;
        return elements;
      });
    });
  }

  /**
   * Find elements using xpath selector.
   * 
   * @param {string} selector 
   * @returns {WebDriverChain}
   */
  elementsByXpath(selector) {
    return this.elements({using: 'xpath', selector});
  }

  /**
   * Find elements using id.
   * 
   * @param {string} selector 
   * @returns {WebDriverChain}
   */
  elementsById(selector) {
    return this.elements({using: 'id', selector});
  }

  /**
   * Find elements using class name.
   * 
   * @param {string} selector 
   * @returns {WebDriverChain}
   */
  elementsByClassName(selector) {
    return this.elements({using: 'class name', selector});
  }

  /**
   * Click the current element.
   */
  click() {
    return this.then(() => this.currentElement.click());
  }

  /**
   * Send text to the current element.
   */
  setValue(val) {
    return this.then(() => this.currentElement.setValue(value(val)));
  }

 /**
  * Clear text from the current element.
  */
  clear() {
    return this.then(() => this.currentElement.clear());
  }

 /**
  * Return the text of the current element
  */
  text() {
    return this.then(() => this.currentElement.text());
  }

 /**
  * Return the bounding box of the current element
  */
  rect() {
    return this.then(() => this.currentElement.rect());
  }

  /**
   * Flick the current element.
   */
  flick({xoffset, yoffset, speed}) {
    return this.then(() => {
      return this.currentElement.flick({
        xoffset: value(xoffset), 
        yoffset: value(yoffset), 
        speed: value(speed)
      });
    });
  }

  /**
   * Flick the current element up.
   */
  flickUp(offset, speed) {
    return this.then(() => this.currentElement.flickUp(value(offset), value(speed)));
  }

  /**
   * Flick the current element down.
   */
  flickDown(offset, speed) {
    return this.then(() => this.currentElement.flickDown(value(offset), value(speed)));
  }

  /**
   * Flick the current left.
   */
  flickLeft(offset, speed) {
    return this.then(() => this.currentElement.flickLeft(value(offset), value(speed)));
  }

  /**
   * Flick the current right.
   */
  flickRight(offset, speed) {
    return this.then(() => this.currentElement.flickRight(value(offset), value(speed)));
  }

  /**
   * Assert that the current element is visible.
   */
  isDisplayed() {
    return this.then(() => this._isDisplayed());
  }

  /**
   * @private
   */
  _isDisplayed() {
    return this.currentElement
      .isDisplayed()
      .then(isDisplayed => {
        if (!isDisplayed) {
          throw new Error(`element "${this.currentElementsSelector}[${this.currentElementIndex}]" is not displayed`);
        } else {
          return isDisplayed;
        }
      });
  }

  /**
   * Wait until the current element is visible. An error is thrown if the element is not
   * visible after the implicit wait timeout. See `setImplicitWaitTimeout` method.
   */
  waitDisplayed(timeout) {
    return this.then(() => {
      return this.poll(() => {
        return this._isDisplayed();
      }, value(timeout));
    });
  }

  /**
   * Assert that the current element is visible.
   */
  isEnabled() {
    return this.then(() => this._isEnabled());
  }

  /**
   * @private
   */
  _isEnabled() {
    return this.currentElement
      .isEnabled()
      .then(isEnbaled => {
        if (!isEnbaled) {
          throw new Error(`element "${this.currentElementsSelector}[${this.currentElementIndex}]" is not enabled`);
        } else {
          return isEnbaled;
        }
      });
  }

  /**
   * Wait until the current element is enabled. An error is thrown if the element is not
   * enabled after the implicit wait timeout. See `setImplicitWaitTimeout` method.
   */
  waitEnabled(timeout) {
    return this.then(() => {
      return this.poll(() => {
        return this._isEnabled();
      }, value(timeout));
    });
  }

  /**
   * Assert that the current element is selected.
   */
  isSelected() {
    return this.then(() => this._isSelected());
  }

  /**
   * @private
   */
  _isSelected() {
    return this.currentElement
      .isSelected()
      .then(isSelected => {
        if (!isSelected) {
          throw new Error(`element "${this.currentElementsSelector}[${this.currentElementIndex}]" is not selected`);
        } else {
          return isSelected;
        }
      });
  }

  /**
   * Wait until the current element is selected. An error is thrown if the element is not
   * selected after the implicit wait timeout. See `setImplicitWaitTimeout` method.
   */
  waitSelected(timeout) {
    return this.then(() => {
      return this.poll(() => {
        return this._isSelected();
      }, value(timeout));
    });
  }

  /**
   * Assert that the current element is not visible.
   */
  isNotDisplayed() {
    return this.then(() => {
      if (this.currentElements.length == 0) {
        return true;
      } else {
        return this.currentElement.isDisplayed().then(isDisplayed => {
          if (isDisplayed) {
            throw new Error(`element "${this.currentElementsSelector}[${this.currentElementIndex}]" is displayed`);
          } else {
            return true;
          }
        });
      }
    });
  }

  /**
   * Wait until the current element stops moving.
   */
  waitStop(timeout) {
    return this.then(() => {
      let prevRect = null;
      
      return this.poll(() => {
        return this.currentElement.rect().then(rect => {
          if (prevRect === null || prevRect.x !== rect.x || prevRect.y !== rect.y) {
            prevRect = rect;
            // Retry.
            throw new Error(`element "${this.currentElementsSelector}[${this.currentElementIndex}]" did not stop moving`);
          }
        });
      }, value(timeout));
    });
  }

  sleep(time) {
    return this.then(() => new Promise(resolve => setTimeout(resolve, value(time))));
  }

  windowRect() {
    return this.then(() => this.session.windowRect());
  }

  resetApp() {
    return this.then(() => this.session.resetApp());
  }

  hideKeyboard() {
    return this.then(() => this.session.hideKeyboard());
  }

  then(...args) {
    this.promise = this.promise.then(...args);
    return this;
  }

  catch(...args) {
    this.promise = this.promise.catch(...args);
    return this;
  }

  poll(op, timeout) {
    const pollInterval = 50;
    const startTime = Date.now();

    const doPoll = () => {
      return op().catch(err => {
        const theTimeout = timeout || this.timeout;

        if (Date.now() - startTime < theTimeout) {
          return delay(pollInterval).then(doPoll);
        } else {
          throw err;
        }
      });
    };

    return doPoll();
  }
}

function delay(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

function value(val) {
  if (typeof val === 'function') {
    return val();
  } else {
    return val;
  }
}

module.exports = {
  Tester
};
