<template>
  <div v-if="isObject(data) || isArray(data)">
    <div :class="getClassDepth(currentDepth)" class="item item-leaf">
      <div :class="modifColor" class="item-node" @click.stop="toggleOpen()">
        <span :class="{opened: isOpen()}" class="item-key item-key-with-chevron">{{ getKey(data) }}</span>
        <span v-show="!isOpen() && data.children.length === 1" class="item-hint"> ({{ data.children.length }} {{ isObject(data) ? 'property' : 'item' }})</span>
        <span v-show="!isOpen() && data.children.length !== 1" class="item-hint"> ({{ data.children.length }} {{ isObject(data) ? 'properties' : 'items' }})</span>
        <span class="item-actions">
          <v-btn disabled icon small class="ma-0 pa-0"><v-icon small>edit</v-icon></v-btn>
          <v-btn :disabled="isBtnDisabled('add')" icon small class="ma-0 pa-0" @click.stop="dialogCreateKeyPath = true"><v-icon small>add</v-icon></v-btn>
          <v-btn :disabled="isBtnDisabled('clone')" icon small class="ma-0 pa-0" @click.stop="openDlgCloneKeyPath()"><v-icon small>file_copy</v-icon></v-btn>
          <v-btn :disabled="isBtnDisabled('delete')" icon small class="ma-0 pa-0" @click.stop="dialogDeleteKeyPath = true"><v-icon small>delete</v-icon></v-btn>
        </span>
      </div>
    </div>
    <consul-view-item v-for="child in data.children" v-show="isOpen()" :key="getKey(child)" :max-depth="maxDepth" :current-depth="currentDepth+1" :data="child" :permissions="permissions" :path="getPath(child)" :modifiable="modifiable" @change-data="onChangeData"/>

    <v-dialog v-model="dialogCreateKeyPath" persistent max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Create Key Value</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  :value="newKeyValue.path"
                  name="key-parent"
                  label="Key parent"
                  disabled
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="newKeyValue.key"
                  name="key-child"
                  label="Key"
                  hint="To create a path without value (folder), end the key with /"
                  persistent-hint
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-if="displayKeyValueField"
                  v-model="newKeyValue.value"
                  name="key-value"
                  label="Value"
                  multi-line
                  rows="10"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dialogCreateKeyPath=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="saveCreatedKeyPath()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDeleteKeyPath" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Key Value</span>
        </v-card-title>
        <v-card-text>
          Are you sure to delete the following key path: <b><span class="red--text text--lighten-2">{{ path }}</span></b> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dialogDeleteKeyPath=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="saveDeletedKeyPath()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogCloneKeyPath" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Clone Key</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  :value="newKeyValue.path"
                  name="key-path"
                  label="Path"
                  disabled
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="newKeyValue.key"
                  name="key-oldkey"
                  label="Old Key"
                  disabled
                  persistent-hint
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="newKeyValue.newKey"
                  :rules="[rules.keyFormat]"
                  name="key-newkey"
                  label="New Key"
                  hint="The new key must be ended by /"
                  required
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dialogCloneKeyPath=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="saveClonedKeyPath()">Clone</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <consul-view-item-value v-else-if="isValue(data)" :key-string="getKey(data)" :data="data.value" :permissions="permissions" :path="path" :modifiable="modifiable" :current-depth="currentDepth" class="item item-leaf" @change-data="onChangeData"/>

</template>

<script>
import _ from "lodash"
import ConsulViewItemValue from "~/components/consul-editor/ConsulViewItemValue.vue"

