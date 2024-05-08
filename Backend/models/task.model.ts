import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Todo', 'Doing', 'Done'], default: "Todo" },
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubTask" }],
    boardId:{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }
}, {
    versionKey: false
})

const TaskModel = mongoose.model('Task', taskSchema);

export default TaskModel;