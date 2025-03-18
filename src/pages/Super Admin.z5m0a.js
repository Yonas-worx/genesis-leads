// ---------------Imports---------------
import { verifyCookie } from "backend/login-verification.web.js";
import { session as storage } from "wix-storage";
import { to } from 'wix-location';
import wixData from 'wix-data';
import "chart.js/auto";
// -------------------------------------

// ---------------Globals---------------
let leadByDateDict = {};
let numLeadsByDateDict = {};
let numRequestAQuoteDateDict = {};
let numBookATestDriveDateDict = {};
let numOfflineEventDateDict = {};
let numContactUsDateDict = {};
let numInstaFaceDateDict = {};
let numLinkedInDateDict = {};
// -------------------------------------

// --------------- Main ---------------
$w.onReady(function () {
    // Authenticate user via cookies
    verifyCookie("Middleeast", storage.getItem("loginCountry")).then(res => {
        if (res.status !== 200) { to("/"); }
    })

    // Expanded Columns View
    const expandedView = $w("#switch1");
    const tableViewText = $w("#text10");
    const dataTable = $w("#table1");
    const allColumns = dataTable.columns;
    const reducedColumns = allColumns.slice(0, -5);
    expandedView.onClick((event) => {
        if (expandedView.checked) {
            dataTable.columns = allColumns;
            tableViewText.text = "EXPANDED VIEW";
        } else {
            dataTable.columns = reducedColumns;
            tableViewText.text = "SIMPLE VIEW";
        }
    })
});
// -------------------------------------

// ------------Helper Functions--------
function LeadDataTriage(results) {
    // Seperate all leads by date
    results.items.forEach(lead => {
        const leadKey = new Date(lead["created"]).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
        if (leadKey in leadByDateDict) {
            leadByDateDict[leadKey].push(lead);
        } else {
            leadByDateDict[leadKey] = [];
        }
        if (leadKey in numLeadsByDateDict) {
            numLeadsByDateDict[leadKey] += 1;
        } else {
            numLeadsByDateDict[leadKey] = 1;
        }

        // Ensure all keys exist
        if (!(leadKey in numLeadsByDateDict)) {
            numLeadsByDateDict[leadKey] = 0
        }
        if (!(leadKey in numRequestAQuoteDateDict)) {
            numRequestAQuoteDateDict[leadKey] = 0
        }
        if (!(leadKey in numBookATestDriveDateDict)) {
            numBookATestDriveDateDict[leadKey] = 0
        }
        if (!(leadKey in numOfflineEventDateDict)) {
            numOfflineEventDateDict[leadKey] = 0
        }
        if (!(leadKey in numContactUsDateDict)) {
            numContactUsDateDict[leadKey] = 0
        }
        // if (!(leadKey in numFacebookDateDict)) {
        //     numFacebookDateDict[leadKey] = 0
        // }
        // if (!(leadKey in numInstagramDateDict)) {
        //     numInstagramDateDict[leadKey] = 0
        // }
        if (!(leadKey in numInstaFaceDateDict)) {
            numInstaFaceDateDict[leadKey] = 0
        }
        if (!(leadKey in numLinkedInDateDict)) {
            numLinkedInDateDict[leadKey] = 0
        }
    });

    // Compute total values of each lead source based on the day
    for (var key in leadByDateDict) {
        const leadsByDateList = leadByDateDict[key];

        leadsByDateList.forEach(lead => {
            switch (lead["source"]) {
            case "Request a Quote":
            case "request a quote":
            case "Request A Quote":
                if (key in numRequestAQuoteDateDict) {
                    numRequestAQuoteDateDict[key] += 1;
                } else {
                    numRequestAQuoteDateDict[key] = 1;
                }
                break;
            case "Book a Test Drive":
            case "book a test drive":
            case "Book A Test Drive":
                if (key in numBookATestDriveDateDict) {
                    numBookATestDriveDateDict[key] += 1;
                } else {
                    numBookATestDriveDateDict[key] = 1;
                }
                break;
            case "Offline Event":
            case "offline event":
                if (key in numOfflineEventDateDict) {
                    numOfflineEventDateDict[key] += 1;
                } else {
                    numOfflineEventDateDict[key] = 1;
                }
                break;
            case "Contact":
            case "Contact Us":
            case "contact":
            case "contact us":
                if (key in numContactUsDateDict) {
                    numContactUsDateDict[key] += 1;
                } else {
                    numContactUsDateDict[key] = 1;
                }
                break;
                // case "Instagram":
                // case "ig":
                // case "IG":
                //     if (key in numInstagramDateDict) {
                //         numInstagramDateDict[key] += 1;
                //     } else {
                //         numInstagramDateDict[key] = 1;
                //     }
                //     break;
                // case "Facebook":
                // case "fb":
                // case "FB":
                //     if (key in numFacebookDateDict) {
                //         numFacebookDateDict[key] += 1;
                //     } else {
                //         numFacebookDateDict[key] = 1;
                //     }
                //     break;
            case "ig & fb":
                if (key in numInstaFaceDateDict) {
                    numInstaFaceDateDict[key] += 1;
                } else {
                    numInstaFaceDateDict[key] = 1;
                }
                break;
            case "LinkedIn":
            case "linkedin":
            case "linkedIn":
                if (key in numLinkedInDateDict) {
                    numLinkedInDateDict[key] += 1;
                } else {
                    numLinkedInDateDict[key] = 1;
                }
                break;
            default:
                break;
            }
        });
    }
}

