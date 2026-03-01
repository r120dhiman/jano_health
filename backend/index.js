
import express from 'express';
import cors from 'cors';
import connectDB from './Database/Dbconnection.js';
import patientRoutes from './routes/patient.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = 3001;


app.use(cors({
    origin: '*'
}));
app.use(express.json());
connectDB();



app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/patients', patientRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});