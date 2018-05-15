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
    <loader v-model="dlgLoading" />
  </v-container>
</template>

<script>
import Loader from "~/components/loader/loader.vue"

export default {
  components: {
    Loader
  },
  data: () => {
    return {
      rowsPerPageItems: [4, 8, 12],
      pagination: {
        rowsPerPage: 4
      },
      nodes: [],
      dlgLoading: false
    }
  },
  mounted: async function() {
    try {
      this.dlgLoading = true

      let datacenters = await this.$consul.coordinate.getDatacenters(
        this.$store.state.ctok
      )

      this.$store.dispatch("selectDatacenter", datacenters[0])
      this.$store.dispatch("updateListDatacenters", datacenters)

      let nodes = await this.$consul.coordinate.getNodes(this.$store.state.ctok)
      this.$store.dispatch("updateListNodes", nodes)

      this.nodes = await this.$consul.health.getAllNodeHealths(
        nodes,
        this.$store.state.ctok
      )

      this.dlgLoading = false
    } catch (error) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: error })
    }
  },
  //async asyncData({ store }) {
  //return {
  //nodes: await this.$consul.health.getAllNodeHealths(store.state.nodes)
  //}
  //}
  notifications: {
    showMsg: {
      type: "success",
      title: "",
      message: ""
    }
  }
}
</script>
