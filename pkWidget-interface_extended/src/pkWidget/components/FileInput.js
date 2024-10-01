import { FileInputState } from '../main.js';
import { bitSizeToMB, sleep } from '../utils.js';
import Component from './Component.js';
import dashed from './dashed.js';
import ProgressRing from './ProgressRing.js';


export default class FileInput extends Component {
  constructor() {
    super('fileInput');

    this.data = {
      file: undefined,
      filesCount: undefined,
    }

    this.onChange = undefined;
    this.onCancel = undefined;
    this.progressRing = undefined;

    this.div.addEventListener('dragover', () => this.div.classList.add('hover'));
    this.div.addEventListener('dragleave', () => this.div.classList.remove('hover'));

    this.addDash();
    this.setState(FileInputState.noArchive);
  }

  async setState(stateName) {
    await this.fadeOutContent(.3);

    switch(stateName) {

      case FileInputState.noArchive:
        setTimeout(() => {
          this.div.classList.remove('hover');
          this.div.classList.remove('error');
          this.div.classList.remove('componentCollapse');
        }, 100);
        this.showInput();
        await this.fadeOutContent(0);
        await sleep(300);
        await this.fadeInContent();
      break;

      case FileInputState.uploading:
        setTimeout(() => this.div.classList.add('hover'), 100);
        this.showUploading();
        await this.fadeOutContent(0);
        await this.fadeInContent();
      break;

      case FileInputState.summary:
        this.div.classList.add('componentCollapse');
        await sleep(500);
        this.showSummary();
        await this.fadeOutContent(0);
        this.fadeInContent();
      break;
    }
  }

  addDash() {
    this.dashDiv = dashed(this.div, {
      color: '#B1D8BC',
      radius: 48,
      width: 1,
      dashArray: '3% 3%',
    });
  }
  
  // ------------------------------

  #removeContent() {
    const content = [...this.div.children].filter((child) => child.className !== 'dashed');
    content.forEach((childDiv) => childDiv.parentNode.removeChild(childDiv));
  }

  showInput() {
    this.#removeContent();

    const input = document.createElement('input');
    this.div.appendChild(input);
    input.className = 'file';
    input.setAttribute('type', 'file');
    input.setAttribute('size', '1');
    input.setAttribute('accept', 'application/zip');
    input.setAttribute('title', '');

    const icon = document.createElement('i');
    this.div.appendChild(icon);
    icon.className = 'icon icon-archive';

    const primary = document.createElement('span');
    this.div.appendChild(primary);
    primary.className = 'primary';
    primary.innerHTML = 'Drop your file here or <mark>browse</mark>';

    const secondary = document.createElement('span');
    this.div.appendChild(secondary);
    secondary.className = 'secondary';
    secondary.innerText = 'Supports: .zip';

    input.addEventListener('change', (e) => {
      this.data.file = e.target.files[0];
      this.onChange && this.onChange(e.target.files[0])
    });
  }

  showUploading() {
    this.#removeContent();

    const ring = document.createElement('div');
    this.div.appendChild(ring);
    ring.id = 'uploadProgressRing';
    ring.className = 'ring';

    const primary = document.createElement('span');
    this.div.appendChild(primary);
    primary.className = 'primary';
    primary.innerText = this.data.file.name;

    const secondary = document.createElement('span');
    this.div.appendChild(secondary);
    secondary.className = 'secondary';
    secondary.innerText = 'Uploading file...';

    this.progressRing = new ProgressRing(ring, {
      bgColor: '#E8F1F1',
      arcColor: '#00C059',
      arcWidth: 4.8,
      showPercentage: true,
    });
  }

  showSummary() {
    this.#removeContent();

    const icon = document.createElement('i');
    this.div.appendChild(icon);
    icon.className = 'icon icon-archive2';

    const info = document.createElement('div');
    this.div.appendChild(info);
    info.className = 'fileInfo';

    const primary = document.createElement('span');
    info.appendChild(primary);
    primary.className = 'primary';
    primary.innerText = this.data.file.name;

    const secondary = document.createElement('span');
    info.appendChild(secondary);
    secondary.className = 'secondary';
    secondary.innerText = `${this.data.filesCount} files ${bitSizeToMB(this.data.file.size)} mb`;

    const cancel = document.createElement('i');
    this.div.appendChild(cancel);
    cancel.className = 'cancel';

    const cancelIcon = document.createElement('i');
    cancel.appendChild(cancelIcon);
    cancelIcon.className = 'icon icon-x';

    cancel.addEventListener('click', async () => {
      this.onCancel && this.onCancel();
    });
  }
}