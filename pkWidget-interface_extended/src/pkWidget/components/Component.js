export default class Component {
  constructor(className) {
    this.componentDiv = document.createElement('div');
    this.componentDiv.className = 'widgetComponent';

    this.div = document.createElement('div');
    this.componentDiv.appendChild(this.div);
    this.div.className = className;
  }

  appendTo = (parentDiv) => parentDiv.appendChild(this.componentDiv)
  prependTo = (parentDiv) => parentDiv.prepend(this.componentDiv)
  remove = () => this.componentDiv.parentNode.removeChild(this.componentDiv)

  setOpacity(div, opacity = 1, time = 1) {
    if (!div) return;

    div.style.transitionProperty = 'opacity';
    div.style.transitionDuration = `${time}s`;

    div.style.opacity = opacity;

    return new Promise((resolve) => setTimeout(() => resolve(), time*1000));
  }
  
  collapse(state, time = 1) {
    this.setOpacity(this.componentDiv, 1, 0);

    const initialHeight = !state ? 0 : this.div.getBoundingClientRect().height;
    this.componentDiv.style.height = `${initialHeight}px`;

    this.componentDiv.style.transitionProperty = 'height';
    this.componentDiv.style.transitionTimingFunction = 'cubic-bezier(0,.5,0,1)';
    this.componentDiv.style.transitionDuration = `${time}s`;

    const height = state ? 0 : this.div.getBoundingClientRect().height;
    this.componentDiv.style.height = `${height}px`;

    state
    ? this.fadeOutContent(time/2)
    : this.fadeInContent(time/2);

    return new Promise((resolve) => setTimeout(() => resolve(), time*1000));
  }

  fadeIn = async (time = 1) => {
    await this.setOpacity(this.componentDiv, 0, 0);
    return this.setOpacity(this.componentDiv, 1, time);
  }
  fadeOut = async (time = 1) => {
    await this.setOpacity(this.componentDiv, 1, 0);
    return this.setOpacity(this.componentDiv, 0, time);
  }

  fadeInContent(time = 1) {
    const content = [...this.div.children].filter((child) => child.className !== 'dashed' && child.className !== 'file');
    content.forEach((childDiv) => this.setOpacity(childDiv, 1, time));
    return new Promise((resolve) => setTimeout(() => resolve(), time*1000));
  }
  fadeOutContent(time = 1) {
    const content = [...this.div.children].filter((child) => child.className !== 'dashed' && child.className !== 'file');
    content.forEach((childDiv) => this.setOpacity(childDiv, 0, time));
    return new Promise((resolve) => setTimeout(() => resolve(), time*1000));
  }
}