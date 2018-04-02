import axios from 'axios'

function ACL (consul) {
  this.consul = consul
  this.apiUrl = this.consul.apiUrl + '/v1/acl'
}

ACL.prototype.list = function applyMultiKeys (transactions) {
  var url = this.apiUrl + '/list'
  return axios.get(url, { crossDomain: true })
    .then(json => {
      return { acls: json.data }
    })
    .catch(e => {
      return { error: e }
    })
}

// const consulKV = new KV(CONSUL_API_URL)
export default ACL
