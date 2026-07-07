import mongoose from "mongoose"
console.log(process.env.MONGODB_URI);

const connectDB=async ()=>{
    try
    {
    const conn=await mongoose.connect(process.env.MONGODB_URI||"");
    console.log(`MONGODB CONNECTED:${conn.connection.host}`);
    }
    catch(error){
        console.error(`Error:${error}`);
        process.exit(1);
    }
}
export default connectDB;