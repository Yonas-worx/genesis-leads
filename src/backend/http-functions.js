// serverError -> 500
// badRequest -> 400
// created -> 201
// response -> anything

import { getSecret } from 'wix-secrets-backend';
import { ok, response, created, serverError, badRequest } from "wix-http-functions";
import { fetch } from 'wix-fetch';
import wixData from "wix-data";
import { z } from "zod";

// Schema Validation Setup
const leadsSchemaZod = z.object({
    created: z.string(),
    createdTime: z.string().optional(),
    source: z.string(),
    country: z.string(),
    showroom: z.string().optional(),
    fullName: z.string(),
    vehicleName: z.string().optional(),
    email: z.string(),
    areaPhoneNumber: z.string(),
    enquiry: z.string().optional(),
    sns: z.string().optional(),
    prefDate: z.string().optional(),
    prefTime: z.string().optional(),
    contactEmail: z.string().optional(),
    currentCar: z.string().optional(),
    purchase: z.string().optional()
}).strict();

const serviceSchemaZod = z.object({
    created: z.string(),
    createdTime: z.string().optional(),
    country: z.string(),
    serviceCenter: z.string(),
    fullName: z.string(),
    email: z.string(),
    areaPhoneNumber: z.string(),
    vehicleName: z.string().optional(),
    enquiry: z.string().optional(),
    sns: z.string().optional(),
    prefDate: z.string().optional(),
    prefTime: z.string().optional(),
    contactEmail: z.string().optional(),
}).strict();

