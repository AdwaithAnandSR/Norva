import mongoose from "mongoose";
import chalk from "chalk";

try {
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_USER = process.env.DB_USER;

    const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.8ayfqlk.mongodb.net/norva?appName=Cluster0`;

    if (!DB_PASSWORD || !DB_USER) {
        console.warn(
            chalk.yellow(
                "MongoDB user or password missing in environment variables. Ensure DB_USER and DB_PASSWORD are set."
            )
        );
    } else if (mongoose.connection.readyState === 0) {
        mongoose
            .connect(uri)
            .then(() => {
                console.log(
                    chalk.hex("#2ef8ad")(`connected to database`),
                    chalk.hex("#f82dbb")(`${mongoose.connection.name} 🍂\n\n\n`)
                );
            })
            .catch(err => {
                console.error(`Failed to connect to DB: ${err.message || err}`);
            });
    }
} catch (err) {
    console.error("db.config error:", err);
}
