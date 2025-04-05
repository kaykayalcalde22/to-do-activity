import axios from "axios";
import { useEffect, useState } from "react";
import AddModal from "../components/AddModal.jsx"; 

function Todo() {
    const [titles, setTitles] = useState([]);
    const [lists, setLists] = useState({});
    const [expandedTasks, setExpandedTasks] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editTitle, setEditTitle] = useState(null);
    const [newTitle, setNewTitle] = useState("");
    const [editTask, setEditTask] = useState(null);
    const [newTaskDesc, setNewTaskDesc] = useState("");

    // Fetch titles from the database
    const fetchTasks = async () => {
        try {
            const response = await axios.get("http://localhost:3000/get-titles");
            setTitles(response.data.titles);
        } catch (error) {
            console.error("Error fetching titles:", error);
        }
    };

    // Fetch lists for a specific title
    const toggleLists = async (titleId) => {
        if (expandedTasks[titleId]) {
            setExpandedTasks((prev) => ({ ...prev, [titleId]: false }));
        } else {
            try {
                const response = await axios.get(`http://localhost:3000/get-lists?title_id=${titleId}`);

                    setLists((prevLists) => ({ ...prevLists, [titleId]: response.data.list }));
                setExpandedTasks((prev) => ({ ...prev, [titleId]: true }));
            } catch (error) {
                console.error("Error fetching lists:", error);
            }
        }
    };

    const handleUpdateTask = async (taskId) => {
        const confirmUpdate = window.confirm("Are you sure you want to update this task?");

        if (!confirmUpdate) return; // If user cancels, stop

        try {
            await axios.put("http://localhost:3000/update-task", {
                id: taskId,
                new_desc: newTaskDesc,
            });

            setEditTask(null);
            fetchTasks(); // Refresh list
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };


    const handleDeleteTask = async (taskId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        try {
            await axios.delete("http://localhost:3000/delete-task", {
                data: { id: taskId },
            });

            setLists((prevLists) => {
                const updatedLists = Object.keys(prevLists).reduce((acc, key) => {
                    acc[key] = prevLists[key].filter(task => task.id !== taskId);
                    return acc;
                }, {});
                return updatedLists;
            });
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };



    // Handle task completion
    const handleCheckboxChange = async (titleId, taskId, currentStatus) => {
        try {
            // Toggle status (true if checked, false if unchecked)
            const newStatus = !currentStatus;

            // Update the task status in the database
            await axios.put("http://localhost:3000/update-status", {
                title_id: titleId,
                id: taskId,
                status: newStatus,
            });

            // Update the local state to reflect the change
            setLists((prevLists) => {
                const updatedLists = prevLists[titleId]?.map((task) =>
                    task.id === taskId ? { ...task, status: newStatus } : task
                ) || [];

                return { ...prevLists, [titleId]: updatedLists };
            });

            // Fetch updated lists to check if all tasks are completed
            const updatedLists = lists[titleId]?.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
            );

            const allTasksDone = updatedLists.every((task) => task.status === true);

            if (allTasksDone) {
                // Update title status in the database
                await axios.put("http://localhost:3000/update-title-status", {
                    titleId,
                    status: true,
                });

                // Ensure the title moves to "Done" in the frontend state
                setTitles((prevTitles) =>
                    prevTitles.map((title) =>
                        title.id === titleId ? { ...title, status: true } : title
                    )
                );
            }

            // *Force UI Refresh* by re-fetching tasks
            fetchTasks();
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    const handleUpdateTitle = async (titleId) => {
        try {
            if (!newTitle.trim()) {
                alert("Title cannot be empty.");
                return;
            }

            await axios.put("http://localhost:3000/update-title", {
                titleId,
                title: newTitle
            });

            setTitles((prevTitles) =>
                prevTitles.map((title) =>
                    title.id === titleId ? { ...title, title: newTitle } : title
                )
            );

            setEditTitle(null);
            setNewTitle("");
        } catch (error) {
            console.error("Error updating title:", error);
        }
    };

    const handleDeleteTitle = async (titleId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this title?");

        if (!confirmDelete) return; // If user cancels, do nothing

        try {
            await axios.delete(`http://localhost:3000/delete-title/${titleId}`);

                setTitles((prevTitles) => prevTitles.filter((title) => title.id !== titleId));
        } catch (error) {
            console.error("Error deleting title:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center p-6 bg-[#1b1b1b]">
            <h2 className="text-5xl font-bold text-center text-[#d4af37] mb-8 drop-shadow-lg">💈 Barber's Task 💈</h2>
    
            <div className="w-3/4 flex justify-between gap-6">
                {/* Ongoing Tasks */}
                <div className="w-1/2">
                    <div className="w-full p-6 bg-[#2c2c2c] rounded-xl shadow-2xl overflow-y-auto max-h-[70vh] border-4 border-[#d4af37]">
                        <h1 className="text-3xl font-semibold text-center text-[#d4af37] mb-6 tracking-wider">✂️ Ongoing Task✂️</h1>
                        <div className="space-y-4">
                            {titles.filter(title => !title.status).map((title) => (
                                <div key={title.id} className="p-4 bg-[#3a3a3a] text-white rounded-xl border-l-8 border-[#d4af37]">
                                    {editTitle === title.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                className="p-2 border border-[#555] rounded bg-[#1f1f1f] text-white"
                                            />
                                            <button onClick={() => handleUpdateTitle(title.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                                            <button onClick={() => setEditTitle(null)} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-bold cursor-pointer text-[#d4af37] text-xl" onClick={() => toggleLists(title.id)}>
                                                💇 {title.title}
                                            </h3>
                                            {expandedTasks[title.id] && (
                                                <div className="mt-2 space-y-2">
                                                    {lists[title.id]?.map((list) => (
                                                        <div key={list.id} className="flex items-center gap-2 text-white">
                                                            <input
                                                                type="checkbox"
                                                                checked={list.status}
                                                                onChange={() => handleCheckboxChange(title.id, list.id, list.status)}
                                                                className="accent-[#d4af37] w-5 h-5"
                                                            />
                                                            {editTask === list.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={newTaskDesc}
                                                                    onChange={(e) => setNewTaskDesc(e.target.value)}
                                                                    className="p-2 border border-[#555] rounded bg-[#1f1f1f] text-white"
                                                                />
                                                            ) : (
                                                                <span>{list.list_desc}</span>
                                                            )}
                                                            {editTask === list.id ? (
                                                                <>
                                                                    <button onClick={() => handleUpdateTask(list.id)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                                                                    <button onClick={() => setEditTask(null)} className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">Cancel</button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => { setEditTask(list.id); setNewTaskDesc(list.list_desc); }} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">🖊️</button>
                                                                    <button onClick={() => handleDeleteTask(list.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">❌</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-2 flex gap-2">
                                                <button onClick={() => { setEditTitle(title.id); setNewTitle(title.title); }} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">🖊️ Update</button>
                                                <button onClick={() => handleDeleteTitle(title.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">❌ Delete</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="mt-4 px-6 py-3 bg-[#d4af37] text-black font-bold rounded-full shadow-md hover:bg-[#b99c2f]">➕ Add Task</button>
                </div>
    
                {/* Done Tasks */}
                <div className="w-1/2">
                    <div className="w-full p-6 bg-[#2c2c2c] rounded-xl shadow-2xl overflow-y-auto max-h-[70vh] border-4 border-[#6699cc]">
                        <h1 className="text-3xl font-semibold text-center text-[#6699cc] mb-6 tracking-wider">💈 All Clean 💈</h1>
                        <div className="space-y-4">
                            {titles.filter(title => title.status).map((title) => (
                                <div key={title.id} className="p-4 bg-[#3e4a52] text-white rounded-xl border-l-8 border-[#6699cc]">
                                    <h3 className="font-bold cursor-pointer text-[#6699cc] text-xl" onClick={() => toggleLists(title.id)}>
                                        ✨ {title.title}
                                    </h3>
                                    {expandedTasks[title.id] && (
                                        <div className="mt-2 space-y-2">
                                            {lists[title.id]?.map((list) => (
                                                <div key={list.id} className="flex items-center gap-2 text-gray-400">
                                                    <span className="line-through">{list.list_desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
    
            {showModal && <AddModal onClose={() => setShowModal(false)} refreshTasks={fetchTasks} />}
        </div>
    );
};

export default Todo;        