// Leads API endpoint
export async function post_sendLead(request) {
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: ""
    };

    try {
        //Authenticate Request 
        const secret = await getSecret("api-key");
        if (secret != request.headers['api-key']) {
            options.status = 401;
            options.body = "Authentication Failed. Incorrect API Key.";
            return response(options);
        }

        // Verify request payload includes at least required fields
        const reqBody = await request.body.text();
        const jsonBody = JSON.parse(reqBody);

        // Make sure to convert formName from SM leads into country
        // Form Name Format is Genesis_OMN_GV80_Ramadan_2025_AR
        if (jsonBody["source"] == "ig & fb") {
            const splitFormName = jsonBody["country"].split("_");
            jsonBody["country"] = splitFormName[1]
            jsonBody["vehicleName"] = splitFormName[2].replace("-", " ");
        }

        // Make sure country codes are correct
        const rawCountry = jsonBody["country"];
        switch (rawCountry) {
        case "middleeast":
        case "Middleeast":
        case "MIDDLEEAST":
        case "ME":
            jsonBody["country"] = "Middleeast"
            break;
        case "ae":
        case "AE":
        case "UAE":
        case "uae":
        case "الإمارات":
            jsonBody["country"] = "UAE"
            break;
        case "jeddah":
        case "Jeddah":
        case "JEDDAH":
        case "SA-JEDDAH":
        case "SAU-J":
        case "جدة":
            jsonBody["country"] = "Jeddah"
            break;
        case "dammam":
        case "Dammam":
        case "DAMMAM":
        case "SA-DAMMAM":
        case "SAU-D":
        case "الدمام":
            jsonBody["country"] = "Dammam"
            break;
        case "riyadh":
        case "Riyadh":
        case "RIYADH":
        case "SA-RIYADH":
        case "SAU-R":
        case "الرياض":
            jsonBody["country"] = "Riyadh"
            break;
        case "Qatar":
        case "qatar":
        case "qa":
        case "QA":
        case "QAT":
        case "قطر":
            jsonBody["country"] = "Qatar"
            break;
        case "Oman":
        case "oman":
        case "om":
        case "OM":
        case "OMN":
        case "عُمان":
            jsonBody["country"] = "Oman"
            break;
        case "Kuwait":
        case "kuwait":
        case "kw":
        case "KW":
        case "KWT":
            jsonBody["country"] = "Kuwait"
            break;
        case "Bahrain":
        case "bahrain":
        case "BH":
        case "bh":
        case "BAH":
            jsonBody["country"] = "Bahrain"
            break;
        case "Mauritius":
        case "mauritius":
        case "mu":
        case "MU":
            // Missing SM formname 
            jsonBody["country"] = "Mauritius"
            break;
        case "Egypt":
        case "egypt":
        case "eg":
        case "EG":
            // Missing SM formname 
            jsonBody["country"] = "Egypt"
            break;
        case "Jordan":
        case "jordan":
        case "jo":
        case "JO":
        case "الأردن":
            // Missing SM formname 
            jsonBody["country"] = "Jordan"
            break;
        default:
            break;
        }

        // Make sure showroom names in arabic are converted to english
        if(jsonBody["showroom"] !== "" || jsonBody["showroom"] !== undefined || jsonBody["showroom"] !== null){
            const rawShowroom = jsonBody["showroom"];
            switch (rawShowroom) {
                // Bahrain
                case "البحرين [منطقة المعامير]":
                case "Bahrain [Ma ameer Area]":
                    jsonBody["showroom"] = "Bahrain [Ma'ameer Area]";
                    break;
                //Dammam 
                case "الأحساء -  الهفوف - فرع شارع الرياض [السلمانية شمال]":
                    jsonBody["showroom"] = "Hassa, Al Hofuf - Riyadh Road Branch [Al Salmaniyah North]";
                    break;
                case "الخبر [الملك فهد]":
                    jsonBody["showroom"] = "Al Khobar [King Fahd]";
                    break;
                case "الدمام 91 الفرع الرئيسي، الفيصلية [الملك فهد]":
                    jsonBody["showroom"] = "Dammam 91 Main Branch, Al Faisaliyah [King Fahd]";
                    break;
                case "معرض الجبيل [ الملك فيصل]":
                case "معرض الجبيل [الملك فيصل]":
                    jsonBody["showroom"] = "Al Jubail Showroom [King Faisal]";
                    break;
                // Jeddah
                case "اوتو مول [المحمدية]":
                    jsonBody["showroom"] = "Auto Mall [Al Muhammadiyah]";
                    break;
                case "شارع المدينة المنورة [المدينة]":
                    jsonBody["showroom"] = "Medina Road [Al-Madinah]";
                    break;
                case "التحلية [الرحاب]":
                    jsonBody["showroom"] = "Al Tahliya [Rehab]";
                    break;
                case "الامل [النعيم]":
                    jsonBody["showroom"] = "Al Amal [Al Naeem]";
                    break;
                case "كيلو 5 [مكة]":
                    jsonBody["showroom"] = "Kilo 5 [Makkah]";
                    break;
                case "شارع الملك عبدالله [شارع الملك عبدالله الفرعي]":
                    jsonBody["showroom"] = "King Abdullah Road [King Abdullah Branch Rd]";
                    break;
                // Jordan
                case "صالة العرض الرئيسية [عَمَّان‎]":
                    jsonBody["showroom"] = "Main Showroom [Amman]";
                    break;
                // Kuwait
                case "الكويت [الشويخ الصناعية]":
                    jsonBody["showroom"] = "Kuwait [Shuwaikh Industrial]";
                    break;
                // MiddleEast / Lebanon
                case "صالة العرض في بيروت [بيروت]":
                    jsonBody["showroom"] = "Beirut Showroom [Beirut]";
                    break;
                // Oman
                case "صحار [شارع النجاح، غيل الشبول]":
                    jsonBody["showroom"] = "Sohar [Al Najah Street, Ghail Shubul]";
                    break;
                case "الوطية [مسقط]":
                    jsonBody["showroom"] = "Wattayah [Muscat]";
                    break;
                // Qatar
                case "سكايلاين للسيارات [الدوحة]":
                    jsonBody["showroom"] = "Skyline Automotive [Doha]";
                    break;
                // Riyadh
                case "بريدة [شارع الملك عبدالعزيزي]":
                    jsonBody["showroom"] = "Buraydah [King Abdulaziz Rd]";
                    break;
                case "مخرج 5 [ شارع الدائري الشمالي]":
                    jsonBody["showroom"] = "Exit 5 [Northern Ring Rd]";
                    break;
                case "المكتب الرئيسي [ مكة]":
                case "المكتب الرئيسي [مكة]":
                    jsonBody["showroom"] = "Head Office [Makkah]";
                    break;
                case "الشفا [ الخليل بن احمد]":
                case "الشفا [الخليل بن احمد]":
                    jsonBody["showroom"] = "Shifa [Al Khalil Ibn Ahmad]";
                    break;
                case "البادية [شارع الدائري الغربي]":
                    jsonBody["showroom"] = "Badiyah [Western Ring Branch Rd]";
                    break;
                case "عنيزة ، القاع [السليمانية]":
                    jsonBody["showroom"] = "Unayzah, Qaah [As Sulimaniyah]";
                    break;
                case "حائل [شارع الملك عبدالله]":
                    jsonBody["showroom"] = "Hail [King Abdullah Rd]";
                    break;
                case "الجوف [المحمدية (ف)]":
                    jsonBody["showroom"] = "Al Jouf [Almuhammadiyah (F)]";
                    break;
                // UAE
                case "صالة العرض بأبوظبي [أبوظبي]":
                case "ابوظبي":
                    jsonBody["showroom"] = "Abu Dhabi Showroom [Abu Dhabi]";
                    break;
                case "صالة العرض بالعين [العين]":
                case "العين":
                    jsonBody["showroom"] = "Al Ain Showroom [Al Ain]";
                    break;
                case "صالة عرض ديرة [دبي]":
                case "ديرة":
                    jsonBody["showroom"] = "Deira Showroom [Dubai]";
                    break;
                case "صالة العرض بالفجيرة [الفجيرة]":
                case "فجيرة":
                    jsonBody["showroom"] = "Fujairah Showroom [Fujairah]";
                    break;
                case "صالة العرض برأس الخيمة [رأس الخيمة]":
                case "راس الخيمة":
                    jsonBody["showroom"] = "Ras Al Khaima Showroom [Ras al Khaimah]";
                    break;
                case "صالة عرض شارع الشيخ زايد [دبي]":
                case "Shaikh Zayed Road Showroom [Dubai]":
                case "Sheikh Zayed Road Showroom":
                case "شارع الشيخ زايد":
                    jsonBody["showroom"] = "Sheikh Zayed Road Showroom [Dubai]";
                    break;
                case "صالة العرض بالشارقة [الشارقة]":
                case "الشارقة":
                    jsonBody["showroom"] = "Sharjah Showroom [Sharjah]";
                    break;
                default:
                    break;
            }
        } 


        // Make sure to convert weird date time formats
        const dateInput = jsonBody["created"];
        var date;
        if (dateInput.includes("T") && dateInput.length > 10) {
            date = new Date(dateInput);
            const dateString = date.toISOString().slice(0, 10); //YYYY-MM-DD
            const timeString = date.toISOString().slice(11, 16); //HH:MM
            jsonBody["created"] = dateString;
            jsonBody["createdTime"] = timeString;
        } else if (dateInput.length === 10) {
            date = new Date(dateInput + "T00:00:00Z");
            const dateString = date.toISOString().slice(0, 10); //YYYY-MM-DD
            const timeString = new Date().toISOString().slice(11, 16); //HH:MM
            jsonBody["created"] = dateString
            jsonBody["createdTime"] = timeString
        }

        const zodBody = leadsSchemaZod.parse(jsonBody);

        // Create Item in Database
        options.body = await wixData.insert("AllLeads", zodBody);
        return created(options)
    } catch (err) {
        options.body = err;
        console.log(request, err);
        return serverError(options);
    }
}

