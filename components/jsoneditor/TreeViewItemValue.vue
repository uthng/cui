<template>
  <div class="item-key-value">
    <div class="item-key" :class="getClassDepth(currentDepth)">{{keyString}}: </div>
    <input v-if="modifiable" class="item-value" :class="getValueType(data)" v-model="valueString" @keyup.enter="onUpdateData" @blur="onUpdateData">
    <div v-else class="item-value" :class="getValueType(data)">{{ valueFormed }}</div>
    <div class="item-icons">
    <v-btn icon small class="ma-0 pa-0"><v-icon small>create</v-icon></v-btn>
    <v-btn icon small class="ma-0 pa-0"><v-icon small>add</v-icon></v-btn>
    <v-btn icon small class="ma-0 pa-0"><v-icon small>delete</v-icon></v-btn>
    </div>
  </div>

<!--
  <v-list-tile @click="">
    <v-list-tile-content>
      <v-list-tile-title>{{ keyString }} {{ valueFormed }}</v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
-->
</template>


<script>
import _ from 'lodash'

export default {
  name: 'tree-view-item',
  props: ['data', 'modifiable', 'key-string', 'current-depth'],
  data: function () {
    return {
      valueString: this.data && this.data.toString(),
      error: false
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
        return '"' + value + '"'
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
  justify-content: center;
}

.item-icons {
  flex: 1;
  justify-content: flex-end;
  margin-right: 10px;
  margin-top: -5px;
}

</style>
