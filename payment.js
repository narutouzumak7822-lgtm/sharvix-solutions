
const APP_KEY = "sharvixPendingApplication";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwx6lIeYxz0WoIgNQIidVjRxDLNvNKmUFAtj1O_TLx0qLxAmxeuI0w8bTMHIXf5G0jD/exec";

const form = document.getElementById("paymentForm");
const message = document.getElementById("paymentMessage");

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;

// Application Data तपासणे
if (!sessionStorage.getItem(APP_KEY)) {
  message.textContent =
    "Application details not found. Please complete the application form first.";

  form.querySelector("button").disabled = true;
}

// Payment Form Submit
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "";

  const application = JSON.parse(
    sessionStorage.getItem(APP_KEY) || "null"
  );

  if (!application) {
    message.textContent =
      "Please complete the application form first.";
    return;
  }

  const utr = form.elements.utr.value.trim();

  const screenshot =
    form.elements.paymentScreenshot.files[0];

  if (screenshot && screenshot.size > MAX_SCREENSHOT_SIZE) {
    message.textContent =
      "Screenshot must be 5 MB or smaller.";
    return;
  }

  const button = form.querySelector("button");

  button.disabled = true;
  button.textContent = "Submitting...";

  try {
    const payload = {
      ...application,
      utr: utr,
      paymentStatus: "Pending Verification"
    };

    // Screenshot convert करणे
    if (screenshot) {
      payload.paymentScreenshotName = screenshot.name;

      payload.paymentScreenshotMimeType =
        screenshot.type || "image/jpeg";

      payload.paymentScreenshotBase64 =
        await convertToBase64(screenshot);
    }

    // Google Sheets कडे Data पाठवणे
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    sessionStorage.removeItem(APP_KEY);

    document.querySelector(".panel:last-of-type").innerHTML = `
      <h2>Submission Request Sent!</h2>

      <p>
        Your application details have been submitted
        for review.
      </p>

      <p>
        Payment Status:
        <strong>Pending Verification</strong>
      </p>

      <p>
        Keep your UTR number. The company must verify
        the actual payment credit before marking it Paid.
      </p>
    `;

  } catch (error) {

    message.textContent =
      "Submission could not be confirmed. Please try again after checking your connection.";

    button.disabled = false;
    button.textContent = "Submit Application →";
  }
});

// File Base64 Convert Function
function convertToBase64(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result.split(",")[1]);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });
}
