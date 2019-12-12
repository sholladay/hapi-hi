# hapi-hi [![Build status for hapi Hi](https://travis-ci.com/sholladay/hapi-hi.svg?branch=master "Build Status")](https://travis-ci.com/sholladay/hapi-hi "Builds")

> Status route for your server

## Why?

 - Provides useful metrics about your server.
 - Response format is friendly to humans and machines.
 - Knowing service health helps you recover from errors.

## Install

```sh
npm install hapi-hi --save
```

## Usage

Register the plugin on your server to provide the health check endpoint.

```js
const hapi = require('hapi');
const hi = require('hapi-hi');

const server = hapi.server();

const init = async () => {
    await server.register({
        plugin  : hi,
        options : {
            cwd : __dirname
        }
    });
    await server.start();
    console.log('Server ready:', server.info.uri);
};

init();
```

Visiting `/status` will return a JSON response with app info because of this plugin.

```json
{
    "appName"    : "my-project",
    "appVersion" : "1.0.0",
    "statusCode" : 200,
    "status"     : "OK",
    "time"       : "2016-10-06T13:48:10.586Z",
    "process"    : {
        "uptime"  : 519163.478,
        "title"   : "node /srv/my-project/bin/my-project.js",
        "version" : "6.3.1",
        "pid"     : 23794,
    }
}
```

## API

### option

Type: `object`

Plugin settings.

#### cwd

Type: `string`<br>
Default: `process.cwd()`

Where to begin a [find-up search](https://github.com/sindresorhus/read-pkg-up) for your project's package.json. Used to provide the name and version of your app in the status route response.

#### noConflict

Type: `boolean`<br>
Default: `false`

Apply a `/__${appName}` prefix to the status route, where `${appName}` is replaced with the `name` from your package.json. This is useful for reverse proxies to remain transparent (e.g. ensure they don't accidentally block access to a file called `status`).

## Contributing

See our [contributing guidelines](https://github.com/sholladay/hapi-hi/blob/master/CONTRIBUTING.md "Guidelines for participating in this project") for more details.

1. [Fork it](https://github.com/sholladay/hapi-hi/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/hapi-hi/compare "Submit code to this project for review").

## License

[MPL-2.0](https://github.com/sholladay/hapi-hi/blob/master/LICENSE "License for hapi-hi") © [Seth Holladay](https://seth-holladay.com "Author of hapi-hi")

Go make something, dang it.
