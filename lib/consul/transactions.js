import VueNotifications from "vue-notifications"

function Transactions(consul) {
  this.consul = consul
  this.apiUrl = consul.apiUrl + "/txn"
  this.axios = consul.axios
}

Transactions.prototype.applyMultiKeys = function(transactions, token) {
  return this.axios
    .$put(this.apiUrl, transactions, {
      crossDomain: true,
      headers: { "X-Consul-Token": token }
    })
    .then(json => {
      return json
    })
    .catch(e => {
      for (var i = 0; i < e.Errors; i++) {
        VueNotifications.error({
          message: e.Errors[i].OpIndex + ": " + e.Errors[i].What
        })
      }
    })
}

// const consulKV = new KV(CONSUL_API_URL)
export default Transactions
