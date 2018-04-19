import Coordinate from './coordinate.js'
import Health from './health.js'
import KV from './kv.js'
import Transactions from './transactions.js'
import ACL from './acl.js'
// import Cookie from 'js-cookie'
// import axios from 'axios'
// import _ from 'lodash'

import {
  CONSUL_API_URL
} from '~/config'

function Consul (apiUrl) {
  this.apiUrl = apiUrl

  this.coordinate = new Coordinate(this)
  this.health = new Health(this)
  this.kv = new KV(this)
  this.transactions = new Transactions(this)
  this.acl = new ACL(this)
}

const consul = new Consul(CONSUL_API_URL)

export default consul
