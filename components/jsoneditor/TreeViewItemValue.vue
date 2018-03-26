<template>
  <div class="item-key-value">
    <div class="item-key" :class="getClassDepth(currentDepth)">{{keyString}}:</div>
    <input v-if="modifiable" class="item-value" :class="getValueType(data)" v-model="valueString" @keyup.enter="onUpdateData" @blur="onUpdateData">
    <div v-else class="item-value" :class="getValueType(data)">{{ valueFormed }}</div>
    <div class="item-icons">
    <v-btn icon small class="ma-0 pa-0" @click.stop="dialogModifyKeyValue = !dialogModifyKeyValue"><v-icon small>create</v-icon></v-btn>
    <v-btn icon small class="ma-0 pa-0"><v-icon small>add</v-icon></v-btn>
    <v-btn icon small class="ma-0 pa-0"><v-icon small>delete</v-icon></v-btn>
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
                  name="key-path"
                  label="Key"
                  :value="path"
                  disabled
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  name="key-value"
                  label="Value"
                  textarea
                  rows="10"
                  v-model="keyValue"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dialogModifyKeyValue=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="saveModifiedKeyValue(keyValue)">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>

</template>


<script>
import _ from 'lodash'
import object from '~/lib/utils/object'

export default {
  name: 'tree-view-item',
  props: ['data', 'modifiable', 'key-string', 'current-depth', 'path'],
  data: function () {
    return {
      valueString: this.data && this.data.toString(),
      error: false,
      dialogModifyKeyValue: false,
      keyValue: this.getValue(this.data)
    }
  },
  computed: {
    valueFormed: function () {
      return this.getValue(this.data)
    }
  },
  methods: {
    onUpdateData: function () {
      try {
        let v = this.typedValue(this.valueString)
        this.error = false
        this.$emit('change-data', [], v)
      } catch (err) {
        this.error = err
      }
    },
    typedValue: function (v) {
      if (v === '') { throw new Error('empty') }

      let dataType = this.getValueType(this.data, '')

      switch (dataType) {
        case 'number':
          if (_.isNaN(_.toNumber(v))) {
            throw new Error('only number')
          }
          return _.toNumber(v)
        case 'boolean':
          if (v.toLowerCase() === 'true') { return true }
          if (v.toLowerCase() === 'false') { return false }
          throw new Error('true or false')
        case 'string':
        default:
          return v
      }
    },
    getValue: function (value) {
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
    getValueType: function (value, prefix = 'item-value-') {
      if (_.isNumber(value)) {
        return prefix + 'number'
      }
      if (_.isFunction(value)) {
        return prefix + 'function'
      }
      if (_.isBoolean(value)) {
        return prefix + 'boolean'
      }
      if (_.isNull(value)) {
        return prefix + 'null'
      }
      if (_.isString(value)) {
        return prefix + 'string'
      }
      return prefix + 'unknown'
    },
    getClassDepth: function (depth) {
        return 'depth-' + depth
    },

    saveModifiedKeyValue: function (newValue) {
      // We must clone here because it will be reference object if
      // we use var with = simply
      var curKeyPathObject = _.cloneDeep(this.$store.state.keyPathObject)
      // Set new value
      object.createObjectByPath(curKeyPathObject, '/', this.path, newValue)
      // Update store
      this.$store.dispatch('updateKeyPathObject', curKeyPathObject)

      var keyPathModifList = _.cloneDeep(this.$store.state.keyPathModifList)
      keyPathModifList.push({path: this.path, value: newValue, type: 'M'})
      this.$store.dispatch('updateKeyPathModifList', keyPathModifList)

      this.dialogModifyKeyValue = false
      this.showSuccessModifMsg()
    }
  },
  notifications: {
    showSuccessModifMsg: {
      type: 'success',
      title: 'Modify Key Value',
      message: 'The new key\'s value has been saved correctly'
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
  justify-content: flex-start
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
