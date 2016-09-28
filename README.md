# perfjankie

PerfJankie is a tool to monitor smoothness and responsiveness of websites and Cordova/Hybrid apps over time. It runs performance tests using [browser-perf](http://github.com/axemclion/browser-perf) and saves the results in a CouchDB server. 
It also has a dashboard that displays graphs of the performance metrics collected over time that you help identify performance trends, or locate a single commit that can slow down a site. 

After running the tests, navigate to the following url to see the results dashboard. 

> http://couchdb.serverl.url/databasename/_design/site/index.html

Here is a [dashboard](http://nparashuram.com/perfslides/perfjankie) created from a [sample project](http://github.com/axemclion/perfslides). 

![Perfjankie sample dashboard](http://i.imgur.com/3VO8T4C.png "A sample dashboard for perfjankie")

## Why ? 
Checking for performance regressions is hard. Though most modern browsers have excellent performance measurement tools, it is hard for a developer to check these tools for every commit. Just as unit tests check for regressions in functionality, perfjankie will help with checking regressions in browser rendering performance when integrated into systems like Travis or Jenkins. 

The results dashboard 
## Setup
Perfjankie requires Selenium as the driver to run tests and CouchDB to store the results. Since this is based on browser-perf, look at [setting up browser-perf](https://github.com/axemclion/browser-perf/wiki/Setup-Instructions) for more information. 

## Usage

Perfjankie can be used as a node module, from the command line, or as a Grunt task and can be installed from npm using `npm install perfjankie`. 

### Node Module

The API call looks like the following

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

  /* Identifies where the data and the dashboard are saved */
  couch: {
    server: 'http://localhost:5984',    
    requestOptions : { "proxy" : "http://someproxy" }, // optional, e.g. useful for http basic auth, see Please check [request] for more information on the defaults. They support features like cookie jar, proxies, ssl, etc.
    database: 'performance', 
    updateSite: !process.env.CI, // If true, updates the couchApp that shows the dashboard. Set to false in when running Continuous integration, run this the first time using command line. 
    onlyUpdateSite: false // No data to upload, just update the site. Recommended to do from dev box as couchDB instance may require special access to create views.
  },

  callback: function(err, res) {
    // The callback function, err is falsy if all of the following happen
    // 1. Browsers perf tests ran
    // 2. Data has been saved in couchDB
    // err is not falsy even if update site fails. 
  },

  /* OPTIONS PASSED TO BROWSER-PERF  */
  // Properties identifying the test environment */
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
  }

});

```

Other options that can be passed include `preScript`, `actions`, `metrics`, `preScriptFile`, etc. Note that most of these options are similar to the options passed to browser-perf. Refer to the [browser-perf options](https://github.com/axemclion/browser-perf/wiki/Node-Module---API) for a mode detailed explanation. 

### Grunt Task
To run perfjankie as a Grunt task, simple load task using `grunt.loadNpmTasks('perfjankie');`, define a `perfjankie` task and pass in all the options from above as options to the Grunt task. [Here](https://github.com/axemclion/perfslides/blob/38b4f6e246c5ab971ce2957ec78bb701dbbc3038/Gruntfile.js#L57) is an example. 

### Command line
Run `perfjankie --help` to see a list of all the options. 
Quick Note - to only update site the first time, run the following from the command line. You need to quote the URL to work with parameters, e.g. https://www.google.de/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=angular

```bash
$ perfjankie --config-file=local.config.json --only-update-site 'example.com'
```
Or without a config file

```bash
$ perfjankie --couch-server=http://localhost:5984 --couch-database=perfjankie-test --couch-user=admin_user --couch-pwd=admin_pass --name=Google 'https://www.google.de/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=angular'
```

The config file can contain server configuration and can look like [this](https://github.com/axemclion/perfjankie/blob/master/test/res/local.config.json). 

## Hosting dashboard on a different server
You can also host the HTML/CSS/JS for displaying the results dashboard on not on CouchDB, but a different static server, possibly behind a CDN. In such cases, 
1. Use the npm module and host the contents of the `site` folder. 
2. Open index.html and insert the following snippet in the `<head>` section

```html
<script type="text/javascript">window.DB_BASE="http://couchdb.server.url/databasename/_design";</script>
```

This will ensure that all requests for data are made to the other CouchDB server. Also ensure that the CouchDB server has CORS turned on. 

## Login before running tests

You can login a user, or perform other kinds of page setup using the [preScript](https://github.com/axemclion/browser-perf/wiki/Node-Module---API#prescript) or the [preScriptFile](https://github.com/axemclion/browser-perf/wiki/Node-Module---API#prescriptfile) options. Here is an [example](https://github.com/axemclion/browser-perf/wiki/FAQ#how-can-i-test-a-page-that-requires-login) of a login action that can be passed in the preScript option. 

## Migrating data from older versions 
If you have older data and want to move to the latest release of perfjankie, you may also have to migrate your data. You can migrate from older version of a database to a newer version using 

```bash
$ perfjankie --config-file=local.config.json --migrate=newDatabaseName
```

This simply transforms all the old data into a format that will work with the newer version of perfjankie. Your version of the database is stored under a document called `version`, and the version supported by your installed version of perfjankie is the key `dbVersion` in the `package.json`

## What does it measure? 

Perfjankie measures page rendering times. It collects metrics like frame times, page load time, first paint time, scroll time, etc. It can be used on 
* long, scrollable web pages (like a search result page, an article page, etc). The impact of changes to CSS, sticky headers and scrolling event handlers can be seen in the results. 
* components (like bootstrap, jQuery UI components, ReactJS components, AngularJS components, etc). Component developers just have to place the component multiple times on a page and will know if they caused perf regressions as they continue developing the component. 
For more information, see the documentation for [browser-perf](http://github.com/axemclion/browser-perf)

# Development

## Dev setup

Any changes should be verified with unit tests, see `test`-folder.
To run the tests you local couchdb installed with a database, see `test/res/local.config.json` for details:

  1. start couchdb
  2. start a local selenium grd: `java -jar node_modules/selenium-server/lib/runner/selenium-server-standalone-2.53.0.jar  -Dwebdriver.chrome.driver=$(pwd)/chromedriver/lib/chromedriver/chromedriver`
  3. run tests via `npm test`