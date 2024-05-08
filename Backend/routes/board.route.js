"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const board_model_1 = __importDefault(require("../models/board.model"));
const auth_middleware_1 = __importDefault(require("./../middleware/auth.middleware"));
const dotenv_1 = __importDefault(require("dotenv"));
const task_model_1 = __importDefault(require("../models/task.model"));
const subtask_model_1 = __importDefault(require("../models/subtask.model"));
dotenv_1.default.config();
const boardRouter = express_1.default.Router();
boardRouter.post('/', auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in request' });
        }
        const board = new board_model_1.default({ name, userId });
        yield board.save();
        res.status(200).json({ msg: 'Board created successfully', board });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Error: 'Internal server error' });
    }
}));
boardRouter.get('/', auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in request' });
        }
        const boards = yield board_model_1.default.find({ userId });
        res.status(200).json({ msg: 'Boards fetched successfully', boards });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ Error: 'Internal server error' });
    }
}));
boardRouter.get('/:boardId', auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
        const { boardId } = req.params;
        if (!userId || !boardId) {
            return res.status(400).json({ message: 'User ID or Board ID not found in request' });
        }
        // Fetch the board with its tasks and populated subtasks
        const board = yield board_model_1.default.findOne({ _id: boardId, userId })
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
boardRouter.delete('/:boardId', auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
        const { boardId } = req.params;
        if (!userId || !boardId) {
            return res.status(400).json({ message: 'User ID or Board ID not found in request' });
        }
        const deletedBoard = yield board_model_1.default.findOneAndDelete({ _id: boardId, userId });
        if (!deletedBoard) {
            return res.status(404).json({ message: 'Board not found' });
        }
        yield task_model_1.default.deleteMany({ boardId: deletedBoard._id });
        yield subtask_model_1.default.deleteMany({ taskId: { $in: deletedBoard.tasks } });
        res.status(200).json({ message: 'Board and associated data deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
boardRouter.patch('/:boardId', auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
        const { boardId } = req.params;
        const { name } = req.body;
        if (!userId || !boardId || !name) {
            return res.status(400).json({ message: 'User ID, Board ID, or Name not found in request' });
        }
        // Find the board to update
        const boardToUpdate = yield board_model_1.default.findOne({ _id: boardId, userId });
        if (!boardToUpdate) {
            return res.status(404).json({ message: 'Board not found' });
        }
        // Update the name of the board
        boardToUpdate.name = name;
        yield boardToUpdate.save();
        res.status(200).json({ message: 'Board name updated successfully', board: boardToUpdate });
    }
    catch (error) {
        console.error('Error updating board name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = boardRouter;
