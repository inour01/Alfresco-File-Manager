<template>
  <div>
    <h1>{{ title }}</h1>
    <div class="table-responsive">
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created By</th>
            <th>Modified</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="child in children" :key="child.id">
            <td>{{ child.name }}</td>
            <td>{{ child.createdByUser.displayName }}</td>
            <td>{{ getDaysSinceModified(child.modifiedAt) }} days ago</td>
            <td>
              <!-- Common buttons for all file types -->
              <button @click="openFileViewer(child)">
                <font-awesome-icon icon="eye" /> View
              </button>
              <button @click="confirmDelete(child)">Delete</button>
              <button @click="downloadFile(child)">
                <font-awesome-icon icon="download" /> Download
              </button>

              <!-- Additional buttons only for PDF files -->
              <template v-if="isPdfFile(child)">
                <button @click="showFileDetails(child)">Details</button>
                <button @click="extractAndUploadSVG(child)">
                  <font-awesome-icon icon="upload" /> Extract
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for File Viewer -->
    <div v-if="showFileViewer" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeFileViewer">&times;</span>
        <div v-if="isPdf">
          <iframe :src="selectedFileUrl" class="pdf-viewer"></iframe>
        </div>
        <div v-else-if="isSvg">
          <object :data="selectedFileUrl" type="image/svg+xml" class="image-viewer"></object>
        </div>
        <div v-else>
          <p>Unsupported file format: {{ selectedFileUrl }}</p>
        </div>
      </div>
    </div>

    <!-- Modal for File Details -->
    <div v-if="showDetailsModal" class="file-details-modal">
      <div class="modal-content">
        <span class="close" @click="closeFileDetails">&times;</span>
        <h3>File Details</h3>
        <p><strong>File Name:</strong> {{ selectedFileDetails.fileName }}</p>
        <p><strong>File Node Ref:</strong> {{ selectedFileDetails.fileNodeRef }}</p>
        <p><strong>Plan:</strong> {{ selectedFileDetails.newPlan }}</p>
        <button @click="closeFileDetails">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService';
import axios from 'axios';

