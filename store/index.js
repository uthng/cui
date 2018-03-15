import consul from '~/lib/consul/consul'

export const GET_DATACENTERS = 'GET_DATACENTERS'
export const SET_DATACENTER = 'SET_DATACENTER'

export const state = () => ({
  sidebar: false,
  datacenters: [],
  selectedDatacenter: ''
})

export const mutations = {
  toggleSidebar (state) {
    state.sidebar = !state.sidebar
  },

  GET_DATACENTERS (state, data) {
    state.datacenters = [ ...data ]
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
        // commit(GET_DATACENTERS, ['dc1-fr', 'dc1-nl'])
        commit(SET_DATACENTER, res.datacenters[0])
      })
    return Promise.all([datacenters])
  },
  selectDatacenter ({ commit }, dc) {
    commit(SET_DATACENTER, dc)
  }
}
