<template>
  <div id ="app">
    <!-- <NodeDetails :nodeId="'58eb2274-8dbd-4dab-b1a6-fdb9928ba958'" /> -->
    <FileUpload @fileUploaded="refreshFilesTable"/>
    <NodeChildrenTable />
  </div>
</template>

<script>
// import NodeDetails from './components/FileRetrieval.vue';
import FileUpload from './components/FileUpload.vue'
import NodeChildrenTable from './components/NodeChildrenTable.vue'

export default {
  components: {
    // NodeDetails,
    FileUpload,
    NodeChildrenTable
  },
  methods: {
    refreshChildren() {
      // Method to refresh children table after file upload
      this.$refs.nodeChildrenTable.fetchChildren();
    }
  }
};
</script>

<style>
#app {
  background-color: #fdeaff72; /* Light blue background color */
  min-height: 100vh; /* Ensures the background covers the entire viewport height */
  padding: 20px; /* Add padding to the app container */
}

</style>
