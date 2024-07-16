import mongoose from "mongoose";

let isConnected = false; //Check Mongoose Connection

function getConnStates() {
  return mongoose.connections.map((connection) => {
    return connection.readyState;
  });
}

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if(!process.env.MONGODB_URI) return console.error('No MongoDB URI found');  
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("MongoDB already connected");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Failed to connect to MongoDB: ", error);
  }
};