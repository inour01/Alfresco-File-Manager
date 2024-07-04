<template>
    <div>
      <h1>Alfresco Node Details</h1>
      <div v-if="node">
        <strong>Name:</strong> {{ node.name }}<br>
        <strong>ID:</strong> {{ node.id }}<br>
        <strong>Created By:</strong> {{ node.createdByUser.displayName }}<br>
        <strong>Modified By:</strong> {{ node.modifiedByUser.displayName }}<br>
        <strong>Created At:</strong> {{ formatTimestamp(node.createdAt) }}<br>
        <strong>Modified At:</strong> {{ formatTimestamp(node.modifiedAt) }}<br>
        <!-- Add more properties as needed -->
      </div>
      <div v-else>
        No node data available.
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import authService from '@/services/authService';
  
  export default {
    props: {
      nodeId: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        node: null
      };
    },
    async created() {
      try {
        const ticket = await this.authenticate();
        const base64Ticket = btoa(ticket);
        console.log("ticket", base64Ticket);
        const nodesUrl = `http://localhost/alfresco/api/-default-/public/alfresco/versions/1/nodes/${this.nodeId}`;
        const nodesConfig = {
          headers: {
            'Authorization': `Basic ${base64Ticket}`,
            'Accept': 'application/json'
          }
        };
  
        const nodesResponse = await axios.get(nodesUrl, nodesConfig);
        this.node = nodesResponse.data.entry;
      } catch (error) {
        console.error('Error fetching node details from Alfresco:', error);
      }
    },
    methods: {
    async authenticate() {
      try {
        const userId = 'ismael1';
        const password = 'inour1029';
        const ticket = await authService.authenticate(userId, password);
        return ticket;
      } catch (error) {
        throw new Error('Authentication failed');
      }
    },
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString();
    }
  }
};
  </script>
  