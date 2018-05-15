<template>
  <div class="consul-view-wrapper">
    <consul-view-item :data="parsedData" :max-depth="allOptions.maxDepth" :current-depth="0" :modifiable="allOptions.modifiable" class="item-root" path="" @change-data="onChangeData"/>
  </div>
</template>

<script>
import _ from "lodash"
import ConsulViewItem from "~/components/consul-editor/ConsulViewItem.vue"

export default {
  name: "ConsulView",
  components: {
    ConsulViewItem
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  computed: {
    allOptions: function() {
      return _.extend(
        {},
        {
          rootObjectKey: "consul",
          maxDepth: 4,
          modifiable: false
        },
        this.options || {}
      )
    },
    parsedData: function() {
      // Take the JSON data and transform
      // it into the Tree View DSL
      // Strings or Integers should not be attempted to be split, so we generate
      // a new object with the string/number as the value
      if (this.isValue(this.data)) {
        return this.transformValue(this.data, this.allOptions.rootObjectKey)
      }

      // If it's an object or an array, transform as an object
      return this.transformObject(
        this.data,
        this.allOptions.rootObjectKey,
        true
      )
    }
  },
  methods: {
    // Transformer for the non-Collection types,
    // like String, Integer of Float
    transformValue: function(valueToTransform, keyForValue) {
      return {
        key: keyForValue,
        type: "value",
        value: valueToTransform
      }
    },

    // Since we use lodash, the _.map method will work on
    // both Objects and Arrays, returning either the Key as
    // a string or the Index as an integer
    generateChildrenFromCollection: function(collection) {
      return _.map(collection, (value, keyOrIndex) => {
        if (this.isObject(value)) {
          return this.transformObject(value, keyOrIndex)
        }
        if (this.isArray(value)) {
          return this.transformArray(value, keyOrIndex)
        }
        if (this.isValue(value)) {
          return this.transformValue(value, keyOrIndex)
        }
      })
    },

    // Transformer for the Array type
    transformArray: function(arrayToTransform, keyForArray) {
      return {
        key: keyForArray,
        type: "array",
        children: this.generateChildrenFromCollection(arrayToTransform)
      }
    },

    // Transformer for the Object type
    transformObject: function(
      objectToTransform,
      keyForObject,
      isRootObject = false
    ) {
      return {
        key: keyForObject,
        type: "object",
        isRoot: isRootObject,
        children: this.generateChildrenFromCollection(objectToTransform)
      }
    },

    // Helper Methods for value type detection
    isObject: function(value) {
      return _.isPlainObject(value)
    },

    isArray: function(value) {
      return _.isArray(value)
    },

    isValue: function(value) {
      return !this.isObject(value) && !this.isArray(value)
    },

    onChangeData: function(path, value) {
      let lastKey = _.last(path)
      path = _.dropRight(_.drop(path))

      let data = _.cloneDeep(this.data)
      let targetObject = data
      _.forEach(path, key => {
        targetObject = targetObject[key]
      })

      if (targetObject[lastKey] !== value) {
        targetObject[lastKey] = value
        this.$emit("change-data", data)
      }
    }
  }
}
</script>

<style>
.consul-view-wrapper {
  overflow: auto;
}

/* Find the first nested node and override the indentation */
.item-root > .item-leaf > .item {
  margin-left: 0 !important;
}

/* Root node should not be indented */
.item-root {
  margin-left: 0 !important;
}
</style>
