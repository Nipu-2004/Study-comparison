// GET TODAY'S DATE

function today() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000)
        .toISOString().split("T")[0];
}

const appVersion = "1.0.0";
const appVersionElement = document.getElementById("appVersion");
if (appVersionElement) {
    appVersionElement.textContent = `Version ${appVersion}`;
}

const todayDate = today();
document.getElementById("wakeDate").value = todayDate;
document.getElementById("studyDate").value = todayDate;
document.getElementById("dayTotalDate").value = todayDate;
document.getElementById("wakeDate").max = todayDate;
document.getElementById("studyDate").max = todayDate;
document.getElementById("dayTotalDate").max = todayDate;

function isTodayOrPast(dateString) {
    if (!dateString) return false;
    return dateString <= today();
}

function getUserName() {
    const storedName = localStorage.getItem("studyTrackerUserName");
    if (storedName && storedName.trim()) {
        return storedName.trim();
    }

    return "Student";
}

function updateUserNameDisplay(userName = getUserName()) {
    const headerName = document.getElementById("headerUserName");
    const welcomeName = document.getElementById("welcomeName");

    if (headerName) {
        headerName.textContent = userName;
    }

    if (welcomeName) {
        welcomeName.textContent = userName;
    }
}

function applyTheme(themeName) {
    const validThemes = ["pink", "blue", "green", "purple"];
    const selectedTheme = validThemes.includes(themeName) ? themeName : "pink";

    document.body.dataset.theme = selectedTheme;

    const themeSelect = document.getElementById("themeSelect");
    if (themeSelect) {
        themeSelect.value = selectedTheme;
    }

    localStorage.setItem("studyTrackerTheme", selectedTheme);
}

function showNameModal() {
    const modal = document.getElementById("nameModal");
    const input = document.getElementById("userNameInput");
    if (!modal || !input) return;

    const savedName = getUserName();
    if (savedName && savedName.trim()) {
        updateUserNameDisplay(savedName);
        modal.classList.add("hidden");
        return;
    }

    modal.classList.remove("hidden");
    input.value = "";
    setTimeout(() => input.focus(), 50);
}

function saveUserName(name) {
    const finalName = (name && name.trim()) ? name.trim() : "Student";
    localStorage.setItem("studyTrackerUserName", finalName);
    updateUserNameDisplay(finalName);
    document.getElementById("nameModal")?.classList.add("hidden");
}

const nameForm = document.getElementById("nameForm");
if (nameForm) {
    nameForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = document.getElementById("userNameInput");
        saveUserName(input?.value || "Student");
    });
}

document.getElementById("changeNameBtn")?.addEventListener("click", function () {
    const modal = document.getElementById("nameModal");
    const input = document.getElementById("userNameInput");
    if (!modal || !input) return;

    const currentName = getUserName();
    input.value = currentName === "Student" ? "" : currentName;
    modal.classList.remove("hidden");
    setTimeout(() => input.focus(), 50);
});

const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");

menuToggle?.addEventListener("click", function () {
    const isHidden = menuPanel?.classList.toggle("hidden");
    this.setAttribute("aria-expanded", String(!isHidden));
});

