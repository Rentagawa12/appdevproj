import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  dateLostOrFound: { type: Date, required: true },
  status: { type: String, enum: ['lost', 'found', 'claimed'], required: true },
  contactInfo: { type: String, required: true },
  imageURL: { type: String }
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
