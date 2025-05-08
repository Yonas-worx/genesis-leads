import wixData from 'wix-data';

// ----------------------- Filter the Dataset by Country and/or Date -----------------------
export async function filterDataset(dataset, country = null, dates = null, showroom = null, vehicle = null, source = null, serviceCenter = null, campaign = null) {
    let customFilter = wixData.filter();

    if (country) {
        customFilter = customFilter.eq("country", country);
    } if (dates && Array.isArray(dates) && dates.length === 2) {
        customFilter = customFilter.and(wixData.filter().between("created", dates[0], dates[1]));
    } if (showroom) {
        customFilter = customFilter.and(wixData.filter().eq("showroom", showroom));
    } if (vehicle) {
        customFilter = customFilter.and(wixData.filter().eq("vehicleName", vehicle));
    } if (source) {
        customFilter = customFilter.and(wixData.filter().eq("source", source));
    } if (serviceCenter) {
        customFilter = customFilter.and(wixData.filter().eq("serviceCenter", serviceCenter));
    } if (campaign) {
        customFilter = customFilter.and(wixData.filter().eq("campaign", campaign));
    }

    await dataset.setFilter(customFilter);
    return await dataset.getItems(0, dataset.getTotalCount());
}

// ----------------------- Sets up the Leads Table Expanded View -----------------------
// Basic function for expanding or reducing the number of columns in the table
export function setupTableViewSwitch() {
    const expandedView = $w("#tableViewSwitch");
    const tableViewText = $w("#tableViewTxt");
    const dataTable = $w("#dataTable");
    const allColumns = dataTable.columns;
    const reducedColumns = allColumns.slice(0, -5);
    expandedView.onClick(() => {
        if (expandedView.checked) {
            dataTable.columns = allColumns;
            tableViewText.text = "EXPANDED VIEW";
        } else {
            dataTable.columns = reducedColumns;
            tableViewText.text = "SIMPLE VIEW";
        }
    });
    dataTable.columns = reducedColumns;
    tableViewText.text = "SIMPLE VIEW";
    expandedView.checked = false;
}

