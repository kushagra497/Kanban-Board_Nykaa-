import express from 'express';
import cors from 'cors';
import connection from './config/db';
import { Request, Response } from "express";
import userRouter from './routes/user.route';
import boardRouter from './routes/board.route';
import taskRouter from './routes/task.route';
import subtaskRouter from './routes/subtask.route';

const app = express();
app.use(express.json(), cors())
app.use("/", userRouter)
app.use("/board", boardRouter)
app.use("/task", taskRouter)
app.use('/subtask', subtaskRouter)

app.get("/", (req: Request, res: Response) => {
    res.send("server is running")
})

app.listen(3000, async () => {
    try {
        await connection;
        console.log("server is listening and db is connected");
    } catch (error) {
        console.log(error);

    }

})