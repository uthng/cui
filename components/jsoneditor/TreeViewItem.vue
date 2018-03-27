<template>
  <div v-if="isObject(data) || isArray(data)">
    <div class="item item-leaf" :class="getClassDepth(currentDepth)">
      <div class="item-node" @click.stop="toggleOpen()" :class="modifColor">
        <span :class="{opened: isOpen()}" class="item-key item-key-with-chevron">{{getKey(data)}}</span>
        <span class="item-hint" v-show="!isOpen() && data.children.length === 1"> ({{data.children.length}} {{ isObject(data) ? 'property' : 'item' }})</span>
        <span class="item-hint" v-show="!isOpen() && data.children.length !== 1"> ({{data.children.length}} {{ isObject(data) ? 'properties' : 'items' }})</span>
        <span class="item-actions">
          <v-btn icon small disabled class="ma-0 pa-0"><v-icon small>create</v-icon></v-btn>
          <v-btn icon small class="ma-0 pa-0"><v-icon small>add</v-icon></v-btn>
          <v-btn icon small class="ma-0 pa-0" @click.stop="dialogDeleteKeyPath = true"><v-icon small>delete</v-icon></v-btn>
        </span>
      </div>
    </div>
    <tree-view-item :key="getKey(child)" :max-depth="maxDepth" :current-depth="currentDepth+1" v-show="isOpen()" v-for="child in data.children" :data="child" :path="getPath(child)" :modifiable="modifiable" @change-data="onChangeData"></tree-view-item>
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
  <tree-view-item-value v-else-if="isValue(data)" class="item item-leaf" :key-string="getKey(data)" :data="data.value" :path="path" :modifiable="modifiable" :current-depth="currentDepth" @change-data="onChangeData"></tree-view-item-value>

</template>

<script>
  import _ from 'lodash'
  import TreeViewItemValue from '~/components/jsoneditor/TreeViewItemValue.vue'

  export default {
    components: {
      TreeViewItemValue
    },
    name: 'tree-view-item',
    props: ['data', 'max-depth', 'current-depth', 'modifiable', 'path'],
    data: function () {
      return {
        open: this.currentDepth < this.maxDepth,
        dialogDeleteKeyPath: false
      }
    },
    computed: {
      modifColor: function () {
        var list = _.cloneDeep(this.$store.state.keyPathModifList)
        var color= "";

        for (var i = 0; i < list.length; i++) {
          // Loop all elements, only break immediate when meeting R
          // if not, return last saved value
          if (list[i].path.startsWith(this.path) || this.path.startsWith(list[i].path)) {
            if (list[i].type == "M") {
              color = "amber--text text--lighten-3"
            }
            else if (list[i].type == "R") {
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
      getPath: function(data, isValue) {
        var path
        if (this.path === undefined) {
          return data.key + "/"
        }

        if (data.isRoot) {
          return ''
        }

        if (this.isValue(data)) {
          path = this.path + data.key
        } else {
          path = this.path + data.key + "/"
        }

        return path
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
      },
      saveDeletedKeyPath: function () {
        var keyPathModifList = _.cloneDeep(this.$store.state.keyPathModifList)
        keyPathModifList.push({path: this.path, value: '',  type: 'R'})
        this.$store.dispatch('updateKeyPathModifList', keyPathModifList)

        this.dialogDeleteKeyPath = false
        this.showSuccessDeleteMsg()
        // Force to reload component (computed because we just mark as delete at this moment)
        // to change colors

      }

    },
    notifications: {
      showSuccessModifMsg: {
        type: 'success',
        title: 'Modify Key Value',
        message: 'The new key\'s value has been saved correctly'
      },
      showSuccessDeleteMsg: {
        type: 'success',
        title: 'Delete Key Value',
        message: 'The path has been deleted correctly'
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

.item-actions {
  position: absolute;
  right: 10px;
  top: -5px;
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
