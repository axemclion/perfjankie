# perfjankie

PerfJankie uses [browser-perf](http://github.com/axemclion/browser-perf) to measure browser rendering performance metrics and tabulate the results in a CouchDB database. 
It is a node module available as [perfjankie](http://npmjs.org/package/perfjankie) and can be integrated into any continuous integration system. 

## Why ? 
Checking for performance regressions is hard. Though most modern browsers have excellent performance measurement tools, it is hard for a developer to check these tools for every commit. Just as unit tests check for regressions in functionality, perfjankie will help with checking regressions in browser rendering performance when integrated into systems like Travis or Jenkins. 
Perfjankie is inspired by the work done with [topcoat](http://bench.topcoat.io). 

## How ? (Usage)
Perfjankie is a node module and can be installed using `npm --save-dev install perfjankie`. Once installed, it can be integrated into a build process (like [Grunt](http://gruntjs.com)). The API call looks like


```javascript

var perfjankie = require('perfjankie');
perfjankie({
  "url": "http://localhost:9000/testpage.html", // URL of the page that you would like to test.

  /* The next set of values identify the test */
  name: "Component or Webpage Name", // A friendly name for the URL. This is shown as component name in the dashboard
  suite: "optional suite name", // Displayed as the title in the dashboard. Only 1 suite name for all components
  time: new Date().getTime(), // Used to sort the data when displaying graph. Can be the time when a commit was made
  run: "commit#Hash", // A hash for the commit, displayed in the x-axis in the dashboard
  repeat: 3, // Run the tests 3 times. Default is 1 time
  /* Properties identifying the test environment */
  browsers: [{ // This can also be a ["chrome", "firefox"] or "chrome,firefox"
    browserName: "chrome",
    version: 32,
    platform: "Windows 8.1"
  }], // See browser perf browser configuration for all options. 

  selenium: {
    hostname: "ondemand.saucelabs.com", // or localhost or hub.browserstack.com
    port: 80,
  },

  BROWSERSTACK_USERNAME: process.env.BROWSERSTACK_USERNAME, // If using browserStack
  BROWSERSTACK_KEY: process.env.BROWSERSTACK_KEY, // If using browserStack, this is automatically added to browsers object

  SAUCE_USERNAME: process.env.SAUCE_USERNAME, // If using Saucelabs
  SAUCE_ACCESSKEY: process.env.SAUCE_ACCESSKEY, // If using Saucelabs

  /* A way to log the information - can be bunyan, or grunt logs. */
  log: { // Expects the following methods,  
    fatal: grunt.fail.fatal.bind(grunt.fail),
    error: grunt.fail.warn.bind(grunt.fail),
    warn: grunt.log.error.bind(grunt.log),
    info: grunt.log.ok.bind(grunt.log),
    debug: grunt.verbose.writeln.bind(grunt.verbose),
    trace: grunt.log.debug.bind(grunt.log)
  },

  /* Identifies where the data and the dashboard are saved */
  couch: {
    server: 'http://localhost:5984',
    database: 'performance',
    updateSite: !process.env.CI, // If true, updates the couchApp that shows the dashboard. Set to false in Continuous integration cases
    onlyUpdateSite: false // No data to upload, just update the site. Recommended to do from dev box as couchDB instance requires special access to create views
  },

  callback: function(err, res) {
    // The callback function, err is falsy if all of the following happen
    // 1. Browsers perf tests ran
    // 2. Data has been saved in couchDB
    // err is not falsy even if update site fails. 
  }

});

```

The dashboard is also a couch app and looks like the following 

![PerfJankie Dashboard](https://gist.github.com/axemclion/8228048/raw/21265227543f9efcd3e3ab606a3991b0ae13e0f9/untitled.png "PerfJankie Dashboard")

## What does it measure? 
Perfjankie measures page rendering times. It basically collects metrics like page load time, first paint time, scroll time, etc. It can be used on 
* long, scrollable web pages (like a search result page, an article page, etc). The impact of changes to CSS, sticky headers and scrolling event handlers can be seen in the results. 
* components (like bootstrap, jQuery UI components, ReactJS components, AngularJS components, etc). Component developers just have to place the component multiple times on a page and will know if they caused perf regressions as they continue developing the component. 
For more information, see the documentation for [browser-perf](http://github.com/axemclion/browser-perf)
