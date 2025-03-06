const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET

const authenticationToken = (req, res, next) => {
       const token = req.headers.authorization?.split(" ")[1];
       if (!token) return res.status(401).send("Access Denied");
       try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.user = decoded;
          next();
       } catch (error) {
          return res.status(403).json({ error: "Forbidden: Invalid token" });
       }
}

module.exports = authenticationToken;