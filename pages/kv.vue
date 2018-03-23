<template>
  <div>
    <tree-view :data="jsonSource" :options="{maxDepth: 7}"></tree-view>
    <v-dialog v-model="dialog2" max-width="500px">
      <v-card>
        <v-card-title>
          Dialog 2
        </v-card-title>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dialog2=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TreeView from '~/components/jsoneditor/TreeView.vue'
import consul from '~/lib/consul/consul'
import utils from '~/lib/utils/utils'

export default {
  data: () => {
  return {
  //    jsonSource: {"csl-tec-vault-dc1-fr":{"auth":{"959668e3-af15-d83e-c6d9-99df1ff57a31":{"group":{},"user":{}}},"core":{"cluster":{"local":{}},"leader":{},"wrapping":{}},"logical":{"2565dd12-8b0f-3736-9f2d-3ea9d5a6cc27":{"chrysalis":{"apikey":{"phpipam":{}},"passwords":{"powerdns":{}},"ssh-keys":{}},"partners":{"ssh-keys":{}},"travel":{"ssh-keys":{}}},"784394ed-7dfb-1df6-a6c1-1394ff26cd26":{"packer":{"buckets":{}}}},"sys":{"policy":{},"token":{"accessor":{},"id":{}}}}}
      dialog2: false
    }
  },
  components: {
    TreeView
  },
  // computed: {
  // },
  async asyncData ({store}) {
    let res = await consul.kv.getRecurseKeys('')
    var mapPaths = {}

    if (res.keys === undefined) {
      return { jsonSource: mapPaths }
    }

    for (var i = 0; i < res.keys.length; i++) {
      /*console.log(res.keys[i].Value)*/
      var value = res.keys[i].Value
      if (value !== undefined && value !== null) {
        value = Base64.decode(value)
      }
      utils.createMapPaths(mapPaths, '/', res.keys[i].Key, value)
    }

    return { jsonSource: mapPaths }
  }

}
</script>
