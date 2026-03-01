const express=require('express');
const cors=require('cors');
const connectDB=require('./Database/Dbconnection');
const app=express();
const port=5000;

app.use(cors());
app.use(express.json());
const mongoURI=process.env.MongoURI;
connectDB(mongoURI);


app.get('/',(req,res)=>{
    res.send('Hello World!');
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});