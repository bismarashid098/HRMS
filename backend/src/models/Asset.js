const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  assignedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date },
  condition: { type: String, enum: ["Good", "Fair", "Damaged"], default: "Good" },
  notes: { type: String, maxlength: 500 }
}, { _id: false });

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  assetCode: { type: String, unique: true, trim: true, maxlength: 50 },
  category: {
    type: String,
    enum: ["Laptop", "Desktop", "Mobile", "Vehicle", "Furniture", "Equipment", "Other"],
    default: "Other"
  },
  brand: { type: String, maxlength: 100 },
  model: { type: String, maxlength: 100 },
  serialNumber: { type: String, maxlength: 100 },
  purchaseDate: { type: Date },
  purchasePrice: { type: Number, min: 0 },
  currentValue: { type: Number, min: 0 },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  status: {
    type: String,
    enum: ["Available", "Assigned", "Under Maintenance", "Disposed"],
    default: "Available"
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  assignmentHistory: [assignmentSchema],
  notes: { type: String, maxlength: 500 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

assetSchema.index({ status: 1, category: 1 });
// assetCode unique index is defined on the field itself

module.exports = mongoose.model("Asset", assetSchema);
