// ------------------------------------------------ //
//                      IMPORTS                     //
// ------------------------------------------------ //
import { verifyCookie } from "backend/login-verification.web.js";
import { session as storage } from 'wix-storage';
import { to } from 'wix-location';
import wixData from 'wix-data';
import "chart.js/auto";
import { filterDataset, setupServicesChartData ,setupTableViewSwitch } from 'public/helper-functions.js';

// ------------------------------------------------- //
//                USER AUTHENTICATION                //
// ------------------------------------------------- //
verifyCookie($w("#dynamicDataset").getCurrentItem().username, storage.getItem("loginCountry")).then(res => {
    if (res.status !== 200) { to("/"); }
})

// ------------------------------------------------ //
//                      GLOBALS                     //
// ------------------------------------------------ //
// OnPage Elements
let currentCountry = null;
let filterDatesArr = null;
let filterCountry = null;
const filterShowroom = null;
let filterServiceCenter = null;
let filterVehicle = null;
const filterSource = null;
let datasetMaxCount = null;

// ------------------------------------------------ //
//                     NAVIGATION                   //
// ------------------------------------------------ //
$w('#button4').onClick((event) => {to(`/admin/${$w("#dynamicDataset").getCurrentItem().username}`)})
$w('#button1').onClick((event) => {storage.removeItem("loginCountry"); to("/");})

// ------------------------------------------------- //
//                       MAIN                        //
// ------------------------------------------------- //
$w.onReady(function () {
    // Initialize Globals
    currentCountry = $w("#dynamicDataset").getCurrentItem().username;
    filterCountry = currentCountry;
    
    // Page Setup
    setupTableViewSwitch();
    
    // Chart Setup
    $w('#dataset1').onReady((event) => {
        const dataset1 = $w("#dataset1");
        dataset1.getItems(0, dataset1.getTotalCount()).then((results) => {
            setupServicesChartData(results);
        })

        datasetMaxCount = $w("#dataset1").getTotalCount();
    })
});

// ------------------------------------------------- //
//                  EVENT LISTENERS                  //
// ------------------------------------------------- //
// CSV Download
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

// ------------------------------------------------- //
//                DATA FIELD FILTERING               //
// ------------------------------------------------- //
// Filter by Service Center
$w("#filterServiceDrop").onChange((event) => {
    const selectedDropdownServiceCenter = event.target.value;
    if(selectedDropdownServiceCenter === "All" || selectedDropdownServiceCenter === "" || selectedDropdownServiceCenter === null || selectedDropdownServiceCenter === "RESET_ALL") {
        filterServiceCenter  = null;
    } else {
        filterServiceCenter = selectedDropdownServiceCenter;
    }
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, null, filterVehicle, null, filterServiceCenter).then((filteredRes) => {
        setupServicesChartData(filteredRes);
    })
})
// Filter by Vehicle
$w("#filterVehicleDrop").onChange((event) => {
    const selectedDropdownVehicle = event.target.value;
    if(selectedDropdownVehicle === "All" || selectedDropdownVehicle === "" || selectedDropdownVehicle === null || selectedDropdownVehicle === "RESET_ALL") {
        filterVehicle  = null;
    } else {
        filterVehicle = selectedDropdownVehicle;
    }
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, null, filterVehicle, null, filterServiceCenter).then((filteredRes) => {
        setupServicesChartData(filteredRes);
    })
})

