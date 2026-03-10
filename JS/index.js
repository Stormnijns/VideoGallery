document.getElementById("protected").style.display="none";
document.getElementById("denied").style.display="block";

let inputKey = prompt("Decrypt key")
if (!isNaN(parseInt(inputKey)))
{
    document.getElementById("protected").style.display="block";
    document.getElementById("denied").style.display="none";
}

/* -------------------------------------------------------------
           VIDEO LIST
------------------------------------------------------------- */
const videos = [];

const gallery = document.getElementById("gallery");
const showMoreBtn = document.getElementById("showMoreBtn");
const searchInput = document.getElementById("searchInput");
const flipBtn = document.getElementById("flipBtn");
const videoList = document.getElementById("videoList");

const batchSize = 6;
let currentIndex = 0;
let filteredVideos = [...videos];
let flipped = false;
let currentKey = 0;

const CipherModule = {
    key: 6927,

    // Shift a single character
    shiftChar: function(c, shift) {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            // Uppercase A-Z
            return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
        }
        if (code >= 97 && code <= 122) {
            // Lowercase a-z
            return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
        }
        return c; // Non-alphabetic characters unchanged
    },

    // Encrypt a string with a given key
    encrypt: function(text, key) {
        return text.split('').map(c => this.shiftChar(c, key)).join('');
    },

    // Decrypt a string with a given key
    decrypt: function(text, key) {
        return this.encrypt(text, -key);
    }
};

function renderVideos(reset=false) {
    if (reset) {
        gallery.innerHTML = "";
        currentIndex = 0;
    }
    const next = filteredVideos.slice(currentIndex, currentIndex + batchSize);
    next.forEach(v => {
        const decryptedTitle = CipherModule.decrypt(v.title, inputKey - CipherModule.key)
        const encryptedUrl = CipherModule.encrypt(v.url, currentKey - inputKey)
        const div = document.createElement("div");
        div.className = "video-container";
        div.innerHTML = `
          <h3>${decryptedTitle}</h3>
          <iframe src="https://drive.google.com/file/d/${encryptedUrl}/preview" allowfullscreen></iframe>
        `;
        gallery.appendChild(div);
    });
    currentIndex += batchSize;
    showMoreBtn.style.display = currentIndex >= filteredVideos.length ? "none" : "inline-block";
}

function filterVideos() {
    const q = searchInput.value.trim().toLowerCase();
    filteredVideos = q === "" ? [...videos] : videos.filter(v => v.title.toLowerCase().includes(q));
    if (flipped) filteredVideos.reverse();
    renderVideos(true);
}

function buildVideoList() {
    videoList.innerHTML = "";

    const addedTitles = new Set();

    videos.forEach(v => {
        if (addedTitles.has(v.title)) return; // skip duplicate

        addedTitles.add(v.title);

        const decryptedTitle = CipherModule.decrypt(v.title, inputKey - CipherModule.key)
        const btn = document.createElement("button");
        btn.textContent = decryptedTitle;
        btn.onclick = () => {
            searchInput.value = v.title;
            filterVideos();
        };

        videoList.appendChild(btn);
    });
}

flipBtn.onclick = () => { flipped = !flipped; filteredVideos.reverse(); renderVideos(true); };

showMoreBtn.onclick = () => renderVideos();
searchInput.addEventListener("keypress", e => { if (e.key === "Enter") filterVideos(); });

buildVideoList();
renderVideos(true);


/* -------------------------------------------------------------
   IMAGE ALBUM (iframe + overlay)
------------------------------------------------------------- */
const images = [];

const imgGallery = document.getElementById("imgGallery");
const showMoreImgBtn = document.getElementById("showMoreImgBtn");
const searchImgInput = document.getElementById("searchImgInput");
const flipImgBtn = document.getElementById("flipImgBtn");
const imageList = document.getElementById("imageList");

let imgIndex = 0;
const imgBatchSize = 9;
let filteredImages = [...images];
let imgFlipped = false;

function renderImages(reset=false) {
    if (reset) {
        imgGallery.innerHTML = "";
        imgIndex = 0;
    }

    const next = filteredImages.slice(imgIndex, imgIndex + imgBatchSize);
    next.forEach(img => {
        const decryptedTitle = CipherModule.decrypt(img.title, inputKey - CipherModule.key)

        const div = document.createElement("div");
        div.className = "video-container";
        div.innerHTML = `
          <h3>${decryptedTitle}</h3>
          <div class="iframeWrapper">
            <iframe class="imageFrame" src="https://drive.google.com/file/d/${img.url}/preview"></iframe>
            <div class="iframeClickLayer" data-url="${img.url}"></div>
          </div>
        `;
        imgGallery.appendChild(div);
    });

    imgIndex += imgBatchSize;
    showMoreImgBtn.style.display = imgIndex >= filteredImages.length ? "none" : "inline-block";

    hookLightbox();
}

function filterImages() {
    const q = searchImgInput.value.trim().toLowerCase();
    filteredImages = q === "" ? [...images] : images.filter(i => i.title.toLowerCase().includes(q));
    if (imgFlipped) filteredImages.reverse();
    renderImages(true);
}

function buildImageList() {
    imageList.innerHTML = "";

    const addedTitles = new Set();

    images.forEach(i => {
        if (addedTitles.has(i.title)) return; // skip duplicate

        addedTitles.add(i.title);

        const btn = document.createElement("button");
        btn.textContent = i.title;
        btn.onclick = () => {
            searchImgInput.value = i.title;
            filterImages();
        };

        imageList.appendChild(btn);
    });
}


flipImgBtn.onclick = () => { imgFlipped = !imgFlipped; filteredImages.reverse(); renderImages(true); };

showMoreImgBtn.onclick = () => renderImages();
searchImgInput.addEventListener("keypress", e => { if (e.key === "Enter") filterImages(); });

buildImageList();
renderImages(true);


/* -------------------------------------------------------------
   LIGHTBOX USING IFRAME
------------------------------------------------------------- */
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxFrame = document.getElementById("lightboxFrame");

function hookLightbox() {
    document.querySelectorAll(".iframeClickLayer").forEach(layer => {
        layer.onclick = () => {
            lightboxFrame.src = layer.dataset.url;
            lightboxOverlay.style.display = "flex";
        };
    });
}

lightboxOverlay.onclick = () => {
    lightboxOverlay.style.display = "none";
    lightboxFrame.src = "";
};

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        lightboxOverlay.style.display = "none";
        lightboxFrame.src = "";
    }
});

// Done Loading

const dropZone = document.getElementById('dropZone');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => e.preventDefault());
    document.body.addEventListener(eventName, e => e.preventDefault());
});

// Highlight drop area when file is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('hover'));
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('hover'));
});

// Handle dropped files
dropZone.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];

        if (file.type === "application/json" || file.name.endsWith(".json")) {
            const reader = new FileReader();

            reader.onload = function(event) {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    currentKey = jsonData.key;
                    // Check that the JSON has the expected structure
                    if (!jsonData.v || !Array.isArray(jsonData.v)) {
                        console.error("JSON must have a 'v' array");
                        return;
                    }

                    console.log("JSON data:", jsonData.v);

                    // Replace videos array
                    videos.length = 0;
                    videos.push(...jsonData.v);

                    // Reset filteredVideos and gallery
                    filteredVideos = [...videos];
                    renderVideos(true);
                    buildVideoList();

                } catch (err) {
                    console.error("Invalid JSON file:", err);
                }
            };

            reader.readAsText(file);
        } else {
            console.error("Please drop a JSON file.");
        }
    }
});