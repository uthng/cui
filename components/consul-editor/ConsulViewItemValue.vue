<template>
  <div :class="modifColor" class="item-key-value">
    <div :class="getClassDepth(currentDepth)" class="item-key">{{ keyString }}:</div>
    <input v-if="modifiable" :class="getValueType(data)" v-model="valueString" class="item-value" @keyup.enter="onUpdateData" @blur="onUpdateData">
    <div v-else :class="getValueType(data)" class="item-value">{{ valueFormed }}</div>
    <div class="item-icons">
      <v-btn :disabled="isBtnDisabled('edit')" icon small class="ma-0 pa-0" @click.stop="dialogModifyKeyValue = !dialogModifyKeyValue"><v-icon small>edit</v-icon></v-btn>
      <v-btn disabled icon small class="ma-0 pa-0"><v-icon small>add</v-icon></v-btn>
      <v-btn :disabled="isBtnDisabled('delete')" icon small class="ma-0 pa-0" @click.stop="dialogDeleteKeyPath = true"><v-icon small>delete</v-icon></v-btn>
    </div>
    <v-dialog v-model="dialogModifyKeyValue" persistent max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Modify Key Value</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  :value="editedKey.key"
                  name="key-path"
                  label="Key"
                  disabled
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="editedKey.value"
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
          <v-btn color="primary" flat @click.stop="dialogModifyKeyValue=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="saveModifiedKeyValue()">Save</v-btn>
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

  </div>

</template>


<script>
import _ from "lodash"

export default {
  name: "ConsulViewItemValue",
  props: {
    data: {
      type: String,
      required: true
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
    keyString: {
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
      valueString: this.data && this.data.toString(),
      error: false,
      dialogModifyKeyValue: false,
      dialogDeleteKeyPath: false,
      editedKey: { key: this.path, value: this.getValue(this.data) }
    }
  },
  computed: {
    valueFormed: function() {
      return this.getValue(this.data)
    },
    modifColor: function() {
      var list = this.$store.state.keyPathModifList
      var color = ""

      for (var i = 0; i < list.length; i++) {
        // In the case of key parent is deleted
        // key parent length < key child
        // all childs will be marked as deleted

        // Loop all elements of list.
        // If current key contains modified key and modification type is different R
        // continue. If modification == R, we break out immediately
        if (this.path.startsWith(list[i].path)) {
          if (list[i].type == "M") {
            color = "amber--text text--lighten-3"
          } else if (list[i].type == "A") {
            color = "light-blue--text text--lighten-3"
          } else if (list[i].type == "R") {
            return "red--text text--lighten-2"
          }
        }
      }

      return color
    },
    permission: function() {
      return this.getKeyPermission()
    }
  },
  methods: {
    onUpdateData: function() {
      try {
        let v = this.typedValue(this.valueString)
        this.error = false
        this.$emit("change-data", [], v)
      } catch (err) {
        this.error = err
      }
    },
    typedValue: function(v) {
      if (v === "") {
        throw new Error("empty")
      }

      let dataType = this.getValueType(this.data, "")

      switch (dataType) {
        case "number":
          if (_.isNaN(_.toNumber(v))) {
            throw new Error("only number")
          }
          return _.toNumber(v)
        case "boolean":
          if (v.toLowerCase() === "true") {
            return true
          }
          if (v.toLowerCase() === "false") {
            return false
          }
          throw new Error("true or false")
        case "string":
        default:
          return v
      }
    },
    getValue: function(value) {
      if (_.isNumber(value)) {
        return value
      }
      if (_.isNull(value)) {
        return null
      }
      if (_.isString(value)) {
        // return '"' + value + '"'
        return value
      }
      return value
    },
    getValueType: function(value, prefix = "item-value-") {
      if (_.isNumber(value)) {
        return prefix + "number"
      }
      if (_.isFunction(value)) {
        return prefix + "function"
      }
      if (_.isBoolean(value)) {
        return prefix + "boolean"
      }
      if (_.isNull(value)) {
        return prefix + "null"
      }
      if (_.isString(value)) {
        return prefix + "string"
      }
      return prefix + "unknown"
    },
    getClassDepth: function(depth) {
      return "depth-" + depth
    },
    saveModifiedKeyValue: function() {
      this.$root.$emit("modify-key-value", this.editedKey)
      this.dialogModifyKeyValue = false
    },
    saveDeletedKeyPath: function() {
      this.$root.$emit("delete-key-value", this.path)
      this.dialogDeleteKeyPath = false
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

      //console.log("path final: " + this.path + " permissions " + permissions)
      return perm
    },
    isBtnDisabled: function(btnName) {
      // permission: deny => not showed automatically in the tree view => no need
      // handle when permission deny
      let permission = "read"

      if (btnName === "add" || btnName === "edit" || btnName === "delete") {
        permission = "write"
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
    }
  },
  notifications: {
    showSuccessModifMsg: {
      type: "success",
      title: "Modify Key Value",
      message: "The new key's value has been saved correctly"
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
/* div horizontally: */
/* parent overflow: hidden, child: float left */
/* or usung flex */
.item-key-value {
  display: flex;
  flex-direction: row;
  /*overflow: hidden;*/
}

.item-key {
  /*float: left;*/
  flex: 1;
  justify-content: flex-start;
}

.item-value {
  white-space: normal;
  width: 100%;
  word-break: break-all;
  text-align: justify;
  float: right;
  padding-right: 40px;
  padding-left: 10px;
  justify-content: center;
}

.item-icons {
  flex: 1;
  justify-content: flex-end;
  margin-right: 10px;
  margin-top: -5px;
}
</style>
