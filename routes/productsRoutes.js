import express from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from '../controllers/productsController.js';
import { uploadFiles } from '../middleware/multerMiddleware.js';
import Product from '../models/productsModel.js';
import mongoose from 'mongoose';

const productsRouter = express.Router();

productsRouter.param('id', async (req, res, next, id) => {
  try {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    const product = isValidId
      ? await Product.findById(id)
      : await Product.findOne({ slug: id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    next();
  } catch (error) {
    // next(error);
    return res.status(404).json({ message: 'Fail', error: error.message });
  }
});

productsRouter
  .route('/')
  .get(getAllProducts)
  .post(
    uploadFiles([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
    createProduct
  );
productsRouter
  .route('/:id')
  .get(getProduct)
  .patch(
    uploadFiles([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ]),
    updateProduct
  )
  .delete(deleteProduct);

export default productsRouter;