function setupChartData(collectionData) {
    // Sort out lead data by source and by date
    LeadDataTriage(collectionData)

    let numWebsiteTotalList = [];
    let numSocialTotalList = [];
    let numAllTotalList = [];
    Object.keys(numLeadsByDateDict).forEach(key => {
        const webTotalForKey = numRequestAQuoteDateDict[key] + numBookATestDriveDateDict[key] + numContactUsDateDict[key] + numOfflineEventDateDict[key];
        const socialTotalForKey = numInstaFaceDateDict[key] + numLinkedInDateDict[key];
        const allTotalForKey = webTotalForKey + socialTotalForKey;
        numWebsiteTotalList.push(webTotalForKey);
        numSocialTotalList.push(socialTotalForKey);
        numAllTotalList.push(allTotalForKey);
    });

    // All Chart setup
    let allChartData = {
        labels: Object.keys(numLeadsByDateDict).slice().reverse(),
        datasets: [{
                label: "Total",
                data: numAllTotalList.slice().reverse(),
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderColor: "rgba(0, 0, 0, 1)",
                borderWidth: 1,
                type: "line",
            },
            {
                label: "Website Leads",
                data: numWebsiteTotalList.slice().reverse(),
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                borderColor: "rgba(255, 0, 0, 1)",
                borderWidth: 1,
                type: "bar",
                datalabels: {
                    display: false,
                }
            },
            {
                label: "Social Media Leads",
                data: numSocialTotalList.slice().reverse(),
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                borderColor: "rgba(0, 255, 0, 1)",
                borderWidth: 1,
                type: "bar",
                datalabels: {
                    display: false,
                }
            },
        ]
    };

    // Website Chart setup
    let webChartData = {
        labels: Object.keys(numLeadsByDateDict).slice().reverse(),
        datasets: [{
                label: "Total",
                data: numWebsiteTotalList.slice().reverse(),
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderColor: "rgba(0, 0, 0, 1)",
                borderWidth: 1,
                type: "line",

            },
            {
                label: "Request a Quote",
                data: Object.values(numRequestAQuoteDateDict).slice().reverse(),
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                borderColor: "rgba(255, 0, 0, 0.6)",
                borderWidth: 1,
                type: "bar",
                datalabels: {
                    display: false,
                }
            },
            {
                label: "Book a Test Drive",
                data: Object.values(numBookATestDriveDateDict).slice().reverse(),
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                borderColor: "rgba(0, 255, 0, 0.6)",
                borderWidth: 1,
                type: "bar",
                datalabels: {
                    display: false,
                }
            },
            {
                label: "Offline Event",
                data: Object.values(numOfflineEventDateDict).slice().reverse(),
                backgroundColor: "rgba(255, 255, 0, 0.2)",
                borderColor: "rgba(255, 255, 0, 0.6)",
                borderWidth: 1,
                type: "bar",
                datalabels: {
                    display: false,
                }
            },
            {
                label: "Contact Us",
                data: Object.values(numContactUsDateDict).slice().reverse(),
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                borderColor: "rgba(0, 0, 255, 0.6)",
                borderWidth: 1,
                type: "bar",
                datalabels: {
                    display: false,
                }
            },
        ]
    };

    // Social media Chart setup
    let SmChartData = {
        labels: Object.keys(numLeadsByDateDict).slice().reverse(),
        datasets: [{
                label: "Total",
                data: numSocialTotalList.slice().reverse(),
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderColor: "rgba(0, 0, 0, 1)",
                borderWidth: 1,
                type: "line",
            },
            // {
            //     label: "Facebook",
            //     data: Object.values(numFacebookDateDict).slice().reverse(),
            //     backgroundColor: "rgba(255, 0, 0, 0.2)",
            //     borderColor: "rgba(255, 0, 0, 0.6)",
            //     borderWidth: 1,
            //     type: "bar",
            //     datalabels: {
            //         display: false,
            //     }
            // },
            // {
            //     label: "Instagram",
            //     data: Object.values(numInstagramDateDict).slice().reverse(),
            //     backgroundColor: "rgba(0, 255, 0, 0.2)",
            //     borderColor: "rgba(0, 255, 0, 0.6)",
            //     borderWidth: 1,
            //     type: "bar",
            //     datalabels: {
            //         display: false,
            //     }
            // },
            {
                label: "Instagram & Facebook",
                data: Object.values(numInstaFaceDateDict).slice().reverse(),
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                borderColor: "rgba(0, 255, 0, 0.6)",
                borderWidth: 1,
                type: "bar",
                datalabels: {
                    display: false,
                }
            },
            {
                label: "LinkedIn",
                data: Object.values(numLinkedInDateDict).slice().reverse(),
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                borderColor: "rgba(0, 0, 255, 0.6)",
                borderWidth: 1,
                type: "bar",
                datalabels: {
                    display: false,
                }
            },
        ]
    };


    $w("#customElement1").setAttribute("data-chart", JSON.stringify(allChartData));
    $w("#customElement2").setAttribute("data-chart", JSON.stringify(webChartData));
    $w("#customElement3").setAttribute("data-chart", JSON.stringify(SmChartData));
    return [allChartData, webChartData, SmChartData];
}

