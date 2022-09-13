import config from './config.js';
import { sendRequest } from './request.js';

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const bitSizeToMB = (size) => Number(size / 1048576).toFixed(2);

const pkPlatform  = {
  win32: 'windows_x86',
  win64: 'windows_x86_64',
  lin32: 'linux_x86',
  lin64: 'linux_x86_64',
  osx: 'mac_x86_64',
}
export const decodePlatform = (platform) => pkPlatform[platform];

export const getEntriesFromZip = async (archive) => {
  const blob = new zip.BlobReader(archive);
  const reader = new zip.ZipReader(blob);

  let entries;
  try {
    entries = await reader.getEntries();
  } catch(err) {}

  return entries;
}

export const validateZip = (file, entries) => {
  const validateCorruption = () => entries;

  const validateSpecialChars = () => {
    const noSpecialCharsInString = (str) => {
      const isCharCodeCorrect = (charCode) => charCode >= 32 && charCode < 127 && charCode !== 92;
      for (const i in str) 
        if (!isCharCodeCorrect(str.charCodeAt(i)))
          return [ false, str ];
      return [ true ];
    };

    let validated = true;
    let wrongPathArr = [];

    entries.forEach((entry) => {
      const [ flag, data ] = noSpecialCharsInString(entry.filename);
      if (!flag) {
        wrongPathArr.push(data);
        validated = false;
      }
    });

    return [ validated, wrongPathArr ];
  }

  const validateSize = () => file.size < config.maxFileSize;

  let validated = true;
  let errorMessage = '';
  if (!validateCorruption()) {
    errorMessage = `This is not a valid zip archive or the archive is corrupted`;
    validated = false;
  }
  else {
    if (!validateSize()) {
      errorMessage = `Archive cannot be bigger than 10GB`;
      validated = false;
    }
    const [ flag, wrongPathArr ] = validateSpecialChars();
    if (!flag) {
      errorMessage = `Zip cannot contain special characters. Please correct given paths: ${wrongPathArr.map((data) => `</br>${data}`)}`;
      validated = false;
    }
  }

  return [ validated, errorMessage ];
}

// Platform detection
export const recognizePlatform = (entries, callback) => {
  return new Promise(async (resolve) => {
      Promise.all(await _findExeArr(entries)).then((exeArr) => {
        const filteredUndefined = exeArr.filter((exe) => exe !== undefined);
        exeArr = filteredUndefined;
        callback && callback(exeArr);
        resolve(exeArr);
      }
    )}
  );
}

const _findExeArr = async (entries) => {
  if (!entries) return;
  
  const getBytesFromFile = async (entry, length) => {
    const data = await entry.getData(new zip.TextWriter());
    return data.slice(0, length);
  }
  const hasAnyExtension = ({ filename }) => filename.split('/').pop().includes('.');
  const hasSpecifiedExtension = ({ filename }, extensions) => extensions.some((extension) => filename.split('/').pop().includes(extension));
  const isFolder = ({ filename }) => filename[filename.length - 1] === '/';
  const isTooDeep = ({ filename }) => config.exeSearchDepth && filename.split('/').length > config.exeSearchDepth;

  const isOSX = (entry) => entry.filename.split('/').some((part) => part.includes('.app'));
  const isWin32 = (bytes) => {
    const index = bytes.indexOf('PE');
    return bytes.includes('MZ') && index && bytes[index + 4] === 'L';
  }
  const isWin64 = (bytes) => {
    const index = bytes.indexOf('PE');
    return bytes.includes('MZ') && index && bytes[index + 4] === 'd';
  }
  const isLin32 = (bytes) => {
    return bytes.includes('ELF') && bytes[28] === '4';
  }
  const isLin64 = (bytes) => {
    return bytes.includes('ELF') && bytes[18] === '>';
  }
  let osxDetected = false;
  
  for (let i=0; i < config.exeSearchDepth; i++) {
    if (isOSX(entries[i])) {
      osxDetected = true;
      return([{
        platform: 'osx',
        path: entries[i].filename.substring(0, entries[i].filename.length-1),
        name: entries[i].filename.split('.')[i].split('/').pop(),
      }]);
    }
  }
  if (!osxDetected) {
    const filteredEntries = entries.filter((entry) => 
      !isTooDeep(entry)
      && (hasSpecifiedExtension(entry, ['.exe', '.x86', '.x86_64'])
      || (!hasAnyExtension(entry) && !isFolder(entry)))
    );

    return filteredEntries.map(async (entry) => {
      const bytes = await getBytesFromFile(entry, 400);
      const detectedPlatform =
        isWin32(bytes)
        ? 'win32'
        : isWin64(bytes)
          ? 'win64'
          : isLin32(bytes)
            ? 'lin32'
            : isLin64(bytes)
              ? 'lin64'
              : undefined

      return (
        detectedPlatform
        && {
          platform: detectedPlatform,
          path: entry.filename,
          name: entry.filename.split('/').pop().split('.')[0],
        }
      )
    })
  }
}


