<template>
  <v-container fluide>
    <v-layout row wrap>
      <v-flex xs12>
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
        <consul-view :data="jsonSource" :options="{maxDepth: 7}"/>
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

export default {
  components: {
    ConsulView,
    Loader
  },
  data: () => {
    return {
      dlgLoading: false
    }
  },
  computed: {
    jsonSource() {
      return this.$store.state.keyPathObject
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

      await this.getRecurseKv("")

      this.dlgLoading = false
    } catch (error) {
      console.log(error)
      this.dlgLoading = false
      this.showMsg({ type: "error", message: error })
    }
  },
  methods: {
    getRecurseKv: async function(path) {
      var kv = await this.$consul.kv.getRecurseKeys(
        path,
        this.$store.state.ctok
      )
      var mapPaths = {}

      // Get value of key to base64 decoding
      for (var i = 0; i < kv.length; i++) {
        var value = kv[i].Value
        if (value !== undefined && value !== null) {
          let buff = Buffer.from(value, "base64")
          value = buff.toString("ascii")
        }
        // Create key path object
        object.createObjectByPath(mapPaths, "/", kv[i].Key, value)
      }

      this.$store.dispatch("updateKeyPathObject", mapPaths)
    },
    applyModifications: async function() {
      try {
        this.dlgLoading = true

        var list = _.cloneDeep(this.$store.state.keyPathModifList)
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
            txn.KV.Verb = "delete"
          }

          txn.KV.Key = list[i].path
          transactions.push(txn)
        }

        await this.$consul.transactions.applyMultiKeys(
          transactions,
          this.$store.state.ctok
        )

        this.getRecurseKv("")

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
      var curKeyPathObject = _.cloneDeep(this.$store.state.keyPathObject)

      // Because of using transaction, we can delete a key path which is not
      // empty. So this recursive function tries to add all child path to
      // remove
      function recurse(keyPath) {
        if (keyPath[keyPath.length - 1] == "/") {
          keyPathModifList.push({ path: path, value: "", type: "R" })
          let obj = object.getObjectValueByPath(
            curKeyPathObject,
            "/",
            keyPath.substr(0, keyPath.length - 1)
          )
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              recurse(keyPath + key)
            }
          }
        } else {
          let obj = object.getObjectValueByPath(curKeyPathObject, "/", keyPath)
          keyPathModifList.push({ path: keyPath, value: obj, type: "R" })
        }
      }

      recurse(path)

      keyPathModifList.push({ path: path, value: "", type: "R" })

      this.$store.dispatch("updateKeyPathModifList", keyPathModifList)
      this.showMsg({
        message: "The key " + path + " has been added to remove!"
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