function setupSummaryTable(results) {
    const listOfCountries = [...new Set(results.items.map(item => item.country))];
    let listOfRows = [];

    const summaryTable = $w("#table2");
    for (let country of listOfCountries) {
        const totalLeads = results.items.filter(item => item.country === country).length;
        const totalRequestAQuote = results.items.filter(item => item.country === country && item.source === "Request a Quote").length;
        const totalBookATestDrive = results.items.filter(item => item.country === country && item.source === "Book a Test Drive").length;
        const totalOfflineEvent = results.items.filter(item => item.country === country && item.source === "Offline Event").length;
        const totalContactUs = results.items.filter(item => item.country === country && item.source === "Contact Us").length;
        const totalInstaFace = results.items.filter(item => item.country === country && item.source === "ig & fb").length;
        const totalLinkedIn = results.items.filter(item => item.country === country && item.source === "LinkedIn").length;
    
        listOfRows.push({
            "Country": country,
            "Leads": totalLeads,
            "Request a Quote": totalRequestAQuote,
            "Book a Test Drive": totalBookATestDrive,
            "Offline Event": totalOfflineEvent,
            "Contact Us": totalContactUs,
            "Instagram & Facebook": totalInstaFace,
            "LinkedIn": totalLinkedIn
        });
    }

    summaryTable.columns = [
        { "id": "col1", "dataPath": "Country", "label": "Country", "type": "string" },
        { "id": "col2", "dataPath": "Leads", "label": "Total Leads", "type": "number" },
        { "id": "col3", "dataPath": "Request a Quote", "label": "Request a Quote", "type": "number" },
        { "id": "col4", "dataPath": "Book a Test Drive", "label": "Book a Test Drive", "type": "number" },
        { "id": "col5", "dataPath": "Offline Event", "label": "Offline Event", "type": "number" },
        { "id": "col6", "dataPath": "Contact Us", "label": "Contact Us", "type": "number" },
        { "id": "col7", "dataPath": "Instagram & Facebook", "label": "Instagram & Facebook", "type": "number" },
        { "id": "col8", "dataPath": "LinkedIn", "label": "LinkedIn", "type": "number" }
    ];

    summaryTable.rows = [{
        "Country": "All Leads",
        "Leads": results.items.filter(item => item).length,
        "Request a Quote": results.items.filter(item => item.source === "Request a Quote").length,
        "Book a Test Drive": results.items.filter(item => item.source === "Book a Test Drive").length,
        "Offline Event": results.items.filter(item => item.source === "Offline Event").length,
        "Contact Us": results.items.filter(item => item.source === "Contact Us").length,
        "Instagram & Facebook": results.items.filter(item => item.source === "ig & fb").length,
        "LinkedIn": results.items.filter(item => item.source === "LinkedIn").length
    }]

    summaryTable.rows = summaryTable.rows.concat(listOfRows);
}
// -------------------------------------

// Setup Charts
$w('#dataset1').onReady((event) => {
    const dataset1 = $w("#dataset1");
    dataset1.getItems(0, dataset1.getTotalCount()).then((results) => {
        setupChartData(results);
        setupSummaryTable(results);
    });
    
    // Filter by Country
    const datasetTotal = $w("#dataset1").getTotalCount();
    $w('#dropdown5').onChange(async (event) => {
        try{
            const res = await $w("#dataset1").getItems(0, datasetTotal);
            const uniqueShowrooms = [...new Set(res.items.map(item => item.showroom))];
            $w("#dropdown2").options = uniqueShowrooms.map(showroom => {
                return {label: showroom, value: showroom}
            });
        } catch (err) { 
            console.error(err); 
        }
    })
})

