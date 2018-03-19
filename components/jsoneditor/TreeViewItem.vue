<template>
  <div class="tree-view-item">
    <div v-if="isObject(data) || isArray(data)" class="tree-view-item-leaf">
      <div class="tree-view-item-node" @click.stop="toggleOpen()" >
        <span :class="{opened: isOpen()}" class="tree-view-item-key tree-view-item-key-with-chevron">{{getKey(data)}}</span>
        <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length === 1"> ({{data.children.length}} {{ isObject(data) ? 'property' : 'item' }})</span>
        <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length !== 1"> ({{data.children.length}} {{ isObject(data) ? 'properties' : 'items' }})</span>
      </div>
      <tree-view-item :key="getKey(child)" :max-depth="maxDepth" :current-depth="currentDepth+1" v-show="isOpen()" v-for="child in data.children" :data="child" :modifiable="modifiable" @change-data="onChangeData"></tree-view-item>
    </div>
    <tree-view-item-value v-if="isValue(data)" class="tree-view-item-leaf" :key-string="getKey(data)" :data="data.value" :modifiable="modifiable" @change-data="onChangeData">
    </tree-view-item-value>
  </div>

<!--  <div v-if="isObject(data) || isArray(data)">
    <v-list-tile @click="">
      <v-list-tile-action>
        <v-icon>play_arrow</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title v-text="getKey(data)"></v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <tree-view-item :key="getKey(child)" :max-depth="maxDepth" :current-depth="currentDepth+1" v-show="isOpen()" v-for="child in data.children" :data="child" :modifiable="modifiable" @change-data="onChangeData"></tree-view-item>
  </div>
  <tree-view-item-value v-else-if="isValue(data)" :key-string="getKey(data)" :data="data.value" :modifiable="modifiable" @change-data="onChangeData">
  </tree-view-item-value>
-->
</template>

<script>
  import _ from 'lodash'
  import TreeViewItemValue from '~/components/jsoneditor/TreeViewItemValue.vue'

  export default {
    components: {
      TreeViewItemValue
    },
    name: 'tree-view-item',
    props: ['data', 'max-depth', 'current-depth', 'modifiable'],
    data: function () {
      return {
        open: this.currentDepth < this.maxDepth
      }
    },
    methods: {
      isOpen: function () {
        return this.open
      },
      toggleOpen: function () {
        this.open = !this.open
      },
      isObject: function (value) {
        return value.type === 'object'
      },
      isArray: function (value) {
        return value.type === 'array'
      },
      isValue: function (value) {
        return value.type === 'value'
      },
      getType: function (value) {
        return value.type
      },
      getKey: function (value) {
        if (_.isInteger(value.key)) {
          return value.key + ':'
        } else {
          return value.key
        }
      },
      isRootObject: function (value = this.data) {
        return value.isRoot
      },
      onChangeData: function (path, value) {
        path = _.concat(this.data.key, path)
        this.$emit('change-data', path, value)
      }
    }
  }
</script>

<style scoped>

.tree-view-item {
  font-family: monaco, monospace;
  font-size: 14px;
  margin-left: 18px;
}

.tree-view-item-node {
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tree-view-item-leaf {
  white-space: nowrap;
}

.tree-view-item-key {
  font-weight: bold;
}

.tree-view-item-key-with-chevron {
  padding-left: 14px;
}


.tree-view-item-key-with-chevron.opened::before {
    top:4px;
    transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
}

.tree-view-item-key-with-chevron::before {
    color: #444;
    content: '\25b6';
    font-size: 10px;
    left: 1px;
    position: absolute;
    top: 3px;
    transition: -webkit-transform .1s ease;
    transition: transform .1s ease;
    transition: transform .1s ease, -webkit-transform .1s ease;
    -webkit-transition: -webkit-transform .1s ease;
}

.tree-view-item-hint {
  color: #ccc
}
</style>
