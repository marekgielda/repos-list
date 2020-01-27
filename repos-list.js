const template = document.createElement("template");
template.innerHTML = `
<style>
@import "./css/styles.css"
</style>
<div>
  <h3 id="header" class="header"></h3>
  <span id="error-mssg" class="hidden"></span>
  <table>
    <tr>
      <th>Names</th>
      <th>Description</th>
      <th>Last upadate</th>
      <th>Link</th>
    </tr>
  </table>
</div>
`;

class ReposList extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$mainContainer = this._shadowRoot.querySelector("div");
    this.$table = this._shadowRoot.querySelector("table");
    this.$header = this._shadowRoot.querySelector("h3");
    this.$errorMssg = this._shadowRoot.querySelector("span");
  }

  connectedCallback() {}

  fetchData() {
    fetch(`https://api.github.com/users/${this.user}/repos?sort=updated`)
      .then(response => response.json())
      .then(data => this.tableRender(data))
      .catch(err => {
        this.$errorMssg.innerHTML = err;
        this.$table.classList.add("hidden");
        this.$errorMssg.classList = ["error-mssg"];
      });
  }

  tableRender(data) {
    data.forEach(el => {
      if (new Date(el.updated_at) > new Date(this.update)) {
        const $tableRow = document.createElement("tr");
        const $nameCell = document.createElement("td");
        const $descrCell = document.createElement("td");
        const $lastUpdateCell = document.createElement("td");
        const $linkCell = document.createElement("td");
        const $link = document.createElement("a");

        $nameCell.innerHTML = el.name;
        $descrCell.innerHTML = el.description;
        $lastUpdateCell.innerHTML = this.formatTime(el.updated_at);
        $link.innerHTML = el.html_url;
        $link.setAttribute("href", el.html_url);
        $linkCell.appendChild($link);

        $tableRow.appendChild($nameCell);
        $tableRow.appendChild($descrCell);
        $tableRow.appendChild($lastUpdateCell);
        $tableRow.appendChild($linkCell);
        this.$table.appendChild($tableRow);
      }
    });
  }

  static get observedAttributes() {
    return ["data-user", "data-update"];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case "data-user":
        this.user = newVal;
        this.$header.innerHTML = newVal;
        this.fetchData();
        break;
      case "data-update":
        this.update = newVal;
        break;
    }
  }

  formatTime(time) {
    const t = new Date(time);
    const addZero = digit => (String(digit).length === 1 ? `0${digit}` : digit);
    const day = addZero(t.getDay());
    const month = addZero(t.getMonth());
    const year = t.getFullYear();
    const hour = addZero(t.getHours());
    const minutes = addZero(t.getMinutes());
    const seconds = addZero(t.getSeconds());
    return `${day}-${month}-${year} ${hour}:${minutes}:${seconds}`;
  }
}

window.customElements.define("repos-list", ReposList);
