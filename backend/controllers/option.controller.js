const axios = require("axios")
exports.getOpt = async (req, res) => {
    const {instrumentKey, expiry_date} = req.query;
    console.log("ik,exp", instrumentKey, expiry_date)
    try {
      const opt = await axios.get("https://api.upstox.com/v2/option/chain", {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          Accept: "application/json",
        },
        params: { instrument_key: instrumentKey,
          expiry_date: expiry_date,
         },
      });
  
      const data = opt.data;
      res.status(200).json(data)
    } catch (err) {
      console.error("LTP fallback error:", err.message);
      return res.status(400).json({ error: "Missing IK or Expiry_data" });
    }
  };

  exports.getExpiryDate = async (req, res) => {
    try {
      const { instrument_key } = req.query;
  
      if (!instrument_key) {
        return res.status(400).json({ error: "Missing instrument_key" });
      }
  
      const apiRes = await axios.get(
        `https://api.upstox.com/v2/option/contract`,
        {
          headers: { 
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, 
            Accept: "application/json" 
          },
          params: { instrument_key },
        }
      );
  
      const expirations = [...new Set(apiRes.data.data.map(c => c.expiry))];
      expirations.sort((a, b) => new Date(a) - new Date(b));
  
      return res.status(200).json({ expirations }); // send as object
    } catch (err) {
      console.error("Expiry fetch error:", err.message);
      return res.status(400).json({ error: "Failed to fetch expiry data" });
    }
  };
