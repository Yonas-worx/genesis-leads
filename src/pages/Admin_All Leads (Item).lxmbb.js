// ------------------------------------------------ //
//                      IMPORTS                     //
// ------------------------------------------------ //
import { verifyCookie } from "backend/login-verification.web.js";
import { session as storage } from "wix-storage";
import { to } from 'wix-location';
import wixData from 'wix-data';
import "chart.js/auto";
import { filterDataset, setupChartData ,setupTableViewSwitch } from "public/helper-functions.js";

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
let filterDatesArr = null;
let filterCountry = null;
let filterShowroom = null;
let filterVehicle = null;
let filterSource = null;
let filterCampaign = null;
let datasetMaxCount = null;


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
    filterCountry = currentCountry;

    // Page Setup
    setupTableViewSwitch();
    
    // Chart Setup
    $w('#dataset1').onReady((event) => {
        const dataset1 = $w("#dataset1");
        dataset1.getItems(0, dataset1.getTotalCount()).then((results) => {
            setupChartData(results);
        });

        datasetMaxCount = $w("#dataset1").getTotalCount();
    })
});

// ------------------------------------------------- //
//                  EVENT LISTENERS                  //
// ------------------------------------------------- //
// CSV Download
$w('#button5').onClick(() => {
    const dataset1 = $w("#dataset1");
    dataset1.getItems(0, dataset1.getTotalCount())
        .then((results) => {
            let csvContent = "created,source,campaign,country,showroom,fullName,vehicleName,enquiry,sns,email,areaPhoneNumber,contactEmail,purchase,prefDate,prefTime,currentCar\n"; // CSV-Header Names

            results.items.forEach(item => {
                let row = `"${item.created}","${item.source}","${item.campaign}","${item.country}","${item.showroom}","${item.fullName}","${item.vehicleName}","${item.enquiry}","${item.sns}","${item.email}","${item.areaPhoneNumber}","${item.contactEmail}","${item.purchase}","${item.prefDate}","${item.prefTime}","${item.currentCar}"\n`;
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
// Filter by Showroom
$w("#filterShowroomDrop").onChange((event) => {
    const selectedDropdownShowroom = event.target.value;
    if(selectedDropdownShowroom === "All" || selectedDropdownShowroom === "" || selectedDropdownShowroom === null || selectedDropdownShowroom === "RESET_ALL") {
        filterShowroom  = null;
    } else {
        filterShowroom = selectedDropdownShowroom;
    }
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, null, null ,filterCampaign).then((filteredRes) => {
        setupChartData(filteredRes);
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
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource, null, filterCampaign).then((filteredRes) => {
        setupChartData(filteredRes);
    })
})
// Filter by Lead Source
$w("#filterSourceDrop").onChange((event) => {
    const selectedDropdownSource = event.target.value;
    if(selectedDropdownSource === "All" || selectedDropdownSource === "" || selectedDropdownSource === null || selectedDropdownSource === "RESET_ALL") {
        filterSource  = null;
    } else {
        filterSource = selectedDropdownSource;
    }
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource, null, filterCampaign).then((filteredRes) => {
        setupChartData(filteredRes);
    })
})
// Filter by Lead Campaign
$w("#filterCampaignDrop").onChange((event) => {
    const selectedDropdownCampaign = event.target.value;
    if(selectedDropdownCampaign === "All" || selectedDropdownCampaign === "" || selectedDropdownCampaign === null || selectedDropdownCampaign === "RESET_ALL") {
        filterSource  = null;
    } else {
        filterSource = selectedDropdownCampaign;
    }
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource, null, filterCampaign).then((filteredRes) => {
        setupChartData(filteredRes);
    })
})

// --------------------------- Date Filtering
// Date Picker [Start]
$w("#startDatePicker").onChange((event) => {
    if($w("#endDatePicker").enabled) {
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
        filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource).then((filteredRes) => {
            setupChartData(filteredRes);
        });
    } else {
        $w("#endDatePicker").minDate = $w("#startDatePicker").value;
        $w("#endDatePicker").enable();
    }
});
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
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource).then((filteredRes) => {
        setupChartData(filteredRes);
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
    $w("#summaryDateTxt").text = "Last Week";
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Add 1 day to current date to account for Timezone
    let lastWeekDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000))
    
    filterDatesArr = [lastWeekDate.toISOString().split("T")[0], currentDate.toISOString().split("T")[0]];
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource).then((filteredRes) => {
        setupChartData(filteredRes);
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
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource).then((filteredRes) => {
        setupChartData(filteredRes);
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
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource).then((filteredRes) => {
        setupChartData(filteredRes);
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
    filterDataset($w("#dataset1"), filterCountry, filterDatesArr, filterShowroom, filterVehicle, filterSource).then((filteredRes) => {
        setupChartData(filteredRes)
    });
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
    $w("#filterCampaignDrop").value = "";
    $w("#sortDateDrop").value = "Descending";
    $w("#dataset1").setSort(wixData.sort().descending("created"));
    $w("#dataset1").setFilter(wixData.filter()).then(()=>{
        $w("#dataset1").getItems(0, $w("#dataset1").getTotalCount()).then((results) => {
            setupChartData(results);
        });
    });
})