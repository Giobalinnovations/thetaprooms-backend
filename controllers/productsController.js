import mongoose from 'mongoose';
import Product from '../models/productsModel.js';
import Category from '../models/categoryModel.js';

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: 'success',
      results: products.length,
      data: products,
    });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const getProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    const product = isValidId
      ? await Product.findById(id)
      : await Product.findOne({ slug: id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: `get product by id ${id}`, data: product });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const createProduct = async (req, res, next) => {
  const { category: categoryId } = req.body;
  const imageCover = req?.files?.imageCover?.map(file => file?.location)[0];
  const images = req?.files?.images?.map(file => file?.location) || [];
  const newProductData = { ...req.body, imageCover, images };

  try {
    const product = await Product.create({
      ...newProductData,
      category: categoryId,
    });

    await Category.findByIdAndUpdate(categoryId, {
      $addToSet: { products: product._id },
    });
    console.log(product);
    res.status(201).json({ message: 'success', data: product });
  } catch (error) {
    res.status(404).json({ message: 'Fail', error: error.message });
    // next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const newProductData = { ...req.body };
  try {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    const product = isValidId
      ? await Product.findById(id)
      : await Product.findOne({
          slug: id,
        });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imageCover =
      req?.files?.imageCover?.map(file => file?.location)[0] ||
      req.body.imageCover ||
      product.imageCover;
    const images =
      typeof req.body.images === 'string'
        ? req.body.images.split(',').filter(Boolean)
        : [
            ...(tour.images || []),
            ...(req?.files?.images?.map(file => file?.location) || []),
          ];

    await Product.findByIdAndUpdate(id, {
      ...newProductData,
      imageCover,
      images,
    });

    res.status(200).json({ message: `Product updated ${id}` });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: `Product deleted ${id}` });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

export {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
