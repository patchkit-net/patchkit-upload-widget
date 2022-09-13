import Components from './Components.js';
import { sleep } from './utils.js';
import { validate, detectPlatforms, upload, process } from './engine.js';
import Alert from './Alert.js';

export default class pkWidget {
  constructor(parentQuery) {
    this.parentDiv = document.querySelector(parentQuery);
    if (!this.parentDiv) {
      console.warn(`pkWidget: Cannot find element with query: ${parentQuery}`);
      return;
    }

    this.div = document.createElement('div');
    this.parentDiv.appendChild(this.div);
    this.div.className = 'pkWidget';

    this.topBar = document.createElement('div');
    this.div.appendChild(this.topBar);
    this.topBar.className = 'widgetTopBar';

    this.content = document.createElement('div');
    this.div.appendChild(this.content);
    this.content.className = 'widgetContent';

    this.modal = document.createElement('div');
    this.div.appendChild(this.modal);
    this.modal.className = 'widgetModal hidden';

    Alert.setParent(this.content);

    Components.init(this);
    this.C = Components.getAll();

    this.C.stepProgress.appendTo(this.topBar);

    this.modal.innerHTML =
    `
    <div>
      <span class="primary">This was a demo.</span>
      <span class="secondary">If you like our solution and want to use it to distribute your applications, please sign up for a free account.</span>
      <div class="form">
        <input type="text" id="email" placeholder="Email">
        <div id="signUp" class="btn">Sign up</div>
      </div>
    </div>
    <div class="modalClose"><i class="icon icon-x"></i></div>
    `;
    const input = this.modal.querySelector('input#email');
    const signUp = this.modal.querySelector('#signUp');
    const close = this.modal.querySelector('.modalClose');
    close.addEventListener('click', () => this.modal.classList.add('hidden'));
    signUp.addEventListener('click', () => window.open(`https://panel.patchkit.net/users/register?email=${input.value}`, '_blank'));
    input.addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        signUp.click();
      }
    });
    this.setView(View.file);
  }

  async setView(viewName, data) {
    switch(viewName) {

      case View.file:
        this.C.stepProgress.setActiveByIndex(0);

        this.C.fileInput.onChange = async (file) => {   
          let [ archiveEntries, isValidated, errorMessage ] = await validate(file);

          if (isValidated) {
            const platforms = await detectPlatforms(archiveEntries);
            if (!platforms || platforms.length === 0) {
              isValidated = false;
              errorMessage = 'No executable found in given archive';
            }

            this.C.fileInput.setState(FileInputState.uploading);
            upload({ file: file }, {
              success: (uploadId) => this.setView(View.summary, {
                entries: archiveEntries,
                file: file,
                filesCount: archiveEntries.length,
                uploadId: uploadId,
                platforms: platforms
              }),
              progress: (percentage) => this.C.fileInput.progressRing.setValue(parseInt(percentage)),
              error: () => {
                Alert.display('Error while uploading', 'error');
                this.C.fileInput.setState(FileInputState.noArchive);
              }
            })
          } else {
            Alert.display(errorMessage, 'error');
            this.C.fileInput.div.classList.add('error');
            await sleep(2000);
            this.C.fileInput.div.classList.remove('error');
          }
        };
        this.C.fileInput.appendTo(this.content);
        await this.C.fileInput.fadeIn();
      break;

      case View.summary:
        this.C.fileInputLabel.appendTo(this.content);
        this.C.fileInputLabel.collapse(true, 0);

        this.C.fileInput.data = data;
        this.C.fileInput.onCancel = async () => {
          this.C.stepProgress.setActiveByIndex(0);

          await this.cleanupView(View.summary);
          this.setView(View.file);
        };
        this.C.fileInput.appendTo(this.content);
        this.C.fileInput.setState(FileInputState.summary);
        await sleep(800);
        this.C.fileInputLabel.collapse(false);

        this.C.platformSelectLabel.appendTo(this.content);
        this.C.platformSelectLabel.fadeIn();

        this.C.platformSelect.appendTo(this.content);
        this.C.platformSelect.setValue(data.platforms[0]);
        this.C.platformSelect.fadeIn();

        this.C.processButton.onClick = async () => {
          await this.cleanupView(View.summary);
          this.setView(View.processing, {
            platform: this.C.platformSelect.selected,
            uploadId: data.uploadId
          });
        };
        this.C.processButton.appendTo(this.content);
        this.C.processButton.fadeIn();
      break;

      case View.processing:
        this.C.stepProgress.setActiveByIndex(1);

        const state = { isCancelled: false };
        this.C.progress.onReset = async () => {
          this.C.stepProgress.setActiveByIndex(1);

          this.cleanupView(View.processing);
          this.C.progress.clear();
          await sleep(500);
          this.setView(View.file);
          state.isCancelled = true;
        };
        this.C.progress.appendTo(this.content);
        this.C.progress.fadeIn();

        this.C.fileInputLabel.fadeIn();

        this.C.progress.setProgress(0, 'Connecting...');
        process({
          platform: data.platform,
          uploadId: data.uploadId
        }, {
          success: (url) => {
            this.C.progress.setUrl(url);
            this.C.stepProgress.setActiveByIndex(2);

            this.C.progress.onDownload = () => {
              window.open(url);
              this.modal.classList.remove('hidden');
            }
          },
          progress: (percentage, message) => this.C.progress.setProgress(percentage, message),
          error: (message) => Alert.display(message, 'error')
        }, state);
      break;
    }
  }

  async cleanupView(viewName) {
    switch(viewName) {

      case View.summary:
        this.C.fileInput.setState(FileInputState.noArchive);

        this.C.fileInputLabel.fadeOut(.5);
        this.C.fileInput.fadeOut(.5);
        this.C.platformSelectLabel.fadeOut(.5);
        this.C.platformSelect.fadeOut(.5);
        await this.C.processButton.fadeOut(.5);
        
        this.C.fileInputLabel.remove();
        this.C.fileInput.remove();
        this.C.platformSelectLabel.remove();
        this.C.platformSelect.remove();
        this.C.processButton.remove();
      break;

      case View.processing:
        await this.C.progress.fadeOut(.5);
        this.C.progress.remove();
      break;
    }
  }
}

export const View = {
  file: 'file',
  summary: 'summary',
  processing: 'processing',
}

export const FileInputState = {
  noArchive: 'noArchive',
  uploading: 'uplading',
}