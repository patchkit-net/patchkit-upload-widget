export class Alert {
  constructor() {
    this.div = document.createElement('div');
    this.div.className = 'widgetAlert';
    
    this.time = 5000;

    this.data = {
      type: undefined,
      message: undefined,
    }
    this.stack = [],
    this.isDisplaying = false;
    this.timeout = undefined,

    this.div.innerHTML =
    `
    <span></span>
    <div class="closeAlert">✕</div>
    `;
    this.messageDiv = this.div.querySelector('span');
    this.closeAlerDiv = this.div.querySelector('.closeAlert');

    this.#updateContent();
    Object.assign(this.div.style, {
      visibility: 'hidden',
      opacity: 0,
      transform: 'translateY(100%)',
    });

    this.#addEvents();
  }

  setParent(div) {
    div.appendChild(this.div);
  }

  #addEvents() {
    this.closeAlerDiv.addEventListener('click', () => this.hideAndDisplayNext());
    this.div.addEventListener('mouseenter', () => { if (this.timeout) clearTimeout(this.timeout) });
    this.div.addEventListener('mouseleave', () => { this.timeout = setTimeout(() => this.hideAndDisplayNext(), this.time) });
  }

  #updateContent() {
    if (!this.div) return;
    
    this.div.classList.remove('error');
    this.div.classList.remove('info');

    switch(this.data.type) {
      case 'error': 
        this.div.classList.add('error');
        break;
      case 'info':
        this.div.classList.add('info');
        break;
    }
    this.messageDiv.innerHTML = this.data.message;
  }

  #show(state) {
    if (!this.div) return;

    this.isDisplaying = state;
    this.div.style.transition = 'visibility .3s ease, opacity .3s ease, transform .3s ease';
    if (state) {
      Object.assign(this.div.style, {
        visibility: 'visible',
        opacity: 1,
        transform: 'translateY(0)',
      });
    } else {
      Object.assign(this.div.style, {
        visibility: 'hidden',
        opacity: 0,
        transform: 'translateY(100%)',
      });
    }
  }

  async clearAndHideAll() {
    if (!this.div) return;

    this.stack = [];
    if (this.timeout) clearTimeout(this.timeout);
    this.#show(false);
    await new Promise(r => setTimeout(r, 100));
  }

  hideAndDisplayNext() {
    if (!this.div) return;

    if (this.timeout) clearTimeout(this.timeout); 
    this.#show(false);
    setTimeout(() => { // wait to hide the previous alert
      const nextAlert = this.stack.shift();
      if (nextAlert) this.display(nextAlert.message, nextAlert.type, nextAlert.time);
    }, 100);
  }

  display(message = '', type) {
    if (!this.div) return;

    if (this.isDisplaying) {
      this.stack.push({
        message: message,
        type: type,
      });
      return;
    }

    this.data.type = type;
    this.data.message = message;
    this.#updateContent();
    this.#show(true);
    this.timeout = setTimeout(() => this.hideAndDisplayNext(), this.time);
  }
}

export default new Alert();