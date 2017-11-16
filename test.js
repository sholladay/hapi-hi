import test from 'ava';
import alignJson from 'json-align';
import { Server } from 'hapi';
import pkg from './package';
import hi from '.';

const mockRoute = (option) => {
    return {
        method : 'GET',
        path   : '/',
        handler(request, reply) {
            reply('foo');
        },
        ...option
    };
};

const createServer = async (option) => {
    const { plugin, route } = {
        plugin : hi,
        route  : mockRoute(),
        ...option
    };
    const server = new Server();
    server.connection();
    if (plugin) {
        await server.register(plugin);
    }
    if (route) {
        server.route(route);
    }
    return server;
};

const mockRequest = (server, option) => {
    return server.inject({
        method : 'GET',
        url    : '/',
        ...option
    });
};

test('without plugin', async (t) => {
    const server = await createServer({
        plugin : null
    });
    const response = await mockRequest(server, {
        url : '/status'
    });
    t.is(response.statusCode, 404);
    t.is(response.payload, JSON.stringify({
        statusCode : 404,
        error      : 'Not Found',
        message    : 'Not Found'
    }));
});

test('provides a status route', async (t) => {
    const server = await createServer();
    const response = await mockRequest(server, {
        url : '/status'
    });
    t.is(response.statusCode, 200);
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
    const server = await createServer();
    const response = await mockRequest(server);
    t.is(response.statusCode, 200);
    t.is(response.payload, 'foo');
});
