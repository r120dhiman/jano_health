
import express from 'express';
import cors from 'cors';
import connectDB from './Database/Dbconnection.js';
import patientRoutes from './routes/patient.js';
import sessionRoutes from './routes/session.js';
import schedulerRoutes from './routes/scheduler.js';
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
app.use('/api/session', sessionRoutes);
app.use('/api/schedule', schedulerRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});