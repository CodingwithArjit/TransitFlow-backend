require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "driver@transitflow.com";
    const newPassword = "123456";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      console.log("Driver not found");
      return;
    }

    console.log("Password reset successfully");
    console.log("Email:", user.email);
    console.log("New password:", newPassword);
  } catch (err) {
    console.log(err.message);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();