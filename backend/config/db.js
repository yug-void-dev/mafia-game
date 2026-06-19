import mongoose from "mongoose";


export const dbConnect = async () => {
  const DB_URI = process.env.DB_URI;
  if (!DB_URI) {
    console.log(`Database Connection UI is not configured in .env`);
  }
  try {
    const connect = await mongoose.connect(DB_URI);
    console.log(
      `Data base connected successfully: [HOST] ${connect.connection.host}`,
    );
  } catch (error) {
    console.log(`Error in connecting to Database [ERROR] ${error}`);
  }
};
