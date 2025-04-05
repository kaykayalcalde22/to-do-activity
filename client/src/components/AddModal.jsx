import axios from "axios";
import { useState } from "react";

export default function AddModal({ onClose, refreshTasks }) {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState(['']);
  const [loading, setLoading] = useState(false);

  const addTask = () => {
    setTasks([...tasks, ""]);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || tasks.every(task => !task.trim())) {
      alert("Title and at least one task are required!");
      return;
    }

    try {
      const username = "test_user"; // Replace with actual username if needed
      const date_modified = new Date().toISOString().split('T')[0];
      const status = false; // New tasks are always 'Ongoing'

      console.log("Sending Task:", { username, title, tasks });

      // Send the new task to backend
      const response = await axios.post("http://localhost:3000/add-to-do", {
        username,
        title,
        status,
        date_modified,
        lists: tasks.filter(task => task.trim()), // Remove empty tasks
      });

      console.log("Backend Response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || "Unknown error occurred");
      }

      // ✅ Fetch updated tasks after adding new task
      refreshTasks();

      onClose();  // Close modal
    } catch (error) {
      console.error("Error adding task:", error.message);
      alert("Failed to add task. Check the console for details.");
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70">
      <div className="relative w-full max-w-md p-6 bg-[#1c1c1c] rounded-2xl shadow-xl border-4 border-[#b91c1c]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#b91c1c]">💈 Add New Task 💈</h3>
          <button onClick={onClose} className="text-[#b91c1c] hover:text-[#f43f5e]">❌</button>
        </div>
  
        <div>
          <label className="text-[#b91c1c]">Task Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border-2 border-[#b91c1c] rounded-md bg-[#2a2a2a] text-white placeholder-gray-400"
            placeholder="Enter task title"
          />
        </div>
  
        <div className="mt-3">
          <label className="text-[#b91c1c]">Task List</label>
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={task}
                onChange={(e) => {
                  const newTasks = [...tasks];
                  newTasks[index] = e.target.value;
                  setTasks(newTasks);
                }}
                className="p-2 border-2 border-[#b91c1c] rounded-md w-full bg-[#2a2a2a] text-white placeholder-gray-400"
                placeholder={`Task ${index + 1}`}
              />
              {tasks.length > 1 && (
                <button
                  onClick={() => removeTask(index)}
                  className="px-3 py-2 bg-[#b91c1c] text-white rounded-lg hover:bg-[#f43f5e] shadow-md"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
        </div>
  
        <button
          onClick={addTask}
          className="mt-4 px-6 py-3 bg-[#f43f5e] text-white rounded-full shadow-lg hover:bg-[#dc2626]"
        >
          ➕ Add Task
        </button>
  
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-[#b91c1c] text-white rounded-full shadow-lg hover:bg-[#7f1d1d]"
        >
          {loading ? "Saving..." : "✅ Save Task"}
        </button>
      </div>
    </div>
  );
  
  }