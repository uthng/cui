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

    <loader v-model="dlgLoading" :text="loadingText"/>
  </v-app>
</template>

<script>
import Loader from "~/components/loader/loader.vue"

export default {
  components: {
    Loader
  },
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
      consulToken: this.$store.state.ctok,
      dlgLoading: false,
      loadingText: "Loading..."
    }
  },
  computed: {
    datacenters() {
      return this.$store.state.listDatacenters
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
    } else {
      this.checkToken()
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
    },
    renewToken: function() {
      try {
        this.loadingText = "Renewing token..."
        this.dlgLoading = true

        this.$store.dispatch("setCtok", this.$store.state.ctok)

        this.showMsg({
          message: "Your current Consul token has been renew successfully !"
        })
        this.dlgLoading = false
      } catch (error) {
        this.dlgLoading = false
        this.showMsg({ type: "error", message: error })
      }
    },
    // Set timeout for checking ctok expiration time every 1min.
    // While token expiration is stil valid, we call recursively this function
    // If the token will expire within 5 mins, a notification will be display
    // to user to renew. No need to clear timeout or anything after token expiration
    // instead of timer
    checkToken: function() {
      var self = this
      setTimeout(function() {
        if (self.$store.state.ctok !== "") {
          let now = new Date().getTime()
          let secs = (self.$store.state.ctok_expiration - now) / 1000
          if (secs > 0) {
            let mins = secs / 60
            if (mins <= 10) {
              self.showMsg({
                type: "warn",
                title: "",
                message:
                  "Your Consul token will expire within 5 mins !!! Click here to renew it !",
                opts: {
                  closeButton: false,
                  positionClass: "toast-top-full-width",
                  timeOut: "30000",
                  extendedTimeOut: "0",
                  preventDuplicates: true,
                  onclick: function() {
                    self.renewToken()
                  }
                }
              })
            }

            self.checkToken()
          }
        }
      }, 60000)
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
