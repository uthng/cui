function Health(consul) {
  this.consul = consul
  this.apiUrl = consul.apiUrl + "/health"
  this.axios = consul.axios
}

Health.prototype.getNodeHealth = function(nodeName, token) {
  let url =
    this.apiUrl +
    "/node/" +
    nodeName +
    (this.consul.dc !== "" ? "?dc=" + this.consul.dc : "")

  return this.axios
    .$get(url, {
      crossDomain: true,
      headers: { "X-Consul-Token": token }
    })
    .then(json => {
      return json
    })
}

Health.prototype.getAllNodeHealths = function(nodes, token) {
  var allNodeHealths = []
  for (var i = 0; i < nodes.length; i++) {
    // Get a promise on getNodeHealth
    allNodeHealths[i] = this.getNodeHealth(nodes[i].Node, token).then(res => {
      var healths = res
      var statuses = []
      // Assemble all statuses
      for (var j = 0; j < healths.length; j++) {
        var st = {
          name: healths[j].Name,
          status: healths[j].Status,
          output: healths[j].Output
        }
        statuses[j] = st
      }
      return { name: healths[0].Node, statuses: statuses }
    })
  }

  // Wait for a promise to return to do synchro
  return Promise.all([...allNodeHealths])
}

// const consulHealth = new Health(CONSUL_API_URL)
export default Health
