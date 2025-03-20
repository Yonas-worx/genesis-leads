// ------------------------------------------------ //
//                      IMPORTS                     //
// ------------------------------------------------ //
import { verifyCookie } from "backend/login-verification.web.js";
import { session as storage } from "wix-storage";
import { to } from 'wix-location';
import wixData from 'wix-data';
import "chart.js/auto";
import { filterDataset, setupChartData, setupSummaryTable, setupTableViewSwitch } from "public/helper-functions.js";

// ------------------------------------------------- //
//                USER AUTHENTICATION                //
// ------------------------------------------------- //
verifyCookie("Middleeast", storage.getItem("loginCountry")).then(res => {
    if (res.status !== 200) { to("/"); }
})

// ------------------------------------------------ //
//                      GLOBALS                     //
// ------------------------------------------------ //
let summaryTableElement = null;
let filterDatesArr = null;
let filterCountry = null;
let datasetMaxCount = null;

// ------------------------------------------------ //
//                     NAVIGATION                   //
// ------------------------------------------------ //
$w('#button4').onClick((event) => { to(`/super-admin-service`) })
$w('#button1').onClick((event) => { storage.removeItem("loginCountry"); to("/"); })

// ------------------------------------------------- //
//                       MAIN                        //
// ------------------------------------------------- //
$w.onReady(function () {
    // Initialize Globals
    summaryTableElement = $w("#table2");

    // Page Setup
    setupTableViewSwitch();

    // Setup Charts
    $w('#dataset1').onReady((event) => {
        const dataset1 = $w("#dataset1");
        dataset1.getItems(0, dataset1.getTotalCount()).then((results) => {
            setupChartData(results);
            setupSummaryTable(summaryTableElement, results);
        });

        datasetMaxCount = $w("#dataset1").getTotalCount();
        // Filter by Country
        // $w('#filterCountryDrop').onChange(async (event) => {
        //     try {
        //         // Set Showroom options based on country
        //         const res = await $w("#dataset1").getItems(0, datasetTotal);
        //         const uniqueShowrooms = [...new Set(res.items.map(item => item.showroom))];
        //         $w("#filterShowroomDrop").options = uniqueShowrooms.map(showroom => {
        //             return { label: showroom, value: showroom }
        //         });
        //     } catch (err) {
        //         console.error(err);
        //     }
        // })
    });
});

// ------------------------------------------------- //
//                  EVENT LISTENERS                  //
// ------------------------------------------------- //

// ---------------CSV Download---------------
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
$w('#filterCountryDrop').onChange(async (event) => {
    const selectedDropdownCountry = $w("#filterCountryDrop").value;

    // Filter by country    
    if(selectedDropdownCountry === "All" || selectedDropdownCountry === "" || selectedDropdownCountry === null) {
        filterCountry = null;
    } else {
        filterCountry = $w("#filterCountryDrop").value;
    }
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr).then(filteredRes => {
        setupChartData(filteredRes);
        setupSummaryTable(summaryTableElement, filteredRes);
    });

    // Set Showroom options based on country
    const res = await $w("#dataset1").getItems(0, datasetMaxCount);
    const uniqueShowrooms = [...new Set(res.items.map(item => item.showroom))];
    $w("#filterShowroomDrop").options = uniqueShowrooms.map(showroom => {
        return { label: showroom, value: showroom }
    });

})
// function setDateFilter(start, end) {
//     const dateFilter = wixData.filter().between("created", start, end);

//     $w("#dataset1").setFilter(dateFilter).then(() => {
//         $w("#dataset1").getItems(0, $w("#dataset1").getTotalCount()).then((results) => {
//             setupChartData(results);
//             setupSummaryTable(summaryTableElement, results);
//         });
//     });
// }
$w("#startDatePicker").onChange((event) => {
    if ($w("#endDatePicker").enabled) {
        let startDate = new Date($w("#startDatePicker").value);
        startDate.setDate(startDate.getDate() + 1);
        const start = startDate.toISOString().split("T")[0];
        let endDate = new Date($w("#endDatePicker").value);
        endDate.setDate(endDate.getDate() + 2);
        const end = endDate.toISOString().split("T")[0];
        
        filterDatesArr = [start, end];
        filterDataset($w("#dataset1"), filterCountry, filterDatesArr).then(filteredRes => {
            setupChartData(filteredRes);
            setupSummaryTable(summaryTableElement, filteredRes);
        });
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
    
    filterDatesArr = [start, end];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr).then(filteredRes => {
        setupChartData(filteredRes);
        setupSummaryTable(summaryTableElement, filteredRes);
    });
});
// Last 1 Week date filter
$w("#lastWeekBtn").onClick((event) => {
    event.target.disable();
    $w("#last2WeekBtn").enable();
    $w("#lastMonthBtn").enable();
    $w("#allDatesBtn").enable();
    $w("#summaryDateTxt").text = "Last Week";
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000))
    
    filterDatesArr = [lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr).then(filteredRes => {
        setupChartData(filteredRes);
        setupSummaryTable(summaryTableElement, filteredRes);
    });
});
// Last 2 Weeks date filter
$w("#last2WeekBtn").onClick((event) => {
    event.target.disable();
    $w("#lastWeekBtn").enable();
    $w("#lastMonthBtn").enable();
    $w("#allDatesBtn").enable();
    $w("#summaryDateTxt").text = "Last 2 Weeks";
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000 * 2))
    
    filterDatesArr = [lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr).then(filteredRes => {
        setupChartData(filteredRes);
        setupSummaryTable(summaryTableElement, filteredRes);
    });
});
// Last 1 Month date filter
$w("#lastMonthBtn").onClick((event) => {
    event.target.disable();
    $w("#lastWeekBtn").enable();
    $w("#last2WeekBtn").enable();
    $w("#allDatesBtn").enable();
    $w("#summaryDateTxt").text = "Last Month";
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000 * 4))
    
    filterDatesArr = [lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr).then(filteredRes => {
        setupChartData(filteredRes);
        setupSummaryTable(summaryTableElement, filteredRes);
    });
});
// All Dates Filtet
$w("#allDatesBtn").onClick((event) => {
    event.target.disable();
    $w("#lastWeekBtn").enable();
    $w("#last2WeekBtn").enable();
    $w("#lastMonthBtn").enable();
    $w("#summaryDateTxt").text = "All Dates";
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(Date.parse("2025-01-01T00:00:00Z"));
    
    filterDatesArr = [lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr);
});

// Sort By
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
    $w("#filterCountryDrop").value = "All";
    $w("#dataset1").setFilter(wixData.filter());
    $w("#dataset1").setSort(wixData.sort().descending("created"));
    $w("#dataset1").getItems(0, $w("#dataset1").getTotalCount()).then((results) => {
        setupChartData(results);
        setupSummaryTable(summaryTableElement, results);
    });
})