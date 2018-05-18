import jsCookie from "js-cookie"
import cookie from "cookie"

export const UPDATE_LISTDATACENTERS = "UPDATE_LISTDATACENTERS"
export const UPDATE_LISTNODES = "UPDATE_LISTNODES"
export const SET_DATACENTER = "SET_DATACENTER"
export const UPDATE_CONSULKV = "UPDATE_CONSULKV"
// export const GET_CONSULKV = 'GET_CONSULKV'
export const UPDATE_ACLSTATUS = "UPDATE_ACLSTATUS"
export const SET_CTOK = "SET_CTOK"
export const SET_CTOK_EXPIRATION = "SET_CTOK_EXPIRATION"
export const UPDATE_CONSULACLLIST = "UPDATE_CONSULACLLIST"
export const UPDATE_KEYPATHOBJECT = "UPDATE_KEYPATHOBJECT"
export const UPDATE_KEYPATHMODIFLIST = "UPDATE_KEYPATHMODIFLIST"
export const UPDATE_KEYPERMISSIONS = "UPDATE_KEYPERMISSIONS"

export const state = () => ({
  sidebar: false,
  listDatacenters: [],
  listNodes: [],
  aclStatus: false,
  consulAclList: [],
  selectedDatacenter: "",
  keyPathObject: {},
  keyPathModifList: [],
  ctok: "",
  ctok_expiration: 0,
  keyPermissions: []
})

export const mutations = {
  toggleSidebar(state) {
    state.sidebar = !state.sidebar
  },

  UPDATE_LISTDATACENTERS(state, data) {
    state.listDatacenters = [...data]
  },

  UPDATE_LISTNODES(state, data) {
    state.listNodes = [...data]
  },

  SET_DATACENTER(state, data) {
    state.selectedDatacenter = data
  },

  SET_CTOK(state, data) {
    state.ctok = data
  },

  SET_CTOK_EXPIRATION(state, data) {
    state.ctok_expiration = data
  },

  UPDATE_ACLSTATUS(state, data) {
    state.aclStatus = data
  },

  UPDATE_CONSULACLLIST(state, data) {
    state.consulAclList = [...data]
  },

  UPDATE_KEYPATHOBJECT(state, data) {
    state.keyPathObject = data
  },

  UPDATE_KEYPATHMODIFLIST(state, data) {
    state.keyPathModifList = [...data]
  },

  UPDATE_KEYPERMISSIONS(state, data) {
    state.keyPermissions = [...data]
  }
}

export const actions = {
  nuxtServerInit({ commit }, context) {
    return new Promise(resolve => {
      // Get back cookie vtok  & user and set them to states
      let cookies = cookie.parse(context.req.headers.cookie || "")
      if (cookies.hasOwnProperty("cui_ctok")) {
        commit(SET_CTOK, cookies.cui_ctok)
      }

      if (cookies.hasOwnProperty("cui_ctok_expiration")) {
        commit(SET_CTOK_EXPIRATION, cookies.cui_ctok_expiration)
      }

      if (cookies.hasOwnProperty("cui_dc")) {
        commit(SET_DATACENTER, cookies.cui_dc)
      }

      resolve(true)
    })
  },
  selectDatacenter({ commit }, dc) {
    jsCookie.set("cui_dc", dc)

    commit(SET_DATACENTER, dc)
  },
  updateKeyPathObject({ commit }, obj) {
    commit(UPDATE_KEYPATHOBJECT, obj)
  },
  updateKeyPathModifList({ commit }, obj) {
    commit(UPDATE_KEYPATHMODIFLIST, obj)
  },
  setCtok({ commit }, token) {
    // Set cookie expiration time to 15mins
    var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000)

    jsCookie.set("cui_ctok", token, {
      expires: inFifteenMinutes,
      secure: false
    })
    jsCookie.set("cui_ctok_expiration", inFifteenMinutes.getTime(), {
      expires: inFifteenMinutes,
      secure: false
    })

    commit(SET_CTOK, token)
    commit(SET_CTOK_EXPIRATION, inFifteenMinutes.getTime())
  },
  updateConsulAclList({ commit }, list) {
    commit(UPDATE_CONSULACLLIST, list)
  },

  updateListDatacenters({ commit }, list) {
    commit(UPDATE_LISTDATACENTERS, list)
  },

  updateListNodes({ commit }, list) {
    commit(UPDATE_LISTNODES, list)
  },

  updateAclStatus({ commit }, status) {
    commit(UPDATE_ACLSTATUS, status)
  },

  updateKeyPermissions({ commit }, perms) {
    commit(UPDATE_KEYPERMISSIONS, perms)
  }
}
