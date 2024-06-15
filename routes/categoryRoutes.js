import express from 'express';
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getCategory,
  updateCategory,
} from '../controllers/categoryController.js';

import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';

const categoryRouter = express.Router();

categoryRouter.param('id', async (req, res, next, id) => {
  try {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    const category = isValidId
      ? await Category.findById(id)
      : await Category.findOne({ name: id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    next();
  } catch (error) {
    // next(error);
    return res.status(404).json({ message: 'Fail', error: error.message });
  }
});

categoryRouter.route('/').get(getAllCategory).post(createCategory);
categoryRouter
  .route('/:id')
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

export default categoryRouter;
