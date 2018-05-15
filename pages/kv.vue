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
        <tree-view :data="jsonSource" :options="{maxDepth: 7}"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import _ from "lodash"
import TreeView from "~/components/jsoneditor/TreeView.vue"

export default {
  components: {
    TreeView
  },
  data: () => {
    return {}
  },
  computed: {
    jsonSource() {
      return this.$store.state.keyPathObject
    },
    nbModifications() {
      return this.$store.state.keyPathModifList.length
    }
  },
  async asyncData({ store }) {
    //  let res = await consul.kv.getRecurseKeys('')
    //  var mapPaths = {}

    //  if (res.keys === undefined) {
    //    await store.dispatch('updateKeyPathObject', mapPaths)
    //  }

    // Get value of key to base64 decoding
    //  for (var i = 0; i < res.keys.length; i++) {
    //    var value = res.keys[i].Value
    //    if (value !== undefined && value !== null) {
    //      value = Base64.decode(value)
    //    }

    // Create key path object
    //    object.createObjectByPath(mapPaths, '/', res.keys[i].Key, value)
    //  }

    // store keypathobject to store
    //  await store.dispatch('updateKeyPathObject', mapPaths)

    await store.dispatch("getConsulKv", "")
  },
  methods: {
    applyModifications: function() {
      var list = _.cloneDeep(this.$store.state.keyPathModifList)
      this.$store.dispatch("updateTxnConsulKv", list)
    }
  }
}
</script>