// ----------------------- Sets up the Summary Table -----------------------
// Columns are set based on the different sources of leads and which country they are from
// Rows are set per country representing the number of leads for each lead source
export function setupSummaryTable(results) {
    const summaryTableElement = $w("#summaryTable");
    const listOfCountries = [...new Set(results.items.map(item => item.country))];
    let listOfRows = [];

    summaryTableElement.columns = [
        { "id": "col1", "dataPath": "Country", "label": "Country", "type": "string", width: 100 },
        { "id": "col2", "dataPath": "Leads", "label": "Total Leads", "type": "number", width: 60 },
        { "id": "col3", "dataPath": "Request a Quote", "label": "Request a Quote", "type": "number", width: 60 },
        { "id": "col4", "dataPath": "Book a Test Drive", "label": "Book a Test Drive", "type": "number", width: 60 },
        { "id": "col5", "dataPath": "Offline Event", "label": "Offline Event", "type": "number", width: 60 },
        { "id": "col6", "dataPath": "Contact Us", "label": "Contact Us", "type": "number", width: 60 },
        { "id": "col7", "dataPath": "Instagram & Facebook", "label": "Instagram & Facebook", "type": "number", width: 80 },
        { "id": "col8", "dataPath": "LinkedIn", "label": "LinkedIn", "type": "number", width: 60 }
    ];

    summaryTableElement.rows = [{
        "Country": "All Countries",
        "Leads": results.items.filter(item => item).length,
        "Request a Quote": results.items.filter(item => item.source === "Request a Quote").length,
        "Book a Test Drive": results.items.filter(item => item.source === "Book a Test Drive").length,
        "Offline Event": results.items.filter(item => item.source === "Offline Event").length,
        "Contact Us": results.items.filter(item => item.source === "Contact Us").length,
        "Instagram & Facebook": results.items.filter(item => item.source === "Social").length,
        "LinkedIn": results.items.filter(item => item.source === "LinkedIn").length
    }]


    for (let country of listOfCountries) {
        const totalLeads = results.items.filter(item => item.country === country).length;
        const totalRequestAQuote = results.items.filter(item => item.country === country && item.source === "Request a Quote").length;
        const totalBookATestDrive = results.items.filter(item => item.country === country && item.source === "Book a Test Drive").length;
        const totalOfflineEvent = results.items.filter(item => item.country === country && item.source === "Offline Event").length;
        const totalContactUs = results.items.filter(item => item.country === country && item.source === "Contact Us").length;
        const totalInstaFace = results.items.filter(item => item.country === country && item.source === "Social").length;
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

    summaryTableElement.rows = summaryTableElement.rows.concat(listOfRows);
}


// ----------------------- Sets up the Services Summary Table -----------------------
// Columns are Country | # Leads
// Rows are set as Country and the Number of Leads
export function setupServicesSummaryTable(results) {
    const summaryTableElement = $w("#summaryTable");
    summaryTableElement.columns = [{
        "id": "col1",
        "dataPath": "Country",
        "label": "Country",
        "type": "string"
    }, {
        "id": "col2",
        "dataPath": "Leads",
        "label": "Leads",
        "type": "number"
    }]

    summaryTableElement.rows = [
        { "Country": "Middle East", "Leads": results.items.filter(item => item.country === "Middleeast").length },
        { "Country": "UAE", "Leads": results.items.filter(item => item.country === "UAE").length },
        { "Country": "Riyadh", "Leads": results.items.filter(item => item.country === "Riyadh").length },
        { "Country": "Jeddah", "Leads": results.items.filter(item => item.country === "Jeddah").length },
        { "Country": "Dammam", "Leads": results.items.filter(item => item.country === "Dammam").length },
        { "Country": "Oman", "Leads": results.items.filter(item => item.country === "Oman").length },
        { "Country": "Bahrain", "Leads": results.items.filter(item => item.country === "Bahrain").length },
        { "Country": "Kuwait", "Leads": results.items.filter(item => item.country === "Kuwait").length },
        { "Country": "Qatar", "Leads": results.items.filter(item => item.country === "Qatar").length },
        { "Country": "Lebanon", "Leads": results.items.filter(item => item.country === "Lebanon").length },
        { "Country": "Jordan", "Leads": results.items.filter(item => item.country === "Jordan").length },
        { "Country": "Mauritius", "Leads": results.items.filter(item => item.country === "Mauritius").length }
    ];
}

// ----------------------- Sets up the Different All Leads Charts -----------------------
// 1 - Separates the leads by date
// 2 - Computes the total number of leads for each source for each day
//  2.1 - Some data preprocessing (fixing up namings for human eyes)
// 3 - Sets up the data for the All Leads Chart, Website Leads Chart, and Social Media Leads Chart
export function setupChartData(collectionData) {
    let leadByDateDict = {};
    let numLeadsByDateDict = {};
    let numRequestAQuoteDateDict = {};
    let numBookATestDriveDateDict = {};
    let numOfflineEventDateDict = {};
    let numContactUsDateDict = {};
    let numInstaFaceDateDict = {};
    let numLinkedInDateDict = {};

    // Seperate all leads sources by date
    collectionData.items.forEach(lead => {
        const leadKey = new Date(lead["created"]).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });

        // Add lead to leadByDateDict
        if (leadKey in leadByDateDict) {
            leadByDateDict[leadKey].push(lead);
        } else {
            leadByDateDict[leadKey] = [lead];
        }

        // Increment numLeadsByDateDict
        numLeadsByDateDict[leadKey] = (numLeadsByDateDict[leadKey] || 0) + 1;

        // Ensure all keys exist in the other dictionaries
        [numLeadsByDateDict, numRequestAQuoteDateDict, numBookATestDriveDateDict, numOfflineEventDateDict, numContactUsDateDict, numInstaFaceDateDict, numLinkedInDateDict]
            .forEach(dict => {
                if (!(leadKey in dict)) {
                    dict[leadKey] = 0;
                }
            });
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
                case "Social":
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
            backgroundColor: "transparent",
            borderColor: "transparent",
            borderWidth: 0,
            type: "line",
            datalabels: {display: false,}
        },
        {
            label: "Website Leads",
            data: numWebsiteTotalList.slice().reverse(),
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderColor: "rgba(0, 0, 0, 0.4)",
            borderWidth: 0,
            type: "bar",
            datalabels: {display: false,}
        },
        {
            label: "Social Media Leads",
            data: numSocialTotalList.slice().reverse(),
            backgroundColor: "rgba(231, 61, 0, 0.6)",
            borderColor: "rgba(231, 61, 0, 0.6)",
            borderWidth: 0,
            type: "bar",
            datalabels: {display: false,}
        },
        ]
    };

    // Website Chart setup
    let webChartData = {
        labels: Object.keys(numLeadsByDateDict).slice().reverse(),
        datasets: [{
            label: "Total",
            data: numWebsiteTotalList.slice().reverse(),
            backgroundColor: "transparent",
            borderColor: "transparent",
            borderWidth: 0,
            type: "line",
            datalabels: { display: false, }

        },
        {
            label: "Quote",
            data: Object.values(numRequestAQuoteDateDict).slice().reverse(),
            backgroundColor: "rgba(231, 61, 0, 0.6)",
            borderColor: "rgba(231, 61, 0, 0.6)",
            borderWidth: 0,
            type: "bar",
            datalabels: { display: false, }
        },
        {
            label: "Test Drive",
            data: Object.values(numBookATestDriveDateDict).slice().reverse(),
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderColor: "rgba(0, 0, 0, 0.4)",
            borderWidth: 0,
            type: "bar",
            datalabels: { display: false, }
        },
        {
            label: "Event",
            data: Object.values(numOfflineEventDateDict).slice().reverse(),
            backgroundColor: "rgba(113, 66, 49, 0.9)",
            borderColor: "rgba(113, 66, 49, 0.9)",
            borderWidth: 0,
            type: "bar",
            datalabels: { display: false, }
        },
        {
            label: "Contact",
            data: Object.values(numContactUsDateDict).slice().reverse(),
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "rgba(0, 0, 0, 0.8)",
            borderWidth: 0,
            type: "bar",
            datalabels: { display: false, }
        },
        ]
    };

    // Social media Chart setup
    let SmChartData = {
        labels: Object.keys(numLeadsByDateDict).slice().reverse(),
        datasets: [{
            label: "Total",
            data: numSocialTotalList.slice().reverse(),
            backgroundColor: "transparent",
            borderColor: "transparent",
            borderWidth: 0,
            type: "line",
            datalabels: { display: false, }
        },
        {
            label: "Instagram & Facebook",
            data: Object.values(numInstaFaceDateDict).slice().reverse(),
            backgroundColor: "rgba(231, 61, 0, 0.6)",
            borderColor: "rgba(231, 61, 0, 0.6)",
            borderWidth: 0,
            type: "bar",
            datalabels: { display: false, }
        },
        {
            label: "LinkedIn",
            data: Object.values(numLinkedInDateDict).slice().reverse(),
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderColor: "rgba(0, 0, 0, 0.4)",
            borderWidth: 0,
            type: "bar",
            datalabels: { display: false, }
        },
        ]
    };

    // @ts-ignore
    $w("#allLeadsChart").setAttribute("data-chart", JSON.stringify(allChartData));
    // @ts-ignore
    $w("#webLeadsChart").setAttribute("data-chart", JSON.stringify(webChartData));
    // @ts-ignore
    $w("#smLeadsChart").setAttribute("data-chart", JSON.stringify(SmChartData));
    return [allChartData, webChartData, SmChartData];
}




