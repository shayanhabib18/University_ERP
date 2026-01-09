// Simple test to verify the /students/me endpoint returns correct data
import fetch from 'node-fetch';

const email = "shayanhabib2003@gmail.com";
const password = "Shayan@123"; // Your test password

async function test() {
  try {
    console.log("1. Testing login...");
    const loginResp = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginResp.json();
    console.log("Login response:", loginData);
    
    if (!loginResp.ok) {
      console.error("Login failed:", loginData);
      return;
    }

    const token = loginData.access_token;
    console.log("\n2. Testing /students/me with token...");
    
    const profileResp = await fetch("http://localhost:5000/students/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileResp.json();
    console.log("Profile response:", JSON.stringify(profileData, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
