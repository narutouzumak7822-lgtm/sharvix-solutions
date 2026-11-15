// Replace the existing Apps Script code with this version before using the new pages.
const SPREADSHEET_ID = "1UGGtpN9ouUyp-PyoT6aj4Jrov4u_2qAakeaZvA6z0vk";
const SHEET_NAME = "Sheet1";
const FOLDER_NAME = "Sharvix_Application_Files";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    const headers = [
      "Application ID","Date","Full Name","Email","Mobile","Job Position",
      "Qualification","Experience","Portfolio","Resume Link","UTR / Transaction ID",
      "Payment Screenshot Link","Payment Status"
    ];
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);

    const folderIter = DriveApp.getFoldersByName(FOLDER_NAME);
    const folder = folderIter.hasNext() ? folderIter.next() : DriveApp.createFolder(FOLDER_NAME);
    let resumeLink = "";
    if (data.resumeBase64 && data.resumeName) {
      const resumeBlob = Utilities.newBlob(
        Utilities.base64Decode(data.resumeBase64),
        data.resumeMimeType || "application/octet-stream",
        data.resumeName
      );
      resumeLink = folder.createFile(resumeBlob).getUrl();
    }
    let screenshotLink = "";
    if (data.paymentScreenshotBase64 && data.paymentScreenshotName) {
      const imageBlob = Utilities.newBlob(
        Utilities.base64Decode(data.paymentScreenshotBase64),
        data.paymentScreenshotMimeType || "image/jpeg",
        data.paymentScreenshotName
      );
      screenshotLink = folder.createFile(imageBlob).getUrl();
    }
    const applicationId = "SHX-" + Utilities.getUuid().slice(0,8).toUpperCase();
    sheet.appendRow([
      applicationId, new Date(), data.fullName || "", data.email || "",
      data.phone || "", data.jobRole || "", data.qualification || "",
      data.experience || "", data.portfolio || "", resumeLink,
      data.utr || "", screenshotLink, "Pending Verification"
    ]);
    return ContentService.createTextOutput(JSON.stringify({
      success:true, applicationId:applicationId, paymentStatus:"Pending Verification"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success:false, message:error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}