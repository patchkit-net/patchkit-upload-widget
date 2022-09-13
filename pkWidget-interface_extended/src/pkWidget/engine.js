import { requestUpload, requestCreateApp, requestProcess, requestProcessingStatus, requestPublish, requestPublishingStatus, requestFetchApp } from './request.js';
import { getEntriesFromZip, validateZip, recognizePlatform, setUploadData, chunkedFileUpload } from './utils.js';

export const validate = async (file) => {
  const archiveEntries = await getEntriesFromZip(file);
  const [ isValidated, errorMessage ] = validateZip(file, archiveEntries);

  return [ archiveEntries, isValidated, errorMessage ];
}

export const detectPlatforms = async (archiveEntries) => {
  const exeArr = await recognizePlatform(archiveEntries);
  if (!exeArr || exeArr.length === 0) return;

  const platformArr = [...new Set(exeArr.map((exe) => exe.platform))];
  return platformArr;
}

export const upload = async ({ file }, callbacks) => {
  const upload = await requestUpload({ file });
  if (!upload) return callbacks.error && callbacks.error();
  const uploadData = JSON.parse(upload);

  setUploadData({
    uploadId: uploadData.upload_id,
    file: file,
    jwt: uploadData.jwt,
  });

  chunkedFileUpload({
    progress: (progressData) => callbacks.progress && callbacks.progress(progressData.totalPercentComplete),
    success: () => callbacks.success && callbacks.success(uploadData.upload_id),
    error: () => callbacks.error && callbacks.error()
  });
};

const trackProcessing = (jobId, callback) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      requestProcessingStatus({ jobId }, {
        success: (r) => {
          const processingStatus = JSON.parse(r);
          const processingProgress = processingStatus.progress * 100;

          callback && callback(processingProgress, processingStatus.status_message);

          if (processingStatus.finished) {
            clearInterval(interval);
            resolve();
          }
        },
        error: () => {}
      });
    }, 1000);
  });
}

const trackPublishing = (appSecret, callback) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      requestPublishingStatus({ appSecret }, {
        success: (r) => {
          const publishingStatus = JSON.parse(r);
          const publishingProgress = publishingStatus.publish_progress * 100;

          callback && callback(publishingProgress, 'Publishing...');

          if (publishingStatus.publish_progress === 1) {
            clearInterval(interval);
            resolve();
          }
        },
        error: () => {}
      });
    }, 1000);
  });
}

export const process = async ({ platform, uploadId }, callbacks, state) => {
  const newApp = await requestCreateApp({ platform }, {
    error: () => callbacks.error && callbacks.error('Error while creating the application')
  });
  if (!newApp) return;
  const newAppData = JSON.parse(newApp);

  const process = await requestProcess({
    appSecret: newAppData.app_secret,
    versionId: newAppData.version_id,
    uploadId: uploadId
  }, {
    error: () => callbacks.error && callbacks.error('Cannot process the file')
  });
  if (!process) return;
  const processData = JSON.parse(process);

  if (state.isCancelled) return;

  await trackProcessing(processData.job_guid, (percentage, message) => {
    if (state.isCancelled) return;
    callbacks.progress(parseInt(percentage * 0.75), message);
  });

  if (state.isCancelled) return;

  const publish = await requestPublish({ appSecret: newAppData.app_secret }, {
    error: () => callbacks.error && callbacks.error('Error while publishing')
  });
  if (!publish) return;

  if (state.isCancelled) return;

  await trackPublishing(newAppData.app_secret, (percentage, message) => {
    if (state.isCancelled) return;
    callbacks.progress(parseInt(75 + percentage * 0.25), message);
  });

  if (state.isCancelled) return;

  const app = await requestFetchApp({ appSecret: newAppData.app_secret });
  if (!app) return;
  const appData = JSON.parse(app);

  if (state.isCancelled) return;

  callbacks.success && callbacks.success(appData.download_links.direct);
};