// ----------------------- Sets up the Services Leads Chart -----------------------
export function setupServicesChartData(collectionData) {
    let serviceleadByDateDict = {};
    let numServiceLeadsByDateDict = {};

    collectionData.items.forEach(lead => {
        const leadKey = new Date(lead["created"]).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
        if (!(leadKey in serviceleadByDateDict)) {
            serviceleadByDateDict[leadKey] = []
            serviceleadByDateDict[leadKey].push(lead);
        } else {
            serviceleadByDateDict[leadKey].push(lead);
        }

        if (leadKey in numServiceLeadsByDateDict) {
            numServiceLeadsByDateDict[leadKey] += 1;
        } else {
            numServiceLeadsByDateDict[leadKey] = 1;
        }

        // Ensure all keys exist
        if (!(leadKey in numServiceLeadsByDateDict)) {
            numServiceLeadsByDateDict[leadKey] = 0
        }
    })

    // Chart setup
    let serviceChartData = {
        labels: Object.keys(numServiceLeadsByDateDict).slice().reverse(),
        datasets: [{
            label: "Book a Service",
            data: numServiceLeadsByDateDict,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderColor: "rgba(0, 0, 0, 1)",
            type: "bar",
        }]
    };

    $w("#serviceChart").setAttribute("data-chart", JSON.stringify(serviceChartData));
}