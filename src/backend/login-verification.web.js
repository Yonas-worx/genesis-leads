import { Permissions, webMethod } from 'wix-web-module';
import { query } from "wix-data";
import { response } from 'wix-http-functions';

const hashMap = {
    "Middleeast": "EZA4h4oLg1eSXKPNC0XivJokWO01CJsf",
    "UAE": "8Qx8EDlskQKID6mhJzoqWav4GLooJtEG",
    "Jeddah": "adusGapSzR4JzAHRO8G8dyYJjrBV6oGJ",
    "Dammam": "oAYzDCPUEcPUMbqIUONVO2i09AKRQokH",
    "Riyadh": "cPjTMs2YYKePhGqv5JudToYFbDe3ECjL",
    "Qatar": "ZMjRXj7MBOYODR7zNISDSMG1rvEGbUJM",
    "Oman": "Ck6JEa55piXqhau80I9E9KTN36gp31I2",
    "Kuwait": "9BJCWT06t4fYieSmjif52d2M7k7GoWJq",
    "Bahrain": "6HaQCTX6tUPWTSC8128r8hfIN4nxvLhX",
    "Mauritius": "f4ADSqLiAkovJO6a5Y58JIeudLHZymKR",
    "Egypt": "UdZLpsktkzXPguWPTznq5exTr7m8UogP",
    "Jordan": "uOWzY9fb7OrRSlUCyjeKXmVuXNnSuPme"
}

export const verifyCookie = webMethod(Permissions.Anyone, function (currCountry, yummyCookie) {
    if(hashMap[currCountry] === yummyCookie) {
        return response({
            status: 200
        })
    } else {
        return response({
            status: 401
        })
    }
})

export const validateLogin = webMethod(Permissions.Anyone, async function (username, password) {
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
            return response({
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: { success: true, message: "Login Successful", country: hashMap[username] }
            });
        } else {
            // Incorrect Password
            return response({
                status: 401,
                body: { success: false, message: "Incorrect Password" }
            });
        }

    } catch (err) {
        // Unknown Error
        console.error(err);
        return response({
            status: 500,
            body: { success: false, message: 'An error occurred. Please try again.' }
        });
    }
})