import Coordinate from './coordinate.js'
import Health from './health.js'
import KV from './kv.js'

import {
  CONSUL_API_URL
} from '~/config'

function Consul (apiUrl) {
  this.apiUrl = apiUrl

  this.coordinate = new Coordinate(this)
  this.health = new Health(this)
  this.kv = new KV(this)
}

const consul = new Consul(CONSUL_API_URL)

export default consul
