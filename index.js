'use strict';

const alignJson = require('json-align');
const readPkgUp = require('read-pkg-up');

const register = async (server, option) => {
    const { pkg } = await readPkgUp({ cwd : option.cwd });
    const { name : appName, version : appVersion } = pkg;

    server.route({
        method : 'GET',
        path   : (option.noConflict ? `/__${appName}` : '') + '/status',
        config : {
            tags        : ['health', 'status', 'monitor'],
            description : 'Check if the server is healthy',
            auth        : false
        },
        handler(request, h) {
            const status = {
                appName,
                appVersion,
                statusCode : 200,
                status     : 'OK',
                time       : (new Date()).toISOString(),
                process    : {
                    uptime  : process.uptime(),
                    title   : process.title,
                    version : process.versions.node,
                    pid     : process.pid
                }
            };

            return h.response(alignJson(status)).type('application/json');
        }
    });
};

module.exports.plugin = {
    register,
    pkg : readPkgUp.sync({ cwd : __dirname }).pkg
};
