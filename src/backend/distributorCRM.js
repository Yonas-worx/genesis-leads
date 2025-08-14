// REQBODY TEMPLATE
// const leadsSchemaZod = z.object({
//     created: z.string(),
//     createdTime: z.string().optional(),
//     source: z.string(),                      //Missing from Service
//     campaign: z.string().optional(),         //Missing from Service
//     country: z.string(),
//     showroom: z.string().optional(),         //Missing from Service
//     fullName: z.string(),
//     vehicleName: z.string().optional(),
//     email: z.string(),
//     areaPhoneNumber: z.string(),
//     enquiry: z.string().optional(),
//     sns: z.string().optional(),
//     prefDate: z.string().optional(),
//     prefTime: z.string().optional(),
//     contactEmail: z.string().optional(),
//     currentCar: z.string().optional(),       //Missing from Service
//     purchase: z.string().optional()          //Missing from Service
// }).strict();

// const serviceSchemaZod = z.object({
//     created: z.string(),
//     createdTime: z.string().optional(),
//     country: z.string(),
//     serviceCenter: z.string(),
//     fullName: z.string(),
//     email: z.string(),
//     areaPhoneNumber: z.string(),
//     vehicleName: z.string().optional(),
//     enquiry: z.string().optional(),
//     sns: z.string().optional(),
//     prefDate: z.string().optional(),
//     prefTime: z.string().optional(),
//     contactEmail: z.string().optional(),
// }).strict();

// import { getSecret } from 'wix-secrets-backend';


// export function handleLeadCRM(reqBody) {
//     const country = reqBody.country

//     switch (country) {
//         case "Egypt":
//             sendToEgyptCRM(reqBody);
//             break;
//         default:
//             console.error("Unsupported country for CRM lead:", country);
//             break;
// }
// }

// async function sendToEgyptCRM(reqBody) {
//     const fullNameNoPre = reqBody.fullName.replace("Mr.","").replace("Ms.", "").replace("Mrs.", "");
//     const firstName = fullNameNoPre.split(" ")[0];
//     const lastName = fullNameNoPre.split(" ")[1] || "";

//     const egFormat = {
//         "phone" : reqBody.areaPhoneNumber,
//         "first_name" : firstName,
//         "last_name" : lastName,
//         "car" : reqBody.vehicleName,
//         "brand" : "71",
//         "email" : reqBody.email,
//         "medium" : "Genesis Website | Book a Service",
//         "campaign": reqBody.campaign || "",
//         "targeting" : "[Note from Dev] not sure what data to put here",
//         "comment" : reqBody.enquiry || "",
//     }

//     const secret = await getSecret("egypt_token")
//     const options = {
//         method: "POST",
//         url: "https://gb-pcbe.ghabbour.com/api/v1/create-lead-genesis/",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": secret
//         },
//         body: JSON.stringify(egFormat),
//     }

//     fetch(options.url, {
//         method: options.method,
//         headers: options.headers,
//         body: options.body
//     })
// };