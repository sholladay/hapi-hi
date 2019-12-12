'use strict';

const joi = require('@hapi/joi');
const alignJson = require('json-align');
const readPkgUp = require('read-pkg-up');

const register = async (server, option) => {
    const config = joi.attempt(option, joi.object().required().keys({
        cwd        : joi.string().required(),
        noConflict : joi.boolean().optional()
    }));
    const { packageJson } = await readPkgUp({ cwd : config.cwd });
    const { name : appName, version : appVersion } = packageJson;

    server.route({
        method : 'GET',
        path   : (config.noConflict ? `/__${appName}` : '') + '/status',
        config : {
            tags        : ['health', 'monitor', 'status'],
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
    pkg : readPkgUp.sync({ cwd : __dirname }).packageJson
};
