<template>
  <b-navbar class="site-navbar" type="light" variant="light">
    <b-container>

      <b-navbar-brand id="tooltip-target-1">
        <router-link to="/" target="_top" class="site-title">Automate.js</router-link>
      </b-navbar-brand>
      <b-tooltip target="tooltip-target-1" triggers="hover">
        <small>🔮 Node.js 自动化编译部署工具!</small>
      </b-tooltip>

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
              <b-icon v-if="token" icon="check-circle-fill"></b-icon>
              <b-icon v-else icon="circle"></b-icon>

            </template>
            <b-dropdown-item v-if="!token" @click="isShowLogin = true">Login</b-dropdown-item>
            <b-dropdown-item v-else @click="clearAuth">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-container>

    <b-modal
        v-model="isShowLogin"
        ref="modal"
        title="Login"
        @ok="handleOk"
        hide-footer
    >
      <form ref="form" @submit.stop.prevent="submitLogin">
        <b-form-group
            label="Username"
            label-for="name-input"
            invalid-feedback="Name is required"
        >
          <b-form-input
              id="name-input"
              v-model="form.username"
              required
          ></b-form-input>
        </b-form-group>

        <b-form-group
            label="Password"
            label-for="password-input"
            invalid-feedback="Password is required"
        >
          <b-form-input
              id="password-input"
              type="password"
              v-model="form.password"
              required
          ></b-form-input>
        </b-form-group>
        <div class="row no-gutters">
          <button type="submit" class="btn btn-primary ml-auto">Submit</button>
        </div>
      </form>
    </b-modal>

  </b-navbar>
</template>

<script>
import {getToken, removeToken} from '@/utils/auth'
import {getAuth} from '@/api/user'

export default {
  data() {
    return {
      isShowLogin: false,
      form: {
        username: '',
        password: ''
      },
    }
  },
  computed: {
    token: {
      get() {
        return this.$store.state.token
      },
      set(val) {
        this.$store.commit('setToken', val)
      }
    }
  },
  mounted() {
    this.token = getToken()
  },
  methods: {
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault()
      // Trigger submit handler
      this.$refs.form.submit()
    },
    async submitLogin() {
      const {
        token,
        username
      } = await getAuth({
        username: this.form.username,
        password: this.form.password
      })
      this.token = token
      // this.isShowLogin = false
      location.reload()
    },
    clearAuth() {
      removeToken()
      location.reload()
    }
  }
};
</script>

<style lang="scss" scoped>
.site-navbar {
  margin: 0 0 20px;
  border-bottom: 1px solid #eee;
}

.site-title {
  display: block;
  color: #F44336;
  text-shadow: 4px 4px 0 #FFEB3B;
  font-weight: bold;
  transition: all .3s;
}

.site-title:hover {
  text-decoration: none;
  text-shadow: -4px 4px 0 #FFEB3B;
}
</style>
