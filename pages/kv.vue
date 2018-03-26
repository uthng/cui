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
          <v-btn flat :disabled="nbModification > 1" class="mx-0 px-0">Apply</v-btn>
        </div>
      </v-flex>
      <v-flex xs12>
        <tree-view :data="jsonSource" :options="{maxDepth: 7}"></tree-view>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TreeView from '~/components/jsoneditor/TreeView.vue'
import consul from '~/lib/consul/consul'
import object from '~/lib/utils/object'

export default {
  data: () => {
  return {
  //    jsonSource: {"csl-tec-vault-dc1-fr":{"auth":{"959668e3-af15-d83e-c6d9-99df1ff57a31":{"group":{},"user":{}}},"core":{"cluster":{"local":{}},"leader":{},"wrapping":{}},"logical":{"2565dd12-8b0f-3736-9f2d-3ea9d5a6cc27":{"chrysalis":{"apikey":{"phpipam":{}},"passwords":{"powerdns":{}},"ssh-keys":{}},"partners":{"ssh-keys":{}},"travel":{"ssh-keys":{}}},"784394ed-7dfb-1df6-a6c1-1394ff26cd26":{"packer":{"buckets":{}}}},"sys":{"policy":{},"token":{"accessor":{},"id":{}}}}}
    }
  },
  components: {
    TreeView
  },
  computed: {
    jsonSource () { return this.$store.state.keyPathObject },
    nbModifications () { return this.$store.state.keyPathModifList.length }
  },
  async asyncData ({store}) {
    let res = await consul.kv.getRecurseKeys('')
    var mapPaths = {}

    if (res.keys === undefined) {
      await store.dispatch('updateKeyPathObject', mapPaths)
    }

    // Get value of key to base64 decoding
    for (var i = 0; i < res.keys.length; i++) {
      var value = res.keys[i].Value
      if (value !== undefined && value !== null) {
        value = Base64.decode(value)
      }

      // Create key path object
      object.createObjectByPath(mapPaths, '/', res.keys[i].Key, value)
    }

    // store keypathobject to store
    await store.dispatch('updateKeyPathObject', mapPaths)
  }

}
</script>
