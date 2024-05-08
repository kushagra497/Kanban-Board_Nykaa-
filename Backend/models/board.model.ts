import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tasks:[{type: mongoose.Schema.Types.ObjectId, ref: "Task"}]
}, {
    versionKey: false
})

const BoardModel = mongoose.model('Board', boardSchema);

export default BoardModel;