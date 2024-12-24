import express from "express";
import { mongoose, Schema } from "mongoose"
import { listing } from "./models/listing.js";
import methodOverride from "method-override"
const app = express();
import path from "path";
import { fileURLToPath } from "url";
import ejsmate from "ejs-mate"
import wrapAsync from "./utils/wrapAsync.js";
import ExpressError from "./utils/ExpressError.js"
import {Review,listingSchema} from "./schema.js"
import review from "./models/review.js";


const MONGO_URL = "mongodb+srv://Kishlay:Kishlay@firstproject.yjwzg.mongodb.net/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(methodOverride("_method"))
//we have to write the below one line for taking the id from header
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res) => {
    res.send("server is running fine")
})
app.use(express.static(path.join(__dirname, "/public")))
app.engine('ejs', ejsmate);
const main = async () => {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("Database Connecteed")
    }).catch((err) => {
        console.log("An error occured")
    })
// app.get("/testListing",async( req,res)=>{
//     // let sample=new listing({
//     //     title: "resort",
//     //     description:"rajasthan resort ",
//     //     // image:"the image not present",
//     //     price:1200,
//     //     location:"rajasthan",
//     //     country:"India",
//     // })
//     // await sample.save();
//     res.send("the data added to the database")
//     console.log("the data was added successfully")
// })

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body)
    if (error){
        // console.log(error)
        // let errMsg=error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,error)
    }else {
        next()
    }
}

app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await listing.find({})
    // console.log(allListings);
    res.render("listings/index.ejs", { allListings })
}))

app.get("/listings/new", wrapAsync((req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    //   }
    console.log("adding new hotel page");
    res.render("listings/new.ejs")
}))

//to create new listing
app.post("/listings",validateListing, wrapAsync(async (req, res,next) => {
    const { title, description, imageUrl, price, country, location } = req.body.listing;
    console.log(req.body)
    // Ensure title and description are present
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Create a new instance of the listing model
    const newListing = new listing({
        title,
        description,
        image: {
            url: imageUrl // Add default image here if none is provided
        },
        price,
        country,
        location
    });

    console.log(newListing); // This will log the listing object
    
    try {
        // Save the new listing to the database
        await newListing.save();
        console.log("The data was successfully added");

        // Redirect to /listings after successful save
        res.redirect("/listings");
    } catch (error) {
        console.error(error); // Log the error
        // res.status(500).json({ error: 'Error creating listing' });
        next(error);
    }
}));

//edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    try {
        const l = req.params.id;
        // console.log(l)
        const data = await listing.findById(l);
         console.log(data)
        if (!data) {
            return res.status(404).send("Listing not found");
        }
        res.render("listings/update", { data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
}))

//delete route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleted = await listing.findByIdAndDelete(id);
    console.log(deleted)
    res.redirect("/listings")
}))

//review
app.post("/listings/:id/review",(async(req,res)=>{
    let listings= await listing.findById(req.params.id);
    let newReview=new review(req.body.review);
     listings.reviews.push(newReview);
     await newReview.save();
     await listings.save();
     console.log("new review saved");
     res.redirect(`/listings/${listings._id}`)
 }))
 
//delte review
app.delete("/listings/:id/review/:reviewId",async(req,res)=>{
    let {id,reviewId}=req.params;
    await listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
})


//post request for update(edit)
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
    console.log("put",req.body.listing)
    const { title, description, imageUrl, price, country, location } = req.body.listing;
    const data = {
        title,
        description,
        image: {
          url: imageUrl
        },
        price,
        country,
        location
      };
      if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
      }
    
    await listing.findByIdAndUpdate(req.params.id, data)
    res.redirect("/listings")
}))


//to view a listing
app.get("/listings/:id", wrapAsync(async (req, res) => {
    try {
        const l = req.params.id;
        // console.log(l)
        const data = await listing.findById(l).populate("reviews");
        //  console.log(data)
        if (!data) {
            return res.status(404).send("Listing not found");
        }
        res.render("listings/show", { data });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
}));
app.all("*",(req,res,next)=> {
    next(new ExpressError(404,"Page Not Found"));
})

app.use((err,req,res,next)=>{
    let{ statusCode=500,message="something went wrong"}=err
    if (res.headersSent) {
        return next(err); // Ensure headers have not already been sent
    }
    res.render("error.ejs",{err})
    // res.status(statusCode).send(message)
})


const start = async () => {
    app.listen(8000, () => {
        console.log("listening to port 8000")
    })

}
start()