// Chunked file upload
const chunkUploadRetries = config.chunkUploadRetries || 0;
let totalChunks = undefined;
let loadedChunks = 0;
let failedChunks = 0;
let wasProgressWarned = false;

let uploadData = {
  url: undefined,
  file: undefined,
  jwt: undefined,
};
export const setUploadData = (data) => {
  Object.assign(uploadData, data);
  uploadData.url = `${config.uploadEndpoint}/uploads/${data.uploadId}/chunk`,
  totalChunks = Math.ceil(data.file.size / config.chunkSize);
  return data;
};

export const chunkedFileUpload = (callbacks = {}, start = 0) => {
  if (!uploadData.url || !uploadData.file || !uploadData.jwt || totalChunks <= 0) {
    console.warn('Upload data are not set properly');
    return;
  }

  if (loadedChunks >= totalChunks) {
    totalChunks = 0;
    loadedChunks = 0;
    callbacks.success && callbacks.success();
    return;
  }

  const newChunk = _createChunk(uploadData.file, start);
  let end = loadedChunks * config.chunkSize - 1;
  if (loadedChunks === totalChunks) {
    end = uploadData.file.size - 1;
  }

  const chunkUploadSuccess = () => {
    failedChunks = 0;
    chunkedFileUpload(callbacks, start + config.chunkSize);
  };
  const chunkUploadError = () => {
    if (failedChunks === chunkUploadRetries) {
      failedChunks = 0;
      callbacks.error && callbacks.error();
      return;
    }

    failedChunks++;
    console.warn(`Chunk upload error. Retrying... (${failedChunks}/${chunkUploadRetries})`);
    _uploadChunk(uploadData.file.size, newChunk, start, end, { 
      success: chunkUploadSuccess, 
      error: chunkUploadError 
    });
  }

  _uploadChunk(uploadData.file.size, newChunk, start, end, {
    progress: callbacks.progress,
    success: chunkUploadSuccess,
    error: chunkUploadError,
  });
}

const _createChunk = (file, start) => {
  loadedChunks++;
  const end = Math.min(start + config.chunkSize , file.size );
  const chunk = file.slice(start, end);
  const chunkForm = new FormData()
  chunkForm.append('chunk', chunk, file.name);

  return chunkForm;
}

const _uploadChunk = (fileSize, chunkForm, start, end, callbacks = {}) => {
  sendRequest(
    {
      method: 'POST',
      url: uploadData.url,
      data: chunkForm,
      headers: {
        ['Content-Range']: `bytes ${start}-${end}/${fileSize}`,
        Authorization: `Bearer ${uploadData.jwt}`,
      }
    },
    {
      progress: (e) => {
        if (e.lengthComputable) {
          const chunkPercentComplete = e.loaded / e.total * 100;
          const totalPercentComplete = (loadedChunks - 1) / totalChunks * 100 + chunkPercentComplete / totalChunks;
          const loaded = (loadedChunks - 1) * config.chunkSize + e.loaded;

          callbacks.progress && callbacks.progress({
            chunkPercentComplete: chunkPercentComplete.toFixed(2),
            totalPercentComplete: totalPercentComplete.toFixed(2),
            loaded: loaded,
            total: uploadData.file.size,
          });
        } else {
          if (!wasProgressWarned) {
            console.warn('Content-Length not responded. Progress cannot be tracked');
            wasProgressWarned = true;
          }
        }
      },
      success: callbacks.success,
      error: callbacks.error,
    }
  );
}