// app.js
// Main JavaScript file for the Hacking Game

// --- CHALLENGE DATA ---
const challenges = [
    {
        id: 1,
        title: "اولین نگاه",
        description: "پرچم در داخل کدهای همین صفحه پنهان شده است. آیا می‌توانی آن را پیدا کنی؟ به دنبال کامنت‌های HTML بگرد.",
        hint: "در مرورگر خود، روی صفحه راست-کلیک کرده و گزینه 'View Page Source' یا 'Inspect' را انتخاب کنید.",
        flag: "flag{خوش_آمدی_هکر}",
        tutorial: {
            title: "آموزش: آشنایی با ابزارهای توسعه‌دهنده (DevTools)",
            content: `
                <p>هر مرورگر مدرنی یک مجموعه ابزار قدرتمند برای توسعه‌دهندگان وب دارد که به آن DevTools می‌گویند. این ابزارها به شما اجازه می‌دهند تا به کدهای یک صفحه وب (HTML, CSS, JavaScript) نگاه کنید و آن‌ها را تغییر دهید. برای باز کردن آن، در صفحه راست-کلیک کرده و گزینه "Inspect" را انتخاب کنید یا کلید F12 را فشار دهید.</p>
                <p>مهم‌ترین قسمتی که با آن کار داریم، تب <strong>Elements</strong> است. این تب ساختار درختی صفحه یا همان DOM را به شما نشان می‌دهد.</p>
                <pre>  &lt;html&gt;\n  |-- &lt;head&gt;\n  |   |-- &lt;title&gt;پروژه هکر&lt;/title&gt;\n  |   +-- &lt;link rel="stylesheet" href="style.css"&gt;\n  |\n  +-- &lt;body&gt;\n      |-- &lt;header&gt;...&lt;/header&gt;\n      |-- &lt;main&gt;...&lt;/main&gt;\n      |-- &lt;!-- این یک کامنت است. کامنت‌ها در صفحه نمایش داده نمی‌شوند ولی در کد منبع قابل مشاهده هستند! --&gt;\n      +-- &lt;footer&gt;...&lt;/footer&gt;</pre>
                <p>همانطور که در دیاگرام بالا می‌بینید، کامنت‌ها بخشی از کد هستند. توسعه‌دهندگان گاهی پیام‌هایی را در کامنت‌ها جا می‌گذارند. در چالش اول، پرچم در یکی از همین کامنت‌ها پنهان شده است!</p>
                <p>تصویر زیر به شما نشان می‌دهد که یک کامنت در تب Elements چگونه به نظر می‌رسد:</p>
                <img src="tutorial_image_1.png" alt="تصویر ابزار توسعه‌دهنده" style="width: 100%; border: 1px solid #00ff00;">
            `
        }
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
    const bodyEl = document.body;
    const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
    const challengeListEl = document.getElementById('challenge-list');
    const challengeViewEl = document.getElementById('challenge-view-container');
    const challengeTitleEl = document.getElementById('challenge-title');
    const challengeDescriptionEl = document.getElementById('challenge-description');
    const challengeHintEl = document.getElementById('challenge-hint');
    const flagInputEl = document.getElementById('flag-input');
    const submitFlagBtn = document.getElementById('submit-flag-btn');
    const feedbackEl = document.getElementById('feedback');
    // Modal elements
    const modalEl = document.getElementById('tutorial-modal');
    const modalTitleEl = document.getElementById('tutorial-title');
    const modalBodyEl = document.getElementById('tutorial-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

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
            const titleSpan = li.querySelector('.challenge-title');
            if (titleSpan && titleSpan.textContent === challenge.title) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }

    function populateChallengeList() {
        challengeListEl.innerHTML = '';
        challenges.forEach(challenge => {
            const listItem = document.createElement('li');
            listItem.dataset.challengeId = challenge.id;

            const itemContent = document.createElement('div');
            itemContent.className = 'challenge-item-content';

            const titleSpan = document.createElement('span');
            titleSpan.textContent = challenge.title;
            titleSpan.className = 'challenge-title';
            titleSpan.addEventListener('click', () => selectChallenge(challenge));

            itemContent.appendChild(titleSpan);

            if (challenge.tutorial) {
                const tutorialButton = document.createElement('button');
                tutorialButton.textContent = "آموزش";
                tutorialButton.className = 'tutorial-btn';
                tutorialButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent challenge selection when clicking button
                    showTutorial(challenge);
                });
                itemContent.appendChild(tutorialButton);
            }

            listItem.appendChild(itemContent);
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

    function showTutorial(challenge) {
        if (challenge.tutorial) {
            modalTitleEl.textContent = challenge.tutorial.title;
            modalBodyEl.innerHTML = challenge.tutorial.content;
            modalEl.classList.remove('hidden');
        }
    }

    function hideTutorial() {
        modalEl.classList.add('hidden');
    }

    // --- Event Listeners & Initial Setup ---

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    themeSwitcherBtn.addEventListener('click', () => {
        const newTheme = bodyEl.classList.contains('light-theme') ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    submitFlagBtn.addEventListener('click', handleSubmitFlag);
    flagInputEl.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') handleSubmitFlag();
    });

    modalCloseBtn.addEventListener('click', hideTutorial);
    modalEl.addEventListener('click', (event) => {
        if (event.target === modalEl) hideTutorial();
    });

    challengeViewEl.classList.add('hidden');
    populateChallengeList();
});
