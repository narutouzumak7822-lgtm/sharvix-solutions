
const APP_KEY = "sharvixPendingApplication";

const form = document.getElementById("applicationForm");
const message = document.getElementById("formMessage");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Careers मधून आलेली Job Position निवडणे
const requestedRole = new URLSearchParams(
  window.location.search
).get("role");

if (requestedRole) {
  const roleSelect = form.elements.jobRole;

  const matchingOption = [...roleSelect.options].find(
    option => option.textContent.trim() === requestedRole
  );

  if (matchingOption) {
    roleSelect.value = matchingOption.value;
  }
}

// Application Form Submit
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "";

  const resume = form.elements.resume.files[0];

  if (!resume) {
    message.textContent = "Please upload your resume.";
    return;
  }

  if (resume.size > MAX_FILE_SIZE) {
    message.textContent = "Resume must be 5 MB or smaller.";
    return;
  }

  const allowedExtensions = [".pdf", ".doc", ".docx"];

  const validFile = allowedExtensions.some(extension =>
    resume.name.toLowerCase().endsWith(extension)
  );

  if (!validFile) {
    message.textContent = "Please upload PDF, DOC or DOCX file.";
    return;
  }

  const button = form.querySelector("button");

  button.disabled = true;
  button.textContent = "Preparing Application...";

  try {
    const resumeBase64 = await convertToBase64(resume);

    const formData = new FormData(form);

    const applicationData = Object.fromEntries(
      formData.entries()
    );

    delete applicationData.resume;

    applicationData.resumeName = resume.name;
    applicationData.resumeMimeType =
      resume.type || "application/octet-stream";

    applicationData.resumeBase64 = resumeBase64;

    sessionStorage.setItem(
      APP_KEY,
      JSON.stringify(applicationData)
    );

    // Payment Page वर जा
    window.location.href = "payment.html";

  } catch (error) {
    message.textContent = "Something went wrong. Try again.";

    button.disabled = false;
    button.textContent = "Continue to Payment →";
  }
});

// Resume Base64 मध्ये Convert करणे
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
