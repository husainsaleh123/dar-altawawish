import Notification from "../../models/notification.js";

export {
  index,
  markRead,
};

async function index(req, res) {
  try {
    const notifications = await Notification.find({})
      .populate("entityId", "name email role createdAt")
      .sort("-createdAt")
      .limit(100)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}

async function markRead(req, res) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )
      .populate("entityId", "name email role createdAt")
      .lean();

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}
