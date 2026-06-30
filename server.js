const mongoose = require('mongoose');
const dns = require('dns');
const dotenv=require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION!💥 Shutting down...')
    console.log(err.name, err.message);
    process.exit(1)   // to shutdown the application, code 0 stands for success and code 1 stands for uncaught exception
})


dotenv.config({path:'./config.env'});
const app = require('./app');


// console.log(app.get('env'));

// console.log(process.env);

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

//OPTION 1, UNHANDLED REJECTION USING CATCH METHOD
// mongoose
// // .connect(process.env.DATABASE_LOCAL,{
// .connect(DB,{
//     // useNewParser: true,
//     // useCreateIndex: true,
//     // useFindAndModify: false,
//     // useUnifiedTopology: true
// }).then(()=> console.log('DB connection successful!')).catch(err => {
//     console.log('ERROR')
// });

//OPTION 2, UNHANDLED REJECTION GLOBALLY
mongoose
// .connect(process.env.DATABASE_LOCAL,{
.connect(DB,{
    // useNewParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true
}).then(()=> console.log('DB connection successful!'));


//Creating New Documnet created out of the Tour Model

// const testTour = new Tour({
//     name: 'The Park Camper',
//     price: 497
// })

// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR 💥 :' , err)
// })


//Start Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app running on port ${port}...`)
})

process.on('unhandledRejection', err => {
    console.log('UNHANDLER REJECTION!💥 Shutting down...')
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1)   // to shutdown the application, code 0 stands for success and code 1 stands for uncaught exception
    })
    
} )

// process.on('uncaughtException', err => {
//     console.log('UNCAUGHT EXCEPTION!💥 Shutting down...')
//     console.log(err.name, err.message);
//     server.close(() => {
//     process.exit(1)   // to shutdown the application, code 0 stands for success and code 1 stands for uncaught exception
//     })
// })

// console.log(x)