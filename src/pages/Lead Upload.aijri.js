//@ts-nocheck

// ------------------------------------------------ //
//                      IMPORTS                     //
// ------------------------------------------------ //
import { processLeads } from "backend/leadsUpload.web.js";
import wixWindow from 'wix-window';

$w.onReady(function () {

    // ------------------------------------------------ //
    //              DECLARE ALL ELEMENTS                 //
    // ------------------------------------------------ //
    const uploadButton      = $w('#uploadButton1');
    const importBtn         = $w('#importBtn1');
    const uploadMessage     = $w('#uploadMessage');
    const importMessage     = $w('#importMessage');
    const rulesList         = $w('#rulesList');
    const recentRowsFrame   = $w('#recentRowsFrame');
    const section9          = $w('#section9');
    const section11         = $w('#section11');
    const backHomeBtn       = $w('#backHomeBtn');
    const stepIndicator     = $w('#stepIndicator');
    const stepIndicator1    = $w('#stepIndicator1');

    // ------------------------------------------------ //
    //         PAGE LOADS                               //
    // ------------------------------------------------ //
    uploadMessage.hide();
    importMessage.hide();
    importBtn.disable();
    recentRowsFrame.hide();
    backHomeBtn.hide();
    stepIndicator.hide();
    stepIndicator1.hide();
    section11.collapse();

    rulesList.text =
        "☐ File is a CSV\n" +
        "☐ Created\n" +
        "☐ Lead Source\n" +
        "☐ Country\n" +
        "☐ Showroom\n" +
        "☐ Full Name\n" +
        "☐ Interested Vehicle\n" +
        "☐ Email\n" +
        "☐ Area + Phone Number\n" +
        "☐ Planned Purchase Date\n" +
        "☐ Campaign";

    let validatedFileUrl  = "";
    let conversionLogText = "";


    // ------------------------------------------------ //
    //         USER SELECTS A FILE                      //
    // ------------------------------------------------ //
    uploadButton.fileType = "Document";

    uploadButton.onChange(function() {
        const files = uploadButton.value;

        // ── X clicked — reset ─────────────────────
        if (!files || files.length === 0) {
            importBtn.disable();
            importMessage.hide();
            uploadMessage.hide();
            stepIndicator.hide();
            section11.collapse();
            recentRowsFrame.hide();
            backHomeBtn.hide();
            stepIndicator1.hide();
            validatedFileUrl  = "";
            conversionLogText = "";

            rulesList.text =
                "☐ File is a CSV\n" +
                "☐ Created\n" +
                "☐ Lead Source\n" +
                "☐ Country\n" +
                "☐ Showroom\n" +
                "☐ Full Name\n" +
                "☐ Interested Vehicle\n" +
                "☐ Email\n" +
                "☐ Area + Phone Number\n" +
                "☐ Planned Purchase Date\n" +
                "☐ Campaign";
            return;
        }

        const file = files[0];

        // Reset state
        importBtn.disable();
        importMessage.hide();
        uploadMessage.hide();
        stepIndicator.hide();
        section11.collapse();
        recentRowsFrame.hide();
        backHomeBtn.hide();
        stepIndicator1.hide();
        validatedFileUrl  = "";
        conversionLogText = "";

        rulesList.text =
            "☐ File is a CSV\n" +
            "☐ Created\n" +
            "☐ Lead Source\n" +
            "☐ Country\n" +
            "☐ Showroom\n" +
            "☐ Full Name\n" +
            "☐ Interested Vehicle\n" +
            "☐ Email\n" +
            "☐ Area + Phone Number\n" +
            "☐ Planned Purchase Date\n" +
            "☐ Campaign";

        // ── Check: Is it a CSV? ───────────────────
        if (!file.name.toLowerCase().endsWith('.csv')) {
            rulesList.text =
                "❌ File is a CSV\n" +
                "☐ Created\n" +
                "☐ Lead Source\n" +
                "☐ Country\n" +
                "☐ Showroom\n" +
                "☐ Full Name\n" +
                "☐ Interested Vehicle\n" +
                "☐ Email\n" +
                "☐ Area + Phone Number\n" +
                "☐ Planned Purchase Date\n" +
                "☐ Campaign";

            stepIndicator.text        = "❌ Invalid file type";
            stepIndicator.style.color = "#FF0000";
            stepIndicator.show();
            uploadMessage.text        = "❌ This is not a CSV file. Please upload a .csv file.";
            uploadMessage.style.color = "#FF0000";
            uploadMessage.show();
            uploadButton.reset();
            return;
        }

        // ── Step 1: Uploading ─────────────────────
        stepIndicator.text        = "Step 1 — Uploading file...";
        stepIndicator.style.color = "#000000";
        stepIndicator.show();

        rulesList.text =
            "✅ File is a CSV\n" +
            "⏳ Created — checking...\n" +
            "⏳ Lead Source — checking...\n" +
            "⏳ Country — checking...\n" +
            "⏳ Showroom — checking...\n" +
            "⏳ Full Name — checking...\n" +
            "⏳ Interested Vehicle — checking...\n" +
            "⏳ Email — checking...\n" +
            "⏳ Area + Phone Number — checking...\n" +
            "⏳ Planned Purchase Date — checking...\n" +
            "⏳ Campaign — checking...";

        uploadMessage.text        = "⏳ Uploading file...";
        uploadMessage.style.color = "#000000";
        uploadMessage.show();

        uploadButton.uploadFiles()
            .then(function(uploadResult) {
                if (!uploadResult || uploadResult.length === 0) {
                    stepIndicator.text        = "❌ Upload failed";
                    stepIndicator.style.color = "#FF0000";
                    uploadMessage.text        = "❌ Upload failed. Please try again.";
                    uploadMessage.style.color = "#FF0000";
                    return Promise.reject("no result");
                }

                const fileUrl = uploadResult[0].fileUrl;

                // ── Step 2: Validating & Converting ──
                stepIndicator.text        = "Step 2 — Validating & Converting...";
                stepIndicator.style.color = "#000000";
                uploadMessage.text        = "⏳ Validating and converting columns...";
                uploadMessage.style.color = "#000000";

                return processLeads(fileUrl, true)
                    .then(function(result) {
                        if (!result) return;

                        if (result.rulesText) {
                            rulesList.text = result.rulesText;
                        }

                        if (!result.success) {
                            stepIndicator.text        = "❌ Validation failed";
                            stepIndicator.style.color = "#FF0000";
                            uploadMessage.text        = "❌ Some required columns are missing or incorrectly named. Download the sample CSV, rename your columns to match exactly, and upload again.";
                            uploadMessage.style.color = "#FF0000";
                            importBtn.disable();
                            return;
                        }

                        // ── All passed — store conversion log ──
                        validatedFileUrl  = fileUrl;
                        conversionLogText = result.conversionLog || "";

                        stepIndicator.text        = "✅ File validated & converted. Review preview below.";
                        stepIndicator.style.color = "#000000";
                        uploadMessage.text        = "✅ File is valid! Review the converted data below and click Submit to merge.";
                        uploadMessage.style.color = "#000000";

                        // Show preview table
                        section11.expand();
                        recentRowsFrame.show();
                        importBtn.enable();
                        backHomeBtn.show();

                        stepIndicator1.text        = "Step 3 — Preview: " + result.total + " rows ready. Click Submit to merge to CMS.";
                        stepIndicator1.style.color = "#000000";
                        stepIndicator1.show();

                        recentRowsFrame.postMessage({
                            type    : 'showLeads',
                            leads   : result.previewRows,
                            headers : result.headers
                        });

                        setTimeout(function() {
                            section11.scrollTo();
                        }, 500);
                    });
            })
            .catch(function(err) {
                if (err === "no result") return;
                stepIndicator.text        = "❌ Error occurred";
                stepIndicator.style.color = "#FF0000";
                uploadMessage.text        = "❌ Error: " + (err.message || err);
                uploadMessage.style.color = "#FF0000";
            });
    });

    // ------------------------------------------------ //
    //         USER CLICKS SUBMIT BUTTON                //
    // ------------------------------------------------ //
    importBtn.onClick(function() {

        importBtn.disable();
        uploadButton.disable();

        stepIndicator1.text        = "Step 3 — Merging to CMS...";
        stepIndicator1.style.color = "#000000";
        importMessage.text         = "⏳ Merging file to CMS, please wait...";
        importMessage.style.color  = "#000000";
        importMessage.show();

        processLeads(validatedFileUrl, false)
            .then(function(result) {

                if (!result.success) {
                    stepIndicator1.text        = "❌ Merge failed";
                    stepIndicator1.style.color = "#FF0000";
                    importMessage.text         = "❌ Merge failed: " + result.errors.join(" ");
                    importMessage.style.color  = "#FF0000";
                    importBtn.enable();
                    uploadButton.enable();
                    return;
                }

                // ── Success — show detailed report ────
                stepIndicator1.text        = "✅ Merge complete!";
                stepIndicator1.style.color = "#000000";

                importMessage.text =
                    "✅ Merge Complete!\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━\n" +
                    "📊 Import Summary\n" +
                    "━━━━━━━━━━━━━━━━━━━━━\n" +
                    "Total Records : " + result.total      + "\n" +
                    "Imported      : " + result.imported   + "\n" +
                    "Skipped       : " + result.skipped    + "\n" +
                    "Duplicates    : " + result.duplicates + "\n" +
                    "Missing Fields: " + result.missingFields + "\n" +
                    "Invalid Emails: " + result.invalidEmails + "\n\n" +
                    "━━━━━━━━━━━━━━━━━━━━━\n" +
                    (conversionLogText ? conversionLogText : "");
                importMessage.style.color = "#000000";

                // Show back home button — table stays visible until user clicks it
                backHomeBtn.show();
            })
            .catch(function(err) {
                stepIndicator1.text        = "❌ Merge failed";
                stepIndicator1.style.color = "#FF0000";
                importMessage.text         = "❌ Merge failed: " + (err.message || err);
                importMessage.style.color  = "#FF0000";
                importBtn.enable();
                uploadButton.enable();
            });
    });

    // ------------------------------------------------ //
    //         BACK TO HOME BUTTON                      //
    // ------------------------------------------------ //
    backHomeBtn.onClick(function() {

        section11.collapse();
        recentRowsFrame.hide();
        backHomeBtn.hide();
        stepIndicator1.hide();
        importMessage.hide();

        uploadButton.reset();
        uploadButton.enable();
        importBtn.disable();
        uploadMessage.hide();
        stepIndicator.hide();
        validatedFileUrl  = "";
        conversionLogText = "";

        rulesList.text =
            "☐ File is a CSV\n" +
            "☐ Created\n" +
            "☐ Lead Source\n" +
            "☐ Country\n" +
            "☐ Showroom\n" +
            "☐ Full Name\n" +
            "☐ Interested Vehicle\n" +
            "☐ Email\n" +
            "☐ Area + Phone Number\n" +
            "☐ Planned Purchase Date\n" +
            "☐ Campaign";

        section9.expand();
        wixWindow.scrollTo(0, 0);
    });

});