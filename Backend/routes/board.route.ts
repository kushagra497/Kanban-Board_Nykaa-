import express, { Request, Response } from 'express';
import BoardModel from '../models/board.model';
import auth, { AuthRequest } from './../middleware/auth.middleware';
import dotenv from 'dotenv'
import TaskModel from '../models/task.model';
import SubtaskModel from '../models/subtask.model';

dotenv.config();

const boardRouter = express.Router();

boardRouter.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in request' });
        }

        const board = new BoardModel({ name, userId });
        await board.save();
        res.status(200).json({ msg: 'Board created successfully', board });
    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: 'Internal server error' });
    }
});

boardRouter.get('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in request' });
        }
        const boards = await BoardModel.find({ userId });
        res.status(200).json({ msg: 'Boards fetched successfully', boards });
    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: 'Internal server error' });
    }
})

boardRouter.get('/:boardId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { boardId } = req.params;

        if (!userId || !boardId) {
            return res.status(400).json({ message: 'User ID or Board ID not found in request' });
        }

        // Fetch the board with its tasks and populated subtasks
        const board = await BoardModel.findOne({ _id: boardId, userId })
            .populate({
                path: 'tasks',
                populate: {
                    path: 'subtasks',
                },
            })
            .exec();

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        res.status(200).json(board);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

boardRouter.delete('/:boardId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { boardId } = req.params;

        if (!userId || !boardId) {
            return res.status(400).json({ message: 'User ID or Board ID not found in request' });
        }

        const deletedBoard = await BoardModel.findOneAndDelete({ _id: boardId, userId });

        if (!deletedBoard) {
            return res.status(404).json({ message: 'Board not found' });
        }

        await TaskModel.deleteMany({ boardId: deletedBoard._id });

        await SubtaskModel.deleteMany({ taskId: { $in: deletedBoard.tasks } });

        res.status(200).json({ message: 'Board and associated data deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

boardRouter.patch('/:boardId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { boardId } = req.params;
        const { name } = req.body;

        if (!userId || !boardId || !name) {
            return res.status(400).json({ message: 'User ID, Board ID, or Name not found in request' });
        }

        // Find the board to update
        const boardToUpdate = await BoardModel.findOne({ _id: boardId, userId });

        if (!boardToUpdate) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Update the name of the board
        boardToUpdate.name = name;
        await boardToUpdate.save();

        res.status(200).json({ message: 'Board name updated successfully', board: boardToUpdate });
    } catch (error) {
        console.error('Error updating board name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default boardRouter