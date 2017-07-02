const { Tester } = require('./Tester');

class AndroidTester extends Tester {

  constructor(options) {
    super(options);
    this.packageName = options.packageName;
  }

  texts() {
    return this.elementsByClassName(`android.widget.TextView`).then(views => {
      return Promise.all(views.map(it => it.text()));
    });
  }

  textViews(text) {
    if (text === undefined) {
      return this.elementsByClassName(`android.widget.TextView`);
    } else {
      return this.elementsByXpath(`//android.widget.TextView[@text=\"${text}\"]`);
    }
  }

  textView(text) {
    return this.textView(text);
  }

  textInputs(text) {
    if (text === undefined) {
      return this.elementsByClassName(`android.widget.EditText`);
    } else {
      return this.elementsByXpath(`//android.widget.EditText[@text=\"${text}\"]`);
    }
  }

  textInput(text) {
    return this.textInputs(text);
  }

  buttons(text) {
    if (text === undefined) {
      return this.elementsByClassName(`android.widget.Button`);
    } else {
      return this.elementsByXpath(`//android.widget.Button[@text=\"${text}\"]`);
    }
  }

  button(text) {
    return this.buttons(text);
  }

  viewsById(id) {
    return this.elementsById(`${this.packageName}:id/${id}`);
  } 

  viewById(id) {
    return this.viewsById(id);
  } 
}

module.exports = {
  AndroidTester
};