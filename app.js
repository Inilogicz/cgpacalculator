// Firebase Setup
const firebaseConfig = {
    apiKey: "AIzaSyB6TuWB3QaOC1Gtxot4IqWNFCYR_QRAHcE",
    authDomain: "cgpa-calculator-97430.firebaseapp.com",
    projectId: "cgpa-calculator-97430",
    storageBucket: "cgpa-calculator-97430.appspot.com",
    messagingSenderId: "945044547837",
    appId: "YOUR_APP_ID",
    databaseURL: "https://cgpa-calculator-97430-default-rtdb.firebaseio.com/" // Add your database URL
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Toggle between login and signup forms
const wrapper = document.querySelector(".wrapper"),
    loginHeader = document.querySelector("#loginHeader"),
    signupHeader = document.querySelector("#signupHeader");

loginHeader.addEventListener("click", () => {
    wrapper.classList.add("active");
});
signupHeader.addEventListener("click", () => {
    wrapper.classList.remove("active");
});

// Signup
document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    const matric = document.getElementById('signupMatric').value;
    const dept = document.getElementById('signupDept').value;
    const session = document.getElementById('signupSession').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const userId = userCredential.user.uid;
            return database.ref('users/' + userId).set({
                name: name,
                matric: matric,
                session: session,
                department: dept,
            });
        })
        .then(() => {
            // Handle success and redirect to dashboard
            window.location.href = "dashboard.html"; // Redirect to dashboard
        })
        .catch((error) => {
            document.getElementById('signupError').textContent = error.message;
        });
});

// Login
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            // Redirect to dashboard after successful login
            window.location.href = "dashboard.html"; // Redirect to dashboard
        })
        .catch((error) => {
            document.getElementById('loginError').textContent = error.message;
        });
});
