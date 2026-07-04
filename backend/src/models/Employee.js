const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    employeeId: { type: String, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    salary: { type: Number, required: true },
    email: { type: String, trim: true },
    designation: { type: String, trim: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], trim: true },
    dutyStartTime: { type: String, trim: true },
    religion: { type: String, trim: true },
    address: { type: String, trim: true },
    joiningDate: { type: Date },
    biometricId: { type: String, required: true, unique: true, trim: true },
    monthlyOffDays: { type: Number, default: 3 },
    leaveBalance: { type: Number, default: 0 },
    employmentStatus: {
      type: String,
      enum: ["Active", "Resigned", "Terminated", "On Probation"],
      default: "Active"
    },
    isDeleted: { type: Boolean, default: false },

    // Identity documents
    cnic: { type: String, trim: true },
    passport: { type: String, trim: true },

    // Emergency contact
    emergencyContact: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      phone: { type: String, trim: true }
    },

    // Organization
    branch: { type: String, trim: true },
    shift: { type: String, trim: true },

    // HR lifecycle
    probationEndDate: { type: Date },
    confirmationDate: { type: Date },
    resignationDate: { type: Date },
    terminationDate: { type: Date },
    terminationReason: { type: String, trim: true },
    rehireDate: { type: Date },

    // Payroll extras
    eobi: { type: Boolean, default: false },
    eobiAmount: { type: Number, default: 0 },
    providentFund: { type: Boolean, default: false },
    providentFundPercentage: { type: Number, default: 0 },

    // Banking
    bankName: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },

    // Profile
    profilePhoto: { type: String, trim: true }
  },
  { timestamps: true }
);

employeeSchema.index({ isDeleted: 1, employmentStatus: 1 });
employeeSchema.index({ name: 1 });
employeeSchema.index({ department: 1 });
// biometricId unique index is defined on the field itself

module.exports = mongoose.model("Employee", employeeSchema);