// Book A Service API Endpoint
export async function post_sendBookService(request) {
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: ""
    };

    try {
        //Authenticate Request 
        const secret = await getSecret("api-key");
        if (secret != request.headers['api-key']) {
            options.status = 401;
            options.body = "Authentication Failed. Incorrect API Key.";
            return response(options);
        }

        // Verify request payload includes at least required fields
        const reqBody = await request.body.text();
        const jsonBody = JSON.parse(reqBody);

        // Make sure to convert weird date time formats
        const dateInput = jsonBody["created"];
        var date;
        if (dateInput.includes("T") && dateInput.length > 10) {
            date = new Date(dateInput); //UTC
            const dateString = date.toISOString().slice(0, 10); //YYYY-MM-DD (UTC)
            const timeString = date.toISOString().slice(11, 16); //HH:MM (UTC)
            jsonBody["created"] = dateString;
            jsonBody["createdTime"] = timeString;
        } else if (dateInput.length === 10) {
            date = new Date(dateInput + "T00:00:00Z");
            const dateString = date.toISOString().slice(0, 10); //YYYY-MM-DD
            const timeString = new Date().toISOString().slice(11, 16); //HH:MM
            jsonBody["created"] = dateString
            jsonBody["createdTime"] = timeString
        }

        const zodBody = serviceSchemaZod.parse(jsonBody);

        // Create Item in Database
        options.body = await wixData.insert("BookaService", zodBody);
        return created(options)
    } catch (err) {
        options.body = err;
        return serverError(options);
    }
}

