let subjects = [];
let editIndex = -1;

const name = document.getElementById('signupName').value;
const matric = document.getElementById('signupMatric').value;
const dept = document.getElementById('signupDept').value;

auth.createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Save additional user information to the database
    const userId = userCredential.user.uid;
    return firebase.firestore().collection('users').doc(userId).set({
      name: name,
      matric: matric,
      department: dept,
    });
  })
  .then(() => {
    // Show preloader and then redirect
    showPreloader();
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  })
  .catch((error) => {
    document.getElementById('signupError').textContent = error.message;
  });
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      firebase.firestore().collection('users').doc(userId).get().then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          document.getElementById('userName').textContent = `Name: ${userData.name}`;
          document.getElementById('userMatric').textContent = `Matric No: ${userData.matric}`;
          document.getElementById('userDept').textContent = `Department: ${userData.department}`;
        }
      });
    }
  });
  function saveCGPA(cgpa) {
    const userId = firebase.auth().currentUser.uid;
    firebase.firestore().collection('cgpa_history').add({
      userId: userId,
      cgpa: cgpa,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  function downloadCGPA() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add content to the PDF
    doc.text("CGPA Report", 20, 20);
    doc.text(`Name: ${document.getElementById('userName').textContent}`, 20, 30);
    doc.text(`Matric No: ${document.getElementById('userMatric').textContent}`, 20, 40);
    doc.text(`Department: ${document.getElementById('userDept').textContent}`, 20, 50);
    
    // Add CGPA history if needed
    // doc.text(`CGPA History: ...`, 20, 60);
  
    doc.save("cgpa_report.pdf");
  }
  
function addSubject() {
    const subjectInput = document.getElementById('subject');
    const grade = document.getElementById('grade').value;
    const unitInput = document.getElementById('unit'); // Changed from credit to unit
    const unit = parseInt(unitInput.value); // Changed from credit to unit

    const inputError = document.getElementById('inputError');
    const unitError = document.getElementById('unitError'); // Changed from creditError to unitError
    
    // Validate inputs
    if (!subjectInput.value || isNaN(unit)) {
        inputError.textContent = 'Please fill out all fields.';
        return;
    } else if (unit < 1 || unit > 5) {
        unitError.textContent = 'Unit must be between 1 and 4 units per course.'; // Updated message
        return;
    } else {
        unitError.textContent = '';
    }

    // Calculate current total units (renamed from total credits)
    const currentTotalUnits = subjects.reduce((sum, s) => sum + s.unit, 0); // Changed from credit to unit

    // Check if adding the current unit will exceed the max limit (24 units)
    if (currentTotalUnits + unit > 24) {
        unitError.textContent = 'Total units cannot exceed 24 units for the semester.'; // Updated message
        return;
    }

    if (editIndex !== -1) {
        subjects[editIndex] = { subject: subjectInput.value, grade, unit }; // Changed from credit to unit
        editIndex = -1;
    } else {
        subjects.push({ subject: subjectInput.value, grade, unit }); // Changed from credit to unit
    }

    displaySubjects();
    clearForm();
}

function displaySubjects() {
    const subjectList = document.getElementById('subjectList');
    subjectList.innerHTML = '';

    subjects.forEach((s, index) => {
        const row = document.createElement('tr');

        const subjectCell = document.createElement('td');
        subjectCell.textContent = s.subject;

        const gradeCell = document.createElement('td');
        gradeCell.textContent = s.grade;

        const unitCell = document.createElement('td'); // Changed from creditCell to unitCell
        unitCell.textContent = s.unit; // Changed from credit to unit

        const actionCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.className = 'edit';
        editButton.textContent = 'Edit';
        editButton.onclick = () => editSubject(index);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteSubject(index);

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(subjectCell);
        row.appendChild(gradeCell);
        row.appendChild(unitCell); // Changed from creditCell to unitCell
        row.appendChild(actionCell);

        subjectList.appendChild(row);
    });
}

function editSubject(index) {
    const subjectInput = document.getElementById('subject');
    const selectedSubject = subjects[index];

    subjectInput.value = selectedSubject.subject;
    document.getElementById('grade').value = selectedSubject.grade;
    document.getElementById('unit').value = selectedSubject.unit; // Changed from credit to unit

    editIndex = index;
}

function deleteSubject(index) {
    subjects.splice(index, 1);
    displaySubjects();
}

function calculateCGPA() {
    const totalUnits = subjects.reduce((sum, s) => sum + s.unit, 0); // Calculate total units
    const weightedSum = subjects.reduce((sum, s) => sum + getGradePoint(s.grade) * s.unit, 0); // Calculate weighted sum

    const cgpa = totalUnits === 0 ? 0 : (weightedSum / totalUnits).toFixed(2); // Calculate CGPA
    document.getElementById('cgpa').textContent = cgpa; // Display CGPA

    // Show download and print buttons after calculation
    document.getElementById('downloadButton').style.display = 'inline-block';
    document.getElementById('printButton').style.display = 'inline-block';

    // Save CGPA history (Optional: Add this if you want to save it immediately after calculation)
    saveCGPA(cgpa);
}

// Save CGPA history to Firestore
function saveCGPA(cgpa) {
    const userId = firebase.auth().currentUser.uid;
    firebase.firestore().collection('cgpa_history').add({
        userId: userId,
        cgpa: cgpa,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
}
function downloadCGPA() {
    const cgpaValue = document.getElementById('cgpa').textContent;
    
    // Create a simple report content
    const reportContent = `
        CGPA Report
        --------------------
        Your CGPA: ${cgpaValue}
    `;

    // Create a blob from the report content
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cgpa_report.txt'; // The file name for download
    link.click(); // Trigger the download
}


function getGradePoint(grade) {
    // Assign grade points as per your grading system
    switch (grade) {
        case 'A': return 5.0;
        case 'B': return 4.0;
        case 'C': return 3.0;
        case 'D': return 2.0;
        case 'E': return 1.0;
        case 'F': return 0.0;
        default: return 0.0;
    }
}

function clearForm() {
    document.getElementById('subject').value = '';
    document.getElementById('grade').value = 'A';
    document.getElementById('unit').value = ''; // Changed from credit to unit
}

function resetForm() {
    subjects = [];
    editIndex = -1;
    document.getElementById('subjectList').innerHTML = '';
    document.getElementById('cgpa').textContent = '0.00';
    clearForm();
}
// Assuming you have the user's name stored during signup
const userName = localStorage.getItem('studentName'); // Store this during signup
document.getElementById('studentName').textContent = `Welcome, ${userName}`;

document.getElementById('logoutBtn').addEventListener('click', function() {
    firebase.auth().signOut().then(() => {
        // Redirect to the login page
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error("Error logging out: ", error);
    });
});

document.getElementById('historyBtn').addEventListener('click', function() {
    // Redirect to the history page
    window.location.href = 'history.html'; // Create this page
});

// Call this function after calculating the CGPA to show the history and download buttons
function showResultButtons() {
    document.getElementById('historyBtn').style.display = 'inline-block';
    document.getElementById('downloadBtn').style.display = 'inline-block';
    document.getElementById('printBtn').style.display = 'inline-block';
}
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
      const userId = user.uid;
      try {
          const doc = await firebase.firestore().collection('users').doc(userId).get();
          if (doc.exists) {
              const userData = doc.data();
              document.getElementById('userName').textContent = `Name: ${userData.name}`;
              document.getElementById('userMatric').textContent = `Matric No: ${userData.matric}`;
              document.getElementById('userDept').textContent = `Department: ${userData.department}`;
          }
      } catch (error) {
          console.error("Error fetching user data: ", error);
      }
  }
});
