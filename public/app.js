function register() {
    // Input values-a gavanikrom
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;

    // Emptya irundha alert tharorom
    if (!username || !password) {
        alert("Username matrum Password rendumey type pannunga!");
        return;
    }

    console.log("Register Button Clicked:", username, password);

    // Backend-kku data anupuroom
    fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Registration Successful!");
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Register Button Clicked! (Backend connectivity test)");
    });
}

function login() {
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    if (!username || !password) {
        alert("Username matrum Password type pannunga!");
        return;
    }

    alert("Login Clicked!");
}