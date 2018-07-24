<template>
  <div id="dashboard">
    <h1>That's the dashboard!</h1>
    <p>You should only get here if you're authenticated!</p>
    <p v-for="(key, index) in email">
      <span v-if="key.email === checkLoginEmail ">Your email address: {{ key.email }}</span>
    </p>
  </div>
</template>

<script>

  export default {
    data(){
      return {
        checkLoginEmail: this.$store.state.userEmail
      }
    },
   computed: {
     email () {
       return !this.$store.getters.user ? false : this.$store.getters.user
     }
   },
    created () {
      this.$store.dispatch('fetchUser')
    }
  }
</script>

<style scoped>
  h1, p {
    text-align: center;
  }

  p {
    color: red;
  }
</style>