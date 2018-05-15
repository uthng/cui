import Coordinate from "./coordinate.js"
import Health from "./health.js"
import KV from "./kv.js"
import Transactions from "./transactions.js"
import ACL from "./acl.js"

function Consul(apiUrl, axios) {
  this.apiUrl = apiUrl
  this.axios = axios

  this.coordinate = new Coordinate(this)
  this.health = new Health(this)
  this.kv = new KV(this)
  this.transactions = new Transactions(this)
  this.acl = new ACL(this)
}

export default Consul
