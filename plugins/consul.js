import Consul from "~/lib/consul/consul"
import { CONSUL_API_URL } from "~/config"

export default ({ app, store }, inject) => {
  // Create a new install Consul
  console.log("plugin " + store.state.selectedDatacenter)
  let consul = new Consul(
    CONSUL_API_URL,
    app.$axios,
    store.state.selectedDatacenter
  )
  // Inject it to context so we can access it by:
  // this.$consul, context.app.$consul
  inject("consul", consul)
}
