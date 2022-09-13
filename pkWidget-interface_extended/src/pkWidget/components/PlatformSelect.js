import Component from './Component.js';
import Dropdown from './Dropdown.js';
import { sleep } from '../utils.js';

export default class PlatformSelect extends Component {
  constructor() {
    super('platformSelect');

    this.selected = undefined;

    this.dropdown = new Dropdown(this.div, {
      options: [
        { value: 'win32', html: '<i class="icon icon-windows"></i>Windows 32bit' },
        { value: 'win64', html: '<i class="icon icon-windows"></i>Windows 64bit' },
        { value: 'lin32', html: '<i class="icon icon-linux"></i>Linux 32bit' },
        { value: 'lin64', html: '<i class="icon icon-linux"></i>Linux 64bit' },
        { value: 'osx', html: '<i class="icon icon-mac"></i>OSX' },
      ],
      onSelect: (val) => { this.selected = val },
      onOpen: () => this.componentDiv.style.overflow = 'visible',
      onClose: async() => {
        await sleep(300);
        this.componentDiv.style.overflow = 'hidden';
      },
    });
  }

  setValue = (value) => this.dropdown.select(value);
}