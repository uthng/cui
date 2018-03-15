import Coordinate from './coordinate.js'

import {
  CONSUL_API_URL
} from '~/config'

function Consul (apiUrl) {
  this.apiUrl = apiUrl

  this.coordinate = new Coordinate(this)
}

const consul = new Consul(CONSUL_API_URL)

export default consul
