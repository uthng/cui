import axios from 'axios'

function KV (consul) {
  this.consul = consul
  this.apiUrl = this.consul.apiUrl + '/v1/kv/'
}

KV.prototype.getAllKeys = function getAllKeys (path) {
  var url = this.apiUrl
  if (path !== '') {
    url = url + path
  }

  url = url + '?keys'
  return axios.get(url, { crossDomain: true })
    .then(json => {
      return { keys: json.data }
    })
    .catch(e => {
      return { error: e }
    })
}

KV.prototype.getRecurseKeys = function getRecurseKeys (path) {
  var url = this.apiUrl
  if (path !== '') {
    url = url + path
  }

  url = url + '?recurse'
  return axios.get(url, { crossDomain: true })
    .then(json => {
      return { keys: json.data }
    })
    .catch(e => {
      return { error: e }
    })
}

// const consulKV = new KV(CONSUL_API_URL)
export default KV
