import consul from '~/lib/consul/consul'
import object from '~/lib/utils/object'

export const GET_DATACENTERS = 'GET_DATACENTERS'
export const GET_NODES = 'GET_NODES'
export const SET_DATACENTER = 'SET_DATACENTER'
export const UPDATE_CONSULKV = 'UPDATE_CONSULKV'
// export const GET_CONSULKV = 'GET_CONSULKV'
export const CHECK_CONSULACL = 'CHECK_CONSULACL'
export const UPDATE_KEYPATHOBJECT = 'UPDATE_KEYPATHOBJECT'
export const UPDATE_KEYPATHMODIFLIST = 'UPDATE_KEYPATHMODIFLIST'

export const state = () => ({
  sidebar: false,
  datacenters: [],
  nodes: [],
  // consulKeys: {},
  consulAcl: false,
  selectedDatacenter: '',
  keyPathObject: {},
  keyPathModifList: []
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
  },

  // GET_CONSULKV (state, data) {
  // state.consulKeys = data
  // }

  CHECK_CONSULACL (state, data) {
    state.consulAcl = data
  },

  UPDATE_KEYPATHOBJECT (state, data) {
    state.keyPathObject = data
  },

  UPDATE_KEYPATHMODIFLIST (state, data) {
    state.keyPathModifList = [ ...data ]
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
  },
  updateKeyPathObject ({ commit }, obj) {
    commit(UPDATE_KEYPATHOBJECT, obj)
  },
  updateKeyPathModifList ({ commit }, obj) {
    commit(UPDATE_KEYPATHMODIFLIST, obj)
  },
  getConsulKv ({ commit }, path) {
    const kv = consul.kv.getRecurseKeys(path)
      .then(res => {
        // commit(GET_CONSULKV, res.keys)
        var mapPaths = {}

        if (res.keys !== undefined && res.keys !== null) {
          var keys = res.keys

          // Get value of key to base64 decoding
          for (var i = 0; i < keys.length; i++) {
            var value = keys[i].Value
            if (value !== undefined && value !== null) {
              let buff = Buffer.from(value, 'base64')
              value = buff.toString('ascii')
            }
            // Create key path object
            object.createObjectByPath(mapPaths, '/', keys[i].Key, value)
          }
        }
        commit(UPDATE_KEYPATHOBJECT, mapPaths)
      })

    return Promise.all([kv])
  },
  updateTxnConsulKv ({ commit, dispatch }, list) {
    var transactions = []

    list.sort(function (a, b) {
      // Use toUpperCase() to ignore character casing
      const pathA = a.path.toUpperCase()
      const pathB = b.path.toUpperCase()

      let comparison = 0
      if (pathA > pathB) {
        comparison = 1
      } else if (pathA < pathB) {
        comparison = -1
      }
      return comparison * -1
    })

    for (var i = 0; i < list.length; i++) {
      var txn = {}
      txn.KV = {}

      if (list[i].type === 'A' || list[i].type === 'M') {
        txn.KV.Verb = 'set'
        txn.KV.Value = ''
        if (list[i].value != null) {
          let buff = Buffer.from(list[i].value, 'ascii')
          txn.KV.Value = buff.toString('base64')
        }
      } else if (list[i].type === 'R') {
        txn.KV.Verb = 'delete'
      }

      txn.KV.Key = list[i].path
      transactions.push(txn)
    }

    const txns = consul.transactions.applyMultiKeys(transactions)
      .then(res => {
        dispatch('getConsulKv', '')
        // reset modification list
        commit(UPDATE_KEYPATHMODIFLIST, [])
      })

    return Promise.all([txns])
  },
  checkConsulAcl ({ commit }) {
    const acl = consul.acl.list()
      .then(res => {
        var enabled = true

        if (res.error !== undefined && res.error !== null) {
          if (res.error.response.data === 'ACL support disabled') {
            enabled = false
          }
        }

        commit(CHECK_CONSULACL, enabled)
      })

    return Promise.all([acl])
  }

}
