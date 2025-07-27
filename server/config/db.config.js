import mongoose from "mongoose";

try {
    const uri = process.env.DB_URI;

    if (!uri){
        
        throw new Error(
            "Mongodb uri must not be undefined!\n ensure .env is loaded with DB_URI."
        )
    }
    else{
        
    mongoose
        .connect(uri)
        .then(() => {
            console.log(`connected to database ${mongoose.connection.name} 🔥`);
        })
        .catch(err => {
            throw new Error(`Failed to connect db: ${err}`);
        });
    }
} catch (err) {
    console.log(err);
}
