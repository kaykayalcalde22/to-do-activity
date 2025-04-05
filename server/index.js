import express from "express";
import { db } from './db.js';
import cors from 'cors';

const app = express();
app.use(cors());
//parse json
app.use(express.json());
const PORT = 3000;

/* //INDEX ROUTE
app.get('/', (req, res) => {
    res.send('Hello Bitch');
});

app.post('/to-do', (req, res) => {
    res.send('This is to-do homepage');
}); */
//get users
app.get('/get-users', (req, res) => {
    const query = "SELECT * FROM users";
    db.query(query)
        .then(users => {
            res.status(200).json({ users: users.rows });
        });
});

//get-titles
app.get("/get-titles", async (req, res) => {
    try {
        const query = "SELECT id, username, title, date_modified, status FROM titles";
        const result = await db.query(query);
        res.status(200).json({ titles: result.rows });
    } catch (error) {
        console.error("Error fetching titles:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/* app.get('/get-titles', (req, res) => {
    const query = "SELECT * FROM titles";
    db.query(query)
        .then(titles => {
            res.status(200).json({ titles: titles.rows });
        });
}); */

//get-lists
/* app.get("/get-lists", async (req, res) => {
    try {
        const { title_id } = req.query; // Extract title_id from query params

        if (!title_id) {
            return res.status(400).json({ success: false, message: "Missing title_id parameter" });
        }

        const query = "SELECT * FROM lists WHERE title_id = $1";
        const result = await db.query(query, [title_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No lists found for this task" });
        }

        res.status(200).json({ list: result.rows });
    } catch (error) {
        console.error("Error fetching lists:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}); */

app.get('/get-lists', async (req, res) => {
    try {
        const { title_id } = req.query;

        let query = "SELECT * FROM lists";
        let values = [];

        if (title_id) {
            query += " WHERE title_id = $1";
            values.push(title_id);
        }

        const result = await db.query(query, values);
        res.status(200).json({ list: result.rows });
    } catch (error) {
        console.error("Error fetching lists:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


//Log in
app.post('/check-user', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username=$1 AND password=$2";

    db.query(query, [username, password])
        .then(result => {
            if (result.rowCount > 0)
                res.status(200).json({ exist: true });
            else {
                res.status(200).json({ exist: false });
            }
        })

});

app.post('/register', (req, res) => {
    const { username, password, fname, lname } = req.body;
    ``
    const query = "INSERT INTO users (username, password, fname, lname )VALUES ($1,$2,$3,$4) ";
    db.query(query, [username, password, fname, lname])
        .then(result => {
            res.status(200).json({ success: true });
        });
});

app.post("/add-task", (req, res) => {
    const { title, tasks } = req.body;
    if (!title || tasks.length === 0) {
        return res.status(400).json({ error: "Title and tasks are required!" });
    }

    console.log("Received new task:", { title, tasks });

    // Simulate saving to database
    tasksDB.push({ title, tasks });

    res.status(201).json({ message: "Task added successfully!" });
});


//add-to-do
/* app.post('/add-title', (req, res) => {
    const { id, username, title, date_modified, status } = req.body;
    ``
    const query = "INSERT INTO titles (id, username, title, date_modified, status )VALUES ($1,$2,$3,$4, $5) ";
    db.query(query, [id, username, title, date_modified, status])
        .then(result => {
            res.status(200).json({ success: true });
        });
});

app.post('/add-list', (req, res) => {
    const { id, title_id, list_desc, status } = req.body;
    ``
    const query = "INSERT INTO list (id, title_id, list_desc, status )VALUES ($1,$2,$3,$4) ";
    db.query(query, [id, title_id, list_desc, status])
        .then(result => {
            res.status(200).json({ success: true });
        });
}); */

app.post('/add-to-do', async (req, res) => {
    try {
        const { username, title, lists } = req.body;
        const date_modified = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const status = false; // Titles are ongoing by default

        // Insert into 'titles' and return the generated ID
        const titleInsertQuery = `
            INSERT INTO titles (username, title, date_modified, status) 
            VALUES ($1, $2, $3, $4) RETURNING id
        `;
        const titleResult = await db.query(titleInsertQuery, [username, title, date_modified, status]);
        const title_id = titleResult.rows[0].id;

        // Insert each task (list item) under the title with default status = false
        const listInsertQuery = "INSERT INTO lists (title_id, list_desc, status) VALUES ($1, $2, $3)";
        for (const list_desc of lists) {
            await db.query(listInsertQuery, [title_id, list_desc, false]); // Status is false (ongoing)
        }

        res.json({ success: true, message: "Successfully Added" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});




//delete button
app.delete('/delete-title/:titleId', async (req, res) => {
    try {
        const { titleId } = req.params;
        await db.query("DELETE FROM lists WHERE title_id = $1", [titleId]);
        await db.query("DELETE FROM titles WHERE id = $1", [titleId]);
        res.json({ success: true, message: "Title and associated tasks deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



//delete-to-do
app.post('/delete-to-do', async (req, res) => {
    try {
        const { title_id } = req.body;

        if (!title_id) {
            return res.status(400).json({ success: false, message: "title_id is required" });
        }

        // Delete lists associated with the title_id first
        const deleteListsQuery = "DELETE FROM lists WHERE title_id = $1";
        await db.query(deleteListsQuery, [title_id]);

        // Delete the title itself
        const deleteTitleQuery = "DELETE FROM titles WHERE id = $1";
        const result = await db.query(deleteTitleQuery, [title_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "No title found with this ID" });
        }

        res.json({ success: true, message: "To-do Successfully Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

//update-title-status
app.put("/update-title-status", async (req, res) => {
    try {
        const { titleId, status } = req.body;
        const query = "UPDATE titles SET status = $1 WHERE id = $2";
        await db.query(query, [status, titleId]);

        res.status(200).json({ success: true, message: "Title status updated" });
    } catch (error) {
        console.error("Error updating title status:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
//upate the tittle
app.put("/update-title", async (req, res) => {
    try {
        const { titleId, title } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Title cannot be empty" });
        }

        await db.query("UPDATE titles SET title = $1 WHERE id = $2", [title, titleId]);

        res.json({ success: true, message: "Title updated successfully" });
    } catch (error) {
        console.error("Error updating title:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
//delete the TAsk
app.delete('/delete-task/:id', async (req, res) => {
    try {
        const taskId = req.params.id;

        // Check if task exists before deleting
        const checkQuery = "SELECT * FROM lists WHERE id = $1";
        const taskExists = await db.query(checkQuery, [taskId]);

        if (taskExists.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Delete the task
        const deleteQuery = "DELETE FROM lists WHERE id = $1";
        await db.query(deleteQuery, [taskId]);

        res.json({ success: true, message: "Task deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});



//upate-status
app.put('/update-status', async (req, res) => {
    try {
        const { title_id, id, status } = req.body;

        if (!title_id || !id || status === undefined) {
            return res.status(400).json({ success: false, message: "title_id, id, and status are required" });
        }

        // Update the status of the list item
        const updateListQuery = "UPDATE lists SET status = $1 WHERE title_id = $2 AND id = $3";
        const result = await db.query(updateListQuery, [status, title_id, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "No matching record found" });
        }

        res.json({ success: true, message: "List Status Successfully Updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Task Description
app.put('/update-task', async (req, res) => {
    try {
        const { id, new_desc } = req.body;

        if (!id || !new_desc) {
            return res.status(400).json({ success: false, message: "Task ID and new description are required" });
        }

        const updateQuery = "UPDATE lists SET list_desc = $1 WHERE id = $2";
        const result = await db.query(updateQuery, [new_desc, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.json({ success: true, message: "Task successfully updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete Task
app.delete('/delete-task', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Task ID is required" });
        }

        const deleteQuery = "DELETE FROM lists WHERE id = $1";
        const result = await db.query(deleteQuery, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.json({ success: true, message: "Task successfully deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

//upate-to-do
app.post('/update-to-do', async (req, res) => {
    try {
        const { title_id, lists } = req.body;

        if (!title_id || !Array.isArray(lists)) {
            return res.status(400).json({ success: false, message: "title_id and a valid lists array are required" });
        }

        // Delete existing list items for the given title_id
        const deleteListsQuery = "DELETE FROM lists WHERE title_id = $1";
        await db.query(deleteListsQuery, [title_id]);

        // Insert updated list items
        const insertListQuery = "INSERT INTO lists (title_id, list_desc, status) VALUES ($1, $2, $3)";
        for (const list_desc of lists) {
            await db.query(insertListQuery, [title_id, list_desc, "true"]);
        }

        res.json({ success: true, message: "To-Do List Successfully Updated" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});
