<template>
  <v-app dark>
    <v-navigation-drawer
      :mini-variant.sync="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      fixed
      app
    >
      <v-list>
        <v-list-tile
          nuxt
          :href="item.href"
          :key="i"
          v-for="(item, i) in items"
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed app :clipped-left="clipped">
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>web</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>remove</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu open-on-hover top offset-y>
        <v-btn color="primary" dark slot="activator">{{ selectedDatacenter }}</v-btn>
        <v-list>
          <v-list-tile v-for="dc in datacenters" :key="dc" value="dc" @click="selectDatacenter(dc)">
            <v-list-tile-title>{{ dc }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer :fixed="fixed" app>
        <v-flex xs12 py-3 text-xs-center white--text>
            &copy;2018 — <strong>Thanh NGUYEN</strong>
        </v-flex>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        clipped: false,
        drawer: true,
        fixed: false,
        items: [
          { icon: 'apps', title: 'Nodes', href: '/' },
          { icon: 'apps', title: 'K/V', href: '/kv' },
          { icon: 'apps', title: 'ACL', href: '/acl' }
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: 'Consul Web UI'
      }
    },
    computed: {
      datacenters () { return this.$store.state.datacenters },
      selectedDatacenter () { return this.$store.state.selectedDatacenter },
    },
    mounted: function () {
      if (this.$store.state.consulAcl == false) {
        this.showWarnMsg({"type": "warn", "title": "", "message": "ACL support disabled", "opts": {"closeButton": true, "positionClass": "toast-top-full-width", "timeOut": "0", "extendedTimeOut": "0", "preventDuplicates": true}})
      }
    },
    methods: {
      selectDatacenter: function (dc) {
        this.$store.dispatch('selectDatacenter', dc)
      }
    },
    notifications: {
      showWarnMsg: {
        type: 'error',
        title: '',
        message: ''
      }
    }

  }
</script>
