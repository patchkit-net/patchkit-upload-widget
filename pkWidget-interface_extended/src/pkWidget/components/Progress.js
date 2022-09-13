import Component from './Component.js';

export default class Progress extends Component {
  constructor() {
    super('widgetProgress');

    this.url = undefined;
    this.onReset = undefined;

    this.textDiv = document.createElement('div');
    this.div.appendChild(this.textDiv);
    this.textDiv.className = 'text';

    this.barDiv = document.createElement('div');
    this.div.appendChild(this.barDiv);
    this.barDiv.className = 'bar';

    this.barFill = document.createElement('div');
    this.barDiv.appendChild(this.barFill);
    this.barFill.className = 'fill';

    this.messageTextDiv = document.createElement('span');
    this.div.appendChild(this.messageTextDiv);
    this.messageTextDiv.className = 'secondary';

    // ---

    const buttonsDiv = document.createElement('div');
    this.div.appendChild(buttonsDiv);
    buttonsDiv.className = 'buttons';

    this.cancelButtonDiv = document.createElement('div');
    buttonsDiv.appendChild(this.cancelButtonDiv);
    this.cancelButtonDiv.className = 'btn-secondary cancelButton';
    this.cancelButtonDiv.innerHTML = '<i class="icon icon-chevron-down"></i>Cancel';

    this.cancelButtonDiv.addEventListener('click', async () => {
      this.onReset && this.onReset();
    });

    this.downloadButtonDiv = document.createElement('div');
    buttonsDiv.appendChild(this.downloadButtonDiv);
    this.downloadButtonDiv.className = 'btn downloadButton disabled';
    this.downloadButtonDiv.innerHTML = '<i class="icon icon-download"></i>Download the launcher';

    this.downloadButtonDiv.addEventListener('click', () => {
      this.onDownload && this.onDownload();
    });
  }

  show(state, div = this.div) {
    div.style.transition = 'visibility .3s ease, opacity .3s ease';

    if (state) {
      div.style.visibility = 'visible';
      div.style.opacity = 1;
      div.style.height = 'inherit';
      div.style.overflow = 'visible';
    } else {
      div.style.visibility = 'hidden';
      div.style.opacity = 0;
      div.style.height = 0;
      div.style.overflow = 'hidden';
    }
  }

  clear() {
    this.barFill.style.width = 0;
    this.textDiv.innerHTML = '';
    this.messageTextDiv.innerText = '';
    this.setUrl();
  }

  setUrl(url) {
    if (!url) {
      this.url = undefined;
      this.cancelButtonDiv.innerHTML = '<i class="icon icon-chevron-down"></i>Cancel';
      this.downloadButtonDiv.classList.add('disabled');
      return;
    }
    this.url = url;
    this.cancelButtonDiv.innerHTML = 'Make another';
    this.downloadButtonDiv.classList.remove('disabled');
  }

  setProgress(percent = 0, message = '') {
    this.barFill.style.width = `${percent}%`;
    this.textDiv.innerHTML = percent === 100 ? 'Done<i class="icon icon-check"></i>' : `${percent}%`;
    this.messageTextDiv.innerText = percent === 100 ? '' : message;
  }
}