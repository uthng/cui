import axios from "axios"

function Health(consul) {
  this.consul = consul
  this.apiUrl = this.consul.apiUrl + "/v1/health/"
}

Health.prototype.getNodeHealth = function getNodeHealth(nodeName) {
  return axios
    .get(this.apiUrl + "node/" + nodeName, { crossDomain: true })
    .then(json => {
      return { healths: json.data }
    })
    .catch(e => {
      return { error: e }
    })
}

Health.prototype.getAllNodeHealths = function getAllNodeHealths(nodes) {
  var allNodeHealths = []
  for (var i = 0; i < nodes.length; i++) {
    // Get a promise on getNodeHealth
    allNodeHealths[i] = this.getNodeHealth(nodes[i].Node).then(res => {
      var healths = res.healths
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
