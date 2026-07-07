import mongoose from "mongoose"

const connectDB = async (mongodbUri: string) => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        const conn = await mongoose.connect(mongodbUri);
        console.log(`MONGODB CONNECTED:${conn.connection.host}`);
    }
    catch(error) {
        console.error(`Error:${error}`);
        throw error;
    }
}
export default connectDB;