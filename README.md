# Tester for the Fastest mobile test framework

```js
const { Server } = require('fastest-server');
const { AndroidTester } = require('fastest-tester');

describe('My app tests', () => {
  const port = 12345;

  let server;
  let tester;

  before(() => {
    server = new Server({
      port,
      // Android SDK path. If omitted ANDROID_HOME env variable is used.
      sdkPath: '/path/to/sdk/root'
    });

    return server.start();
  });

  before(() => {
    tester = new AndroidTester({
      serverUrl: `http://localhost:${port}`,

      app: 'path/to/the/app.apk',
      packageName: 'fi.your.package.name'
      platformName: 'Android',
      platformVersion: '6.0',

      // Name of the android virtual device (if using emulator).
      avdName: 'Sony_xperia_z5_compact_API_23',
      // The android emulator device name.
      deviceName: 'emulator-5554'
    });

    return tester.init();
  });

  it('should test some crap', () => {
    return tester
      // Click a button with text 'Do stuff'.
      .button('Do stuff').click()
      // Wait until a text view with text 'Some stuff was done' becomes visible.
      .textView('Some stuff was done').waitVisible()
      // Guess what this does?
      .flickRight()
      // Test that something is visible without waiting.
      .textView('I became visible').isVisible()
      // Get all visible text inputs (EditTexts) and write some text to them.
      .textInputs()
        .at(0).setValue('foo')
        .at(1).setValue('bar')
        // Last visible text input.
        .reverseAt(0).setValue('eggs')
      // Select an element by android id and get its text.
      .viewById('some_id').text().then(text => {
        console.log(text);
      });
  });

});
```