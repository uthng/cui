function Coordinate(consul) {
  this.consul = consul
  this.apiUrl = consul.apiUrl + "/coordinate"
  this.axios = consul.axios
}

Coordinate.prototype.getDatacenters = function(token) {
  return this.axios
    .$get(this.apiUrl + "/datacenters", {
      crossDomain: true,
      headers: { "X-Consul-Token": token }
    })
    .then(json => {
      var data = json
      var datacenters = []
      // Get only datacenter fields
      for (var i = 0; i < data.length; i++) {
        datacenters.push(data[i].Datacenter)
      }

      return datacenters
    })
}

Coordinate.prototype.getNodes = function(token) {
  return this.axios
    .$get(this.apiUrl + "/nodes", {
      crossDomain: true,
      headers: { "X-Consul-Token": token }
    })
    .then(json => {
      return json
    })
}

export default Coordinate
