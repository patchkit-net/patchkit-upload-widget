export default class ProgressRing {
  constructor(parentDiv, settings) {
    this.parentDiv = parentDiv;
    const rect = this.parentDiv.getBoundingClientRect();

    this.size = Math.min(rect.width, rect.height);
    this.r = (this.size - settings.arcWidth) / 2;
    this.circumference = 2 * Math.PI * this.r;
    this.step = this.circumference / 100;

    this.div = document.createElement('div');
    this.parentDiv.appendChild(this.div);
    this.div.className = 'progressRing';
    
    const namespace = "http://www.w3.org/2000/svg";

    this.svg = document.createElementNS(namespace, 'svg');
    this.div.appendChild(this.svg);
    this.svg.setAttribute('viewBox', `0 0 ${this.size} ${this.size}`);

    this.bg = document.createElementNS(namespace, 'circle');
    this.svg.appendChild(this.bg);
    this.bg.style.r = this.r;
    this.bg.style.cx = '50%';
    this.bg.style.cy = '50%';

    this.arc = document.createElementNS(namespace, 'circle');
    this.svg.appendChild(this.arc);
    this.arc.style.r = this.r;
    this.arc.style.cx = '50%';
    this.arc.style.cy = '50%';

    if (settings.showPercentage) {
      this.text = document.createElement('span');
      this.div.appendChild(this.text);
    }

    this.init(settings);
    this.setValue(0);
  }

  init(settings) {
    this.bg.style.strokeWidth = settings.arcWidth;
    this.bg.style.stroke = settings.bgColor;
    this.bg.style.fill = 'transparent';

    this.arc.style.strokeWidth = settings.arcWidth;
    this.arc.style.strokeDasharray = this.circumference;
    this.arc.style.stroke = settings.arcColor;
    this.arc.style.fill = 'transparent';
    this.arc.style.strokeLinecap = 'round';
    this.arc.style.transition = 'stroke-dashoffset .5s ease-out';

    this.arc.style.transformOrigin = 'center';
    this.arc.style.transform = 'rotate(-90deg)';
  }

  setValue(value) {
    this.arc.style.strokeDashoffset = this.circumference - value * this.step;
    if (this.text) this.text.innerText = `${value}%`;
  }
}