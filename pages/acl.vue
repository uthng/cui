<template>
  <div v-if="!isAclEnabled">
    <p class="text-xs-center display-1 mt-5 amber--text">ACL support disabled !</p>
  </div>
  <div v-else>
    <v-dialog v-model="dlgEditItem" persistent max-width="700px">
      <v-btn slot="activator" color="primary" class="mb-2" dark>New ACL</v-btn>
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  v-if="formFieldEnabled"
                  v-model="editedItem.ID"
                  :disabled="formFieldEnabled"
                  name="acl-token"
                  label="Token:"
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="editedItem.Name"
                  name="aclName"
                  label="Name:"
                />
              </v-flex>
              <v-flex xs12>
                <v-select
                  :items="aclTypes"
                  v-model="editedItem.Type"
                  name="aclType"
                  label="Type:"
                />
              </v-flex>
              <v-flex xs12>
                <v-textarea
                  v-model="editedItem.Rules"
                  name="aclRule"
                  label="Rules:"
                  row="10"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click.stop="closeDlgItem()">Close</v-btn>
          <v-btn color="primary" @click.stop="saveItem()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dlgDeleteItem" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete ACL</span>
        </v-card-title>
        <v-card-text>
          Are you sure to delete the following ACL: <b><span class="red--text text--lighten-2">{{ editedItem.ID }}</span></b> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="closeDlgItem()">Close</v-btn>
          <v-btn color="primary" flat @click.stop="deleteItem()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-table
      :headers="headers"
      :items="acls"
      hide-actions
      class="elevation-1"
      item-key="ID"
    >
      <template slot="items" slot-scope="props">
        <tr @click="props.expanded = !props.expanded">
          <td class="text-xs-left">{{ props.item.ID }}</td>
          <td class="text-xs-left">{{ props.item.Name }}</td>
          <td class="text-xs-left">{{ props.item.Type }}</td>
          <td class="text-xs-left">{{ props.item.CreateIndex }}</td>
          <td class="text-xs-left">{{ props.item.ModifyIndex }}</td>
          <td class="justify-center layout px-0">
            <v-btn icon class="mx-0" @click="openDlgItem(props.item, 'edit')">
              <v-icon color="teal">edit</v-icon>
            </v-btn>
            <v-btn icon class="mx-0" @click="openDlgItem(props.item, 'delete')">
              <v-icon color="pink">delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          Sorry, nothing to display here :(
        </v-alert>
      </template>
      <template slot="expand" slot-scope="props">
        <v-card flat>
          <v-card-text class="line-break-and-tab body-1">{{ props.item.Rules }}</v-card-text>
        </v-card>
      </template>
    </v-data-table>

    <loader v-model="dlgLoading" />
  </div>
</template>

<script>
import _ from "lodash"
import Loader from "~/components/loader/loader.vue"

export default {
  components: {
    Loader
  },
  data: () => {
    return {
      headers: [
        { text: "Token", value: "token", align: "left" },
        { text: "Name", value: "name", align: "left" },
        { text: "Type", value: "type", align: "left" },
        {
          text: "CreateIndex",
          value: "createindex",
          sortable: false,
          align: "left"
        },
        {
          text: "ModifyIndex",
          value: "modifyindex",
          sortable: false,
          align: "left"
        },
        { text: "Actions", value: "name", sortable: false, align: "left" }
      ],
      aclTypes: ["client", "management"],
      dlgEditItem: false,
      dlgDeleteItem: false,
      editedIndex: -1,
      editedItem: {
        ID: "",
        Name: "",
        Type: "",
        CreateIndex: -1,
        ModifyIndex: -1,
        Rules: ""
      },
      defaultItem: {
        ID: "",
        Name: "",
        Type: "",
        CreateIndex: -1,
        ModifyIndex: -1,
        Rules: ""
      },
      dlgLoading: false
    }
  },
  computed: {
    isAclEnabled() {
      return this.$store.state.aclStatus
    },
    acls() {
      return this.$store.state.consulAclList
    },
    formTitle: function() {
      return this.editedIndex === -1 ? "New ACL" : "Edit ACL"
    },
    formFieldEnabled: function() {
      return this.editedIndex === -1 ? false : true
    }
  },
  mounted: async function() {
    try {
      this.dlgLoading = true
      await this.loadData()

      this.dlgLoading = false
    } catch (error) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: error })
    }
  },
  methods: {
    loadData: async function() {
      let items = await this.$consul.acl.list(this.$store.state.ctok)

      this.$store.dispatch("updateConsulAclList", items)
    },
    deleteItem: async function() {
      try {
        this.dlgLoading = true
        await this.$consul.acl.delete(
          this.editedItem.ID,
          this.$store.state.ctok
        )

        this.loadData()

        this.showMsg({
          message:
            "The acl " + this.editedItem.ID + " has been deleted correctly !"
        })

        this.closeDlgItem()
      } catch (error) {
        this.closeDlgItem()
        this.showMsg({ type: "error", message: error })
      }
    },
    saveItem: async function() {
      try {
        this.dlgLoading = true

        if (this.editedIndex > -1) {
          await this.$consul.acl.update(this.editedItem, this.$store.state.ctok)
        } else {
          await this.$consul.acl.create(this.editedItem, this.$store.state.ctok)
        }

        this.loadData()

        this.showMsg({
          message:
            "The acl " + this.editedItem.Name + " has been saved correctly !"
        })

        this.closeDlgItem()
      } catch (error) {
        this.closeDlgItem()
        this.showMsg({ type: "error", message: error })
      }
    },
    openDlgItem: function(item, op) {
      this.editedIndex = this.acls.indexOf(item)
      this.editedItem = _.cloneDeep(item)
      if (op === "edit") {
        this.dlgEditItem = true
      } else {
        this.dlgDeleteItem = true
      }
    },
    closeDlgItem: function() {
      this.dlgLoading = false
      this.dlgEditItem = false
      this.dlgDeleteItem = false

      this.editedIndex = -1
      this.editedItem = Object.assign({}, this.defaultItem)
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

<style>
.line-break-and-tab {
  white-space: pre-wrap;
}
</style>
