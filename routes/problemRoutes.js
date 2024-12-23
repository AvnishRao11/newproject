const express = require("express");
const Problem = require("../models/Problem");
const Topic = require("../models/Topic"); // Import Topic model

const router = express.Router();

// Get all unique topics (fetching from the Topic model directly)
router.get("/topics", async (req, res) => {
    try {
        const topics = await Topic.find({}, "name"); // Retrieve only topic names
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get problems by topic ID
router.get("/by-topic/:topicId", async (req, res) => {
    try {
        const { topicId } = req.params;

        // Fetch problems associated with the specific topic ID
        const problems = await Problem.find({ topic: topicId }).populate('topic'); // populate 'topic' to get full topic details

        if (!problems.length) {
            return res.status(404).json({ message: "No problems found for this topic" });
        }

        res.json(problems);
    } catch (error) {
        console.error("Error fetching problems by topic:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get all problems or filter by topic if provided as a query param
router.get("/", async (req, res) => {
    try {
        const { topic } = req.query;
        const query = topic ? { topic } : {}; // If 'topic' is provided in query, filter by it
        const problems = await Problem.find(query).populate('topic'); // Populate the 'topic' field with full topic details

        if (!problems.length) {
            return res.status(404).json({ message: "No problems found" });
        }

        res.json(problems);
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get a specific problem by ID
router.get("/:id", async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('topic'); // Populate 'topic' to get full topic details
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        res.json(problem);
    } catch (error) {
        console.error("Error fetching problem:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