export default {
  name: "ConsulViewItem",
  components: {
    ConsulViewItemValue
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    maxDepth: {
      type: Number,
      default: 7
    },
    currentDepth: {
      type: Number,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    },
    path: {
      type: String,
      required: true
    },
    permissions: {
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      open: this.currentDepth < this.maxDepth,
      dialogDeleteKeyPath: false,
      dialogCreateKeyPath: false,
      dialogCloneKeyPath: false,
      displayKeyValueField: true,
      newKeyValue: {
        path: this.path,
        key: "",
        value: "",
        newKey: ""
      },
      defaultKeyValue: {
        path: this.path,
        key: "",
        value: "",
        newKey: ""
      },
      rules: {
        keyFormat: value => {
          const pattern = /^[a-zA-Z0-9][/a-zA-Z0-9_-]+\/$/
          return (
            pattern.test(value) ||
            "Method path must contain only: [a-zA-Z0-9_-] and must be ended by /"
          )
        }
      }
    }
  },
  computed: {
    modifColor: function() {
      var list = _.cloneDeep(this.$store.state.keyPathModifList)
      var color = ""

      for (var i = 0; i < list.length; i++) {
        // Loop all elements, only break immediate when meeting R
        // if not, return last saved value
        if (
          list[i].path.startsWith(this.path) ||
          this.path.startsWith(list[i].path)
        ) {
          if (list[i].type == "M") {
            color = "amber--text text--lighten-3"
          } else if (list[i].type == "A") {
            if (list[i].path.length <= this.path.length) {
              return "light-blue--text text--lighten-3"
            } else {
              // Just a parent => just modified
              color = "amber--text text--lighten-3"
            }
          } else if (list[i].type == "R") {
            // Current path is child of removed key => remove
            if (list[i].path.length <= this.path.length) {
              return "red--text text--lighten-2"
            } else {
              // Just a parent => just modified
              color = "amber--text text--lighten-3"
            }
          }
        }
      }

      return color
    },
    permission: function() {
      return this.getKeyPermission()
    }
  },
  watch: {
    "newKeyValue.key": function(newValue) {
      // Just for avoiding error while running eslint
      if (newValue[newValue.length - 1] == "/") {
        this.displayKeyValueField = false
      } else {
        this.displayKeyValueField = true
      }
    }
  },
  mounted: function() {
    this.$root.$on("fold-event", () => {
      // Fold/unfold only if it is not root
      if (this.path !== "" && this.currentDepth > 3) {
        this.toggleOpen()
      }
    })
  },
  methods: {
    isOpen: function() {
      return this.open
    },
    toggleOpen: function() {
      this.open = !this.open
    },
    isObject: function(value) {
      return value.type === "object"
    },
    isArray: function(value) {
      return value.type === "array"
    },
    isValue: function(value) {
      return value.type === "value"
    },
    getType: function(value) {
      return value.type
    },
    getKey: function(value) {
      if (_.isInteger(value.key)) {
        return value.key + ":"
      } else {
        return value.key
      }
    },
    getPath: function(data) {
      var path
      if (this.path === undefined) {
        return data.key + "/"
      }

      if (data.isRoot) {
        return ""
      }

      if (this.isValue(data)) {
        path = this.path + data.key
      } else {
        path = this.path + data.key + "/"
      }

      return path
    },
    isRootObject: function(value = this.data) {
      return value.isRoot
    },
    onChangeData: function(path, value) {
      path = _.concat(this.data.key, path)
      this.$emit("change-data", path, value)
    },
    getClassDepth: function(depth) {
      return "depth-" + depth
    },
    saveDeletedKeyPath: function() {
      this.$root.$emit("delete-key-path", this.path)
      this.dialogDeleteKeyPath = false
    },
    saveCreatedKeyPath: function() {
      this.$root.$emit("add-key-path", this.newKeyValue)
      this.dialogCreateKeyPath = false
      this.newKeyValue = Object.assign({}, this.defaultKeyValue)
    },
    getKeyPermission: function() {
      let perm = ""

      // If path = root
      if (this.path === "") {
        return perm
      }

      //console.log(JSON.stringify(this.unfoldPaths))
      // Check if key in path, if not disable all
      for (var i = 0; i < this.permissions.length; i++) {
        let permission = this.permissions[i]
        if (permission.key === "" || permission.key == this.path) {
          perm = permission.policy
        } else {
          if (
            (permission.key.endsWith("*") &&
              this.path.startsWith(permission.key.replace("*", ""))) ||
            this.path.startsWith(permission.key)
          ) {
            perm = permission.policy
          }
        }
      }

      // console.log("path final: " + this.path + " permissions " + perm)
      return perm
    },
    isBtnDisabled: function(btnName) {
      // permission: deny => not showed automatically in the tree view => no need
      // handle when permission deny
      let permission = "read"

      if (btnName === "add" || btnName === "edit" || btnName === "delete") {
        permission = "write"
      }

      if (btnName === "clone") {
        return false
      }

      if (this.permission === "") {
        return true
      }

      if (permission === "read" && this.permission === permission) {
        return true
      }

      if (permission === "write" && this.permission === permission) {
        return false
      }

      return true
    },
    openDlgCloneKeyPath: function() {
      // Clone only possible if current path has children (ended by "/")
      // So when we split, the last element of the array is empty
      // We must pop 2 times to get the real path parent
      let keys = this.path.split("/")
      // Pop empty element
      keys.pop()

      // Save old key and pop it
      this.newKeyValue.key = keys[keys.length - 1] + "/"
      keys.pop()

      this.newKeyValue.path = keys.join("/") + "/"

      this.dialogCloneKeyPath = true
    },
    saveClonedKeyPath: function() {
      this.$root.$emit("clone-key-path", this.newKeyValue)
      this.dialogCloneKeyPath = false
      this.newKeyValue = Object.assign({}, this.defaultKeyValue)
    }
  },
  notifications: {
    showSuccessCreateMsg: {
      type: "success",
      title: "Create Key Value",
      message: "The new key has been created correctly"
    },
    showSuccessDeleteMsg: {
      type: "success",
      title: "Delete Key Value",
      message: "The path has been deleted correctly"
    }
  }
}
</script>

<style>
.item {
  font-family: monaco, monospace;
  font-size: 14px;
  /*margin-left: 15px;*/
  padding: 5px;
}

.item:hover {
  background-color: #424242;
}

.item-node {
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.item-leaf {
  white-space: nowrap;
}

.item-key {
  font-weight: bold;
}

.item-key-with-chevron {
  padding-left: 5px;
}

.item-key-with-chevron.opened::before {
  top: 0px;
  transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
}

.item-key-with-chevron::before {
  color: #444;
  content: "\25b6";
  font-size: 15px;
  left: -10px;
  position: absolute;
  top: -1px;
  transition: -webkit-transform 0.1s ease;
  transition: transform 0.1s ease;
  transition: transform 0.1s ease, -webkit-transform 0.1s ease;
  -webkit-transition: -webkit-transform 0.1s ease;
}

.item-hint {
  color: #ccc;
}

.item-actions {
  position: absolute;
  right: 10px;
  top: -5px;
}

.depth-0 {
  padding-left: 0px;
}

.depth-1 {
  padding-left: 15px;
}

.depth-2 {
  padding-left: 35px;
}

.depth-3 {
  padding-left: 55px;
}

.depth-4 {
  padding-left: 75px;
}

.depth-5 {
  padding-left: 95px;
}

.depth-6 {
  padding-left: 115px;
}

.depth-7 {
  padding-left: 135px;
}

.depth-8 {
  padding-left: 155px;
}

.depth-9 {
  padding-left: 175px;
}

.depth-10 {
  padding-left: 195px;
}
</style>
