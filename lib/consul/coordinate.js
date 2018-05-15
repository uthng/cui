import axios from "axios"

function Coordinate(consul) {
  this.consul = consul
  this.apiUrl = this.consul.apiUrl + "/v1/coordinate/"
}

Coordinate.prototype.getDatacenters = function getDatacenters() {
  return axios
    .get(this.apiUrl + "datacenters", { crossDomain: true })
    .then(json => {
      var data = json.data
      var datacenters = []
      // Get only datacenter fields
      for (var i = 0; i < data.length; i++) {
        datacenters.push(data[i].Datacenter)
      }

      return { datacenters: datacenters }
    })
    .catch(e => {
      return { error: e }
    })
}

Coordinate.prototype.getNodes = function getNodes() {
  return axios
    .get(this.apiUrl + "nodes", { crossDomain: true })
    .then(json => {
      return { nodes: json.data }
    })
    .catch(e => {
      return { error: e }
    })
}

// const consulCoordinate = new Coordinate(CONSUL_API_URL)
export default Coordinate