document.addEventListener("click", function (event) {
    if (!menuToggle || !menuPanel) return;

    if (!menuToggle.contains(event.target) && !menuPanel.contains(event.target)) {
        menuPanel.classList.add("hidden");
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

updateUserNameDisplay();
applyTheme(localStorage.getItem("studyTrackerTheme") || "pink");

document.getElementById("themeSelect")?.addEventListener("change", function (event) {
    applyTheme(event.target.value);
});

document.getElementById("clearDataBtn")?.addEventListener("click", function () {
    const confirmed = window.confirm("This will clear all saved study data and restart the app. Continue?");
    if (!confirmed) return;

    localStorage.clear();
    wakeRecords = {};
    studyRecords = [];
    dayTotalRecords = [];
    currentGraph = "daily";
    currentRange = "week";
    currentMonth = today().slice(0, 7);
    motivationIndex = 0;

    applyTheme("pink");
    updateUserNameDisplay("Student");
    updateStudyMilestone(0);
    showNameModal();
    updateDashboard();

    if (menuPanel) {
        menuPanel.classList.add("hidden");
    }
    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

showNameModal();

// LOAD SAVED DATA

let wakeRecords = JSON.parse(
    localStorage.getItem("wakeRecords") || "{}"
);

let studyRecords = JSON.parse(
    localStorage.getItem("studyRecords") || "[]"
);

let dayTotalRecords = JSON.parse(
    localStorage.getItem("dayTotalRecords") || "[]"
);

let currentGraph = "daily";
let currentRange = "week";
let currentMonth = today().slice(0, 7);
let motivationIndex = Number(localStorage.getItem("motivationIndex") || 0);

const motivationQuotes = [
    "Your dreams are worth the effort.",
    "Small steps still move you forward.",
    "You are stronger than yesterday.",
    "Be proud of every lesson you learn.",
    "Grace grows when you keep going.",
    "Your hard work is blooming beautifully.",
    "Confidence looks good on you.",
    "A calm heart can still win big goals.",
    "You are creating your own magic.",
    "Keep shining, even in quiet moments.",
    "Every page you turn is progress.",
    "Your future is built by today's effort.",
    "Dream big and study brave.",
    "Your effort is never wasted.",
    "Beauty and brains are a powerful mix.",
    "You are becoming the girl you admire.",
    "You can do hard things with heart.",
    "Your focus is your superpower.",
    "Little wins add up to big dreams.",
    "A lovely mind learns with courage.",
    "You are already more capable than you think.",
    "Progress is beautiful.",
    "Keep your sparkle and your discipline.",
    "Your goals are waiting for your courage.",
    "The best version of you is still growing.",
    "You are doing amazing, sweet girl.",
    "Strong effort creates beautiful results.",
    "One more step is still a win.",
    "Your ambition is your light.",
    "Your journey is full of purpose.",
    "Beautiful goals deserve beautiful effort.",
    "You are growing through every challenge.",
    "Every study session strengthens your future.",
    "You are radiant when you keep learning.",
    "Your effort paints a brighter future.",
    "Keep choosing progress over perfection.",
    "Your sparkle is powered by determination.",
    "You are becoming unstoppable.",
    "The dream feels closer with each step.",
    "Your dedication is inspiring.",
    "You are wise, bold, and full of potential.",
    "Consistency turns dreams into reality.",
    "Your story is still being written beautifully.",
    "You grow stronger every time you try.",
    "Keep believing in your pace.",
    "You are capable of so much more.",
    "A bright future starts with today's choices.",
    "The effort you give today becomes your tomorrow."
];

function buildStudyGirlArt(index) {
    const paletteSets = [
        ["#f6e7d2", "#dfe9d8", "#a0d39a", "#d36d7d", "#f5c7a8", "#5b4a3d", "#f9d678", "#d29c6a", "#eadfca"],
        ["#f0ebd7", "#d4e7d6", "#9ec8b5", "#f2b5b5", "#f6d9b7", "#5d4538", "#f4c56b", "#c88d6d", "#dfe7d9"],
        ["#f8e8d0", "#dbead7", "#b5d7a8", "#f498a8", "#f1c59a", "#5b4336", "#f6d578", "#c9926f", "#edf1dd"],
        ["#f4eae8", "#dceee0", "#a9d3bf", "#e3a8b5", "#f8d6b0", "#5f4f47", "#f2d17a", "#bf7d63", "#f2ede7"]
    ];

    const colors = paletteSets[index % paletteSets.length];
    const bg = colors[0];
    const desk = colors[1];
    const grass = colors[2];
    const shirt = colors[3];
    const skin = colors[4];
    const hair = colors[5];
    const sparkle = colors[6];
    const book = colors[7];
    const paper = colors[8];

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
          <defs>
            <linearGradient id="bg-${index}" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stop-color="${bg}"/>
              <stop offset="100%" stop-color="#f8f4ef"/>
            </linearGradient>
          </defs>
          <rect width="600" height="420" fill="url(#bg-${index})"/>
          <circle cx="120" cy="90" r="32" fill="#ffffff" opacity="0.35"/>
          <circle cx="500" cy="80" r="24" fill="#ffffff" opacity="0.25"/>
          <circle cx="490" cy="280" r="20" fill="#ffffff" opacity="0.22"/>

          <g transform="translate(35 150)">
            <path d="M70 175 L450 175 L500 230 L20 230 Z" fill="${desk}"/>
            <path d="M60 175 L100 110 L210 110 L160 175 Z" fill="#c5a46d" opacity="0.75"/>
            <path d="M245 175 L380 110 L470 110 L420 175 Z" fill="#b99562" opacity="0.8"/>
            <path d="M230 127 L300 75 L390 125 L330 175 Z" fill="#a6c68a" opacity="0.8"/>
            <path d="M170 130 L230 75 L300 75 L240 130 Z" fill="#8bb07d" opacity="0.8"/>

            <g transform="translate(210 12)">
              <path d="M50 50 L80 20 L110 50 L110 150 L50 150 Z" fill="${book}" opacity="0.9"/>
              <path d="M25 60 L52 32 L78 60 L80 150 L25 150 Z" fill="#a86d43" opacity="0.9"/>
              <path d="M55 80 Q80 92 105 80" stroke="#f6e9d8" stroke-width="4" fill="none"/>
              <path d="M48 94 Q80 103 111 94" stroke="#f6e9d8" stroke-width="4" fill="none"/>
              <path d="M70 30 L120 30" stroke="#d29f71" stroke-width="5"/>
            </g>

            <g transform="translate(305 30)">
              <path d="M0 0 L80 0 L120 38 L42 38 Z" fill="#9ab467"/>
              <path d="M0 0 L42 38 L42 110 L0 86 Z" fill="#7b9d57"/>
              <path d="M120 38 L120 110 L42 110 L42 38 Z" fill="#8fa848"/>
              <path d="M0 86 L42 110 L120 110 L80 86 Z" fill="#6f8a47"/>
            </g>

            <g transform="translate(155 62)">
              <path d="M110 82 L135 30 L180 30 L205 82 L188 130 L128 130 Z" fill="${shirt}"/>
              <path d="M110 82 Q150 45 188 82" fill="${shirt}"/>
              <circle cx="150" cy="28" r="28" fill="${skin}"/>
              <path d="M124 28 Q150 -6 176 28" fill="${hair}"/>
              <path d="M140 10 Q150 0 160 10" stroke="#4e3a2f" stroke-width="3" fill="none"/>
              <path d="M136 34 Q150 42 164 34" stroke="#6c4b37" stroke-width="3" fill="none"/>
              <circle cx="140" cy="30" r="4" fill="#4a3a33"/>
              <circle cx="160" cy="30" r="4" fill="#4a3a33"/>
              <path d="M144 50 Q150 56 156 50" stroke="#9d5f62" stroke-width="3" fill="none" stroke-linecap="round"/>

              <path d="M128 132 L120 175" stroke="#5b4336" stroke-width="9" stroke-linecap="round"/>
              <path d="M172 132 L180 175" stroke="#5b4336" stroke-width="9" stroke-linecap="round"/>
              <path d="M126 175 L98 215" stroke="#5b4336" stroke-width="9" stroke-linecap="round"/>
              <path d="M176 175 L200 215" stroke="#5b4336" stroke-width="9" stroke-linecap="round"/>

              <path d="M150 130 L150 215" stroke="#5b4336" stroke-width="9" stroke-linecap="round"/>
              <path d="M112 138 L88 164" stroke="#5b4336" stroke-width="8" stroke-linecap="round"/>
              <path d="M188 138 L212 164" stroke="#5b4336" stroke-width="8" stroke-linecap="round"/>
              <path d="M112 214 L95 255" stroke="#5b4336" stroke-width="10" stroke-linecap="round"/>
              <path d="M188 214 L205 255" stroke="#5b4336" stroke-width="10" stroke-linecap="round"/>

              <path d="M110 92 L75 118" stroke="#f5d4cb" stroke-width="12" stroke-linecap="round"/>
              <path d="M188 92 L220 118" stroke="#f5d4cb" stroke-width="12" stroke-linecap="round"/>

              <path d="M50 245 L230 245" stroke="#a88d6b" stroke-width="6" opacity="0.35"/>
              <path d="M70 120 L106 120" stroke="#f1ab9a" stroke-width="10" stroke-linecap="round"/>
            </g>
          </g>

          <g transform="translate(450 110)">
            <rect x="0" y="0" width="80" height="80" rx="8" fill="#f4ebdc" transform="rotate(12 40 40)"/>
            <path d="M20 18 L60 18 M20 31 L60 31 M20 44 L51 44" stroke="#d7a95e" stroke-width="4" stroke-linecap="round"/>
            <path d="M17 62 L62 62" stroke="#d7a95e" stroke-width="4" stroke-linecap="round"/>
          </g>

          <g transform="translate(130 280)">
            <path d="M0 40 L48 0 L86 40 L86 72 L0 72 Z" fill="#e6a5b9" opacity="0.9"/>
            <path d="M14 20 L32 0 L85 0 L60 22 Z" fill="#f8d0b9"/>
          </g>

          <g fill="${sparkle}" opacity="0.85">
            <path d="M80 52 L90 78 L116 68 L90 90 L100 116 L80 96 L58 116 L68 90 L44 78 L68 68 Z"/>
            <path d="M500 120 L506 136 L522 130 L508 146 L514 162 L500 150 L486 162 L492 146 L478 130 L494 136 Z"/>
          </g>

          <text x="300" y="380" text-anchor="middle" font-size="32" fill="#6a4c54" font-family="Arial, sans-serif" font-weight="700">shine</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const motivationImageFiles = [
    "popup-attached-image.jpg",
    "🌙 Just a Girl With Big Dreams.jpg",
    "🌷 A Little World of Cozy Moments.jpg",
    "🌸 Cute Little Girl Vibing Sticker 🎀.jpg",
    "ASHU.jpg",
    "be your own vibe.jpg",
    "clipart girl writing.jpg",
    "Cute Busy Cat Sticker.jpg",
    "Cute Girl and Puppy Sticker _ Kawaii Aesthetic.jpg",
    "download (1).jpg",
    "download (2).jpg",
    "download (3).jpg",
    "download (4).jpg",
    "download (5).jpg",
    "download (6).jpg",
    "download.jpg",
    "just vibing 🫠.jpg",
    "popup-girl-study.png",
    "Progress Not Perfection _ Cozy Study Girl Aesthetic Sticker.jpg",
    "Stickers.jpg",
    "study mode sticker cute aesthetic blue book sticker for students.jpg",
    "อินฟูล.jpg"
];

const motivationImageFolder = "./New folder";
const motivationImages = motivationImageFiles.map((file) => `${motivationImageFolder}/${encodeURI(file)}`);

const motivationLibrary = Array.from({ length: 48 }, (_, index) => ({
    quote: motivationQuotes[index],
    image: motivationImages[index % motivationImages.length]
}));

const studyMilestoneImages = [
    { hours: 20, image: "./New folder/07.jpg", label: "Level 7: 20 hours complete" },
    { hours: 15, image: "./New folder/06.jpg", label: "Level 6: 15 hours complete" },
    { hours: 10, image: "./New folder/05.jpg", label: "Level 5: 10 hours complete" },
    { hours: 5, image: "./New folder/04.jpg", label: "Level 4: 5 hours complete" },
    { hours: 3, image: "./New folder/03.jpg", label: "Level 3: 3 hours complete" },
    { hours: 2, image: "./New folder/02.jpg", label: "Level 2: 2 hours complete" },
    { hours: 1, image: "./New folder/01.jpg", label: "Level 1: 1 hour complete" }
];

function getStudyMilestone(hours) {
    const sessionHours = Number(hours) || 0;
    return [...studyMilestoneImages].sort((a, b) => a.hours - b.hours)
        .reverse()
        .find(item => sessionHours >= item.hours) || null;
}

function updateStudyMilestone(hours) {
    const totalHours = Array.isArray(studyRecords)
        ? studyRecords.reduce((sum, record) => sum + Number(record.duration || 0), 0)
        : 0;

    const milestone = getStudyMilestone(typeof hours === "number" ? hours : totalHours);

    if (!milestone) {
        return;
    }
}

updateStudyMilestone(studyRecords.at(-1)?.duration || 0);

function getMonthOptions() {
    const months = new Set();

    studyRecords.forEach(record => {
        if (record.date) months.add(record.date.slice(0, 7));
    });

    dayTotalRecords.forEach(record => {
        if (record.date) months.add(record.date.slice(0, 7));
    });

    months.add(currentMonth);

    const sorted = [...months].sort();
    return sorted;
}

function populateMonthSelector() {
    const monthPicker = document.getElementById("monthPicker");
    if (!monthPicker) return;

    const options = getMonthOptions();
    monthPicker.innerHTML = options.map(month => {
        const label = new Date(month + "-01T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
        return `<option value="${month}">${label}</option>`;
    }).join("");

    if (!options.includes(currentMonth)) {
        currentMonth = options[options.length - 1] || today().slice(0, 7);
    }

    monthPicker.value = currentMonth;
}

function showMotivationPopup() {
    const modal = document.getElementById("motivationModal");
    if (!modal) return;

    const item = motivationLibrary[motivationIndex % motivationLibrary.length];
    const imageEl = document.getElementById("motivationImage");
    const quoteEl = document.getElementById("motivationQuote");

    imageEl.onerror = () => {
        imageEl.src = buildStudyGirlArt(motivationIndex);
    };

    imageEl.src = item.image;
    quoteEl.textContent = item.quote;
    modal.classList.remove("hidden");

    motivationIndex = (motivationIndex + 1) % motivationLibrary.length;
    localStorage.setItem("motivationIndex", String(motivationIndex));
}

function hideMotivationPopup() {
    const modal = document.getElementById("motivationModal");
    if (!modal) return;
    modal.classList.add("hidden");
}

// SAVE DATA

function saveData() {

    localStorage.setItem(
        "wakeRecords",
        JSON.stringify(wakeRecords)
    );

    localStorage.setItem(
        "studyRecords",
        JSON.stringify(studyRecords)
    );

    localStorage.setItem(
        "dayTotalRecords",
        JSON.stringify(dayTotalRecords)
    );

}


// MORNING WAKE-UP TRACKER

document.getElementById("wakeForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const date = document.getElementById("wakeDate").value;
    const time = document.getElementById("wakeTime").value;

    if (!isTodayOrPast(date)) {
        document.getElementById("wakeMessage").textContent = "You can only save wake-up times for today or past dates.";
        return;
    }

    wakeRecords[date] = time;

    saveData();

    document.getElementById("wakeMessage")
        .textContent = "Wake-up time saved successfully!";

    showMotivationPopup();
    updateDashboard();

});


// ADD STUDY SESSION

document.getElementById("studyForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const date = document.getElementById("studyDate").value;
    const subject = document.getElementById("subject").value.trim();
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;

    if (!isTodayOrPast(date)) {
        document.getElementById("studyMessage").textContent = "You can only add study sessions for today or past dates.";
        return;
    }

    let startMinutes =
        Number(start.split(":")[0]) * 60 +
        Number(start.split(":")[1]);

    let endMinutes =
        Number(end.split(":")[0]) * 60 +
        Number(end.split(":")[1]);

    // HANDLE OVERNIGHT STUDY

    if (endMinutes <= startMinutes) {
        endMinutes += 1440;
    }

    const duration = (endMinutes - startMinutes) / 60;

    if (duration > 12) {
        document.getElementById("studyMessage")
            .textContent = "Please enter a session shorter than 12 hours.";
        return;
    }

    const session = {
        id: Date.now(),
        date: date,
        subject: subject,
        start: start,
        end: end,
        duration: duration
    };

    studyRecords.push(session);

    saveData();

    updateStudyMilestone(duration);

    document.getElementById("studyMessage")
        .textContent = "Study session added successfully!";

    showMotivationPopup();

    document.getElementById("studyForm").reset();

    document.getElementById("studyDate").value = today();

    updateDashboard();

});


// ADD END-OF-DAY TOTAL

document.getElementById("dayTotalForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const date = document.getElementById("dayTotalDate").value;
    const totalHours = Number(document.getElementById("dayTotalHours").value);

    if (!isTodayOrPast(date)) {
        document.getElementById("comparisonMessage").textContent = "You can only add end-of-day totals for today or past dates.";
        return;
    }

    if (!date || Number.isNaN(totalHours)) {
        document.getElementById("comparisonMessage")
            .textContent = "Please enter valid values for all fields.";
        return;
    }

    if (totalHours < 0) {
        document.getElementById("comparisonMessage")
            .textContent = "Hours cannot be negative.";
        return;
    }

    const existingIndex = dayTotalRecords.findIndex(record => record.date === date);

    if (existingIndex >= 0) {
        dayTotalRecords[existingIndex].totalHours = totalHours;
    } else {
        dayTotalRecords.push({
            id: Date.now(),
            date: date,
            totalHours: totalHours
        });
    }

    saveData();

    document.getElementById("comparisonMessage")
        .textContent = "End-of-day total saved successfully!";

    showMotivationPopup();

    document.getElementById("dayTotalForm").reset();
    document.getElementById("dayTotalDate").value = today();

    updateDashboard();

});


document.querySelectorAll(".toggle-btn[data-graph]").forEach(button => {
    button.addEventListener("click", function() {
        currentGraph = this.dataset.graph;

        document.querySelectorAll(".toggle-btn[data-graph]").forEach(btn => {
            btn.classList.toggle("active", btn === this);
        });

        const chartDescription = document.getElementById("chartDescription");

        if (currentRange === "week") {
            chartDescription.textContent = "Shows the actual study time added for the last 7 days.";
        } else if (currentGraph === "daily") {
            chartDescription.textContent = "Shows the actual study time added for each day in the selected month.";
        } else {
            chartDescription.textContent = "Compare your daily study time with your end-of-day total study hours for the selected month.";
        }

        updateDashboard();
    });
});

document.querySelectorAll(".toggle-btn[data-range]").forEach(button => {
    button.addEventListener("click", function() {
        currentRange = this.dataset.range;

        document.querySelectorAll(".toggle-btn[data-range]").forEach(btn => {
            btn.classList.toggle("active", btn === this);
        });

        const chartDescription = document.getElementById("chartDescription");

        if (currentRange === "week") {
            chartDescription.textContent = "Shows the actual study time added for the last 7 days.";
        } else if (currentGraph === "daily") {
            chartDescription.textContent = "Shows the actual study time added for each day in the selected month.";
        } else {
            chartDescription.textContent = "Compare your daily study time with your end-of-day total study hours for the selected month.";
        }

        updateDashboard();
    });
});

const monthPicker = document.getElementById("monthPicker");
if (monthPicker) {
    monthPicker.addEventListener("change", function() {
        currentMonth = this.value;
        updateDashboard();
    });
}

document.getElementById("closeMotivation")?.addEventListener("click", hideMotivationPopup);
document.getElementById("motivationModal")?.addEventListener("click", function(event) {
    if (event.target === this) {
        hideMotivationPopup();
    }
});

document.getElementById("prevMonthBtn")?.addEventListener("click", function() {
    const options = getMonthOptions();
    const currentIndex = options.indexOf(currentMonth);
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    currentMonth = options[nextIndex] || currentMonth;
    populateMonthSelector();
    updateDashboard();
});

document.getElementById("nextMonthBtn")?.addEventListener("click", function() {
    const options = getMonthOptions();
    const currentIndex = options.indexOf(currentMonth);
    const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : options.length - 1;
    currentMonth = options[nextIndex] || currentMonth;
    populateMonthSelector();
    updateDashboard();
});


// CALCULATE DAILY STUDY HOURS

function getDailyHours(date) {

    return studyRecords
        .filter(record => record.date === date)
        .reduce((total, record) =>
            total + record.duration, 0);

}


// UPDATE DASHBOARD

function updateDashboard() {

    populateMonthSelector();

    const monthPicker = document.getElementById("monthPicker");
    const selectedMonth = monthPicker ? monthPicker.value : currentMonth;
    currentMonth = selectedMonth;

    const dates = [];

    if (currentRange === "week") {
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const offset = d.getTimezoneOffset();
            const date = new Date(d.getTime() - offset * 60000)
                .toISOString().split("T")[0];
            dates.push(date);
        }
    } else {
        const year = Number(selectedMonth.slice(0, 4));
        const month = Number(selectedMonth.slice(5, 7));
        const daysInMonth = new Date(year, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(year, month - 1, day);
            const offset = d.getTimezoneOffset();
            const date = new Date(d.getTime() - offset * 60000)
                .toISOString().split("T")[0];
            dates.push(date);
        }
    }

    const hours = dates.map(getDailyHours);

    const total = hours.reduce((a, b) => a + b, 0);

    const average = dates.length ? total / dates.length : 0;

    document.getElementById("totalHours")
        .textContent = total.toFixed(1) + " hrs";

    document.getElementById("averageHours")
        .textContent = average.toFixed(1) + " hrs";

    document.getElementById("wakeDisplay")
        .textContent = wakeRecords[today()] || "Not Added";


    // DRAW GRAPH

    const chart = document.getElementById("chart");
    chart.innerHTML = "";

    const width = 780;
    const height = window.innerWidth < 480 ? 260 : 230;
    const isMobile = window.innerWidth < 480;
    const padding = { top: 30, right: 18, bottom: isMobile ? 42 : 28, left: isMobile ? 46 : 20 };
    const graphHeight = height - padding.top - padding.bottom;

    const getDayTotalForDate = date => {
        const record = [...dayTotalRecords].reverse().find(item => item.date === date);
        return record ? record.totalHours : 0;
    };

    const selectedDate = document.getElementById("studyDate")?.value || today();
    const dailyHours = Array.from({ length: 24 }, () => 0);

    studyRecords
        .filter(record => record.date === selectedDate)
        .forEach(record => {
            const startHour = Number(record.start.split(":")[0]);
            const startMinute = Number(record.start.split(":")[1]);
            const endHour = Number(record.end.split(":")[0]);
            const endMinute = Number(record.end.split(":")[1]);

            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            const sessionLength = Math.max(0, endTotalMinutes - startTotalMinutes) / 60;

            if (sessionLength <= 0) return;

            for (let hour = 0; hour < 24; hour++) {
                const hourStart = hour * 60;
                const hourEnd = hourStart + 60;
                const overlapStart = Math.max(startTotalMinutes, hourStart);
                const overlapEnd = Math.min(endTotalMinutes, hourEnd);
                const overlap = Math.max(0, overlapEnd - overlapStart) / 60;

                if (overlap > 0) {
                    dailyHours[hour] += overlap;
                }
            }
        });

    const dailySeries = [{
        values: dailyHours,
        color: "#ff5ca8",
        glow: "#ff9cc8",
        label: "Daily Study Time"
    }];

    const progressSeries = [{
        values: hours,
        color: "#ff5ca8",
        glow: "#ff9cc8",
        label: "Daily Study Time"
    }, {
        values: dates.map(date => getDayTotalForDate(date)),
        color: "#5b7cff",
        glow: "#a7b9ff",
        label: "End-of-Day Total"
    }];

    const series = currentGraph === "progress" ? progressSeries : dailySeries;
    const maxValue = Math.max(1, ...series.flatMap(entry => entry.values));
    const scalePadding = maxValue * 0.2;
    const scaledMaxValue = maxValue + scalePadding;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.style.opacity = "0";
    svg.style.transform = "translateY(8px)";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "graphGlow");
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    const glow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow");
    glow.setAttribute("dx", "0");
    glow.setAttribute("dy", "0");
    glow.setAttribute("stdDeviation", "2.5");
    glow.setAttribute("flood-color", "#ff7bb8");
    glow.setAttribute("flood-opacity", "0.7");
    filter.appendChild(glow);
    defs.appendChild(filter);
    svg.appendChild(defs);

    const baseline = document.createElementNS("http://www.w3.org/2000/svg", "line");
    baseline.setAttribute("x1", padding.left);
    baseline.setAttribute("y1", height - padding.bottom);
    baseline.setAttribute("x2", width - padding.right);
    baseline.setAttribute("y2", height - padding.bottom);
    baseline.setAttribute("stroke", "rgba(60, 74, 100, 0.7)");
    baseline.setAttribute("stroke-width", "2");
    svg.appendChild(baseline);

    const leftAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    leftAxis.setAttribute("x1", padding.left);
    leftAxis.setAttribute("y1", padding.top);
    leftAxis.setAttribute("x2", padding.left);
    leftAxis.setAttribute("y2", height - padding.bottom);
    leftAxis.setAttribute("stroke", "rgba(60, 74, 100, 0.7)");
    leftAxis.setAttribute("stroke-width", "2");
    svg.appendChild(leftAxis);

    const niceStep = (() => {
        const raw = scaledMaxValue / 4;
        const magnitude = 10 ** Math.floor(Math.log10(raw || 1));
        const normalized = raw / magnitude;
        let rounded = 1;
        if (normalized > 1) rounded = 2;
        if (normalized > 2) rounded = 5;
        if (normalized > 5) rounded = 10;
        return rounded * magnitude;
    })();

    const yMaxTick = Math.ceil(scaledMaxValue / niceStep) * niceStep;
    const yTicks = [];
    for (let value = 0; value <= yMaxTick + 0.0001; value += niceStep) {
        yTicks.push(value);
    }

    yTicks.forEach((value) => {
        const y = height - padding.bottom - ((value / yMaxTick) * graphHeight);

        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", padding.left - 6);
        tick.setAttribute("y1", y);
        tick.setAttribute("x2", padding.left);
        tick.setAttribute("y2", y);
        tick.setAttribute("stroke", "rgba(60, 74, 100, 0.7)");
        tick.setAttribute("stroke-width", "1.2");
        svg.appendChild(tick);
    });

    if (currentGraph === "daily") {
        const hourSteps = isMobile ? [0, 6, 12, 18, 24] : [0, 6, 12, 18, 24];
        hourSteps.forEach((hour) => {
            const x = padding.left + (hour / 24) * (width - padding.left - padding.right);
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", x);
            tick.setAttribute("y1", height - padding.bottom);
            tick.setAttribute("x2", x);
            tick.setAttribute("y2", height - padding.bottom + 6);
            tick.setAttribute("stroke", "rgba(60, 74, 100, 0.7)");
            tick.setAttribute("stroke-width", "1.2");
            svg.appendChild(tick);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", height - 8);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("font-size", isMobile ? "18" : "12");
            label.setAttribute("font-weight", "800");
            label.setAttribute("fill", "#4a1d3a");
            label.textContent = `${hour}h`;
            svg.appendChild(label);
        });
    }

    if (currentGraph === "progress") {
        const step = dates.length > 12 ? Math.ceil(dates.length / 8) : 1;

        dates.forEach((date, index) => {
            if (index % step !== 0 && index !== dates.length - 1) return;

            const x = padding.left + (index * (width - padding.left - padding.right)) / Math.max(dates.length - 1, 1);
            const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tick.setAttribute("x1", x);
            tick.setAttribute("y1", height - padding.bottom);
            tick.setAttribute("x2", x);
            tick.setAttribute("y2", height - padding.bottom + 8);
            tick.setAttribute("stroke", "rgba(60, 74, 100, 0.7)");
            tick.setAttribute("stroke-width", "1.2");
            svg.appendChild(tick);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", x);
            label.setAttribute("y", height - 10);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("font-size", isMobile ? "18" : "12");
            label.setAttribute("font-weight", "800");
            label.setAttribute("fill", "#4a1d3a");
            const displayDate = new Date(date + "T00:00:00");
            const day = displayDate.getDate();
            const month = displayDate.toLocaleDateString("en-US", { month: "short" });
            label.textContent = currentRange === "week" ? displayDate.toLocaleDateString("en-US", { weekday: "short" }) : `${month} ${day}`;
            svg.appendChild(label);
        });
    }

    series.forEach(set => {
        const points = set.values.map((value, index) => {
            const x = padding.left + (index * (width - padding.left - padding.right)) / Math.max(set.values.length - 1, 1);
            const y = height - padding.bottom - (value / scaledMaxValue) * graphHeight;
            return { x, y };
        });

        const linePath = points.map((point, index) => {
            return `${index === 0 ? "M" : "L"}${point.x},${point.y}`;
        }).join(" ");

        const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        glowPath.setAttribute("d", linePath);
        glowPath.setAttribute("fill", "none");
        glowPath.setAttribute("stroke", set.glow);
        glowPath.setAttribute("stroke-width", "6");
        glowPath.setAttribute("stroke-linecap", "round");
        glowPath.setAttribute("stroke-linejoin", "round");
        glowPath.setAttribute("filter", "url(#graphGlow)");
        svg.appendChild(glowPath);

        const mainPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        mainPath.setAttribute("d", linePath);
        mainPath.setAttribute("fill", "none");
        mainPath.setAttribute("stroke", set.color);
        mainPath.setAttribute("stroke-width", "2.8");
        mainPath.setAttribute("stroke-linecap", "round");
        mainPath.setAttribute("stroke-linejoin", "round");
        svg.appendChild(mainPath);

        points.forEach((point, pointIndex) => {
            const value = set.values[pointIndex];
            if (value <= 0) return;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", point.x);
            circle.setAttribute("cy", point.y);
            circle.setAttribute("r", "4.5");
            circle.setAttribute("fill", set.color);
            circle.setAttribute("stroke", "#ffffff");
            circle.setAttribute("stroke-width", "1.8");
            svg.appendChild(circle);

            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", point.x);
            label.setAttribute("y", point.y - 12);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("font-size", isMobile ? "16" : "12");
            label.setAttribute("fill", "#2f3d5a");
            label.setAttribute("font-weight", "900");
            label.textContent = `${value.toFixed(1)}h`;
            svg.appendChild(label);
        });
    });

    if (currentGraph === "progress") {
        const legendY = 14;
        const legendItems = [
            { color: "#ff5ca8", label: "Daily Study" },
            { color: "#5b7cff", label: "End-of-Day Total" }
        ];

        legendItems.forEach((item, index) => {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", 24 + index * 150);
            rect.setAttribute("y", legendY);
            rect.setAttribute("width", "12");
            rect.setAttribute("height", "12");
            rect.setAttribute("fill", item.color);
            rect.setAttribute("rx", "3");
            svg.appendChild(rect);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", 42 + index * 150);
            text.setAttribute("y", legendY + 10);
            text.setAttribute("font-size", "11");
            text.setAttribute("fill", "#4a1d3a");
            text.textContent = item.label;
            svg.appendChild(text);
        });
    }

    chart.appendChild(svg);

    requestAnimationFrame(() => {
        svg.style.opacity = "1";
        svg.style.transform = "translateY(0)";
    });

    // DISPLAY STUDY HISTORY

    const history = document.getElementById("historyList");

    history.innerHTML = "";

    const allHistoryEntries = [];

    studyRecords.forEach(record => {
        allHistoryEntries.push({
            type: "study",
            date: record.date,
            time: `${record.start} - ${record.end}`,
            title: record.subject,
            subtitle: `${record.date} | ${record.start} - ${record.end} | ${record.duration.toFixed(2)} hours`,
            id: record.id,
            delete: () => {
                studyRecords = studyRecords.filter(item => item.id !== record.id);
                saveData();
                updateDashboard();
            }
        });
    });

    dayTotalRecords.forEach(record => {
        allHistoryEntries.push({
            type: "total",
            date: record.date,
            time: "",
            title: "End-of-day total",
            subtitle: `${record.date} | ${record.totalHours} hours`,
            id: record.id,
            delete: () => {
                dayTotalRecords = dayTotalRecords.filter(item => item.id !== record.id);
                saveData();
                updateDashboard();
            }
        });
    });

    Object.entries(wakeRecords).forEach(([date, time]) => {
        allHistoryEntries.push({
            type: "wake",
            date,
            time,
            title: "Wake-up time",
            subtitle: `${date} | ${time}`,
            id: date,
            delete: () => {
                delete wakeRecords[date];
                saveData();
                updateDashboard();
            }
        });
    });

    if (allHistoryEntries.length === 0) {
        history.textContent = "No study records yet.";
        return;
    }

    const sortedEntries = allHistoryEntries.sort((a, b) =>
        b.date.localeCompare(a.date) ||
        (b.time || "").localeCompare(a.time || "")
    );

    sortedEntries.forEach(entry => {
        const div = document.createElement("div");
        div.className = "record";

        const details = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = entry.title;

        const info = document.createElement("small");
        info.textContent = entry.subtitle;

        details.appendChild(title);
        details.appendChild(document.createElement("br"));
        details.appendChild(info);

        const button = document.createElement("button");
        button.className = "delete";
        button.textContent = "Clear";

        button.addEventListener("click", entry.delete);

        div.appendChild(details);
        div.appendChild(button);
        history.appendChild(div);
    });

}


// INITIAL LOAD

updateDashboard();
