import { createStore } from 'vuex';

export default createStore({
  state: {
    children: [],
  },
  mutations: {
    setChildren(state, children) {
      state.children = children;
    },
  },
});
