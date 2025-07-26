import {
  uploadImage,
  fetchImages,
  getImagePreview,
  deleteImage
} from "./appwrite.js";

const input = document.getElementById("image-input");
const gallery = document.getElementById("gallery");
const progressBar = document.getElementById("progress-bar");
const themeBtn = document.getElementById("toggle-theme");
const favBtn = document.getElementById("toggle-favorites");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewer-image");
const closeViewer = document.getElementById("close-viewer");
const circleElement = document.querySelector(".circle");
const music = document.getElementById("bg-music");
const toggleBtn = document.getElementById("audio-toggle");

// 👇 Viewer upload time
const viewerTime = document.createElement("div");
viewerTime.className = "viewer-time";
viewer.appendChild(viewerTime);

let showOnlyFav = false;

// ✅ Upload handler
input.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  progressBar.style.width = "0%";
  const reader = new FileReader();

  reader.onprogress = (e) => {
    const percent = (e.loaded / e.total) * 100;
    progressBar.style.width = `${percent}%`;
  };

  reader.onload = async () => {
    try {
      await uploadImage(file);
      progressBar.style.width = "100%";
      setTimeout(() => (progressBar.style.width = "0%"), 600);
      renderGallery();
    } catch (err) {
      alert("Upload failed.");
    }
  };

  reader.readAsDataURL(file);
});

// ✅ Gallery renderer
async function renderGallery() {
  try {
    const files = await fetchImages();
    gallery.innerHTML = "";

    files.forEach((file) => {
      const isFav = localStorage.getItem(`fav-${file.$id}`) === "true";
      if (showOnlyFav && !isFav) return;

      const imgURL = getImagePreview(file.$id);

      let uploadedDate = "Unknown";
      try {
        const timestamp = file.dateCreated || file.$createdAt;
        uploadedDate = new Date(timestamp).toLocaleString();
      } catch (e) {
        console.warn("Invalid date format:", file.dateCreated);
      }

      const div = document.createElement("div");
      div.className = "image-card";
      div.innerHTML = `
        <div class="image-wrapper">
          <img src="${imgURL}" alt="${file.name}" data-id="${file.$id}" data-time="${uploadedDate}" />
          <div class="upload-time">Uploaded: ${uploadedDate}</div>
        </div>
        <div class="controls">
          <span data-del="${file.$id}" title="Delete">🗑️</span>
          <span data-fav="${file.$id}" title="Favorite">❤️</span>
        </div>
      `;
      gallery.appendChild(div);
    });
  } catch (err) {
    gallery.innerHTML = "<p style='color: var(--highlight);'>Failed to load gallery.</p>";
  }
}

// ✅ Image Viewer, Deletion & Favorites
gallery.addEventListener("click", async (e) => {
  const delId = e.target.dataset.del;
  const favId = e.target.dataset.fav;
  const imgEl = e.target.closest(".image-card")?.querySelector("img");

  if (delId) {
    try {
      await deleteImage(delId);
      renderGallery();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  } else if (favId) {
    const isFav = localStorage.getItem(`fav-${favId}`) === "true";
    localStorage.setItem(`fav-${favId}`, !isFav);
    renderGallery();
  } else if (imgEl) {
    showImageInViewer(imgEl.src, imgEl.dataset.time);
  }
});

// ✅ Viewer function
function showImageInViewer(src, time) {
  viewerImg.src = src;
  viewerTime.textContent = time ? `Uploaded: ${time}` : "";
  viewer.classList.add("active");
}

closeViewer.addEventListener("click", () => {
  viewer.classList.remove("active");
  viewerImg.src = "";
  viewerTime.textContent = "";
});

// ✅ Theme toggle
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

// ✅ Favorites toggle
favBtn.addEventListener("click", () => {
  showOnlyFav = !showOnlyFav;
  favBtn.textContent = showOnlyFav ? "❤️ Favorites" : "📁 All";
  renderGallery();
});

// ✅ Audio Toggle
toggleBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    toggleBtn.textContent = "🔊";
  } else {
    music.pause();
    toggleBtn.textContent = "🔇";
  }
});

// ✅ Custom Cursor Animation
const mouse = { x: 0, y: 0 };
const previousMouse = { x: 0, y: 0 };
const circle = { x: 0, y: 0 };
let currentScale = 0;
let currentAngle = 0;

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  const speed = 0.17;

  const tick = () => {
    circle.x += (mouse.x - circle.x) * speed;
    circle.y += (mouse.y - circle.y) * speed;
    const translateTransform = `translate(${circle.x}px, ${circle.y}px)`;

    const deltaX = mouse.x - previousMouse.x;
    const deltaY = mouse.y - previousMouse.y;
    previousMouse.x = mouse.x;
    previousMouse.y = mouse.y;

    const velocity = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2) * 4, 150);
    const scaleValue = (velocity / 150) * 0.5;
    currentScale += (scaleValue - currentScale) * speed;
    const scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    if (velocity > 20) currentAngle = angle;
    const rotateTransform = `rotate(${currentAngle}deg)`;

    circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;
    requestAnimationFrame(tick);
  };

  tick();
});

renderGallery();
