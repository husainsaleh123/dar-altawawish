import User from "../../models/user.js";

export {
  index,
  update,
};

async function index(req, res) {
  try {
    const users = await User.find({})
      .select("-password")
      .sort("-createdAt")
      .lean();

    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}

async function update(req, res) {
  try {
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "role")) {
      updates.role = req.body.role;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "points")) {
      updates.points = req.body.points;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ msg: "No valid fields provided." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}
