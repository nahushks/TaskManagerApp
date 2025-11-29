import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());

app.use(express.static(path.join(__dirname, "static")));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const dbName = "nodetask";
let db;
let taskCollection;

// Helper function to transform MongoDB documents for client compatibility
function transformTaskDocument(doc) {
  if (!doc) return null;

  // Create a copy of the document
  const task = { ...doc };

  // Add id field (string) that matches MongoDB's _id for client compatibility
  task.id = doc._id.toString();

  return task;
}

app.get("/api/tasks", async (req, res) => {
  try {
    const { complete } = req.query;
    let query = {};

    if (complete !== undefined) {
      const isComplete = complete === "true";
      query = { complete: isComplete };
    }

    const tasks = await taskCollection.find(query).toArray();

    const transformedTasks = tasks.map((task) => transformTaskDocument(task));

    res.json(transformedTasks);
  } catch (error) {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
  }
});

app.get("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Convert string ID to MongoDB ObjectId
    const objectId = new ObjectId(id);

    const task = await taskCollection.findOne({ _id: objectId });

    if (!task) {
      return res.status(404).json({ error: `Task with ID ${id} not found` });
    }

    // Transform MongoDB document for client compatibility
    const transformedTask = transformTaskDocument(task);

    res.json(transformedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, complete } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const task = {
      title,
      description: description || "",
      complete: complete || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await taskCollection.insertOne(task);

    // Get the inserted document with the generated _id
    const insertedTask = await taskCollection.findOne({
      _id: result.insertedId,
    });

    res.status(201).json(insertedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, complete } = req.body;

    // Convert string ID to MongoDB ObjectId
    const objectId = new ObjectId(id);

    // Update document with current timestamp
    const updateDoc = {
      $set: {
        title,
        description,
        complete,
        updatedAt: new Date(),
      },
    };

    // Note: In MongoDB driver v6+, findOneAndUpdate uses returnValue instead of returnDocument
    const result = await taskCollection.findOneAndUpdate(
      { _id: objectId },
      updateDoc,
      { returnDocument: "after" } // Return the updated document
    );

    // Result structure changed in MongoDB driver v6+
    const updatedTask = result;

    if (!updatedTask) {
      return res.status(404).json({ error: `Task with ID ${id} not found` });
    }

    // Transform MongoDB document for client compatibility
    const transformedTask = transformTaskDocument(updatedTask);

    res.json(transformedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Convert string ID to MongoDB ObjectId
    const objectId = new ObjectId(id);

    const result = await taskCollection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `Task with ID ${id} not found` });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");

    // Initialize database and collection
    db = client.db(dbName);
    taskCollection = db.collection("tasks");

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Handle application termination
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

// Start the server
startServer();
