//@ts-nocheck
// ------------------------------------------------ //
//           backend/leadsUpload.web.js             //
// ------------------------------------------------ //
import { Permissions, webMethod } from 'wix-web-module';
import wixData from 'wix-data';
import { mediaManager } from 'wix-media-backend';

const COLLECTION = "AllLeads";

// ------------------------------------------------ //
//   CMS FIELD ORDER (matches CMS exactly)          //
// ------------------------------------------------ //
const CMS_FIELDS = [
    'created',
    'createdTime',
    'source',
    'campaign',
    'country',
    'showroom',
    'fullName',
    'vehicleName',
    'email',
    'areaPhoneNumber',
    'enquiry',
    'sns',
    'prefDate',
    'prefTime',
    'contactEmail',
    'currentCar',
    'purchase',
];

// ------------------------------------------------ //
//   PREVIEW HEADERS (display names for table)      //
// ------------------------------------------------ //
const PREVIEW_HEADERS = [
    'Created', 'Created Time', 'Lead Source', 'Campaign',
    'Country', 'Showroom', 'Full Name', 'Interested Vehicle',
    'Email', 'Area + Phone Number', 'Enquiry', 'SNS',
    'Pref Date', 'Pref Time', 'Contact Email', 'Current Car',
    'Planned Purchase Date'
];

// ------------------------------------------------ //
//   REQUIRED RULES (shown in rules list)           //
//   STRICT: the CSV column header must match       //
//   exactly one of the accepted names listed here. //
// ------------------------------------------------ //
const REQUIRED_RULES = [
    { label: 'Created',               field: 'created'         },
    { label: 'Lead Source',           field: 'source'          },
    { label: 'Country',               field: 'country'         },
    { label: 'Showroom',              field: 'showroom'        },
    { label: 'Full Name',             field: 'fullName'        },
    { label: 'Interested Vehicle',    field: 'vehicleName'     },
    { label: 'Email',                 field: 'email'           },
    { label: 'Area + Phone Number',   field: 'areaPhoneNumber' },
    { label: 'Planned Purchase Date', field: 'purchase'        },
    { label: 'Campaign',              field: 'campaign'        },
];

// ------------------------------------------------ //
//   STRICT COLUMN MAP                              //
//   Column headers must match exactly (case-       //
//   insensitive). No aliases, no fallbacks.        //
// ------------------------------------------------ //
const STRICT_COLUMN_MAP = {
    // Required
    'created'              : 'created',
    'lead source'          : 'source',
    'country'              : 'country',
    'showroom'             : 'showroom',
    'full name'            : 'fullName',
    'interested vehicle'   : 'vehicleName',
    'email'                : 'email',
    'area + phone number'  : 'areaPhoneNumber',
    'planned purchase date': 'purchase',
    'campaign'             : 'campaign',

    // Optional
    'enquiry'              : 'enquiry',
    'sns'                  : 'sns',
    'pref date'            : 'prefDate',
    'pref time'            : 'prefTime',
    'contact email'        : 'contactEmail',
    'current car'          : 'currentCar',
    'created time'         : 'createdTime',
};