// Meta Webhook for verification of authenticity
export async function get_metaWebhook(request) {
    let options = {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: ""
    };

    const hub_verify_token = request.query["hub.verify_token"];
    const hub_challenge = request.query["hub.challenge"];

    try {
        //Authenticate Request 
        const verifyToken = await getSecret("meta-token");
        if (verifyToken == hub_verify_token) {
            options.body = hub_challenge;
            return ok(options)
        }

        return serverError(options)
    } catch (err) {
        options.body = err;
        return serverError(options);
    }
}

// Meta webhook to receive data
export function post_metaWebhook(request) {
    console.log("Received Webhook Request: ", JSON.stringify(request.body, null, 2));

    return request.body.json()
        .then(body => {
            console.log("Webhook Received:", JSON.stringify(body, null, 2));

            // Check if it's a leadgen event
            if (body.entry && body.entry.length > 0) {
                body.entry.forEach(entry => {
                    if (entry.changes) {
                        entry.changes.forEach(change => {
                            if (change.field === "leads") {
                                let leadgenId = change.value.leadgen_id;
                                let pageId = change.value.page_id;

                                console.log(`New Lead Received! Leadgen ID: ${leadgenId}`);

                                // Fetch lead details from Facebook
                                return getLeadDetails(leadgenId)
                                    .then(leadData => {
                                        console.log("Lead Data:", leadData);
                                        // Store lead data in Wix Database (Optional)
                                        // Save to collection here if needed
                                    })
                                    .catch(err => console.error("Error fetching lead details:", err));
                            }
                        });
                    }
                });
            }
            return ok({ body: { status: "Webhook Processed" } });
        })
        .catch(err => badRequest({ body: { error: "Invalid request", details: err } }));
}

// Fetch lead details from Facebook Graph API
function getLeadDetails(leadgenId) {
    // If you need to get a new token go to Meta Graph API Explorer https://developers.facebook.com/tools/explorer/990575472948623/
    const PAGE_ACCESS_TOKEN = "EAAiGTDx23cgBOyPsdgn1PG3s0cieogmmCuDdj0Fz0x0gOuXSGXsA7icHJ6tgOvNmnpAgZCLvnPBSZBL7DM1vvZAZAX6IvWF9KiYwjA3GftFL3sueTg7ZAZCcZBGx8xTvX3wFnT7JEJB4pCBZAW0WHgxFwyIIiBJNgPtXZAcxZC0hJldSHhyrPLz76TZBJMN5A0hAS4kuYTeOLksqbPSCAVqeAZDZD";
    const url = `https://graph.facebook.com/v22.0/${leadgenId}?access_token=${PAGE_ACCESS_TOKEN}`;

    return fetch(url, { method: "GET" })
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error.message);
            return data;
        });
}








import { query } from "wix-data";
import jsonwebtoken from "jsonwebtoken";

const secretKey = '{VVZE?_?vNXoLF|YQ">MojX|>WV!TY';

export async function post_validateLogin (username, password) {
    try {
        const { items } = await query("Accounts").eq("username", username).find();

        // Username not recognized
        if (items.length === 0) {
            return response({
                status: 401,
                body: { success: false, message: "Username not recognized." }
            })
        }

        // Correct Username
        const user = items[0];
        if (user.password === password) {
            // Correct Password - Login Success
            const sessionToken = jsonwebtoken.sign({ userId: user._id, country: username }, secretKey, { expiresIn: '7d' });
            return response({
                status: 200,
                headers: {
                    "Set-Cookie": `auth_token=${sessionToken}; HttpOnly: Secure; Path=/; SameSite=Strict; Max-Age${60*60*24*7}`,
                    "Content-Type": "application/json"
                },
                body: { success: true, message: "Login Successful", country: username }
            });
        } else {
            // Incorrect Password
            return response({
                status: 401,
                body: { success: false, message: "Incorrect Password" }
            });
        }

    } catch (err) {
        console.error(err);
        return response({
            status: 500,
            body: { success: false, message: 'An error occurred. Please try again.' }
        });
    }
}


export async function get_getUserCountry (request) {
    try {
        // Get the cookie from the request headers
        const cookies = request.headers.cookie || '';
        const authToken = cookies.split('auth_token=')[1]?.split(';')[0];

        if (!authToken) {
            return response({
                status: 401,
                body: { success: false, message: 'No auth token found.' }
            });
        }

        // Verify and decode the JWT token
        const decoded = jsonwebtoken.verify(authToken, secretKey);

        return response({
            status: 200,
            body: { success: true, country: decoded["country"] }
        });
    } catch (err) {
        return response({
            status: 401,
            body: { success: false, message: 'Invalid or expired token:', err }
        });
    }
}