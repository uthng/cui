function ACL(consul) {
  this.consul = consul
  this.apiUrl = consul.apiUrl + "/acl"
  this.axios = consul.axios
}

ACL.prototype.list = function list(token) {
  return this.axios
    .$get(this.apiUrl + "/list", {
      crossDomain: true,
      headers: {
        "X-Consul-Token": token
      }
    })
    .then(json => {
      // console.log(json.data)
      return json
    })
}

ACL.prototype.read = function(uuid, token) {
  return this.axios.$get(this.apiUrl + "/info/" + uuid, {
    crossDomain: true,
    headers: {
      "X-Consul-Token": token
    }
  })
}

ACL.prototype.create = function(acl, token) {
  var newAcl = Object.assign({}, acl)
  delete newAcl.CreateIndex
  delete newAcl.ModifyIndex

  return this.axios.$put(this.apiUrl + "/create", newAcl, {
    crossDomain: true,
    headers: {
      "X-Consul-Token": token
    }
  })
}

ACL.prototype.update = function(acl, token) {
  return this.axios.$put(this.apiUrl + "/update", acl, {
    crossDomain: true,
    headers: {
      "X-Consul-Token": token
    }
  })
}

ACL.prototype.delete = function(uuid, token) {
  return this.axios.$put(
    this.apiUrl + "/destroy/" + uuid,
    {},
    {
      crossDomain: true,
      headers: {
        "X-Consul-Token": token
      }
    }
  )
}

ACL.prototype.clone = function(uuid, token) {
  return this.axios.put(
    this.apiUrl + "/clone/" + uuid,
    {},
    {
      crossDomain: true,
      headers: {
        "X-Consul-Token": token
      }
    }
  )
}

// const consulKV = new KV(CONSUL_API_URL)
export default ACL