export default {
  props: {
    nodeId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Files'
    }
  },
  data() {
    return {
      children: [],
      selectedFile: null,
      selectedFileUrl: '',
      selectedFileDetails: null,
      showFileViewer: false,
      showDetailsModal: false,
      isPdf: true,
      isSvg: false
    };
  },
  methods: {
    async authenticate() {
      try {
        const userId = 'ismael1';
        const password = 'inour1029';
        const ticket = await authService.authenticate(userId, password);
        console.log("Ticket", ticket);
        return ticket;
      } catch (error) {
        throw new Error('Authentication failed');
      }
    },
    async fetchChildren() {
      try {
        const ticket = await this.authenticate();
        const base64Ticket = btoa(ticket);
        const nodeId = '668041c6-70f3-472a-95bf-cb1d8230a414';
        console.log(base64Ticket);
        const response = await axios.get(`http://localhost/alfresco/api/-default-/public/alfresco/versions/1/nodes/${nodeId}/children`, {
          headers: {
            'Authorization': `Basic ${base64Ticket}`,
            'Accept': 'application/json'
          }
        });
        this.children = response.data.list.entries.map(entry => entry.entry);
      } catch (error) {
        console.error('Error fetching children:', error);
      }
    },
    async openFileViewer(child) {
      try {
        const ticket = await this.authenticate();
        const base64Ticket = btoa(ticket);
        const url = `http://localhost/alfresco/api/-default-/public/alfresco/versions/1/nodes/${child.id}/content`;
        const response = await axios.get(url, {
          responseType: 'blob',
          headers: {
            'Authorization': `Basic ${base64Ticket}`,
            'Accept': 'application/json'
          }
        });
        const contentType = response.headers['content-type'];
        console.log('Content Type:', contentType);

        const blob = new Blob([response.data], { type: contentType });
        const urlObject = URL.createObjectURL(blob);
        this.selectedFileUrl = urlObject;
        this.selectedFile = child;

        if (contentType.includes('application/pdf')) {
          this.isPdf = true;
          this.isSvg = false;
        } else if (contentType.includes('image/svg+xml')) {
          this.isPdf = false;
          this.isSvg = true;
        } else {
          this.isPdf = false;
          this.isSvg = false;
        }
        this.showFileViewer = true;
      } catch (error) {
        console.error('Error viewing file:', error);
      }
    },
    async showFileDetails(child) {
      try {
        const ticket = "YWRtaW46YWRtaW4=";
        const url = `http://localhost/alfresco/s/sample/plan-management?id=${child.id}`;
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Basic ${ticket}`,
            'Accept': 'application/json'
          }
        });

        this.selectedFileDetails = response.data;
        this.selectedFile = child;
        this.showDetailsModal = true;
        console.log("selectedFileDetails", this.selectedFileDetails);
      } catch (error) {
        console.error('Error fetching file details:', error);
        console.log("selectedFileDetails", this.selectedFileDetails);
      }
    },
    async downloadFile(child) {
      try {
        console.log("nodeid", child.id);
        const ticket = await this.authenticate();
        const base64Ticket = btoa(ticket);
        const url = `http://localhost/alfresco/api/-default-/public/alfresco/versions/1/nodes/${child.id}/content`;
        const response = await axios.get(url, {
          responseType: 'blob',
          headers: {
            'Authorization': `Basic ${base64Ticket}`,
            'Accept': 'application/json'
          }
        });
        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', child.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    },
    closeFileViewer() {
      this.selectedFileUrl = '';
      this.selectedFile = null;
      this.showFileViewer = false;
    },
    closeFileDetails() {
      this.selectedFile = null;
      this.showDetailsModal = false;
    },
    async confirmDelete(child) {
      const confirmed = window.confirm(`Are you sure you want to delete '${child.name}'?`);
      if (confirmed) {
        try {
          const ticket = await this.authenticate();
          const base64Ticket = btoa(ticket);
          const url = `http://localhost/alfresco/api/-default-/public/alfresco/versions/1/nodes/${child.id}`;
          await axios.delete(url, {
            headers: {
              'Authorization': `Basic ${base64Ticket}`,
              'Accept': 'application/json'
            }
          });
          this.fetchChildren();
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }
    },
    getDaysSinceModified(modifiedAt) {
      const modifiedDate = new Date(modifiedAt);
      const currentDate = new Date();
      const differenceInDays = Math.floor((currentDate - modifiedDate) / (1000 * 60 * 60 * 24));
      return differenceInDays;
    },
    async extractAndUploadSVG(child) {
      try {
        const response = await axios.get(`http://localhost/alfresco/s/sample/image-extractor?nodeId=${child.id}`, {
          headers: {
            'Authorization': 'Basic aXNtYWVsMTppbm91cjEwMjk=',
            'Accept': 'application/json'
          }
        });
        if (response.data.message === 'Signatures extracted successfully') {
          this.fetchChildren();
        } else {
          alert('No SVG images found in the response.');
        }
      } catch (error) {
        console.error('Error extracting and uploading SVG:', error);
        alert('An error occurred while extracting and uploading SVG.');
      }
    },
    isPdfFile(child) {
      return child.name.toLowerCase().endsWith('.pdf');
    },
    isSvgFile(child) {
      return child.name.toLowerCase().endsWith('.svg');
    }
  },
  created() {
    this.fetchChildren();
  }
};
</script>

<style>
  .table-responsive {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    max-width: 100%;
    margin-bottom: 1rem;
    background-color: transparent;
    border-collapse: collapse;
  }

  .table th,
  .table td {
    padding: 12px;
    text-align: left;
  }

  .table th {
    background-color: #e0e0e0;
    color: #333;
  }

  .table tbody tr {
    background-color: #f5f5f5;
    color: #333;
  }

  .table th + th,
  .table td + td {
    padding-left: 20px;
  }

  .table tbody tr:hover {
    background-color: #e0e0e0;
  }

  @media (max-width: 768px) {
    .table th,
    .table td {
      font-size: 14px;
      padding: 8px;
    }
  }

  .modal {
    display: block;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 50%; /* Initial width */
    max-width: 80%; /* Set a maximum width for the modal */
    height: 50%; /* Initial height */
    max-height: 80%; /* Set a maximum height for the modal */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    border-radius: 5px; /* Rounded corners for a cleaner look */
    resize: both; /* Allow resizing */
    overflow: auto; /* Enable overflow for content */
  }

  .modal-content::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 15px;
    height: 15px;
    background-color: #e0e0e0;
    cursor: nwse-resize;
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  .pdf-viewer {
    width: 100%;
    height: 90%; /* Adjusted height for PDF viewer */
    min-height: 400px; /* Minimum height for the PDF viewer */
    object-fit: scale-down;
  }

  .image-viewer {
    width: 100%;
    height: 100%; /* Adjusted height for SVG viewer */
    min-height: 200px; /* Minimum height for the SVG viewer */
    object-fit: scale-down;
  }

  .file-details-modal {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border: 1px solid #ccc;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    width: 50%; /* Adjust the width to fit the content */
    max-width: 80%; /* Set a maximum width for the modal */
    height: auto; /* Adjust height to fit content */
    max-height: 50%; /* Set a maximum height for the modal */
    border-radius: 5px; /* Rounded corners for a cleaner look */
    resize: both; /* Allow resizing */
    overflow: auto; /* Enable overflow for content */
  }

  .file-details-modal .close {
    position: absolute;
    top: 10px;
    right: 15px;
    cursor: pointer;
    font-size: 20px;
  }
</style>
