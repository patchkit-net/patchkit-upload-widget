import FileInput from "./components/FileInput.js";
import PlatformSelect from "./components/PlatformSelect.js";
import StepProgress from './components/StepProgress.js';
import Progress from './components/Progress.js';
import Div from './components/Div.js';
import Button from './components/Button.js';

class Components {
  constructor() {
    this.components = [];
  }

  add = (name, obj) => this.components.push({ name, obj });
  get = (name) => this.components.find((elem) => elem.name === name)?.obj;
  getAll() {
    const result = {};
    this.components.forEach((elem) => result[elem.name] = elem.obj);
    return result;
  }

  init(pkWidget) {
    this.add('stepProgress', new StepProgress({
      steps: [
        { name: '1', description: 'Upload game archive' },
        { name: '2', description: 'Processing & Publishing' },
        { name: '3', description: 'Download the launcher' },
      ],
    }));
    this.add('fileInputLabel', new Div('fileInputLabel', '<span>Uploaded file</span>'));
    this.add('fileInput', new FileInput());
    this.add('platformSelectLabel', new Div('platformSelectLabel', '<span>Detected platform</span>'));
    this.add('platformSelect', new PlatformSelect());
    this.add('processButton', new Button('processButton', '<div class="btn">Process<i class="icon icon-chevron-down"></i></div>'));
    this.add('progress', new Progress());
  }
}

export default new Components();