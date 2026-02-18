const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    salary: Number,
    location: String,
    contactNumber: String,
    urgent: { type: Boolean, default: false },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "assigned", "completed", "paid"],
      default: "open",
    },

    rating: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
