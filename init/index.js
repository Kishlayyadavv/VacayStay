import mongoose from "mongoose";
import data from "./data.js";
import { listing } from "../models/listing.js";

const MONGO_URL="mongodb+srv://Kishlay:Kishlay@firstproject.yjwzg.mongodb.net/";


const main=async()=>{
    await mongoose.connect(MONGO_URL);
}
main()
.then(()=>{
    console.log("Database Connecteed")
}).catch((err)=>{
    console.log("An error occured")
})

const initDB=async()=>{
    await listing.deleteMany({});
    await listing.insertMany(data.data);
    console.log("MANY DATA WAS ADDED SUCCESFULLY")
}
initDB();