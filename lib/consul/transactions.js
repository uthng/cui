import VueNotifications from "vue-notifications"

function Transactions(consul) {
  this.consul = consul
  this.apiUrl = consul.apiUrl + "/txn"
  this.axios = consul.axios
}

Transactions.prototype.applyMultiKeys = function(transactions, token) {
  return new Promise((resolve, reject) => {
    return this.axios
      .$put(this.apiUrl, transactions, {
        crossDomain: true,
        headers: { "X-Consul-Token": token }
      })
      .then(json => {
        resolve(json)
      })
      .catch(e => {
        var res = e.response.data
        for (var i = 0; i < res.Errors.length; i++) {
          VueNotifications.error({
            message: res.Errors[i].OpIndex + ": " + res.Errors[i].What
          })
        }
        reject(e)
      })
  })
}

// const consulKV = new KV(CONSUL_API_URL)
export default Transactions
