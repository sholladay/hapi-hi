'use strict';

const alignJson = require('json-align');
const readPkgUp = require('read-pkg-up');

const register = (server, option, next) => {
    readPkgUp({ cwd : option.cwd })
        .catch((err) => {
            next(err);
        })
        .then((found) => {
            const { name : appName, version : appVersion } = found.pkg;

            server.route({
                method : 'GET',
                path   : (option.noConflict ? `/__${appName}` : '') + '/status',
                config : {
                    tags        : ['health', 'status', 'monitor'],
                    description : 'Check if the server is healthy.',
                    auth        : false,
                    handler(request, reply) {
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

                        reply(alignJson(status))
                        // Inform Hapi that our string is actually valid JSON.
                        .type('application/json');
                    }
                }
            });

            next();
        });
};

register.attributes = {
    pkg : readPkgUp.sync({ cwd : __dirname }).pkg
};

module.exports = {
    register
};