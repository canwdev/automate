<template>
  <b-container>
    <b-navbar type="light" variant="light">
      <b-navbar-brand title="🔮 Node.js 自动化编译部署工具">
        <router-link to="/" target="_top" class="site-title">Automate.js</router-link>
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <!--<b-navbar-nav>
          <b-nav-item href="#">Link</b-nav-item>
          <b-nav-item href="#" disabled>Disabled</b-nav-item>
        </b-navbar-nav>-->

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <template v-slot:button-content>
              User
            </template>
            <b-dropdown-item href="#">Login</b-dropdown-item>
            <b-dropdown-item href="#">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </b-container>

  <!--  <div class="nav-bar">
      <div class="container">
        <div class="page-header">

          <p>🔮 Node.js 自动化编译部署工具</p>
        </div>
      </div>
    </div>-->
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
  font-weight: bold;
}

.site-title:hover {
  text-decoration: none;
}
</style>
