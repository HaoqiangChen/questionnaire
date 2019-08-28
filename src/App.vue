<template>
  <div id="app">
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {}
}
</script>

<style lang="stylus" scoped>
  @import "~@/common/stylus/variable"
</style>
