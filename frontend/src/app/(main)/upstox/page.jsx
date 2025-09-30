"use client";
const CLIENT_ID = "8b01026f-26d3-40ce-b76f-e45383998856";
const REDIRECT_URI = "http://localhost:5000"; // This is your backend endpoint
export default function AdminPage() {
  const handleLogin = () => {
    // api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=8b01026f-26d3-40ce-b76f-e45383998856&redirect_uri=https://127.0.0.1:5000

    const upstoxAuthURL = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=8b01026f-26d3-40ce-b76f-e45383998856&redirect_uri=https://127.0.0.1:5000`;
    window.location.href = upstoxAuthURL;
  };

  return (
    <>
      <div>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogin}>Login with Upstox</button>
      </div>
    </>
  );
}
