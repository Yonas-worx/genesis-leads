// ------------------------------------------------ //
//                      IMPORTS                     //
// ------------------------------------------------ //
import { verifyCookie } from "backend/login-verification.web.js";
import { session as storage } from "wix-storage";
import { to } from 'wix-location';
import wixData from 'wix-data';
import "chart.js/auto";
import { setupChartData ,setupTableViewSwitch } from "public/helper-functions.js";

// ------------------------------------------------- //
//                USER AUTHENTICATION                //
// ------------------------------------------------- //
verifyCookie($w("#dynamicDataset").getCurrentItem().username, storage.getItem("loginCountry")).then(res => {
    if (res.status !== 200) { to("/"); }
})

// ------------------------------------------------ //
//                      GLOBALS                     //
// ------------------------------------------------ //
let currentCountry = null;

// ------------------------------------------------ //
//                     NAVIGATION                   //
// ------------------------------------------------ //
$w('#button4').onClick((event) => {to(`/admin/service/${$w("#dynamicDataset").getCurrentItem().username}`)})
$w('#button1').onClick((event) => {storage.removeItem("loginCountry"); to("/");})

// ------------------------------------------------- //
//                       MAIN                        //
// ------------------------------------------------- //
$w.onReady(function () {
    // Initialize Globals
    currentCountry = $w("#dynamicDataset").getCurrentItem().username;

    // Page Setup
    setupTableViewSwitch();
    
    // Chart Setup
    $w('#dataset1').onReady((event) => {
        const dataset1 = $w("#dataset1");
        dataset1.getItems(0, dataset1.getTotalCount()).then((results) => {
            setupChartData(results);
        });
    })
});

// ------------------------------------------------- //
//                  EVENT LISTENERS                  //
// ------------------------------------------------- //

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
    const countryFilter = wixData.filter().eq("country", currentCountry);

    $w("#dataset1").setFilter(dateFilter.and(countryFilter)).then(() => {
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
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
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
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
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
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
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
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(Date.parse("2025-01-01T00:00:00Z"));
    setDateFilter(lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]);
});

// Sort by
$w('#sortDateDrop').onChange((event) => {
    const selection = $w("#sortDateDrop").value
    if (selection === "Descending") {
        $w("#dataset1").setSort(wixData.sort().descending("created"))
    } else {
        $w("#dataset1").setSort(wixData.sort().ascending("created"))
    }
})

// Clear Filters
$w("#clearFiltersBtn").onClick((event) => {
    $w("#filterVehicleDrop").value = "";
    $w("#filterShowroomDrop").value = "";
    $w("#filterSourceDrop").value = "";
    $w("#sortDateDrop").value = "Descending";
    $w("#dataset1").setFilter(wixData.filter());
    $w("#dataset1").setSort(wixData.sort().descending("created"));
    $w("#dataset1").getItems(0, $w("#dataset1").getTotalCount()).then((results) => {
        setupChartData(results);
    });
})