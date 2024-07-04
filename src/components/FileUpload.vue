<template>
    <div>
      <h1>Upload File</h1>
      <div @dragover.prevent @drop="handleDrop" class="drop-area">
        <p>Drop file here</p>
      </div>
      <input type="file" ref="fileInput" @change="handleFileInput">
      <!-- <button @click="uploadFile">Upload File</button> -->
      <p v-if="uploadStatus">{{ uploadStatus }}</p>
    </div>
  </template>
  
  <script>
import axios from 'axios';
import authService from '@/services/authService';

export default {
  data() {
    return {
      uploadStatus: null,
      uploadedFiles: []
    };
  },
  methods: {
    async authenticateUser() {
      try {
        const userId = 'ismael1';
        const password = 'inour1029';
        const ticket = await authService.authenticate(userId, password);
        return ticket;
      } catch (error) {
        console.error('Authentication error:', error);
        throw new Error('Authentication failed');
      }
    },
    handleDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      this.uploadFileToAlfresco(file);
    },
    handleFileInput() {
      const file = this.$refs.fileInput.files[0];
      this.uploadFileToAlfresco(file);
    },
    async uploadFile() {
      const file = this.$refs.fileInput.files[0];
      this.uploadFileToAlfresco(file);
    },
    async uploadFileToAlfresco(file) {
      try {
        this.uploadStatus = 'Uploading...';
        const ticket = await this.authenticateUser();
        const nodeId = '668041c6-70f3-472a-95bf-cb1d8230a414'; // Example node ID where the file will be uploaded
        const url = `http://localhost/alfresco/api/-default-/public/alfresco/versions/1/nodes/${nodeId}/children`;

        const config = {
          headers: {
            'Authorization': `Basic ${btoa(ticket)}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        };

        const formData = new FormData();
        formData.append('filedata', file);
        formData.append('autoRename', 'true');
        formData.append('majorVersion', 'true');

        await axios.post(url, formData, config);

        this.uploadStatus = `File '${file.name}' uploaded successfully!`;
        // Update the table of uploaded files
        this.fetchUploadedFiles();
        this.$emit('fileUploaded');
      } catch (error) {
        console.error('Error uploading file to Alfresco:', error);
        this.uploadStatus = 'File upload failed.';
      }
    },
    async fetchUploadedFiles() {
      try {
        const ticket = await this.authenticateUser();
        const nodeId = '668041c6-70f3-472a-95bf-cb1d8230a414'; // Same node ID for fetching files
        const url = `http://localhost/alfresco/api/-default-/public/alfresco/versions/1/nodes/${nodeId}/children`;

        const config = {
          headers: {
            'Authorization': `Basic ${btoa(ticket)}`,
            'Accept': 'application/json'
          }
        };

        const response = await axios.get(url, config);
        this.uploadedFiles = response.data.list.entries.map(entry => entry.entry);
      } catch (error) {
        console.error('Error fetching uploaded files:', error);
      }
    }
  },
  created() {
    // Fetch initially uploaded files when the component is created
    this.fetchUploadedFiles();
  }
};
</script>
  
  <style>
  .drop-area {
    width: 300px;
    height: 150px;
    border: 2px dashed #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>
  