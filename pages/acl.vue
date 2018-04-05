<template>
  <div v-if="!isAclEnabled">
    <p class="text-xs-center display-1 mt-5 amber--text">ACL support disabled !</p>
  </div>
  <div v-else>
    <v-data-table
      :headers="headers"
      :items="items"
      hide-actions
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">{{ props.item.ID }}</td>
        <td class="text-xs-right">{{ props.item.Name }}</td>
        <td class="text-xs-right">{{ props.item.Type }}</td>
        <td class="text-xs-right">{{ props.item.CreateIndex }}</td>
        <td class="text-xs-right">{{ props.item.ModifyIndex }}</td>
        <td class="justify-center layout px-0">
          <v-btn icon class="mx-0" @click="">
            <v-icon color="teal">edit</v-icon>
          </v-btn>
          <v-btn icon class="mx-0" @click="">
            <v-icon color="pink">delete</v-icon>
          </v-btn>
        </td>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          Sorry, nothing to display here :(
        </v-alert>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import _ from 'lodash'
import consul from '~/lib/consul/consul'

export default {
  data: () => {
    return {
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Type', value: 'type' },
        { text: 'CreateIndex', value: 'createindex', sortable: false },
        { text: 'ModifyIndex', value: 'modifyindex', sortable: false }
      ],
      items: []
    }
  },
  computed: {
    isAclEnabled () { return this.$store.state.consulAcl },
    items () {
      var acls = this.$store.state.consulAcl.acls
      if (_.isUndefined(acls) || _.isNull(acls)) {
        return []
      }

      return acls
    }
  },
  async asyncData ({store}) {
  },
  mounted: function () {
    var err = this.$store.state.consulAclList.error
    if (!_.isUndefined(err) && !_.isNull(err)) {
      this.showMsg({type: 'error', message: err})
    }

  },
  methods: {
    test: function () {
      return []
    }
  },
  notifications: {
    showMsg: {
      type: 'error',
      title: '',
      message: ''
    },
  }


}
</script>
