<template>
  <div class="nav-bar">
    <div class="container">
      <div class="page-header">
        <router-link to="/" target="_top" class="site-title"><h1>Automate.js</h1></router-link>
        <p>🔮 Node.js 自动化编译部署工具</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.nav-bar {

  padding-bottom: 9px;
  margin: 40px 0 20px;
  border-bottom: 1px solid #eee;
}

.site-title {
  display: block;
  color: #F44336;
  text-shadow: 4px 4px 0 #FFEB3B;

  h1 {
      color: inherit;
      margin-bottom: 0;
  }
}
.site-title:hover {
  text-decoration: none;
}
</style>
