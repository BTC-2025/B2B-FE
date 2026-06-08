import Message from "../models/Message.js";
import User from "../models/User.js";

export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChatContacts = async (req, res) => {
  try {
    // Find all users who have messaged the current user or been messaged by them
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    });

    const contactIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== req.user._id.toString()) {
        contactIds.add(msg.sender.toString());
      }
      if (msg.recipient.toString() !== req.user._id.toString()) {
        contactIds.add(msg.recipient.toString());
      }
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }).select(
      "name email role"
    );

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
