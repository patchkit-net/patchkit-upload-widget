import Component from "./Component.js";

export default class Button extends Component {
  constructor(className, html, onClick) {
    super(className);
    this.onClick = onClick;
    
    this.div.innerHTML = html;
    this.div.addEventListener('click', () => this.onClick && this.onClick());
  }
}