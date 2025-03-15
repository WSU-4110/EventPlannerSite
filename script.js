//firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB78Zxb1syQWWtf-bPDzGdhClkmBZsKkWM",
    authDomain: "eventplannersite-7e4a1.firebaseapp.com",
    projectId: "eventplannersite-7e4a1",
    storageBucket: "eventplannersite-7e4a1.firebasestorage.app",
    messagingSenderId: "107253360225",
    appId: "1:107253360225:web:7cbdea05d0d78e68576c20",
    measurementId: "G-JNNSMNC46Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function registerUser(email, password, username) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
           
            const user = userCredential.user;
            console.log("Registration successful:", user);
            
            return db.collection('users').doc(user.uid).set({
                username: username
            });
        })
        .then(() => {
            window.location.href = './planner.html'; 
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Registration error:", errorCode, errorMessage);
            alert("Registration failed: " + errorMessage);
            
        });
}

function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            
            const user = userCredential.user;
            console.log("Login successful:", user);
            window.location.href = './planner.html'; 
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Login error:", errorCode, errorMessage);
            alert("Login failed: " + errorMessage);
            
        });
}

// Script from login.html
function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}
// Script from planner.html
// Is currently in planner.html

// Initially show the "View Events" section or any default section
// Is currently in planner.html