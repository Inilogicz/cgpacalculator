const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "cgpa-calculator-97430.firebaseapp.com",
    projectId: "cgpa-calculator-97430",
    storageBucket: "cgpa-calculator-97430.appspot.com",
    messagingSenderId: "945044547837",
    appId: "YOUR_APP_ID"
  };
  
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  auth.onAuthStateChanged((user) => {
    if (user) {
      const userId = user.uid;
      db.collection('users').doc(userId).get().then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          document.getElementById('profileName').textContent = userData.name;
          document.getElementById('profileMatric').textContent = userData.matric;
          document.getElementById('profileDept').textContent = userData.department;
          document.getElementById('profileSession').textContent = userData.session;
        }
      });
    } else {
      window.location.href = "signup.html"; // Redirect to login/signup page if not authenticated
    }
  });
          