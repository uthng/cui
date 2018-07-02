import _ from "lodash"
import VueNotifications from "vue-notifications"

function KV(consul) {
  this.consul = consul
  this.apiUrl = consul.apiUrl + "/kv"
  this.axios = consul.axios
}

KV.prototype.getAllKeys = function(path, token) {
  var url = this.apiUrl
  if (path !== "") {
    url = url + path
  }

  url = url + "/?keys" + (this.consul.dc !== "" ? "&dc=" + this.consul.dc : "")

  return this.axios
    .$get(url, { crossDomain: true, headers: { "X-Consul-Token": token } })
    .then(json => {
      return json
    })
}

KV.prototype.getRecurseKeys = function(path, token) {
  var url = this.apiUrl
  if (path !== "") {
    url = url + path
  }

  url =
    url + "/?recurse" + (this.consul.dc !== "" ? "&dc=" + this.consul.dc : "")

  return this.axios
    .$get(url, { crossDomain: true, headers: { "X-Consul-Token": token } })
    .then(json => {
      return json
    })
    .catch(e => {
      VueNotifications.error({ message: e.response.statusText })
      return []
    })
}

KV.prototype.getDepthKeys = function(path, token, depth = 1) {
  var url = this.apiUrl + "/"
  let result = {}
  let self = this
  let arrPaths = []

  arrPaths.push(path)

  async function loop(paths, currentDepth) {
    for (let i = 0; i < paths.length; i++) {
      let path = paths[i]
      let key = url + path

      if (key[key.length - 1] === "/") {
        key =
          key +
          "?keys&separator=/" +
          (self.consul.dc !== "" ? "&dc=" + self.consul.dc : "")

        let responses = await self.axios.$get(key, {
          crossDomain: true,
          headers: {
            "X-Consul-Token": token
          }
        })

        if (path !== "") {
          // transform key to key object with dot
          path = path.substr(0, path.lastIndexOf("/"))
          path = path.replace(/\//gi, ".")

          _.set(result, path, {})
        }

        if (currentDepth < depth) {
          let res = await loop(responses, currentDepth + 1)

          result = Object.assign(result, res)
        }
      } else {
        key =
          key +
          "?separator=/" +
          (self.consul.dc !== "" ? "&dc=" + self.consul.dc : "")

        let responses = await self.axios.$get(key, {
          crossDomain: true,
          headers: {
            "X-Consul-Token": token
          }
        })

        let value = responses[0].Value

        if (!_.isNil(value)) {
          let buff = Buffer.from(value, "base64")
          value = buff.toString("ascii")
        } else {
          value = ""
        }

        path = path.replace(/\//gi, ".")

        _.set(result, path, value)
      }
    }

    return result
  }

  return loop(arrPaths, 0)
}

export default KV
