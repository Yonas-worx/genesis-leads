/* global Chart */

class MyChart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Create canvas for Chart.js
        this.canvas = document.createElement("canvas");
        this.shadowRoot.appendChild(this.canvas);

        this.chartInstance = null;
    }

    static get observedAttributes() {
        return ["data-chart"]; // Listen for attribute changes
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data-chart" && newValue) {
            try {
                const chartData = JSON.parse(newValue);
                this.renderChart(chartData);
            } catch (error) {
                console.error("Invalid chart data:", error);
            }
        }
    }

    connectedCallback() {
        // Load Chart.js and DataLabels plugin
        const loadScript = (src, callback) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = callback;
            document.head.appendChild(script);
        };

        if (!window.Chart) {
            loadScript("https://cdn.jsdelivr.net/npm/chart.js", () => {
                loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels", () => {
                    loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom", () => {
                        if (this.hasAttribute("data-chart")) {
                            this.renderChart(JSON.parse(this.getAttribute("data-chart")));
                        }
                    });
                });
            });
        } else {
            if (!window.ChartDataLabels) {
                loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels", () => {
                    loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom", () => {
                        if (this.hasAttribute("data-chart")) {
                            this.renderChart(JSON.parse(this.getAttribute("data-chart")));
                        }
                    });
                });
            } else if (!window.ChartZoom) {
                loadScript("https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom", () => {
                    if (this.hasAttribute("data-chart")) {
                        this.renderChart(JSON.parse(this.getAttribute("data-chart")));
                    }
                });
            } else {
                if (this.hasAttribute("data-chart")) {
                    this.renderChart(JSON.parse(this.getAttribute("data-chart")));
                }
            }
        }
    }

    renderChart(chartData) {
        if (!this.canvas) return;

        // Destroy the existing chart instance before creating a new one
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(this.canvas.getContext("2d"), {
            type: "line",
            data: chartData,
            options: {
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Website Leads',
                        color: 'black',
                        font: {
                            weight: 'bold',
                            size: 15
                        },
                        padding: 10,
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'black',
                            font: {
                                size: 10
                            }
                        }
                    },
                    datalabels: {
                        color: "black",
                        anchor: "end",
                        align: "top",
                        font: {
                            weight: "bold"
                        }
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                                speed: 0.01,
                            },
                            drag: {
                                enabled: true,
                                backgroundColor: 'rgba(225,225,225,0.5)',
                            },
                            pinch: {
                                enabled: true,
                                speed: 0.05,
                            },
                            mode: 'x',
                        }
                    }
                }
            },
            plugins: [window.ChartDataLabels, window.ChartZoom]
        });
    }
}

// Define the custom element
customElements.define("website-leads-chart", MyChart);