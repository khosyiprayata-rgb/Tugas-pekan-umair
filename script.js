// ===== Data & State =====
let students = [];
let editId = null;
let alertTimer = null;

// ===== Elemen DOM =====
const form = document.getElementById("studentForm");
const nameInput = document.getElementById("studentName");
const scoreInput = document.getElementById("studentScore");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const studentList = document.getElementById("studentList");
const emptyMessage = document.getElementById("emptyMessage");
const alertBox = document.getElementById("alertMessage");
const searchInput = document.getElementById("searchInput");
const deleteAllBtn = document.getElementById("deleteAllBtn");

// ===== LocalStorage =====
function loadStudents() {
  const data = localStorage.getItem("students");
  students = data ? JSON.parse(data) : [];
}

function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}

// ===== Alert (otomatis hilang 3 detik) =====
function showAlert(message, type = "add") {
  clearTimeout(alertTimer);
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  alertTimer = setTimeout(() => alertBox.classList.add("hidden"), 3000);
}

// ===== Render =====
function scoreClass(score) {
  if (score >= 75) return "score-high";
  if (score >= 50) return "score-mid";
  return "score-low";
}

function renderStudents() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = students.filter((s) => s.name.toLowerCase().includes(keyword));

  studentList.innerHTML = "";
  emptyMessage.classList.toggle("hidden", filtered.length > 0);

  filtered.forEach((student, index) => {
    const item = document.createElement("div");
    item.className = "student-item";
    item.innerHTML = `
      <div class="student-info">
        <strong>${index + 1}. ${student.name}</strong>
        <span class="score-badge ${scoreClass(student.score)}">${student.score}</span>
        <p>Nilai: ${student.score}</p>
      </div>
      <div class="student-actions">
        <button class="btn btn-edit" onclick="editStudent(${student.id})">✏️ Ubah</button>
        <button class="btn btn-del" onclick="deleteStudent(${student.id})">🗑️ Hapus</button>
      </div>
    `;
    studentList.appendChild(item);
  });

  renderStats();
}

// ===== Statistik =====
function renderStats() {
  const total = students.length;
  document.getElementById("totalStudents").textContent = total;

  if (total === 0) {
    document.getElementById("averageScore").textContent = 0;
    document.getElementById("highestScore").textContent = "-";
    document.getElementById("lowestScore").textContent = "-";
    document.getElementById("passedCount").textContent = 0;
    return;
  }

  const scores = students.map((s) => s.score);
  const avg = scores.reduce((a, b) => a + b, 0) / total;
  document.getElementById("averageScore").textContent = avg % 1 === 0 ? avg : avg.toFixed(1);
  document.getElementById("highestScore").textContent = Math.max(...scores);
  document.getElementById("lowestScore").textContent = Math.min(...scores);
  document.getElementById("passedCount").textContent = students.filter((s) => s.score >= 75).length;
}

// ===== Add / Update =====
function resetForm() {
  form.reset();
  editId = null;
  submitBtn.textContent = "➕ Tambah Siswa";
  formTitle.textContent = "➕ Tambah Siswa";
  cancelBtn.classList.add("hidden");
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const score = Number(scoreInput.value);

  if (editId === null) {
    // CREATE
    const student = { id: Date.now(), name: name, score: score };
    students.push(student);
    saveStudents();
    showAlert(`✅ Data siswa ${name} berhasil ditambahkan.`, "add");
  } else {
    // UPDATE
    const student = students.find((s) => s.id === editId);
    if (student) {
      student.name = name;
      student.score = score;
      saveStudents();
      showAlert(`🔄 Data siswa ${name} berhasil diperbarui.`, "update");
    }
  }

  resetForm();
  renderStudents();
});

// ===== Edit =====
function editStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  editId = id;
  nameInput.value = student.name;
  scoreInput.value = student.score;
  submitBtn.textContent = "💾 Update Siswa";
  formTitle.textContent = "✏️ Edit Siswa";
  cancelBtn.classList.remove("hidden");
  nameInput.focus();
}

cancelBtn.addEventListener("click", resetForm);

// ===== Delete =====
function deleteStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  const yakin = confirm(`Apakah kamu yakin ingin menghapus siswa ${student.name}?`);
  if (!yakin) return; // Cancel: tidak ada perubahan

  students = students.filter((s) => s.id !== id);
  saveStudents();
  renderStudents();
  showAlert(`🗑️ Data siswa ${student.name} berhasil dihapus.`, "delete");

  if (editId === id) resetForm();
}

// ===== Hapus Semua (Bonus) =====
deleteAllBtn.addEventListener("click", function () {
  if (students.length === 0) return;
  const yakin = confirm("Apakah kamu yakin ingin menghapus SEMUA data siswa?");
  if (!yakin) return;

  students = [];
  saveStudents();
  resetForm();
  renderStudents();
  showAlert("🧹 Semua data siswa berhasil dihapus.", "delete");
});

// ===== Search (Bonus) =====
searchInput.addEventListener("input", renderStudents);

// ===== Init =====
loadStudents();
renderStudents();
