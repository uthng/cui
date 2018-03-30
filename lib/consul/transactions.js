import axios from 'axios'

function Transactions (consul) {
  this.consul = consul
  this.apiUrl = this.consul.apiUrl + '/v1/txn'
}

Transactions.prototype.applyMultiKeys = function applyMultiKeys (transactions) {
  var url = this.apiUrl
  return axios.put(url, transactions, { crossDomain: true })
    .then(json => {
      return { results: json.data }
    })
    .catch(e => {
      return { error: e }
    })
}

// const consulKV = new KV(CONSUL_API_URL)
export default Transactions
