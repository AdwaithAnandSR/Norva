import mongoose from "mongoose";
import chalk from "chalk";

try {
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_USER = process.env.DB_USER;
    
    const uri  = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.8ayfqlk.mongodb.net/norva?appName=Cluster0`

    if (!DB_PASSWORD) {
        throw new Error(
            "Mongodb password must not be undefined!\n ensure .env is loaded with DB_PASSWORD."
        );
    } else {
        mongoose
            .connect(uri)
            .then(() => {
                console.log(
                    chalk.hex("#2ef8ad")(
                        `connected to database`
                    ),
                    chalk.hex("#f82dbb")(`${mongoose.connection.name} 🍂\n\n\n`)
                );
            })
            .catch(err => {
                throw new Error(`Failed to connect db: ${err}`);
            });
    }
} catch (err) {
    console.log(err);
}