// --------------------------- Date Filtering
// Date Picker [Start]
$w("#startDatePicker").onChange((event) => {
    if ($w("#endDatePicker").enabled) {
        let startDate = new Date($w("#startDatePicker").value);
        startDate.setDate(startDate.getDate() + 1);
        const start = startDate.toISOString().split("T")[0];
        let endDate = new Date($w("#endDatePicker").value);
        endDate.setDate(endDate.getDate() + 2);
        const end = endDate.toISOString().split("T")[0];
        
        $w("#lastWeekBtn").enable();
        $w("#last2WeekBtn").enable();
        $w("#lastMonthBtn").enable();
        $w("#allDatesBtn").enable();

        filterDatesArr = [start, end];
        filterDataset($w("#dataset1"), filterCountry, filterDatesArr, null, filterVehicle, null, filterServiceCenter).then((filteredRes) => {
            setupServicesChartData(filteredRes);
        });
    } else {
        $w("#endDatePicker").minDate = $w("#startDatePicker").value;
        $w("#endDatePicker").enable();
    }
})
// Date Picker [End]
$w('#endDatePicker').onChange((event) => {
    let startDate = new Date($w("#startDatePicker").value);
    startDate.setDate(startDate.getDate() + 1);
    const start = startDate.toISOString().split("T")[0];
    let endDate = new Date($w("#endDatePicker").value);
    endDate.setDate(endDate.getDate() + 2);
    const end = endDate.toISOString().split("T")[0];
    
    $w("#lastWeekBtn").enable();
    $w("#last2WeekBtn").enable();
    $w("#lastMonthBtn").enable();
    $w("#allDatesBtn").enable();

    filterDatesArr = [start, end];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, null, filterVehicle, null, filterServiceCenter).then((filteredRes) => {
        setupServicesChartData(filteredRes);
    });
});
// Last 1 Week date filter
$w("#lastWeekBtn").onClick((event) => {
    event.target.disable();
    $w("#startDatePicker").value = null;
    $w("#endDatePicker").value = null;
    $w("#endDatePicker").disable();
    $w("#last2WeekBtn").enable();
    $w("#lastMonthBtn").enable();
    $w("#allDatesBtn").enable();
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000))
    
    filterDatesArr = [lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, null, filterVehicle, null, filterServiceCenter).then((filteredRes) => {
        setupServicesChartData(filteredRes);
    });
});
// Last 2 Weeks date filter
$w("#last2WeekBtn").onClick((event) => {
    event.target.disable();
    $w("#startDatePicker").value = null;
    $w("#endDatePicker").value = null;
    $w("#endDatePicker").disable();
    $w("#lastWeekBtn").enable();
    $w("#lastMonthBtn").enable();
    $w("#allDatesBtn").enable();
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000 * 2))
    
    filterDatesArr = [lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, null, filterVehicle, null, filterServiceCenter).then((filteredRes) => {
        setupServicesChartData(filteredRes);
    });
});
// Last 1 Month date filter
$w("#lastMonthBtn").onClick((event) => {
    event.target.disable();
    $w("#startDatePicker").value = null;
    $w("#endDatePicker").value = null;
    $w("#endDatePicker").disable();
    $w("#lastWeekBtn").enable();
    $w("#last2WeekBtn").enable();
    $w("#allDatesBtn").enable();
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000 * 4))
    
    filterDatesArr = [lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, null, filterVehicle, null, filterServiceCenter).then((filteredRes) => {
        setupServicesChartData(filteredRes);
    });
});
// All Dates Filter
$w("#allDatesBtn").onClick((event) => {
    event.target.disable();
    $w("#startDatePicker").value = null;
    $w("#endDatePicker").value = null;
    $w("#endDatePicker").disable();
    $w("#lastWeekBtn").enable();
    $w("#last2WeekBtn").enable();
    $w("#lastMonthBtn").enable();
    
    filterDatesArr = null;
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, null, filterVehicle, null, filterServiceCenter).then((filteredRes) => {
        setupServicesChartData(filteredRes);
    });
});

// Sory by
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
    $w("#filterServiceDrop").value = "";
    $w("#filterCountryDrop").value = "";
    $w("#sortDateDrop").value = "Descending";
    $w("#dataset1").setSort(wixData.sort().descending("created"));
    $w("#dataset1").setFilter(wixData.filter()).then(()=>{
        $w("#dataset1").getItems(0, $w("#dataset1").getTotalCount()).then((results) => {
            setupServicesChartData(results);
        });
    });
})