const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = require("./middleware/auth");
const User = require("./models/user");
const Job = require("./models/job");

const app = express();

app.use(cors());
app.use(express.json());

/* =============================
   DB CONNECTION
============================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

/* =============================
   REGISTER
============================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role,
      walletBalance: 0,
    });

    res.status(201).json({ message: "Registered ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   LOGIN
============================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   CREATE JOB
============================= */
app.post("/create-job", auth, async (req, res) => {
  try {
    const { title, description, salary, location, contactNumber } = req.body;

    const user = await User.findById(req.user.id);

    if (user.role !== "agent" && user.role !== "owner")
      return res.status(403).json({ message: "Not allowed ❌" });

    const job = await Job.create({
      title,
      description,
      salary,
      location,
      contactNumber,
      postedBy: user._id,
      applicants: [],
      status: "open",
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   APPLY JOB
============================= */
app.post("/apply-job/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (user.role !== "worker")
      return res.status(403).json({ message: "Only workers allowed" });

    if (job.applicants.includes(user._id))
      return res.status(400).json({ message: "Already applied" });

    job.applicants.push(user._id);
    await job.save();

    res.json({ message: "Applied ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   ACCEPT WORKER
============================= */
app.post("/accept-job/:jobId/:workerId", auth, async (req, res) => {
  try {
    const { jobId, workerId } = req.params;

    const job = await Job.findById(jobId);
    const owner = await User.findById(req.user.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (owner.role !== "agent" && owner.role !== "owner")
      return res.status(403).json({ message: "Not allowed ❌" });

    if (!job.applicants.includes(workerId))
      return res.status(400).json({ message: "Worker not applied" });

    job.assignedTo = workerId;
    job.status = "assigned";

    await job.save();

    res.json({ message: "Worker Accepted ✅" });
  } catch (err) {
    console.log("ACCEPT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =============================
   GET JOBS
============================= */
app.get("/jobs", async (req, res) => {
  const jobs = await Job.find()
    .populate("postedBy", "name role")
    .populate("applicants", "name")
    .sort({ createdAt: -1 });

  res.json(jobs);
});

/* ============================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
