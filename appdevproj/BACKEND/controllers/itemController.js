import Item from '../models/itemModel.js';

export const getItems = async (req, res) => {
  try {
    const { status, q } = req.query;
    const query = {};
    if (status) query.status = status;
    if (q) query.itemName = new RegExp(q, 'i');

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postItem = async (req, res) => {
  try {
    console.log('Received data:', req.body);  // Debug log
    
    const itemData = {
      itemName: req.body.itemName,
      description: req.body.description,
      dateLostOrFound: req.body.dateLostOrFound,
      status: req.body.status,
      contactInfo: req.body.contactInfo
    };

    if (req.file) {
      itemData.imageURL = `/uploads/${req.file.filename}`;
    }

    const newItem = new Item(itemData);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error saving item:', err);  // Debug log
    res.status(400).json({ error: err.message });
  }
};

export const updateItemStatus = async (req, res) => {
  try {
    console.log('Updating item status. ID:', req.params.id, 'New status:', req.body.status);
    
    if (!req.body.status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const updated = await Item.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    
    if (!updated) {
      console.log('Item not found with ID:', req.params.id);
      return res.status(404).json({ error: 'Item not found' });
    }
    
    console.log('Item updated successfully:', updated);
    res.json(updated);
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
