const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
app.use(express.json());
const {
   models: { User },
} = require("./db");
const path = require("path");

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
   try {
      const user = await User.authenticate(req.body);
		if (!user) res.sendStatus(404);
		res.send(user);
   } catch (ex) {
      next(ex);
   }
});

app.get("/api/auth", async (req, res, next) => {
   try {
      const token = req.headers.authorization;
		const data = await jwt.verify(token, "testKey");
		console.log(data, 'data');
		const user = await User.findByPk(data.userId);
		res.send(user);
   } catch (ex) {
      next(ex);
   }
});

app.use((err, req, res, next) => {
   console.log(err);
   res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
