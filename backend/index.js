const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = require("./middleware/auth");
const User = require("./models/user");
const Transaction = require("./models/transaction");

const app = express();

/* =============================
   Middleware
============================= */
app.use(cors());
app.use(express.json());

/* =============================
   MongoDB Connection
============================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

/* =============================
   Test Route
============================= */
app.get("/", (req, res) => {
  res.json({ message: "WORQIZ Backend Running 🚀" });
});

/* =============================
   REGISTER
============================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    res.status(201).json({
      message: "User Registered Successfully ✅",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =============================
   LOGIN
============================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login Successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =============================
   CREDIT WALLET (Protected)
============================= */
app.post("/credit-wallet", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.walletBalance += Number(amount);
    user.totalEarnings += Number(amount);
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "credit",
      amount: Number(amount),
    });

    res.json({
      message: "Wallet Credited ✅",
      walletBalance: user.walletBalance,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =============================
   WITHDRAW (Protected)
============================= */
app.post("/withdraw", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient Balance ❌" });
    }

    user.walletBalance -= Number(amount);
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: "withdraw",
      amount: Number(amount),
    });

    res.json({
      message: "Withdrawal Successful ✅",
      walletBalance: user.walletBalance,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =============================
   TRANSACTION HISTORY (Protected)
============================= */
app.get("/transactions", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =============================
   START SERVER
============================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
