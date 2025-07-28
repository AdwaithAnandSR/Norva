import mongoose from "mongoose";
import chalk from "chalk";

try {
    const uri = process.env.DB_URI;

    if (!uri) {
        throw new Error(
            "Mongodb uri must not be undefined!\n ensure .env is loaded with DB_URI."
        );
    } else {
        mongoose
            .connect(uri)
            .then(() => {
                console.log(
                    chalk.hex("#2ef8ad")(
                        `connected to database`
                    ),
                    chalk.hex("#f82dbb")(`${mongoose.connection.name} 🔥`)
                );
            })
            .catch(err => {
                throw new Error(`Failed to connect db: ${err}`);
            });
    }
} catch (err) {
    console.log(err);
}
