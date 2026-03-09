// TOP OF SCRIPT.JS
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://voslmijkamswlmmcugjd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvc2xtaWprYW1zd2xtbWN1Z2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTQ2NTcsImV4cCI6MjA4ODUzMDY1N30.FcILRfxoCt537qWKMhN9vATxnBLZfLdPrwk0OVbUcaE';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

window.signUpUser = async function signUpUser() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const course = document.getElementById('signup-course').value;
    const semester = document.getElementById('signup-semester').value;

    if (!email || !password || course === "Select Course") {
        return alert("Please fill in all fields!");
    }

    // 1. Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) return alert("Sign up failed: " + error.message);

    /*if (data.user) {
        // 2. Insert their profile data into our custom 'profiles' table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                { id: data.user.id, email: email, course: course, semester: semester }
            ]);  */

    if (profileError) {
        console.error("Profile error:", profileError);
    } else {
        alert("Success! Account created. You can now login.");
        toggleAuth(); // Switch back to the login screen
    }
}
//}
// LOGIN FUNCTION
window.loginUser = async function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) return alert("Login failed: " + error.message);

    if (data.user) {
        currentUser = data.user;

        // Fetch the user's course and semester from the profiles table
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('course, semester')
            .eq('id', currentUser.id)
            .single();

        if (profile) {
            console.log(`Welcome back! You are in ${profile.course}, Sem ${profile.semester}`);
            // You can save these to global variables to use them in the dashboard
            window.userCourse = profile.course;
            window.userSemester = profile.semester;
        }

        showDashboard(); // Your existing function to show the dashboard
    }
}

// Global array to store topics - pulls from memory if it exists
let topics = JSON.parse(localStorage.getItem('studyTopics')) || [];

// 1. NAVIGATION: LOGIN TO SETUP
// window.showSetup = function showSetup() {
//     const user = document.getElementById('username').value;
//     if (user.trim() === "") {
//         alert("Please enter a username!");
//         return;
//     }
//     document.getElementById('login-screen').classList.add('hidden');
//     document.getElementById('setup-screen').classList.remove('hidden');
// }

// 2. NAVIGATION: SETUP TO DASHBOARD
window.showDashboard = function showDashboard() {
    // Hide all entry screens
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.add('hidden');

    // Show dashboard
    document.getElementById('dashboard-screen').classList.remove('hidden');

    // Use the global variables we set during login
    const course = window.userCourse || "General";
    const sem = window.userSemester || "Study";

    document.getElementById('welcome-text').innerText = `Happy Learning! (${course} - Sem ${sem})`;

    renderTopics();
}

// 3. PLANNER LOGIC
window.calculatePlan = function calculatePlan() {
    const total = document.getElementById('total-topics-input').value;
    const months = document.getElementById('months-left').value;

    if (!total || !months) {
        alert("Please fill in both fields!");
        return;
    }

    const perWeek = (total / (months * 4)).toFixed(1);
    document.getElementById('plan-result').innerText = `Target: Finish ${perWeek} topics per week!`;

    // Update Stat Card
    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.innerText = total;

    localStorage.setItem('totalTopicsCount', total);
}

// 4. TOPIC TRACKER LOGIC
window.toggleTaskForm = function toggleTaskForm() {
    const topicName = prompt("Enter topic name from your syllabus:");
    if (topicName && topicName.trim() !== "") {
        const topic = { name: topicName, completed: false };
        topics.push(topic);
        saveAndRender();
    }
}

window.toggleTopic = function toggleTopic(index) {
    topics[index].completed = !topics[index].completed;
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('studyTopics', JSON.stringify(topics));
    renderTopics();
}

