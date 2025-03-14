class CSVDownloader extends HTMLElement {
    static get observedAttributes() {
        return ['csv-data'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.innerHTML = `
            <style>
                #download-button {
                    padding: 10px;
                    background-color: black;
                    color: #FFFFFF;
                    width: 200px;
                    height: 40px;
                }
                #download-button:hover {
                    cursor: pointer;
                    background-color: white;
                    border: 1px solid black;
                    color: black;
                }
            </style>
            <button id="download-button" style="display:none;">DOWNLOAD CSV</button>
        `;

        this.querySelector('#download-button').addEventListener('click', () => this.downloadCSV());

        if (name === 'csv-data') {
            this.csvContent = newValue;
            this.querySelector('#download-button').style.display = 'block';
        }
    }

    constructor() {
        super();
    }

    downloadCSV() {

        let csvContentWithBOM = "\uFEFF" + this.csvContent;
        let encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContentWithBOM);
        // let encodedUri = encodeURI("data:text/csv;charset=utf-8," + this.csvContent);

        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

customElements.define("csv-downloader", CSVDownloader);