import axios from 'axios'

function ACL (consul) {
  this.consul = consul
  this.apiUrl = this.consul.apiUrl + '/v1/acl'
}

ACL.prototype.list = function list (token = '') {
  var url = this.apiUrl + '/list' + (token !== '' ? '?token=' + token : '')

  return axios.get(url, { crossDomain: true })
    .then(json => {
      // console.log(json.data)
      return { acls: json.data }
    })
    .catch(e => {
      // console.log(e)
      return { error: e }
    })
}

// const consulKV = new KV(CONSUL_API_URL)
export default ACL
