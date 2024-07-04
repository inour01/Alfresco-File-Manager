<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error" style="color: red;">{{ error }}</p>
  </div>
</template>

<script>
import authService from '@/services/authService';

export default {
  data() {
    return {
      username: '',
      password: '',
      error: ''
    };
  },
  methods: {
  async login() {
    try {
      const ticket = await authService.authenticate(this.username, this.password);
      // Redirect to components page and pass the ticket as a prop
      this.$router.push({ name: 'ComponentsPage', params: { ticket } });
    } catch (error) {
      this.error = 'Authentication failed. Please check your credentials.';
    }
  }
}
};
</script>
