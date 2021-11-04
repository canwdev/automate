<template>
  <div id="app" class="tk-scroll">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'
export default {
  name: 'App',
  components: {
    NavBar
  }
}
</script>


<style lang="scss">

</style>
