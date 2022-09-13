export default class Dropdown {
  constructor(parentDiv, settings) {
    this.parentDiv = parentDiv;
    if (!this.parentDiv) return;

    this.div = document.createElement('div');
    this.parentDiv.appendChild(this.div);
    this.div.className = 'dropdown';

    this.isOpen = false;
    this.options = settings.options;
    this.onSelect = settings.onSelect;
    this.onOpen = settings.onOpen;
    this.onClose = settings.onClose;

    this.selectedValue = undefined;
    
    this.init();
    this.div.addEventListener('mouseleave', () => this.isOpen && this.open(false));
  }

  init() {
    const buttonDiv = document.createElement('div');
    this.div.appendChild(buttonDiv);
    buttonDiv.className = 'button';

    buttonDiv.addEventListener('click', () => this.open(!this.isOpen));

    this.buttonContentDiv = document.createElement('div');
    buttonDiv.appendChild(this.buttonContentDiv);
    this.buttonContentDiv.className = 'buttonContent';

    const arrow = document.createElement('i');
    buttonDiv.appendChild(arrow);
    arrow.className = 'arrow icon-chevron-down';

    const optionsContainerDiv = document.createElement('div');
    this.div.appendChild(optionsContainerDiv);
    optionsContainerDiv.className = 'optionsContainer';

    this.options.forEach((option) => {
      const optionDiv = document.createElement('div');
      optionsContainerDiv.appendChild(optionDiv);
      optionDiv.className = 'option';
      optionDiv.id = option.value;

      optionDiv.innerHTML = option.html;

      optionDiv.addEventListener('click', () => {
        this.select(option.value);
        this.open(false);
      });
    });
  }

  select(value) {
    const html = this.options.find((elem) => elem.value === value)?.html;
    if (!html) return;

    this.buttonContentDiv.innerHTML = html;
    this.selectedValue = value;

    this.onSelect && this.onSelect(value);
  }

  open(state) {
    if (state) {
      this.div.classList.add('open');
      this.isOpen = true;
      this.onOpen && this.onOpen();
    } else {
      this.div.classList.remove('open');
      this.isOpen = false;
      this.onClose && this.onClose();

    }
  }
}