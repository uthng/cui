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

  console.log("consul dc " + this.consul.dc)
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

export default KV
