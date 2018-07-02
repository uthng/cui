<template>
  <v-container fluide>
    <v-layout row wrap>
      <v-flex xs6>
        <div class="text-xs-left mt-2">
          <v-switch
            :label="`${folded === true ? 'Folded' : 'Unfolded' }`"
            v-model="folded"
            @change="onSwitchChange"
          />
        </div>
      </v-flex>
      <v-flex xs6>
        <div class="text-xs-right mb-4">
          <v-badge left class="mx-0 px-0">
            <span slot="badge">{{ nbModifications }}</span>
            <span class="grey--text text--darken-1">MODIFICATIONS</span>
          </v-badge>
          &nbsp;&nbsp;
          <v-btn :disabled="nbModifications < 1" flat class="mx-0 px-0" @click="applyModifications()">Apply</v-btn>
        </div>
      </v-flex>
      <v-flex xs12>
        <consul-view :data="jsonSource" :permissions="keyPermissions" :options="{maxDepth: 7}"/>
      </v-flex>
    </v-layout>
    <loader v-model="dlgLoading" />
  </v-container>
</template>

<script>
import _ from "lodash"
import ConsulView from "~/components/consul-editor/ConsulView.vue"
import Loader from "~/components/loader/loader.vue"
import object from "~/lib/utils/object"
import gopherhcl from "gopher-hcl"
export default {
  components: {
    ConsulView,
    Loader
  },
  data: () => {
    return {
      dlgLoading: false,
      folded: true
    }
  },
  computed: {
    jsonSource() {
      return this.$store.state.keyPathObject
    },
    keyPermissions: function() {
      return this.$store.state.keyPermissions
    },
    nbModifications() {
      return this.$store.state.keyPathModifList.length
    }
  },
  mounted: async function() {
    // Listen event to add key path
    this.$root.$on("add-key-path", data => {
      this.createKeyPath(data)
    })

    // Listen event to delete key path
    this.$root.$on("delete-key-path", data => {
      this.deleteKeyPath(data)
    })

    // Listen event to clone key path
    this.$root.$on("clone-key-path", data => {
      this.cloneKeyPath(data)
    })

    // (Re)load key value
    this.$root.$on("load-key-path", data => {
      let modifs = this.$store.state.keyPathModifList

      // Only reload on existing path, not on new added path
      // still in modification list
      let found = modifs.find(modif => {
        return modif.path === data && modif.type === "A"
      })

      if (_.isNil(found)) {
        this.getRecurseKv([data])
      }
    })

    // Listen event to modify key value
    this.$root.$on("modify-key-value", data => {
      this.modifyKeyValue(data)
    })

    // Listen event to delete key value
    this.$root.$on("delete-key-value", data => {
      this.deleteKeyValue(data)
    })

    try {
      this.dlgLoading = true

      await this.getRecurseKv([""])

      await this.getKeyPolicies()

      this.dlgLoading = false
    } catch (error) {
      console.log(error)
      this.dlgLoading = false
      this.showMsg({ type: "error", message: error })
    }
  },
  methods: {
    getRecurseKv: async function(paths) {
      try {
        this.dlgLoading = true
        var mapPaths = _.cloneDeep(this.$store.state.keyPathObject)
        var modifs = _.cloneDeep(this.$store.state.keyPathModifList)
        var keyPath = ""

        // Check if path is in modification list and is a new path
        var kv = await this.$consul.kv.getDepthKeys(
          paths,
          this.$store.state.ctok,
          2
        )

        // Update the paths
        for (let i = 0; i < paths.length; i++) {
          let path = paths[i]

          // Override the path's value
          if (path !== "") {
            //transform key to key object with dot
            keyPath = this.convertKeyToPathObject(path)

            _.set(mapPaths, keyPath, _.get(kv, keyPath))
          } else {
            mapPaths = Object.assign(mapPaths, kv)
          }
        }

        // Re-apply modifs
        for (let i = 0; i < modifs.length; i++) {
          let modif = modifs[i]
          if (modif.type === "A" || modif.type === "M") {
            let key = modif.path
            let value = modif.value

            key = this.convertKeyToPathObject(key)
            _.set(mapPaths, key, value)
          }
        }

        this.$store.dispatch("updateKeyPathObject", mapPaths)
        this.dlgLoading = false
      } catch (error) {
        console.log(error)
        this.dlgLoading = false
        this.showMsg({ type: "error", message: error })
      }
    },
    applyModifications: async function() {
      try {
        this.dlgLoading = true

        var list = _.cloneDeep(this.$store.state.keyPathModifList)
        console.log("list " + JSON.stringify(list))
        var transactions = []

        list.sort(function(a, b) {
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

          if (list[i].type === "A" || list[i].type === "M") {
            txn.KV.Verb = "set"
            txn.KV.Value = ""
            if (list[i].value != null) {
              let buff = Buffer.from(list[i].value, "ascii")
              txn.KV.Value = buff.toString("base64")
            }
          } else if (list[i].type === "R") {
            txn.KV.Verb = "delete-tree"
          }

          txn.KV.Key = list[i].path
          transactions.push(txn)
        }

        //console.log("transaction " + JSON.stringify(transactions))

        await this.$consul.transactions.applyMultiKeys(
          transactions,
          this.$store.state.ctok
        )

        this.getRecurseKv([""])

        // reset modification list
        this.$store.dispatch("updateKeyPathModifList", [])

        this.dlgLoading = false
        this.showMsg({
          message: "All modifications are successfully applied !"
        })
      } catch (error) {
        this.dlgLoading = false
        this.showMsg({ type: "error", message: error })
      }
    },
    createKeyPath: function(kv) {
      var keyPathModifList = _.cloneDeep(this.$store.state.keyPathModifList)
      var curKeyPathObject = _.cloneDeep(this.$store.state.keyPathObject)
      var path = kv.path

      if (kv.key[kv.key.length - 1] == "/") {
        keyPathModifList.push({ path: path + kv.key, value: null, type: "A" })
        // Set new value
        object.createObjectByPath(curKeyPathObject, "/", kv.path + kv.key, null)
      } else {
        // Split kv.key if it has multiple levels
        // Loop and add each level to modified path list to handle color
        var arr = kv.key.split("/")
        for (var i = 0; i < arr.length; i++) {
          if (i < arr.length - 1) {
            path = path + arr[i] + "/"
            keyPathModifList.push({ path: path, value: null, type: "A" })
          } else {
            path = path + arr[i]
            keyPathModifList.push({ path: path, value: kv.value, type: "A" })
          }
        }
        // Set new value
        object.createObjectByPath(
          curKeyPathObject,
          "/",
          kv.path + kv.key,
          kv.value
        )
      }

      this.$store.dispatch("updateKeyPathModifList", keyPathModifList)
      // Update store
      this.$store.dispatch("updateKeyPathObject", curKeyPathObject)
      this.showMsg({
        message:
          "New key " + kv.path + "/" + kv.value + " has been added to create!"
      })
    },
    deleteKeyPath: function(path) {
      var keyPathModifList = _.cloneDeep(this.$store.state.keyPathModifList)
      //var curKeyPathObject = _.cloneDeep(this.$store.state.keyPathObject)

      // Because we use delete-tree in transaction, so we dont care
      // whether the key path has children or not and its value
      keyPathModifList.push({ path: path, value: "", type: "R" })

      //console.log(JSON.stringify(keyPathModifList))

      this.$store.dispatch("updateKeyPathModifList", keyPathModifList)
      this.showMsg({
        message: "The key " + path + " has been added to remove!"
      })
    },
    cloneKeyPath: function(kv) {
      var keyPathModifList = _.cloneDeep(this.$store.state.keyPathModifList)
      var curKeyPathObject = _.cloneDeep(this.$store.state.keyPathObject)
      var path = kv.path + kv.key.substr(0, kv.key.lastIndexOf("/"))

      //console.log("curKey " + JSON.stringify(curKeyPathObject))
      var value = _.get(curKeyPathObject, this.convertKeyToPathObject(path))

      console.log("value " + JSON.stringify(value))
      path = kv.path + kv.newKey.substr(0, kv.newKey.lastIndexOf("/"))

      _.set(curKeyPathObject, this.convertKeyToPathObject(path), value)

      // Because of using transaction, we cannt add a key path which has object as
      // children. So this recursive function tries to add all child path to
      // create
      function recurse(path, val) {
        keyPathModifList.push({ path: path, value: "", type: "A" })
        for (var key in val) {
          if (val.hasOwnProperty(key)) {
            if (_.isObject(val[key])) {
              recurse(path + key + "/", val[key])
            } else {
              keyPathModifList.push({
                path: path + key,
                value: val[key],
                type: "A"
              })
            }
          }
        }
      }

      recurse(path + "/", value)

      //console.log(JSON.stringify(keyPathModifList))

      this.$store.dispatch("updateKeyPathModifList", keyPathModifList)
      // Update store
      this.$store.dispatch("updateKeyPathObject", curKeyPathObject)
      this.showMsg({
        message:
          "New key " + kv.path + "/" + kv.value + " has been added to create!"
      })
    },
    modifyKeyValue: function(kv) {
      // We must clone here because it will be reference object if
      // we use var with = simply
      var curKeyPathObject = _.cloneDeep(this.$store.state.keyPathObject)
      // Set new value
      object.createObjectByPath(curKeyPathObject, "/", kv.key, kv.value)
      // Update store
      this.$store.dispatch("updateKeyPathObject", curKeyPathObject)

      var keyPathModifList = _.cloneDeep(this.$store.state.keyPathModifList)
      keyPathModifList.push({ path: kv.key, value: kv.value, type: "M" })
      this.$store.dispatch("updateKeyPathModifList", keyPathModifList)

      this.showMsg({
        message: "The value of the key " + kv.key + " has been added to modify!"
      })
    },
    deleteKeyValue: function(path) {
      var keyPathModifList = _.cloneDeep(this.$store.state.keyPathModifList)
      keyPathModifList.push({ path: path, value: "", type: "R" })
      this.$store.dispatch("updateKeyPathModifList", keyPathModifList)

      this.showMsg({
        message: "The key " + path + " has been added to remove!"
      })
    },
    getKeyPolicies: async function() {
      try {
        let keyPerms = []
        let token = await this.$consul.acl.read(this.$store.state.ctok)

        if (token[0].Type === "management") {
          keyPerms.push({ key: "", policy: "write" })
        } else {
          let tokenRules = gopherhcl.parse(token[0].Rules)

          // Just looping policies and add only keys begining with secret/
          for (var policy in tokenRules) {
            if (tokenRules.hasOwnProperty(policy)) {
              if (policy === "key") {
                let keys = tokenRules[policy]

                for (var key in keys) {
                  if (keys.hasOwnProperty(key)) {
                    keyPerms.push({ key: key, policy: keys[key]["policy"] })
                  }
                }
              }
            }
          }
        }

        //console.log(JSON.stringify(keyPerms))

        this.$store.dispatch("updateKeyPermissions", keyPerms)
      } catch (error) {
        this.showMsg({ type: "error", message: error })
      }
    },
    convertKeyToPathObject: function(key) {
      let path = key

      if (path[path.length - 1] === "/") {
        path = path.substr(0, path.lastIndexOf("/"))
      }

      path = path.replace(/\//gi, ".")

      return path
    },
    onSwitchChange: function() {
      this.$root.$emit("fold-event", this.folded)
    }
  },
  notifications: {
    showMsg: {
      type: "success",
      title: "",
      message: ""
    }
  }
}
</script>
