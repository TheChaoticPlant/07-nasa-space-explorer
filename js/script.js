// NASA APOD API key (use DEMO_KEY for learning/demo purposes)
const API_KEY = 'ZGZid3rNICEfkDkdZJsWnmvs5mpcRFMn3t6NhBCd';

// Get references to DOM elements
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Array of beginner-friendly "Did You Know?" facts
const didYouKnowFacts = [
  "Did you know? NASA's Hubble Space Telescope has been in orbit since 1990.",
  "Did you know? The first person on the Moon was Neil Armstrong in 1969.",
  "Did you know? NASA stands for National Aeronautics and Space Administration.",
  "Did you know? The Sun is about 93 million miles away from Earth.",
  "Did you know? Jupiter is the largest planet in our solar system.",
  "Did you know? NASA's Mars rovers have been exploring the Red Planet for over 20 years.",
  "Did you know? The International Space Station orbits Earth every 90 minutes.",
  "Did you know? Saturn's rings are made mostly of ice and rock.",
  "Did you know? NASA was founded in 1958.",
  "Did you know? The Milky Way galaxy is home to over 100 billion stars."
];

// Show a random "Did You Know?" fact when the page loads
window.addEventListener('DOMContentLoaded', () => {
  // Pick a random fact from the array
  const randomIndex = Math.floor(Math.random() * didYouKnowFacts.length);
  const fact = didYouKnowFacts[randomIndex];

  // Create a div for the fact and add it above the gallery
  const factDiv = document.createElement('div');
  factDiv.className = 'did-you-know';
  factDiv.textContent = fact;

  // Insert the fact at the top of the gallery
  gallery.innerHTML = '';
  gallery.appendChild(factDiv);
});

// Listen for button click to fetch images
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    gallery.innerHTML = '<p>Please select both start and end dates.</p>';
    return;
  }

  // Show loading message while fetching data
  gallery.innerHTML = '<p>Loading images...</p>';

  // Fetch APOD images for the selected date range
  fetchAPODImages(startDate, endDate);
});

// Function to fetch APOD images for up to 9 days in the selected range
function fetchAPODImages(start, end) {
  // Convert dates to Date objects
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Calculate the number of days between the dates (inclusive)
  const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  // Limit to 9 days maximum
  const numDays = Math.min(daysDiff, 9);

  // Create an array of date strings for the API
  const dates = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    // Format date as YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }

  // Build API URL with start_date and end_date
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${dates[0]}&end_date=${dates[dates.length - 1]}`;

  // Fetch data from NASA APOD API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Check if we got an error
      if (data.error) {
        gallery.innerHTML = `<p>Error: ${data.error.message}</p>`;
        return;
      }

      // Display images in the gallery
      displayImages(data);
    })
    .catch(error => {
      gallery.innerHTML = `<p>Failed to fetch images. Please try again later.</p>`;
    });
}

// Function to display APOD images in the gallery
function displayImages(images) {
  // If only one image is returned, put it in an array
  const imageList = Array.isArray(images) ? images : [images];

  // Only show items that are images (not videos)
  const imageItems = imageList.filter(item => item.media_type === 'image');

  // If there are no images, show a message
  if (imageItems.length === 0) {
    gallery.innerHTML = '<p>No images found for these dates.</p>';
    return;
  }

  // Create HTML for each image (up to 9)
  let html = '';
  imageItems.slice(0, 9).forEach((item, index) => {
    html += `
      <div class="apod-card">
        <img 
          src="${item.url}" 
          alt="${item.title}" 
          data-index="${index}" 
          class="apod-thumb"
          style="cursor:pointer;"
        />
        <h3>${item.title}</h3>
        <p>${item.date}</p>
      </div>
    `;
  });

  // Show the images in the gallery (removes loading message)
  gallery.innerHTML = html;

  // Add click event to each image to open modal
  const thumbs = document.querySelectorAll('.apod-thumb');
  thumbs.forEach((img, idx) => {
    img.addEventListener('click', () => {
      openModal(imageItems[idx]);
    });
  });
}

// Function to create and show a modal with title, date, and explanation (no image)
function openModal(item) {
  // Create modal background
  const modalBg = document.createElement('div');
  modalBg.className = 'apod-modal-bg';

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'apod-modal-content';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'apod-modal-close';
  closeBtn.textContent = '×';
  closeBtn.title = 'Close';

  // Modal HTML content (no image, text is black)
  modalContent.innerHTML = `
    <h2>${item.title}</h2>
    <p><strong>Date:</strong> ${item.date}</p>
    <p>${item.explanation}</p>
  `;
  modalContent.appendChild(closeBtn);

  // Add everything to modal background
  modalBg.appendChild(modalContent);
  document.body.appendChild(modalBg);

  // Close modal on click of close button or background
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modalBg);
  });
  modalBg.addEventListener('click', (e) => {
    if (e.target === modalBg) {
      document.body.removeChild(modalBg);
    }
  });
}

// Set up the date pickers using the helper from dateRange.js
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
