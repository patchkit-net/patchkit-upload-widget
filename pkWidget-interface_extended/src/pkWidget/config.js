export default {
  endpoint: 'http://localhost:3000', // PUT HERE YOUR SERVER ENDPOINT
  
  pkEndpoint: 'https://api2.patchkit.net/1',
  uploadEndpoint: 'https://api.patchkit.net/1',

  maxFileSize: 1073741824 * 10, // 10 GiB
  chunkSize: 1048576 * 10, // 10 MiB
  exeSearchDepth: 2,
  chunkUploadRetries: 0,
}