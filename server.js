// server.js
import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static("public"));

// file to store feedback
const filePath = path.resolve("feedback.json");

// ensure feedback.json exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "[]", "utf8");
}

// limit JSON body size slightly for safety
app.use(express.json({ limit: "100kb" }));

// POST /feedback - accept feedback form
app.post("/feedback", (req, res) => {
  try {
    const { name, subject, feedback } = req.body;
    if (!name || !subject || !feedback) {
      return res.status(400).json({ message: "All fields required" });
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const entry = {
      name: String(name).trim(),
      subject: String(subject).trim(),
      feedback: String(feedback).trim(),
      timestamp: new Date().toISOString(),
    };
    data.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    return res.json({ message: "✅ Feedback received!" });
  } catch (err) {
    console.error("Save error:", err);
    return res.status(500).json({ message: "❌ Error saving feedback" });
  }
});

// GET /feedbacks - return all feedbacks (for admin/demo)
app.get("/feedbacks", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return res.json(data);
  } catch (err) {
    console.error("Read error:", err);
    return res.status(500).json({ message: "Error reading feedbacks" });
  }
});

// listen on CF-provided port or 8080 locally
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
