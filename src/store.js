import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth.js';
import globalAxios from 'axios';
import router from './router';

Vue.use(Vuex);


export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null,
    userEmail: null
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
      state.userEmail = userData.email
    },
    storeUser(state, user) {
      state.user = user
    },
    clearAuthData(state) {
      state.idToken = null;
      state.userId = null
    }
  },
  actions: {
    setLogoutTimer({commit}, expirationTime) {
      setTimeout(() => {
        commit('clearAuthData')
      }, expirationTime * 1000)
    },
    signup({commit, dispatch}, authData) {
      axios.post('/signupNewUser?key=AIzaSyAjiWKp_fAJSEEnKTnEBthYPw_SXeaBtR8', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
        .then(res => {
          console.log(res)
          commit('authUser', {
            email: res.data.email,
            token: res.data.idToken,
            userId: res.data.localId
          });
          const now = new Date();
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expireIn', expirationDate);
          dispatch('storeUser', authData);
          dispatch('setLogoutTimer', res.data.expiresIn)
          router.replace('/dashboard')
        })
        .catch(error => console.log(error))
    },
    autoLogin({commit}){
      const token = localStorage.getItem('token');
      if(!token){
        return
      }
      const expirationDate = localStorage.getItem('expireIn');
      const now = new Date();
      if(now >= expirationDate){
        return
      }
      const userId = localStorage.getItem('userId');
      commit('authUser', {
        token: token,
        userId: userId
      })

    },
    login ({commit, dispatch}, authData) {
      axios.post('/verifyPassword?key=AIzaSyAjiWKp_fAJSEEnKTnEBthYPw_SXeaBtR8', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
        .then(res => {
          const now = new Date();
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expireIn', expirationDate);
          console.log(res.data)
          commit('authUser', {
            email: res.data.email,
            token: res.data.idToken,
            userId: res.data.localId
          });
          dispatch('setLogoutTimer', res.data.expiresIn);
          router.replace('/dashboard')
        })
        .catch(error => console.log(error))
    },
    logout({commit}) {
      commit('clearAuthData');
      localStorage.removeItem('expireIn');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.replace('/signin')
    },
    storeUser({commit, state}, userData){
      if(!state.idToken){
        return
      }
      globalAxios.post('/users.json' + '?auth=' + state.idToken, userData)
        .then(res => console.log(res))
        .catch(error => console.log(error))
    },
    fetchUser({commit, state}){
      if(!state.idToken){
        return
      }
      globalAxios.get('/users.json' + '?auth=' + state.idToken)
        .then(res => {
          const data = res.data;
          const users = [];
          for (let key in data) {
            const user = data[key];
            user.id = key;
            users.push(user)
          }
          commit('storeUser', users)
        })
        .catch(error => console.log(error))
    }
  },
  getters: {
    user(state) {
      return state.user
    },
    isAuthenticated(state) {
      return state.idToken !== null
    }
  }
})