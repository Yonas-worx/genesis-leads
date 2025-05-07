import { validateLogin } from "backend/login-verification.web.js";
import { to } from 'wix-location';
import { session as storage } from "wix-storage";

$w.onReady(function () {
    const username = $w("#dropdown1");
    const password = $w("#input1");
    const submitBtn = $w("#button2");
    const errorMsg = $w("#text9");

    submitBtn.enable()

    submitBtn.onClick((event) => {
        submitBtn.disable();

        if (username.valid && password.valid) {

            validateLogin(username.value, password.value).then((res) => {

                // Login Success
                if (res.body.success) {
                    // Set Header
                    storage.setItem("loginCountry", res.body.country);

                    if (username.value === "Middleeast") {
                        to("/super-admin/");
                    } else {
                        // Redirect to respective country page
                        errorMsg.text = "Login Successful. Redirecting...";
                        errorMsg.style.color = "#000000"
                        errorMsg.show();
                        setTimeout(() => {
                            errorMsg.hide();
                            errorMsg.style.color = "#FF0000";
                        }, 3000)
                        to(`/admin/${username.value}`);
                    }

                } else {
                    // Login Failed display error message
                    errorMsg.text = res.body.message;
                    errorMsg.show();
                    setTimeout(() => { errorMsg.hide() }, 3000)
                    submitBtn.enable();
                }


            }).catch((err) => {
                console.error(err);
                errorMsg.text = "An error occurred. Please try again.";
                errorMsg.show();
                setTimeout(() => { errorMsg.hide(); }, 3000);
                submitBtn.enable();
            });
        } else {
            submitBtn.enable();
            errorMsg.text = "Missing Fields.";
            errorMsg.show();
            setTimeout(() => { errorMsg.hide() }, 3000)
        }
    });
});