// ------------------------------------------------ //
//   COUNTRY NORMALIZER                             //
//   Exact match of switch in http-functions.js     //
// ------------------------------------------------ //
function normalizeCountry(raw) {
    if (!raw) return '';
    const r   = raw.trim();
    const low = r.toLowerCase();

    // Arabic values matched on raw, everything else matched case-insensitively
    if (r === 'الإمارات')  return 'UAE';
    if (r === 'جدة')       return 'Jeddah';
    if (r === 'الدمام')    return 'Dammam';
    if (r === 'الرياض')    return 'Riyadh';
    if (r === 'قطر')       return 'Qatar';
    if (r === 'عُمان')     return 'Oman';
    if (r === 'الكويت')    return 'Kuwait';
    if (r === 'البحرين')   return 'Bahrain';
    if (r === 'مصر')       return 'Egypt';
    if (r === 'الأردن')    return 'Jordan';
    if (r === 'لبنان')     return 'Lebanon';

    switch (low) {
        case 'middleeast': case 'me':
            return 'Middleeast';
        case 'ae': case 'uae':
            return 'UAE';
        case 'jeddah': case 'sa-jeddah': case 'sau-j':
            return 'Jeddah';
        case 'dammam': case 'sa-dammam': case 'sau-d':
            return 'Dammam';
        case 'riyadh': case 'sa-riyadh': case 'sau-r':
            return 'Riyadh';
        case 'qatar': case 'qa': case 'qat':
            return 'Qatar';
        case 'oman': case 'om': case 'omn':
            return 'Oman';
        case 'kuwait': case 'kw': case 'kwt':
            return 'Kuwait';
        case 'bahrain': case 'bh': case 'bah':
            return 'Bahrain';
        case 'mauritius': case 'mu':
            return 'Mauritius';
        case 'egypt': case 'eg':
            return 'Egypt';
        case 'jordan': case 'jo':
            return 'Jordan';
        case 'lebanon': case 'lb':
            return 'Lebanon';
        default:
            return r;
    }
}

// ------------------------------------------------ //
//   COUNTRY DIAL CODES                             //
// ------------------------------------------------ //
const DIAL_CODES = {
    'UAE'       : '+971',
    'Jeddah'    : '+966',
    'Dammam'    : '+966',
    'Riyadh'    : '+966',
    'Qatar'     : '+974',
    'Oman'      : '+968',
    'Kuwait'    : '+965',
    'Bahrain'   : '+973',
    'Mauritius' : '+230',
    'Egypt'     : '+20',
    'Jordan'    : '+962',
    'Lebanon'   : '+961',
    'Middleeast': '',     // no single dial code for region
};

// ------------------------------------------------ //
//   PHONE FORMATTER                                //
//   Strips p: prefix, strips all non-digits        //
//   then prepends correct country dial code        //
//   if not already present.                        //
// ------------------------------------------------ //
function formatPhone(phone, country) {
    if (!phone) return '';

    // Strip p: prefix
    let cleaned = phone.replace(/^p:/i, '').trim();

    // Strip all formatting characters except leading +
    const hasPlus  = cleaned.startsWith('+');
    const digitsOnly = cleaned.replace(/[^\d]/g, '');

    // If already has a + we trust it and just reformat
    if (hasPlus) return '+' + digitsOnly;

    // Look up dial code for the normalised country
    const dialCode = DIAL_CODES[country] || '';

    if (!dialCode) {
        // No known dial code — return digits as-is
        return digitsOnly;
    }

    const dialDigits = dialCode.replace('+', '');

    // If number already starts with the dial digits, don't double-add
    if (digitsOnly.startsWith(dialDigits)) {
        return '+' + digitsOnly;
    }

    return dialCode + digitsOnly;
}

// ------------------------------------------------ //
//   GENESIS VEHICLE LIST                           //
//   Used to identify vehicle from campaign string  //
// ------------------------------------------------ //
const GENESIS_VEHICLES = [
    'Electrified G80',
    'G70 Shooting Brake',
    'G90 Black',
    'Electrified GV70',
    'GV80 Coupe',
    'G70',
    'G80',
    'G90',
    'GV60',
    'GV70',
    'GV80',
];