// Download Data
$w('#button5').onClick(() => {
    const dataset1 = $w("#dataset1");
    dataset1.getItems(0, dataset1.getTotalCount())
        .then((results) => {
            let csvContent = "created,source,country,showroom,fullName,vehicleName,enquiry,sns,email,areaPhoneNumber,contactEmail,purchase,prefDate,prefTime,currentCar\n"; // CSV-Header Names

            results.items.forEach(item => {
                let row = `"${item.created}","${item.source}","${item.country}","${item.showroom}","${item.fullName}","${item.vehicleName}","${item.enquiry}","${item.sns}","${item.email}","${item.areaPhoneNumber}","${item.contactEmail}","${item.purchase}","${item.prefDate}","${item.prefTime}","${item.currentCar}"\n`;
                csvContent += row;
            })

            $w("#csvDownloader").setAttribute("csv-data", csvContent);
        }).catch(err => {
            console.error(err);
        });
});

// ---------------Filtering---------------
function setDateFilter(start, end) {
    const dateFilter = wixData.filter().between("created", start, end);

    $w("#dataset1").setFilter(dateFilter).then(() => {
        $w("#dataset1").getItems(0, $w("#dataset1").getTotalCount()).then((results) => {
            // Reset dictionaries
            leadByDateDict = {};
            numLeadsByDateDict = {};
            numRequestAQuoteDateDict = {};
            numBookATestDriveDateDict = {};
            numOfflineEventDateDict = {};
            numContactUsDateDict = {};
            numInstaFaceDateDict = {};
            numLinkedInDateDict = {};

            setupChartData(results);
            setupSummaryTable(results);
        });
    });
}
$w("#startDatePicker").onChange((event) => {
    if($w("#endDatePicker").enabled) {
        let startDate = new Date($w("#startDatePicker").value);
        startDate.setDate(startDate.getDate() + 1);
        const start = startDate.toISOString().split("T")[0];
        let endDate = new Date($w("#endDatePicker").value);
        endDate.setDate(endDate.getDate() + 2);
        const end = endDate.toISOString().split("T")[0];
        setDateFilter(start, end);
    } else {
        $w("#endDatePicker").minDate = $w("#startDatePicker").value;
        $w("#endDatePicker").enable();
    }
})
$w('#endDatePicker').onChange((event) => {
    let startDate = new Date($w("#startDatePicker").value);
    startDate.setDate(startDate.getDate() + 1);
    const start = startDate.toISOString().split("T")[0];
    let endDate = new Date($w("#endDatePicker").value);
    endDate.setDate(endDate.getDate() + 2);
    const end = endDate.toISOString().split("T")[0];
    setDateFilter(start, end);
});
// Last 1 Week date filter
$w("#lastWeekBtn").onClick((event) => {
    event.target.disable();
    $w("#last2WeekBtn").enable();
    $w("#lastMonthBtn").enable();
    $w("#allDatesBtn").enable();
    let currentDate = new Date();
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000))
    setDateFilter(lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]);
});
// Last 2 Weeks date filter
$w("#last2WeekBtn").onClick((event) => {
    event.target.disable();
    $w("#lastWeekBtn").enable();
    $w("#lastMonthBtn").enable();
    $w("#allDatesBtn").enable();
    let currentDate = new Date();
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000 * 2))
    setDateFilter(lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]);
});
// Last 1 Month date filter
$w("#lastMonthBtn").onClick((event) => {
    event.target.disable();
    $w("#lastWeekBtn").enable();
    $w("#last2WeekBtn").enable();
    $w("#allDatesBtn").enable();
    let currentDate = new Date();
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000 * 4))
    setDateFilter(lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]);
});
// All Dates Filtet
$w("#allDatesBtn").onClick((event) => {
    event.target.disable();
    $w("#lastWeekBtn").enable();
    $w("#last2WeekBtn").enable();
    $w("#lastMonthBtn").enable();
    let currentDate = new Date();
    let lastWeekDate = new Date(Date.parse("2025-01-01T00:00:00Z"));
    setDateFilter(lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]);
});

// Sort By
$w('#dropdown4').onChange((event) => {
    const selection = $w("#dropdown4").value
    if (selection === "Descending") {
        $w("#dataset1").setSort(wixData.sort().descending("created"))
    } else {
        $w("#dataset1").setSort(wixData.sort().ascending("created"))
    }
})
// ----------------------------------------

// ---------------Navigation---------------
// Service requests button Redirect
$w('#button4').onClick((event) => {
    to(`/super-admin-service`)
})

// Log out button 
$w('#button1').onClick((event) => {
    storage.removeItem("loginCountry")
    to("/");
})
// ----------------------------------------