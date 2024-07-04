import axios from 'axios';

const authService = {
  async authenticate(username, password) {
    const url = 'http://localhost/alfresco/api/-default-/public/authentication/versions/1/tickets';
    const data = {
      userId: username,
      password: password
    };
    const config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await axios.post(url, data, config);
      const ticket = response.data.entry.id;
      return ticket;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed');
    }
  },
  async getUserFolders(ticket) {
    try {
      const response = await axios.get('http://localhost/alfresco/api/-default-/public/alfresco/versions/1/people/-me-/folders', {
        headers: {
          'Authorization': `Basic ${btoa(ticket)}`
        }
      });
      console.log("Response", response);
      return response.data.list.entries;
    } catch (error) {
      console.error('Failed to retrieve user folders:', error);
      throw error;
    }
  }
};

export default authService;
