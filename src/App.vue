<script>
import MainPage from './components/MainPage.vue';
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    MainPage,
    RouterView,
    Header,
    Footer
  }
}
</script>

<template>
  
  <Header></Header>

  <router-view></router-view>

  <Footer></Footer>
  
</template>

<style>

</style>
