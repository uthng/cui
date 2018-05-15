<template>
  <v-container fluid grid-list-md>
    <v-data-iterator
      :items="nodes"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      content-tag="v-layout"
      row
      wrap
    >
      <v-flex
        slot="item"
        slot-scope="props"
        xs12
        sm6
        md4
        lg3
      >
        <v-card>
          <v-card-title><h4>{{ props.item.name }}</h4></v-card-title>
          <v-divider/>
          <v-list dense>
            <v-list-tile v-for="status in props.item.statuses" :key="status" value="status">
              <v-list-tile-content>{{ status.name }}:</v-list-tile-content>
              <v-list-tile-content class="align-end">{{ status.status }}</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-data-iterator>
  </v-container>
</template>

<script>
import consul from "~/lib/consul/consul"

export default {
  data: () => {
    return {
      rowsPerPageItems: [4, 8, 12],
      pagination: {
        rowsPerPage: 4
      }
    }
  },
  // computed: {
  //  nodes () { return consul.health.getAllNodeHealths(this.$store.state.nodes) }
  // }
  async asyncData({ store }) {
    return { nodes: await consul.health.getAllNodeHealths(store.state.nodes) }
  }
}
</script>
