import Component from "./Component.js";

export default class Div extends Component {
  constructor(className, html) {
    super(className);
    this.div.innerHTML = html;
  }
}