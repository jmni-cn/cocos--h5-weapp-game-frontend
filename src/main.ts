import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/index';
import axios from '@/lib/axios';
// import Vant from 'vant';
import { Overlay } from 'vant';
import Popup from '@/components/public/popup.vue';
import 'vant/lib/index.css';
import io from 'socket.io-client';
import obServer from '@/utils/obServer';
import defaultConfig from '@/config/default.config';

const socket = io(defaultConfig.io.host);

declare module 'vue/types/vue' {
  interface Vue {
    $io: typeof socket;
    $observer: typeof obServer;
  }
}

Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.prototype.$io = socket;
Vue.prototype.$observer = obServer;

// Vue.use(Vant);
Vue.use(Overlay);
Vue.component('popup', Popup);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

router.beforeEach((to, from, next) => {
  console.log(to.name);
  if (to.name === 'home') {
    // const userInfo: any = store.state.userInfo;
    // if (!userInfo.token) {
    //   next({ name: 'login' });
    //   return;
    // }
  }
  next();
});