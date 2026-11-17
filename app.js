// app.js
// The Daily Grind - Cafe Website

const API_URL = "/api/menu";

const menuGrid = document.querySelector("#menu-grid");
const filterButtons = document.querySelectorAll("[data-category]");

let menuItems = [];

/* =========================================================
   1. FETCH MENU DATA
   ========================================================= */

async function fetchMenu() {
  try {
    if (!menuGrid) return;

    menuGrid.innerHTML = "<p>Loading menu...</p>";

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    menuItems = await response.json();
    renderMenu(menuItems);
  } catch (error) {
    console.error("Could not load menu:", error);

    if (menuGrid) {
      menuGrid.innerHTML =
        "<p>Sorry, we couldn't load the menu. Please try again later.</p>";
    }
  }
}

/* =========================================================
   2. RENDER MENU CARDS
   Expected API item:
   {
      id: 1,
      name: "Cappuccino",
      description: "Espresso with steamed milk",
      price: 180,
      category: "coffee",
      image: "/images/cappuccino.jpg"
   }
   ========================================================= */

function renderMenu(items) {
  if (!menuGrid) return;

  menuGrid.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    menuGrid.innerHTML = "<p>No menu items found.</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.classList.add("menu-card");

    // Image
    if (item.image) {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.name || "Cafe menu item";
      image.loading = "lazy";

      card.appendChild(image);
    }

    // Name
    const name = document.createElement("h3");
    name.textContent = item.name || "Unnamed Item";

    // Description
    const description = document.createElement("p");
    description.classList.add("menu-description");
    description.textContent = item.description || "";

    // Price
    const price = document.createElement("p");
    price.classList.add("menu-price");

    const numericPrice = Number(item.price);

    price.textContent = Number.isFinite(numericPrice)
      ? `₹${numericPrice.toFixed(2)}`
      : "Price unavailable";

    card.append(name, description, price);
    menuGrid.appendChild(card);
  });
}

/* =========================================================
   3. FILTER MENU BY CATEGORY
   Example HTML:

   <button data-category="all">All</button>
   <button data-category="coffee">Coffee</button>
   <button data-category="tea">Tea</button>
   <button data-category="food">Food</button>
   ========================================================= */

function filterMenu(category) {
  if (category === "all") {
    renderMenu(menuItems);
    return;
  }

  const filteredItems = menuItems.filter(
    (item) =>
      String(item.category).toLowerCase() ===
      String(category).toLowerCase()
  );

  renderMenu(filteredItems);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    filterMenu(category);

    // Update active button
    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
  });
});

/* =========================================================
   4. CUSTOMER REVIEW / LOCAL STORAGE
   ========================================================= */

/**
 * Saves a customer review locally.
 *
 * Example:
 *
 * saveCustomerReview({
 *   fullName: "Rahul Sharma",
 *   email: "rahul@example.com",
 *   rating: 5,
 *   review: "Excellent coffee!",
 *   orderHistory: [
 *      { item: "Cappuccino", quantity: 2 },
 *      { item: "Croissant", quantity: 1 }
 *   ],
 *   consentToStore: true
 * });
 */

function saveCustomerReview({
  fullName,
  email,
  rating,
  review,
  orderHistory = [],
  consentToStore = false
}) {
  // Validate required fields
  if (!fullName?.trim()) {
    throw new Error("Customer full name is required.");
  }

  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!consentToStore) {
    throw new Error(
      "Customer consent is required before storing personal information."
    );
  }

  const reviewData = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,

    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),

    rating: Number(rating) || 0,
    review: review?.trim() || "",

    orderHistory: Array.isArray(orderHistory)
      ? orderHistory
      : [],

    createdAt: new Date().toISOString()
  };

  const reviews = getCustomerReviews();

  reviews.push(reviewData);

  localStorage.setItem(
    "dailyGrindCustomerReviews",
    JSON.stringify(reviews)
  );

  return reviewData;
}


/* =========================================================
   5. GET SAVED REVIEWS
   ========================================================= */

function getCustomerReviews() {
  try {
    const storedReviews = localStorage.getItem(
      "dailyGrindCustomerReviews"
    );

    return storedReviews
      ? JSON.parse(storedReviews)
      : [];
  } catch (error) {
    console.error("Could not read customer reviews:", error);
    return [];
  }
}


/* =========================================================
   6. EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


/* =========================================================
   7. OPTIONAL REVIEW FORM HANDLER

   Expected IDs:

   #review-form
   #full-name
   #email
   #rating
   #review
   #storage-consent
   #review-message
   ========================================================= */

const reviewForm = document.querySelector("#review-form");

if (reviewForm) {
  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const fullName =
      document.querySelector("#full-name")?.value || "";

    const email =
      document.querySelector("#email")?.value || "";

    const rating =
      document.querySelector("#rating")?.value || 0;

    const review =
      document.querySelector("#review")?.value || "";

    const consentToStore =
      document.querySelector("#storage-consent")?.checked || false;

    const message =
      document.querySelector("#review-message");

    try {
      saveCustomerReview({
        fullName,
        email,
        rating,
        review,

        // Replace this with the customer's real
        // order data from your application.
        orderHistory: [],

        consentToStore
      });

      if (message) {
        message.textContent =
          "Thank you! Your review has been saved.";
      }

      reviewForm.reset();

    } catch (error) {
      if (message) {
        message.textContent = error.message;
      }

      console.error(error);
    }
  });
}


/* =========================================================
   8. INITIALIZE WEBSITE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  fetchMenu();
});
