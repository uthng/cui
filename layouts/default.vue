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
          v-for="(item, i) in items"
          :href="item.href"
          :key="i"
          nuxt
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"/>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"/>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="clipped" fixed app>
      <v-toolbar-side-icon @click="drawer = !drawer"/>
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"/>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>web</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"/>
      <v-spacer/>
      <v-menu open-on-hover top offset-y>
        <v-btn slot="activator" color="primary" dark>{{ selectedDatacenter }}</v-btn>
        <v-list>
          <v-list-tile v-for="dc in datacenters" :key="dc" value="dc" @click="selectDatacenter(dc)">
            <v-list-tile-title>{{ dc }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-btn color="warning" fab small dark @click.stop="dialogLogin=true">
        <v-icon>account_circle</v-icon>
      </v-btn>
      <!--<v-btn color="error" fab small dark>
        <v-icon>power_settings_new</v-icon>
      </v-btn>-->
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
    <v-dialog v-model="dialogLogin" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Login</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  v-model="consulToken"
                  name="consul-token"
                  label="Consul Token:"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click.stop="dialogLogin=false">Close</v-btn>
          <v-btn color="primary" @click.stop="saveToken()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      items: [
        { icon: "apps", title: "Nodes", href: "/" },
        { icon: "apps", title: "K/V", href: "/kv" },
        { icon: "apps", title: "ACL", href: "/acl" }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Consul Web UI",
      dialogLogin: false,
      consulToken: this.$store.state.ctok
    }
  },
  computed: {
    datacenters() {
      return this.$store.state.datacenters
    },
    selectedDatacenter() {
      return this.$store.state.selectedDatacenter
    }
  },
  mounted: function() {
    if (this.$store.state.consulAcl == false) {
      this.showMsg({
        type: "warn",
        title: "",
        message: "ACL support disabled",
        opts: {
          closeButton: true,
          positionClass: "toast-top-full-width",
          timeOut: "0",
          extendedTimeOut: "0",
          preventDuplicates: true
        }
      })
    }
  },
  methods: {
    selectDatacenter: function(dc) {
      this.$store.dispatch("selectDatacenter", dc)
    },
    saveToken: function() {
      this.$store.dispatch("setCtok", this.consulToken)
      this.dialogLogin = false
      this.showMsg({ message: "Token has been saved successfully !" })
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
