// ===== LOAD SALONS =====
let salons = JSON.parse(localStorage.getItem("salons")) || [];

let searchInput = document.getElementById("salonSearchInput");
let suggestionsBox = document.getElementById("suggestionsBox");
let bookBtn = document.getElementById("bookSlotBtn");

let recentBox = document.getElementById("recentBox");
let recentList = document.getElementById("recentList");
let clearRecentBtn = document.getElementById("clearRecentBtn");

let selectedSalon = null;

// ===== Recent Searches Storage =====
let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");

function saveRecent(name) {
    recent = recent.filter(r => r !== name); // avoid duplicates
    recent.unshift(name); // add on top
    if (recent.length > 5) recent.pop(); // limit to 5
    localStorage.setItem("recentSearches", JSON.stringify(recent));
    renderRecent();
}

function renderRecent() {
    recentList.innerHTML = "";

    if (recent.length === 0) {
        recentBox.style.display = "none";
        return;
    }

    recentBox.style.display = "block";

    recent.forEach(name => {
        let div = document.createElement("div");
        div.textContent = name;
        div.onclick = () => {
            selectedSalon = name;
            searchInput.value = name;
            bookBtn.style.display = "block";
            suggestionsBox.style.display = "none";
        };
        recentList.appendChild(div);
    });
}
renderRecent();

// ===== CLEAR RECENT SEARCHES =====
clearRecentBtn.onclick = () => {
    recent = [];
    localStorage.setItem("recentSearches", "[]");
    renderRecent();
};

// ===== Show Suggestions =====
searchInput.addEventListener("input", function () {
    let val = this.value.toLowerCase();

    if (val === "") {
        suggestionsBox.style.display = "none";
        bookBtn.style.display = "none";
        return;
    }

    let filtered = salons.filter(s => s.name.toLowerCase().includes(val));
    suggestionsBox.innerHTML = "";

    if (filtered.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    filtered.forEach(salon => {
        let div = document.createElement("div");
        div.textContent = salon.name;

        div.onclick = () => {
            selectedSalon = salon.name;
            searchInput.value = salon.name;

            // hide suggestions
            suggestionsBox.style.display = "none";

            // show book slot
            bookBtn.style.display = "block";

            // save to recent searches
            saveRecent(salon.name);
        };

        suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
});

// ===== BOOK SLOT =====
bookBtn.onclick = function () {
    if (!selectedSalon) return;

    saveRecent(selectedSalon);

    window.location.href = "customer.html?salon=" + encodeURIComponent(selectedSalon);
};
