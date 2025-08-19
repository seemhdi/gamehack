// app.js
// Main JavaScript file for the Hacking Game

// --- CHALLENGE DATA ---
// All user-facing text is in Persian.
const challenges = [
    {
        id: 1,
        title: "اولین نگاه",
        description: "پرچم در داخل کدهای همین صفحه پنهان شده است. آیا می‌توانی آن را پیدا کنی؟ به دنبال کامنت‌های HTML بگرد.",
        hint: "در مرورگر خود، روی صفحه راست-کلیک کرده و گزینه 'View Page Source' یا 'Inspect' را انتخاب کنید.",
        flag: "flag{خوش_آمدی_هکر}"
    },
    {
        id: 2,
        title: "فایل‌های جاوا اسکریپت",
        description: "گاهی اوقات اطلاعات حساس در فایل‌های خارجی که به صفحه وب متصل هستند، پنهان می‌شود. پرچم این مرحله در فایل `app.js` قرار دارد.",
        hint: "تب 'Sources' یا 'Debugger' را در ابزارهای توسعه‌دهنده مرورگر خود بررسی کنید تا فایل‌های بارگذاری شده را ببینید.",
        flag: "flag{جاوااسکریپت_را_فراموش_نکن}"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. App is running.');

    // --- DOM Elements ---
    const challengeListEl = document.getElementById('challenge-list');
    const challengeViewEl = document.getElementById('challenge-view-container');
    const challengeTitleEl = document.getElementById('challenge-title');
    const challengeDescriptionEl = document.getElementById('challenge-description');
    const challengeHintEl = document.getElementById('challenge-hint');
    const flagInputEl = document.getElementById('flag-input');
    const submitFlagBtn = document.getElementById('submit-flag-btn');
    const feedbackEl = document.getElementById('feedback');
    const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
    const bodyEl = document.body;

    let activeChallenge = null;

    // --- Functions ---

    function selectChallenge(challenge) {
        activeChallenge = challenge;
        challengeViewEl.classList.remove('hidden');
        challengeTitleEl.textContent = challenge.title;
        challengeDescriptionEl.textContent = challenge.description;
        challengeHintEl.textContent = `راهنمایی: ${challenge.hint}`;
        flagInputEl.value = '';
        feedbackEl.textContent = '';
        feedbackEl.style.display = 'none';
        feedbackEl.className = '';
        document.querySelectorAll('#challenge-list li').forEach(li => {
            li.classList.toggle('active', li.dataset.challengeId == challenge.id);
        });
    }

    function populateChallengeList() {
        challengeListEl.innerHTML = '';
        challenges.forEach(challenge => {
            const listItem = document.createElement('li');
            listItem.textContent = challenge.title;
            listItem.dataset.challengeId = challenge.id;
            listItem.addEventListener('click', () => selectChallenge(challenge));
            challengeListEl.appendChild(listItem);
        });
    }

    function handleSubmitFlag() {
        if (!activeChallenge) return;

        const submittedFlag = flagInputEl.value.trim();
        if (!submittedFlag) return;

        feedbackEl.style.display = 'block';

        if (submittedFlag === activeChallenge.flag) {
            feedbackEl.textContent = "آفرین! پرچم صحیح است.";
            feedbackEl.className = 'success';
        } else {
            feedbackEl.textContent = "اشتباه است. دوباره تلاش کنید.";
            feedbackEl.className = 'error';
        }
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            bodyEl.classList.add('light-theme');
        } else {
            bodyEl.classList.remove('light-theme');
        }
    }

    // --- Event Listeners & Initial Setup ---

    // Theme Switcher
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeSwitcherBtn.addEventListener('click', () => {
        const newTheme = bodyEl.classList.contains('light-theme') ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Flag Submission
    submitFlagBtn.addEventListener('click', handleSubmitFlag);
    flagInputEl.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSubmitFlag();
        }
    });

    // Initial Page Setup
    challengeViewEl.classList.add('hidden');
    populateChallengeList();
});
