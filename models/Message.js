const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender_id: String,
  room: String,
  body: String,
  recipient_readed: {type: Boolean, default: false},
  created_at: { type: Date, default: Date.now },
});

module.exports = messageSchema