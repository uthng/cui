# CUI: Consul UI
Another Web UI written in VueJS & NuxtJS to manage Consul easily. It uses directly Consul HTTP API and still under heavy development.

![CUI Demo](./docs/images/cui_demo.gif)

## Current features:
- Token login: with expiration time. A renew notification will be display to allow to renew token 5 mins before it expires
- Node & Service Health dashboard
- KV store:
  - Tree view editor to manage KV operations: create, clone, edit and delete
  - Transaction support: all modifications are first saved locally with different colors. And then, they can be applied at once.
  - Clone: allow to copy a key with all its childrens to a new key under the same key parent
- ACL: full management (create, edit and delete)

## Build Setup:

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

```

## Docker:

To run CUI using the Docker image:

```bash
docker run -d --name cui -e CONSUL_API_URL=http://consul_api_url:8200/v1 -p 4000:3000 uthng/cui:0.2.0
```

**Environment variables:**
- CONSUL_API_URL: Consul endpoint with version


## Configuration:

### CUI:

To run and to communicate with Consul, CUI loads the configuration file `config.js` in which the following informations need to be specified:

```javascript
export const CONSUL_API_URL = "http://consul_api_url:8200/v1"
```

This configuration file will be generated automatically if you are using the Docker image.

### Consul:

##### 1. CORS:

CUI communicates directly with Consul HTTP API, so in order to avoid CORS issues, the following configuration needs to be set first in Consul servers' configuration file:

```json
{
  "http_config": {
    "response_headers": {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PUT",
      "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Consul-Token"
    }
  }
}

```

##### 2. Rules

CUI needs access to get node and service health informations, so the following rules needs to be set for all ACLs:

```hcl
# Read only nodes & services to dashboard display in CUI app
node "" {
  policy = "read"
}

service "" {
  policy = "read"
}
```
