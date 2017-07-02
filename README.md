# Tester for the Fastest mobile test framework

```js
const { AndroidTester } = require('fastest-tester');

describe('My app tests', () => {
  let tester;

  before(() => {
    tester = new AndroidTester({
      serverUrl: `http://localhost:12345`,
      caps: capabilities,
      packageName: 'my.app.package.name')
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
      .textView('I became visible').isVisible();
  });

});
```