const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwx6lIeYxz0WoIgNQIidVjRxDLNvNKmUFAtj1O_TLx0qLxAmxeuI0w8bTMHIXf5G0jD/exec";

const jobs = [
  {title:"Frontend Developer",type:"Full-time",location:"India · Hybrid",salary:"₹15,000 – ₹25,000 / month",level:"Fresher / 0–2 years"},
  {title:"Web Developer",type:"Full-time",location:"India · Hybrid",salary:"₹15,000 – ₹28,000 / month",level:"Fresher / 0–2 years"},
  {title:"UI / UX Designer",type:"Full-time",location:"India · Remote",salary:"₹12,000 – ₹22,000 / month",level:"Fresher / 0–2 years"},
  {title:"Digital Marketing Executive",type:"Full-time",location:"India · Hybrid",salary:"₹12,000 – ₹20,000 / month",level:"Fresher / 0–1 year"}
];

const jobList = document.getElementById("jobList");
const modal = document.getElementById("applyModal");
const form = document.getElementById("applicationForm");
const roleField = document.getElementById("jobRole");
const selectedRole = document.getElementById("selectedRole");
const message = document.getElementById("formMessage");
const submitButton = form.querySelector('button[type="submit"]');

jobList.innerHTML = jobs.map((job, index) => `
  <article class="job-card">
    <div class="job-title"><h3>${job.title}</h3><p>${job.level}</p></div>
    <div class="job-meta"><span>WORK TYPE</span>${job.type} · ${job.location}</div>
    <div class="job-meta"><span>ESTIMATED PAY</span>${job.salary}</div>
    <button class="apply-btn" data-job="${index}">Apply Now ↗</button>
  </article>`).join("");

function openApplication(job) {
  roleField.value = job.title;
  selectedRole.textContent = `${job.title} · ${job.type}`;
  message.textContent = "";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeApplication() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read the resume file."));
    reader.readAsDataURL(file);
  });
}


jobList.addEventListener("click", event => {
  const button = event.target.closest("[data-job]");

  if (button) {
    const selectedJob = jobs[Number(button.dataset.job)];

    window.location.href =
      `application.html?role=${encodeURIComponent(selectedJob.title)}`;
  }
});

document.getElementById("closeModal").addEventListener("click", closeApplication);
modal.addEventListener("click", event => { if (event.target.dataset.close) closeApplication(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeApplication(); });

form.addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "";
  const resume = document.getElementById("resume").files[0];
  if (!resume) return;
  if (!/\.(pdf|doc|docx)$/i.test(resume.name)) {
    message.textContent = "Please upload a PDF, DOC or DOCX resume.";
    return;
  }
  // Keep uploads small so the browser can send them reliably to Apps Script.
  if (resume.size > 5 * 1024 * 1024) {
    message.textContent = "Please upload a resume smaller than 5 MB.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      jobRole: values.jobRole,
      qualification: values.qualification,
      experience: values.experience,
      portfolio: values.portfolio,
      resumeName: resume.name,
      resumeMimeType: resume.type || "application/octet-stream",
      resumeBase64: await fileToBase64(resume)
    };

    // Apps Script web apps commonly require no-cors for cross-origin form posts.
    // The opaque response means the browser cannot confirm server-side success.
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    message.textContent = "Your application was sent. Please contact the company if you do not receive an acknowledgement.";
    form.reset();
    roleField.value = "";
  } catch (error) {
    message.textContent = "Could not send the application. Please check your internet connection and try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Submit Application <span>↗</span>';
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));
