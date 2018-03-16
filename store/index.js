import consul from '~/lib/consul/consul'

export const GET_DATACENTERS = 'GET_DATACENTERS'
export const GET_NODES = 'GET_NODES'
export const SET_DATACENTER = 'SET_DATACENTER'

export const state = () => ({
  sidebar: false,
  datacenters: [],
  nodes: [],
  selectedDatacenter: ''
})

export const mutations = {
  toggleSidebar (state) {
    state.sidebar = !state.sidebar
  },

  GET_DATACENTERS (state, data) {
    state.datacenters = [ ...data ]
  },

  GET_NODES (state, data) {
    state.nodes = [ ...data ]
  },

  SET_DATACENTER (state, data) {
    state.selectedDatacenter = data
  }
}

export const actions = {
  nuxtServerInit ({ commit }) {
    const datacenters = consul.coordinate.getDatacenters()
      .then(res => {
        commit(GET_DATACENTERS, res.datacenters)
        commit(SET_DATACENTER, res.datacenters[0])
      })

    const nodes = consul.coordinate.getNodes()
      .then(res => {
        commit(GET_NODES, res.nodes)
      })

    return Promise.all([datacenters, nodes])
  },
  selectDatacenter ({ commit }, dc) {
    commit(SET_DATACENTER, dc)
  }
}
