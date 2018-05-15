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

ACL.prototype.read = function (uuid, token = '') {
  var url = this.apiUrl + '/info/' + uuid + (token !== '' ? '?token=' + token : '')

  return axios.get(url, { crossDomain: true })
    .catch(e => {
      console.log(e)
    })
}

ACL.prototype.create = function (acl, token = '') {
  var newAcl = Object.assign({}, acl)
  delete newAcl.CreateIndex
  delete newAcl.ModifyIndex

  var url = this.apiUrl + '/create' + (token !== '' ? '?token=' + token : '')

  return axios.put(url, newAcl, { crossDomain: true })
    .catch(e => {
      console.log(e)
    })
}

ACL.prototype.update = function (acl, token = '') {
  var url = this.apiUrl + '/update' + (token !== '' ? '?token=' + token : '')

  return axios.put(url, acl, { crossDomain: true })
    .catch(e => {
      console.log(e)
    })
}

ACL.prototype.delete = function (uuid, token = '') {
  var url = this.apiUrl + '/destroy/' + uuid + (token !== '' ? '?token=' + token : '')

  return axios.put(url, {}, { crossDomain: true })
    .catch(e => {
      console.log(e)
    })
}

ACL.prototype.clone = function (uuid, token = '') {
  var url = this.apiUrl + '/clone/' + uuid + (token !== '' ? '?token=' + token : '')

  return axios.put(url, {}, { crossDomain: true })
    .catch(e => {
      console.log(e)
    })
}

// const consulKV = new KV(CONSUL_API_URL)
export default ACL
