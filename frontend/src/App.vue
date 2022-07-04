<template>
  <div id="app" class="tk-scroll">
    <NavBar/>
    <KeepAlive :include="['Home']">
      <router-view/>
    </KeepAlive>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'

export default {
  name: 'App',
  components: {
    NavBar
  },
  computed: {
    isDarkTheme() {
      return this.$store.getters.isDarkTheme
    },
  },
  watch: {
    isDarkTheme: {
      handler(val) {
        if (val) {
          document.body.classList.add('tk-dark-theme')
          document.body.classList.remove('tk-light-theme')
        } else {
          document.body.classList.add('tk-light-theme')
          document.body.classList.remove('tk-dark-theme')
        }
      },
      immediate: true
    }
  }
}
</script>


<style lang="scss">

</style>