// ------------------------------------------------ //
//   CAMPAIGN PARSER                                //
//   Scans every underscore-separated part for a   //
//   Genesis vehicle and a known country.           //
//   Whatever parts are not vehicle or country      //
//   are joined as the campaign name.               //
//   Works regardless of part order or format.      //
// ------------------------------------------------ //
function parseSocialFormName(formName) {
    if (!formName) return {};
    const extracted  = {};
    const parts      = formName.split('_');
    if (parts.length < 1) return {};

    const vehicleIndexes = [];
    const countryIndexes = [];

    for (let i = 0; i < parts.length; i++) {
        // Dashes represent spaces inside each part
        const asSpaces = parts[i].replace(/-/g, ' ').trim();
        const lower    = asSpaces.toLowerCase();

        // ── Try to match a Genesis vehicle ───────
        // Check longer names first (already ordered longest→shortest in list)
        let matchedVehicle = false;
        for (let v = 0; v < GENESIS_VEHICLES.length; v++) {
            if (GENESIS_VEHICLES[v].toLowerCase() === lower) {
                extracted.vehicleName = GENESIS_VEHICLES[v];
                vehicleIndexes.push(i);
                matchedVehicle = true;
                break;
            }
        }
        if (matchedVehicle) continue;

        // ── Try to match a country ────────────────
        const normalised = normalizeCountry(asSpaces);
        // normalizeCountry returns the input unchanged if no match
        // so only accept it if it actually changed or is a known result
        const KNOWN_COUNTRIES = [
            'Middleeast','UAE','Jeddah','Dammam','Riyadh',
            'Qatar','Oman','Kuwait','Bahrain','Mauritius',
            'Egypt','Jordan','Lebanon'
        ];
        if (KNOWN_COUNTRIES.indexOf(normalised) !== -1) {
            extracted.country = normalised;
            countryIndexes.push(i);
            continue;
        }

        // ── Language codes — skip silently ────────
        // AR, EN, FR etc. are 2-letter language tags
        if (/^[a-z]{2}$/i.test(parts[i].trim())) continue;
    }

    // ── Remaining parts = campaign name ──────────
    const skipIndexes = vehicleIndexes.concat(countryIndexes);
    const campaignParts = [];
    for (let i = 0; i < parts.length; i++) {
        if (skipIndexes.indexOf(i) === -1) {
            const word = parts[i].replace(/-/g, ' ').trim();
            // Skip 2-letter language codes
            if (/^[a-z]{2}$/i.test(parts[i].trim())) continue;
            if (word) campaignParts.push(word);
        }
    }
    if (campaignParts.length > 0) {
        extracted.campaign = campaignParts.join(' ');
    }

    return extracted;
}



// ------------------------------------------------ //
//   SOURCE NORMALIZER                              //
// ------------------------------------------------ //
function normalizeSource(raw) {
    if (!raw) return '';
    const r = raw.trim().toLowerCase();
    if (r === 'ig')      return 'IG';
    if (r === 'fb')      return 'FB';
    if (r === 'tiktok')  return 'TikTok';
    if (r === 'social')  return 'Social';
    if (r === 'website') return 'Website';
    return raw.trim();
}

