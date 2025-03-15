// ---------------Imports---------------
import { verifyCookie } from "backend/login-verification.web.js";
import { session as storage } from 'wix-storage';
import { to } from 'wix-location';
import wixData from 'wix-data';
import "chart.js/auto";
// -------------------------------------

// ---------------Globals---------------
let serviceleadByDateDict = {};
let numServiceLeadsByDateDict = {};
// -------------------------------------

// --------------- Main ---------------
$w.onReady(function () {
    // Authenticate user via cookies
    verifyCookie($w("#dynamicDataset").getCurrentItem().username, storage.getItem("loginCountry")).then(res => {
        if (res.status !== 200) { to("/"); }
    })
    
    const expandedView = $w("#switch1");
    const tableViewText = $w("#text10");
    const dataTable = $w("#table1");

    // Expanded Columns View
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
function setupChartData(collectionData) {
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

    $w("#customElement10").setAttribute("data-chart", JSON.stringify(serviceChartData));
}
// -------------------------------------

$w('#dataset1').onReady((event) => {
    // Create a filter for only showing items from last week and more.
    const dataset1 = $w("#dataset1");
    dataset1.getItems(0, dataset1.getTotalCount()).then((results) => {
       setupChartData(results);
    })
})

// Download Data
$w('#button6').onClick(() => {
    const dataset1 = $w("#dataset1");
    dataset1.getItems(0, dataset1.getTotalCount())
        .then((results) => {
            let csvContent = "created,country,serviceCenter,fullName,vehicleName,enquiry,sns,email,areaPhoneNumber,contactEmail,prefDate,prefTime\n"; // CSV-Header Names

            results.items.forEach(item => {
                let row = `"${item.created}","${item.country}","${item.serviceCenter}","${item.fullName}","${item.vehicleName}","${item.enquiry}","${item.sns}","${item.email}","${item.areaPhoneNumber}","${item.contactEmail}","${item.prefDate}","${item.prefTime}"\n`;
                csvContent += row;
            })

            $w("#csvDownloader").setAttribute("csv-data", csvContent);
        }).catch(err => {
            console.error(err);
        });
});

// ---------------Filtering---------------
function setDateFilter() {
    let startDate = new Date($w("#startDatePicker").value);
    startDate.setDate(startDate.getDate() + 1);
    const start = startDate.toISOString().split("T")[0];
    let endDate = new Date($w("#endDatePicker").value);
    endDate.setDate(endDate.getDate() + 2);
    const end = endDate.toISOString().split("T")[0];

    const username = $w("#dynamicDataset").getCurrentItem()["username"]
    const countryFilter = wixData.filter().eq("country", username);
    const dateFilter = wixData.filter().between("created", start, end);

    $w("#dataset1").setFilter(countryFilter.and(dateFilter)).then(() => {
        $w("#dataset1").getItems(0, $w("#dataset1").getTotalCount()).then((results) => {
            // Reset dictionaries
            serviceleadByDateDict = {};
            numServiceLeadsByDateDict = {};

            setupChartData(results);
        });
    });
}
$w("#startDatePicker").onChange((event) => {
    if($w("#endDatePicker").enabled) {
        setDateFilter();
    } else {
        $w("#endDatePicker").minDate = $w("#startDatePicker").value;
        $w("#endDatePicker").enable();
    }
})
$w('#endDatePicker').onChange((event) => {
    setDateFilter();
});

// Sory by
$w('#dropdown3').onChange((event) => {
    const selection = $w("#dropdown3").value
    if (selection === "Descending") {
        $w("#dataset1").setSort(wixData.sort().descending("created"))
    } else {
        $w("#dataset1").setSort(wixData.sort().ascending("created"))
    }
})
// ----------------------------------------

// ---------------Navigation---------------
// Sales Leads BUtton
$w('#button4').onClick((event) => {
    to(`/admin/${$w("#dynamicDataset").getCurrentItem().username}`)
})

// Log out button 
$w('#button1').onClick((event) => {
    storage.removeItem("loginCountry")
    to("/");
})
// ----------------------------------------