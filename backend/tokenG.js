
exports.getCode = async(req, res) =>{
  const code = req.query.code;

  if (!code) return res.status(400).send("Authorization code not found");

  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", "8b01026f-26d3-40ce-b76f-e45383998856");
  params.append("client_secret", "0urq2u8srs");
  params.append("redirect_uri", "https://127.0.0.1:5000");
  params.append("grant_type", "authorization_code");

  try {
    const tokenRes = await fetch("https://api.upstox.com/v2/login/authorization/token", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await tokenRes.json();
    console.log("Access Token:", data.access_token);
    
    // Optionally: store in DB or send back to admin panel
    res.redirect('/dashboard');  
  } catch (err) {
    console.error("Token Fetch Error:", err);
    res.status(500).send("Failed to get token");
  }
  // Step 1: Get the authorization code
  // api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=8b01026f-26d3-40ce-b76f-e45383998856&redirect_uri=https://127.0.0.1:5000
  // get code from the above URL and replace it in the params below
  // https: fetch("https://api.upstox.com/v2/login/authorization/token", {
  //   method: "POST",
  //   headers: {
  //     accept: "application/json",
  //     "Content-Type": "application/x-www-form-urlencoded",
  //   },
  //   body: params,
  // })
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log("Access Token Response:", data);
  //   })
  //   .catch((error) => {
  //     console.error("Error fetching token:", error);
  //   });
  }
