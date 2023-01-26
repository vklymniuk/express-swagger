# ManageTeam Express Swagger

Complete express middleware for ManageTeam JavaScript services. Features:

+ Swagger UI middleware
+ Swagger validation middleware
+ Swagger file assembly

Installation
------------

Create `.npmrc` file near the `package.json` file with `registry="https://nexus.infra.manageteam.internal/repository/vklymniuk-npm-group/"` content. Then install with:

```bash
npm install --save vklymniuk-express-swagger
```

Usage
-----

```javascript
import express from "express";
import enableSwagger from "vklymniuk-express-swagger";

const app = express();

await enableSwagger(app, { // Second parameter (options) is optional, defaults are listed below
    route: "/swagger",
    yamlPath: "src/swagger",
    enableUi: true
});
```

Directory structure under `yamlPath` directory:

```
- definitions
  - order.yaml
  - response.yaml
- paths
  - index.yaml
  - order.yaml
template.yaml
```

Missing `template.yaml` file will be replaced with default template:

```
swagger: "2.0"
info:
  description: ""
  version: "1.0"
  title: DreamTeam Token Provider Payment Service
consumes:
  - application/json
produces:
  - application/json
definitions:
  {DEFINITION_FILE_NAME}:
    ...
paths:
  {CONTENTS_OF_FILES_IN_PATHS_DIRECTORY}
```

See [Ethereum Gateway service](http://gitlab-service.manageteam.ec2-internal/blockchain/ethereum-gateway) for usage example.

License
-------

[MIT](LICENSE) (c) [Valdimir Klymniuk