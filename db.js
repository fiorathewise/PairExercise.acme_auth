const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
   logging: false,
};

if (process.env.LOGGING) {
   delete config.logging;
}
const conn = new Sequelize(
   process.env.DATABASE_URL || "postgres://localhost/acme_db",
   config
);

const User = conn.define("user", {
   username: STRING,
   password: STRING,
});

User.byToken = async (token) => {
   try {
      const user = await User.findByPk(token);
		if (user) return user;
   } catch (ex) {
      const error = Error("User.byToken failed");
      error.status = 401;
      throw error;
   }
};

User.authenticate = async ({ username, password }) => {
   const user = await User.findOne({
		where: {
			username: username,
			password: password,
		},
	});
	if (user) {
		const token = await jwt.sign({ userId: user.id }, "testKey");
		return { token };
	}
   const error = Error("User.authenticate failed.");
   error.status = 401;
   throw error;
};

const syncAndSeed = async () => {
   await conn.sync({ force: true });
   const credentials = [
      { username: "lucy", password: "lucy_pw" },
      { username: "moe", password: "moe_pw" },
      { username: "larry", password: "larry_pw" },
   ];
   const [lucy, moe, larry] = await Promise.all(
      credentials.map((credential) => User.create(credential))
   );
   return {
      users: {
         lucy,
         moe,
         larry,
      },
   };
};

module.exports = {
   syncAndSeed,
   models: {
      User,
   },
};
