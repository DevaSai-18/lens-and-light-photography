const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// Filter photographs by category.
const filterButtons = document.querySelectorAll(".filter-btn");
const photoCards = document.querySelectorAll(".photo-card");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const selectedCategory = button.dataset.filter;
    photoCards.forEach(card => {
      card.hidden = !(selectedCategory === "all" || card.dataset.category === selectedCategory);
    });
  });
});

// Booking records are stored locally in this browser.
const STORAGE_KEY = "lensAndLightBookings";
const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const bookingDateInput = document.getElementById("date");
const dashboardDate = document.getElementById("dashboardDate");
const bookingTableBody = document.getElementById("bookingTableBody");

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function formatDate(dateString) {
  if (!dateString) return "Not selected";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function renderDashboard() {
  const bookings = getBookings();
  const chosenDate = dashboardDate.value;
  const visibleBookings = chosenDate
    ? bookings.filter(booking => booking.date === chosenDate)
    : bookings;

  document.getElementById("totalBookings").textContent = bookings.length;
  document.getElementById("selectedDateCount").textContent = chosenDate
    ? visibleBookings.length
    : "—";
  document.getElementById("uniqueDates").textContent =
    new Set(bookings.map(booking => booking.date).filter(Boolean)).size;

  if (visibleBookings.length === 0) {
    const message = chosenDate
      ? `No bookings found for ${formatDate(chosenDate)}.`
      : "No bookings yet. Submit the booking form above to see it here.";
    bookingTableBody.innerHTML = `<tr class="empty-row"><td colspan="4">${message}</td></tr>`;
    return;
  }

  bookingTableBody.innerHTML = visibleBookings.map(booking => `
    <tr>
      <td>${escapeHTML(booking.name)}</td>
      <td>${escapeHTML(booking.service)}</td>
      <td>${formatDate(booking.date)}</td>
      <td>${escapeHTML(booking.email)}</td>
    </tr>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

bookingForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const formData = new FormData(bookingForm);
  const newBooking = {
    id: Date.now(),
    name: String(formData.get("name")).trim(),
    email: String(formData.get("email")).trim(),
    service: String(formData.get("service")),
    date: String(formData.get("date")),
    message: String(formData.get("message") || "").trim()
  };

  if (!newBooking.date) {
    formMessage.textContent = "Please select your preferred booking date.";
    bookingDateInput.focus();
    return;
  }

  const bookings = getBookings();
  bookings.push(newBooking);
  saveBookings(bookings);

  const countForDate = bookings.filter(booking => booking.date === newBooking.date).length;
  formMessage.textContent =
    `Thank you, ${newBooking.name}! Your booking is saved. ${countForDate} booking(s) for ${formatDate(newBooking.date)}.`;

  bookingForm.reset();
  dashboardDate.value = newBooking.date;
  renderDashboard();
  document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" });
});

dashboardDate.addEventListener("change", renderDashboard);

document.getElementById("clearDateFilter").addEventListener("click", () => {
  dashboardDate.value = "";
  renderDashboard();
});

document.getElementById("year").textContent = new Date().getFullYear();
renderDashboard();
