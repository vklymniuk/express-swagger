const swaggerValidation = require("swagger-express-middleware");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
const { fileSync } = require("tmp");
const walkSync = require("walk-sync");
const { readFileSync, writeFileSync, existsSync } = require("fs");

const defaultTemplate = `swagger: "2.0"
info:
  description: ""
  version: "1.0"
  title: ManageTeam Token Provider Payment Service
consumes:
  - application/json
produces:
  - application/json`;

function pad (string, spaces) {
    const str = Array.from({ length: spaces }, () => " ").join("");

    return str + string.replace(/\n/g, "\n" + str);
}

function assembleYaml (yamlPath) {
    const file = fileSync();
    const pPath = `${ yamlPath }/paths`;
    const defsPath = `${ yamlPath }/definitions`;
    const paths = walkSync(pPath);
    const definitions = walkSync(defsPath);
    const template = existsSync(`${ yamlPath }/template.yaml`)
        ? readFileSync(`${ yamlPath }/template.yaml`).toString()
        : defaultTemplate;
    const dataToWrite = template + "\ndefinitions:\n" + definitions.map(fileName => {
        const defName = fileName.replace(/\.[^.]+$/, "");
        const contents = readFileSync(`${ defsPath }/${ fileName }`).toString();

        return "  " + defName + ":\n" + pad(contents, 4);
    }).join("\n") + "\npaths:\n" + paths.map(fileName => {
        const contents = readFileSync(`${ pPath }/${ fileName }`).toString();

        return pad(contents, 2);
    }).join("\n");
    writeFileSync(file.name, dataToWrite);

    return file;
}

/**
 * @param app 
 * @param config 
 * @returns {Promise}
 */
module.exports = async function (expressApp, config = {}) {

    config = Object.assign({}, {
        route: "/swagger",
        yamlPath: "src/swagger",
        enableUi: true
    }, config);

    const swaggerDocumentFile = assembleYaml(config.yamlPath);

    if (config.enableUi) {
        expressApp.use(config.route, swaggerUi.serve, swaggerUi.setup(yaml.load(swaggerDocumentFile.name)));
    }

    return new Promise((resolve, reject) => {
        swaggerValidation(swaggerDocumentFile.name, expressApp, (err, middleware) => {

            if (err) {
                return reject(err);
            }

            expressApp.use(
                middleware.metadata(),
                middleware.parseRequest(),
                middleware.validateRequest(),
                function (err, _, res, next) {
                    if (res.headersSent) {
                        return next(err);
                    }
                    res.status(400).json({
                        error: err.message
                    });
                }
            );
            swaggerDocumentFile.removeCallback();
            resolve();
        });
    });
};