function renderTopics() {
    const list = document.getElementById('topic-list');
    if (!list) return;

    list.innerHTML = '';
    let completedCount = 0;

    topics.forEach((topic, index) => {
        if (topic.completed) completedCount++;

        list.innerHTML += `
            <li style="margin-bottom: 10px; font-size: 18px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <input type="checkbox" ${topic.completed ? 'checked' : ''} onchange="toggleTopic(${index})">
                <span style="${topic.completed ? 'text-decoration: line-through; color: gray;' : ''}">${topic.name}</span>
            </li>
        `;
    });

    // Update Stats Safely
    const completedEl = document.getElementById('stat-completed');
    const rateEl = document.getElementById('stat-rate');
    const totalEl = document.getElementById('stat-total');

    if (completedEl) completedEl.innerText = completedCount;

    const savedTotal = localStorage.getItem('totalTopicsCount') || topics.length;
    if (totalEl) totalEl.innerText = savedTotal;

    if (rateEl) {
        const rate = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;
        rateEl.innerText = rate + "%";
    }
}

// Load saved data when the page opens without crashing the login
window.onload = function () {
    console.log("App initialized.");
    const savedTotal = localStorage.getItem('totalTopicsCount');
    const totalEl = document.getElementById('stat-total');
    if (savedTotal && totalEl) {
        totalEl.innerText = savedTotal;
    }
}
window.showSection = function showSection(sectionId) {
    const sections = document.querySelectorAll('.tab-content');
    sections.forEach(sec => sec.classList.add('hidden'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.remove('hidden');

    const tabs = document.querySelectorAll('.sidebar li');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Highlight the tab based on the clicked element
    if (window.event) {
        window.event.currentTarget.classList.add('active');
    }
};

// Simple save function for Notes
function saveNotes() {
    const noteData = document.getElementById('quick-notes').value;
    localStorage.setItem('savedNotes', noteData);
    alert("Notes saved to browser memory! ✅");
}
// Array to store notes references
let savedNotes = JSON.parse(localStorage.getItem('studyNotesVault')) || [];

window.addNoteLink = function addNoteLink() {
    const subject = document.getElementById('note-subject').value;
    const fileInput = document.getElementById('note-file');

    if (!subject || fileInput.files.length === 0) {
        alert("Please enter a subject and select a PDF file!");
        return;
    }

    const fileName = fileInput.files[0].name;
    const newNote = { subject: subject, fileName: fileName };

    savedNotes.push(newNote);
    localStorage.setItem('studyNotesVault', JSON.stringify(savedNotes));

    // Clear inputs
    document.getElementById('note-subject').value = '';
    fileInput.value = '';

    renderNotes();
}

function renderNotes() {
    const list = document.getElementById('notes-list');
    const emptyMsg = document.getElementById('no-notes');
    if (!list) return;

    list.innerHTML = '';

    if (savedNotes.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
    } else {
        if (emptyMsg) emptyMsg.style.display = 'none';

        savedNotes.forEach((note, index) => {
            list.innerHTML += `
                <li style="background: #f8f9ff; padding: 15px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid #6a5af9;">
                    <div>
                        <strong style="color: #333;">${note.subject}</strong><br>
                        <span style="font-size: 0.85rem; color: #666;">📄 ${note.fileName}</span>
                    </div>
                    <button onclick="deleteNote(${index})" style="background: none; border: none; color: #ff7eb3; cursor: pointer; font-size: 1.2rem;">🗑️</button>
                </li>
            `;
        });
    }
}

window.deleteNote = function deleteNote(index) {
    if (confirm("Delete this note from your vault?")) {
        savedNotes.splice(index, 1);
        localStorage.setItem('studyNotesVault', JSON.stringify(savedNotes));
        renderNotes();
    }
}

// Make sure notes load when the section is shown
// Update your existing showSection slightly to include this:
const originalShowSection = showSection;
showSection = function (sectionId) {
    originalShowSection(sectionId);
    if (sectionId === 'notes-section') {
        renderNotes();
    }
}
let savedPlaylists = JSON.parse(localStorage.getItem('studyPlaylists')) || [];

window.addPlaylist = function addPlaylist() {
    const title = document.getElementById('playlist-title').value;
    const url = document.getElementById('playlist-url').value;

    if (!title || !url) {
        alert("Please enter both a title and a link!");
        return;
    }

    // Basic check to see if it's a real link
    if (!url.startsWith("http")) {
        alert("Please paste a valid URL (starting with http/https)");
        return;
    }

    const newPlaylist = { title: title, url: url };
    savedPlaylists.push(newPlaylist);
    localStorage.setItem('studyPlaylists', JSON.stringify(savedPlaylists));

    // Clear inputs
    document.getElementById('playlist-title').value = '';
    document.getElementById('playlist-url').value = '';

    renderPlaylists();
}

function renderPlaylists() {
    const container = document.getElementById('playlist-container');
    if (!container) return;

    container.innerHTML = '';

    savedPlaylists.forEach((item, index) => {
        container.innerHTML += `
            <div style="background: #fdf2f8; border: 1px solid #fbcfe8; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="display: block; color: #333;">${item.title}</strong>
                    <a href="${item.url}" target="_blank" style="color: #6a5af9; text-decoration: none; font-size: 0.85rem;">Click to watch on YouTube ↗</a>
                </div>
                <button onclick="deletePlaylist(${index})" style="background: none; border: none; color: #ff7eb3; cursor: pointer; font-size: 1.1rem;">🗑️</button>
            </div>
        `;
    });
}

// Add this to your window.onload or showSection to make sure they load
window.addEventListener('load', renderPlaylists);

window.generateRoadmap = async function generateRoadmap() {
    const subject = document.getElementById('subject-select').value;
    const roadmapContainer = document.getElementById('roadmap-container');

    if (subject === "Select Subject") {
        alert("Please pick a subject!");
        return;
    }

    roadmapContainer.innerHTML = "<p>Loading your plan from the cloud... ☁️</p>";

    // 1. FETCH FROM SUPABASE
    const { data: topicsFromDB, error } = await supabase
        .from('master_syllabus') // Make sure this matches your table name exactly
        .select('*')
        .eq('subject_name', subject); // Matches the dropdown value to the table column

    if (error) {
        console.error("Error fetching data:", error);
        roadmapContainer.innerHTML = "<p>Error loading syllabus. Check console.</p>";
        return;
    }

    if (topicsFromDB.length === 0) {
        roadmapContainer.innerHTML = "<p>No topics found for this subject in the database yet!</p>";
        return;
    }

    // 2. RENDER THE ROADMAP
    roadmapContainer.innerHTML = `<h3>Roadmap for ${subject.toUpperCase()}</h3><br>`;

    // We'll group them by 'week_number' which you added to your table
    let currentWeek = -1;
    let html = "";

    topicsFromDB.forEach(topic => {
        if (topic.week_number !== currentWeek) {
            if (currentWeek !== -1) html += `</div>`; // Close previous week div
            currentWeek = topic.week_number;
            html += `<div class="roadmap-week"><span class="week-header">WEEK ${currentWeek}</span>`;
        }

        html += `
            <div class="topic-item">
                <span>${topic.topic_name}</span>
                <button class="add-btn" style="padding: 2px 10px; font-size: 12px;" 
                        onclick="addToMainTracker('${topic.topic_name}')">Track This</button>
            </div>
        `;
    });

    roadmapContainer.innerHTML += html + `</div>`;
}

// Function to move a topic from the roadmap to your "Daily Dashboard"
function addToMainTracker(topicName) {
    if (!topics.some(t => t.name === topicName)) {
        topics.push({ name: topicName, completed: false });
        saveAndRender();
        alert(`${topicName} added to your Dashboard!`);
    } else {
        alert("Topic already in tracker!");
    }
}

window.toggleAuth = function () {
    document.getElementById('login-screen').classList.toggle('hidden');
    document.getElementById('setup-screen').classList.toggle('hidden');
}