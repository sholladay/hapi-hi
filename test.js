import test from 'ava';
import alignJson from 'json-align';
import hapi from '@hapi/hapi';
import pkg from './package.json';
import hi from '.';

const makeRoute = (option) => {
    return {
        method : 'GET',
        path   : '/',
        handler() {
            return 'foo';
        },
        ...option
    };
};

const makeServer = async (option) => {
    const { plugin } = {
        plugin : {
            plugin  : hi,
            options : {
                cwd : __dirname
            }
        },
        ...option
    };
    const server = hapi.server();
    if (plugin) {
        await server.register(plugin);
    }
    return server;
};

test('without plugin', async (t) => {
    const server = await makeServer({ plugin : null });
    server.route(makeRoute());
    const response = await server.inject('/status');
    t.is(response.statusCode, 404);
    t.is(response.headers['content-type'], 'application/json; charset=utf-8');
    t.is(response.payload, JSON.stringify({
        statusCode : 404,
        error      : 'Not Found',
        message    : 'Not Found'
    }));
});

test('server can initialize', async (t) => {
    const server = await makeServer();
    await t.notThrowsAsync(server.initialize());
});

test('provides a status route', async (t) => {
    const server = await makeServer();
    const response = await server.inject('/status');
    t.is(response.statusCode, 200);
    t.is(response.headers['content-type'], 'application/json; charset=utf-8');
    t.is(typeof response.payload, 'string');

    const parsed = JSON.parse(response.payload);

    t.is(typeof parsed.time, 'string');
    t.false(Number.isNaN(Date.parse(parsed.time)));
    t.true(Date.parse(parsed.time) <= Date.now());
    delete parsed.time;

    t.is(typeof parsed.process.uptime, 'number');
    t.true(parsed.process.uptime > 0);
    t.true(parsed.process.uptime <= process.uptime());
    delete parsed.process.uptime;

    t.deepEqual(parsed, {
        appName    : pkg.name,
        appVersion : pkg.version,
        statusCode : 200,
        status     : 'OK',
        process    : {
            title   : process.title,
            version : process.versions.node,
            pid     : process.pid
        }
    });

    t.is(response.payload, alignJson(JSON.parse(response.payload)));
});

test('does not affect non-status routes', async (t) => {
    const server = await makeServer();
    server.route(makeRoute());
    const response = await server.inject('/');
    t.is(response.statusCode, 200);
    t.is(response.headers['content-type'], 'text/html; charset=utf-8');
    t.is(response.payload, 'foo');
});
