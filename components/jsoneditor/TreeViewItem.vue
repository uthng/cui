<template>
  <div v-if="isObject(data) || isArray(data)">
    <div class="item item-leaf" :class="getClassDepth(currentDepth)">
      <div class="item-node" @click.stop="toggleOpen()" >
        <span :class="{opened: isOpen()}" class="item-key item-key-with-chevron">{{getKey(data)}}</span>
        <span class="item-hint" v-show="!isOpen() && data.children.length === 1"> ({{data.children.length}} {{ isObject(data) ? 'property' : 'item' }})</span>
        <span class="item-hint" v-show="!isOpen() && data.children.length !== 1"> ({{data.children.length}} {{ isObject(data) ? 'properties' : 'items' }})</span>
      </div>
    </div>
    <tree-view-item :key="getKey(child)" :max-depth="maxDepth" :current-depth="currentDepth+1" v-show="isOpen()" v-for="child in data.children" :data="child" :modifiable="modifiable" @change-data="onChangeData"></tree-view-item>
  </div>
  <tree-view-item-value v-else-if="isValue(data)" class="item item-leaf" :key-string="getKey(data)" :data="data.value" :modifiable="modifiable" :current-depth="currentDepth" @change-data="onChangeData"></tree-view-item-value>
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
      },
      getClassDepth: function (depth) {
        return 'depth-' + depth
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
    top:0px;
    transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
}

.item-key-with-chevron::before {
    color: #444;
    content: '\25b6';
    font-size: 15px;
    left: -10px;
    position: absolute;
    top: -1px;
    transition: -webkit-transform .1s ease;
    transition: transform .1s ease;
    transition: transform .1s ease, -webkit-transform .1s ease;
    -webkit-transition: -webkit-transform .1s ease;
}

.item-hint {
  color: #ccc
}

.depth-0 {
  padding-left:0px;
}

.depth-1 {
  padding-left:15px;
}

.depth-2 {
  padding-left:35px
}

.depth-3 {
  padding-left:55px
}

.depth-4 {
  padding-left:75px
}

.depth-5 {
  padding-left:95px
}

.depth-6 {
  padding-left:115px
}

.depth-7 {
  padding-left:135px
}

.depth-8 {
  padding-left:155px
}

.depth-9 {
  padding-left:175px
}

.depth-10 {
  padding-left:195px
}

</style>
