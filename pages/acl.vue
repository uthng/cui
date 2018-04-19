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
        <td class="text-xs-left">{{ props.item.ID }}</td>
        <td class="text-xs-left">{{ props.item.Name }}</td>
        <td class="text-xs-left">{{ props.item.Type }}</td>
        <td class="text-xs-left">{{ props.item.CreateIndex }}</td>
        <td class="text-xs-left">{{ props.item.ModifyIndex }}</td>
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
        { text: 'ID', value: 'id', align: 'left' },
        { text: 'Name', value: 'name', align: 'left' },
        { text: 'Type', value: 'type', align: 'left' },
        { text: 'CreateIndex', value: 'createindex', sortable: false, align: 'left' },
        { text: 'ModifyIndex', value: 'modifyindex', sortable: false, align: 'left' },
        { text: 'Actions', value: 'name', sortable: false, align: 'left' }
      ],
    }
  },
  computed: {
    isAclEnabled () { return this.$store.state.consulAcl },
    // items () {
    //  var acls = this.$store.state.consulAcl.acls
    //  if (_.isUndefined(acls) || _.isNull(acls)) {
    //    return []
    //  }

    //  return acls
    // },
    // ctok () { return this.$store.state.ctok }
    items () { return this.$store.state.consulAclList }
  },
  mounted: async function () {
    let ret = await consul.acl.list(this.$store.state.ctok)
    let items = []
    if (!_.isUndefined(ret.error) && !_.isNull(ret.error)) {
       this.showMsg({type: 'error', message: ret.error})
    } else {
      items = ret.acls
    }

    this.$store.dispatch('updateConsulAclList', items)
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
