const fs = require('fs');
const mongoose = require('mongoose');
const dns = require('dns');
const dotenv=require('dotenv');
const Tour = require('./../../models/tourModels')
const User = require('./../../models/userModels')
const Review = require('./../../models/reviewModels')

dotenv.config({path:'./config.env'});

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose
// .connect(process.env.DATABASE_LOCAL,{
.connect(DB,{
    // useNewParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true
}).then(()=> console.log('DB connection successful!'));

// READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
// console.log(tours)

//IMPORT DATA INTO DB

const importData = async () => {
    try{
        await Tour.create(tours)
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews)
        console.log('Data successfully loaded!')
    }catch(err){
        console.log(err)
    }
    process.exit();
}

// DELETE ALL DATA FROM COLLECTION OR DB

const deleteData = async () => {
     try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted');
    }catch(err){
        console.log(err)
    }
        process.exit();
}

if(process.argv[2] === '--import') {
    importData();
}else if (process.argv[2] === '--delete') {
    deleteData();
}

// deleteData();
// console.log(process.argv);


