// ------------------------------------------------ //
//   MAIN EXPORT                                    //
// ------------------------------------------------ //
export const processLeads = webMethod(Permissions.Anyone, async function (fileUrl, validateOnly) {

    const result = {
        success        : false,
        rulesText      : '',
        conversionLog  : '',
        errors         : [],
        total          : 0,
        imported       : 0,
        skipped        : 0,
        duplicates     : 0,
        missingFields  : 0,
        invalidEmails  : 0,
        previewRows    : [],
        headers        : PREVIEW_HEADERS,
    };

    // ── 1. Fetch CSV ──────────────────────────────
    let csvText;
    try {
        const downloadUrl = await mediaManager.getDownloadUrl(fileUrl);
        const { fetch }   = await import('wix-fetch');
        const response    = await fetch(downloadUrl);
        csvText           = await response.text();
    } catch (err) {
        result.rulesText = '❌ Could not read file\n';
        result.errors.push('Could not read file');
        return result;
    }

    if (!csvText || !csvText.trim()) {
        result.rulesText = '❌ The CSV file is empty\n';
        result.errors.push('The CSV file is empty.');
        return result;
    }

    // ── 2. Parse CSV ──────────────────────────────
    const rows = parseCSV(csvText);
    if (rows.length < 2) {
        result.rulesText = '❌ CSV has no data rows\n';
        result.errors.push('CSV has no data rows.');
        return result;
    }

    const rawHeaders = rows[0];

    // ── 3. Build strict header mapping ───────────
    //   Each raw column header is matched ONLY against
    //   STRICT_COLUMN_MAP (lowercased, trimmed).
    //   Unrecognised columns are ignored.
    //   No aliases, no extraction, no fallbacks.
    // ─────────────────────────────────────────────
    const mappedHeaders    = [];
    const unrecognisedCols = [];

    for (let i = 0; i < rawHeaders.length; i++) {
        const raw        = rawHeaders[i].trim();
        const normalized = raw.toLowerCase();
        const cmsField   = STRICT_COLUMN_MAP[normalized] || null;

        mappedHeaders.push(cmsField);

        if (!cmsField) {
            unrecognisedCols.push('"' + raw + '"');
        }
    }

    // ── 4. Check which required fields are present ─
    const satisfiedFields = {};
    for (let i = 0; i < mappedHeaders.length; i++) {
        const f = mappedHeaders[i];
        if (f) satisfiedFields[f] = true;
    }

    // ── 5. Build rules list ───────────────────────
    let rulesText = '✅ File is a CSV\n';
    let allPassed = true;

    for (let i = 0; i < REQUIRED_RULES.length; i++) {
        const rule = REQUIRED_RULES[i];
        if (satisfiedFields[rule.field]) {
            rulesText += '✅ ' + rule.label + '\n';
        } else {
            rulesText += '❌ ' + rule.label + ' — column not found. Rename it to: "' + rule.label + '"\n';
            allPassed  = false;
        }
    }

    result.rulesText = rulesText;

    if (!allPassed) {
        result.errors.push('Some required columns are missing or incorrectly named. Please rename them to match the rules list exactly.');
        return result;
    }

    result.success = true;

    // ── 6. Process all data rows ──────────────────
    const dataRows = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        let hasContent = false;
        for (let j = 0; j < row.length; j++) {
            if (row[j].trim()) { hasContent = true; break; }
        }
        if (hasContent) dataRows.push(row);
    }

    result.total = dataRows.length;

    const convertedRows = [];
    const conversionNotes = [];

    for (let i = 0; i < dataRows.length; i++) {
        const row  = dataRows[i];
        const lead = {};

        // Map columns using strict map only
        for (let j = 0; j < mappedHeaders.length; j++) {
            const cmsField = mappedHeaders[j];
            const val      = (row[j] || '').trim();
            if (cmsField) lead[cmsField] = val;
        }

        // ── Apply social form name logic (data extraction) ──
        // Same as original http-functions.js: extract country/vehicle/
        // campaign/source from the Campaign column value if not already set.
        const campaignVal = lead['campaign'] || '';
        if (campaignVal) {
            const extracted = parseSocialFormName(campaignVal);

            if (extracted.country     && (!lead['country']     || !lead['country'].trim()))      lead['country']     = extracted.country;
            if (extracted.vehicleName && (!lead['vehicleName'] || !lead['vehicleName'].trim()))  lead['vehicleName'] = extracted.vehicleName;
            if (extracted.campaign    && (!lead['campaign']    || lead['campaign'] === campaignVal)) lead['campaign'] = extracted.campaign;
            if (extracted.source      && (!lead['source']      || !lead['source'].trim()))        lead['source']     = extracted.source;
        }

        // Normalize values
        if (lead['country'])         lead['country']         = normalizeCountry(lead['country']);
        if (lead['source'])          lead['source']          = normalizeSource(lead['source']);
        if (lead['areaPhoneNumber']) lead['areaPhoneNumber'] = formatPhone(lead['areaPhoneNumber'], lead['country']);

        // Default source if still empty
        if (!lead['source']) lead['source'] = 'Upload';

        convertedRows.push(lead);
    }

    // ── 7. Build conversion log ───────────────────
    result.conversionLog =
        '📋 Conversion Summary:\n' +
        '• Total rows found: ' + result.total + '\n' +
        '• Columns matched exactly — no header conversions needed.';

    // ── 8. Set preview (first 5 rows) ────────────
    result.previewRows = convertedRows.slice(0, 5).map(function(lead) {
        return {
            'Created'              : lead['created']         || '',
            'Created Time'         : lead['createdTime']     || '',
            'Lead Source'          : lead['source']          || '',
            'Campaign'             : lead['campaign']        || '',
            'Country'              : lead['country']         || '',
            'Showroom'             : lead['showroom']        || '',
            'Full Name'            : lead['fullName']        || '',
            'Interested Vehicle'   : lead['vehicleName']     || '',
            'Email'                : lead['email']           || '',
            'Area + Phone Number'  : lead['areaPhoneNumber'] || '',
            'Enquiry'              : lead['enquiry']         || '',
            'SNS'                  : lead['sns']             || '',
            'Pref Date'            : lead['prefDate']        || '',
            'Pref Time'            : lead['prefTime']        || '',
            'Contact Email'        : lead['contactEmail']    || '',
            'Current Car'          : lead['currentCar']      || '',
            'Planned Purchase Date': lead['purchase']        || '',
        };
    });

    // ── 9. Stop if validate only ──────────────────
    if (validateOnly) return result;

    // ── 10. Full merge ────────────────────────────
    const leadsToInsert = [];

    for (let i = 0; i < convertedRows.length; i++) {
        const lead = convertedRows[i];

        if (!lead['fullName'] || !lead['email'] || !lead['country'] || !lead['areaPhoneNumber']) {
            result.missingFields++;
            result.skipped++;
            continue;
        }

        if (!isValidEmail(lead['email'])) {
            result.invalidEmails++;
            result.skipped++;
            continue;
        }

        if (!isValidPhone(lead['areaPhoneNumber'])) {
            result.invalidEmails++;   // reuse counter — shown as invalid in report
            result.skipped++;
            continue;
        }

        // Parse created date
        const createdVal = lead['created'];
        if (createdVal) {
            const d = new Date(createdVal);
            if (!isNaN(d.getTime())) {
                const dateStr  = d.toISOString().slice(0, 10);
                const timeStr  = d.toISOString().slice(11, 16);
                lead['created']     = dateStr;
                lead['createdTime'] = timeStr;
            }
        } else {
            const now = new Date();
            lead['created']     = now.toISOString().slice(0, 10);
            lead['createdTime'] = now.toISOString().slice(11, 16);
        }

        leadsToInsert.push(lead);
    }

    // ── 11. Insert in batches of 1000 ────────────
    const BATCH_SIZE = 1000;
    for (let i = 0; i < leadsToInsert.length; i += BATCH_SIZE) {
        const batch = leadsToInsert.slice(i, i + BATCH_SIZE);
        try {
            await wixData.bulkInsert(COLLECTION, batch, { suppressAuth: true });
            result.imported += batch.length;
        } catch (err) {
            for (let j = 0; j < batch.length; j++) {
                try {
                    await wixData.insert(COLLECTION, batch[j], { suppressAuth: true });
                    result.imported++;
                } catch (e) {
                    result.skipped++;
                }
            }
        }
    }

    result.skipped = result.total - result.imported;
    return result;
});

// ------------------------------------------------ //
//   HELPERS                                        //
// ------------------------------------------------ //
function isValidEmail(email) {
    if (!email) return false;
    // Must have exactly one @, a domain, and a TLD of at least 2 chars
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

function isValidPhone(phone) {
    if (!phone) return false;
    // Strip common formatting chars then check length and digits
    const cleaned = phone.replace(/[\s\-().+]/g, '');
    return /^[0-9]{7,15}$/.test(cleaned);
}

function parseCSV(text) {
    const lines  = text.split(/\r?\n/);
    const result = [];
    for (let i = 0; i < lines.length; i++) {
        const row = splitCSVLine(lines[i]);
        let hasContent = false;
        for (let j = 0; j < row.length; j++) {
            if (row[j].trim()) { hasContent = true; break; }
        }
        if (hasContent) result.push(row);
    }
    return result;
}

function splitCSVLine(line) {
    const result = [];
    let current  = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += c;
        }
    }
    result.push(current.trim());
    return result;
}