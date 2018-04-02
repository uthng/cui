<template>
  <div v-if="!isAclEnabled">
    <p class="text-xs-center display-1 mt-5 amber--text">ACL support disabled !</p>
  </div>
</template>

<script>
import _ from 'lodash'
import consul from '~/lib/consul/consul'
import object from '~/lib/utils/object'

export default {
  data: () => {
    return {
    }
  },
  computed: {
    isAclEnabled () { return this.$store.state.consulAcl }
  },
  async asyncData ({store}) {
  },
  methods: {
  }

}
</script>
