import Component from "./Component.js";

export default class StepProgress extends Component {
  constructor(settings) {
    super('stepProgress');

    this.steps = {};
    this.bars = {};

    this.init(settings);
    window.addEventListener('resize', () => this.positionBars());
  }

  init(settings) {
    settings.steps.forEach((step) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'step';

      const nameDiv = document.createElement('div');
      stepDiv.appendChild(nameDiv);
      nameDiv.className = 'name';
      const nameTextDiv = document.createElement('span');
      nameDiv.appendChild(nameTextDiv);
      nameTextDiv.innerText = step.name;

      const descriptionDiv = document.createElement('div');
      stepDiv.appendChild(descriptionDiv);
      descriptionDiv.className = 'description';
      descriptionDiv.innerText = step.description;

      this.div.appendChild(stepDiv);

      this.steps[step.name] = stepDiv;
    });

    // progress bars
    const keys = Object.keys(this.steps);
    keys.forEach((key, i) => {
      if (i === 0) {
        this.bars[key] = undefined;
        return;
      }

      const barDiv = document.createElement('div');
      this.div.appendChild(barDiv);
      barDiv.className = 'bar';

      this.bars[key] = barDiv;
    });

    setTimeout(() => this.positionBars(), 300);
  }

  positionBars() {
    if (!this.bars) return;

    const stepsDivArr = Object.values(this.steps);

    stepsDivArr.forEach((stepDiv, i) => {
      const barDiv = Object.values(this.bars)[i];
      if (!barDiv) return;

      const barDim = barDiv.getBoundingClientRect();
      const barHeight = barDim.height || 2;

      const fromDiv = stepsDivArr[i-1].querySelector('.name span');
      const fromDim = fromDiv.getBoundingClientRect();
      const toDiv = stepDiv.querySelector('.name span');

      const x = fromDiv.offsetLeft + fromDim.width;
      const y = fromDiv.offsetTop + fromDim.height / 2 - barHeight / 2;
      const w = toDiv.offsetLeft - x;

      Object.assign(barDiv.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        zIndex: '-1',
      });
    });
  }

  setActiveByIndex(stepIndex) {
    if (stepIndex === undefined) {
      this.activeIndex = undefined;
      Object.values(this.steps).forEach((step) => step.classList.remove('active'));
      return;
    }

    if (stepIndex - this.activeIndex === 1) {
      const lastActive = Object.values(this.steps)[this.activeIndex];
      lastActive.classList.remove('active');
      lastActive.classList.add('done');
    }
    if (stepIndex - this.activeIndex === -1) {
      const lastActive = Object.values(this.steps)[this.activeIndex];
      lastActive.classList.remove('active');
      lastActive.classList.remove('done');
      const lastActiveBar = Object.values(this.bars)[this.activeIndex];
      lastActiveBar?.classList.remove('active');
    }

    this.activeIndex = stepIndex;
    const step = Object.values(this.steps)[stepIndex];
    step.classList.add('active');
    const bar = Object.values(this.bars)[stepIndex];
    bar?.classList.add('active');

    setTimeout(() => this.positionBars(), 300);
  }

  setActive(stepName) {
    if (!stepName) {
      Object.values(this.steps).forEach((step) => step.classList.remove('active'));
      this.active = undefined;
      return;
    }

    this.bars[stepName]?.classList.add('active');
    setTimeout(() => {
      this.steps[stepName].classList.add('active');
    }, 400);

    if (this.active) {
      this.steps[this.active].classList.remove('active');
      this.steps[this.active].classList.add('done');

      const stepKeys = Object.keys(this.steps);
      const fromId = stepKeys.indexOf(this.active);
      const toId = stepKeys.indexOf(stepName);
      if (fromId > toId) {
        this.bars[this.active]?.classList.remove('active');
        this.steps[this.active].classList.remove('done');
      }
    }

    this.active = stepName;
  }
}
