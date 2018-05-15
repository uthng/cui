import Consul from "~/lib/consul/consul"
import { CONSUL_API_URL } from "~/config"

export default ({ app }, inject) => {
  // Create a new install Consul
  let consul = new Consul(CONSUL_API_URL, app.$axios)
  // Inject it to context so we can access it by:
  // this.$consul, context.app.$consul
  inject("consul", consul)
}
