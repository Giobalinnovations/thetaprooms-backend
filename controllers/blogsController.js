import mongoose from 'mongoose';
import Blog from '../models/blogsModel.js';
import Category from '../models/categoryModel.js';

const getAllBlogs = async (req, res, next) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'category'];
    excludedFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    let query = Blog.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const parts = req.query.sort.split(':');
      query = query.sort({ [parts[0]]: parts[1] === 'desc' ? -1 : 1 });
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }

    if (req.query.category) {
      query = query.where('category').equals(req.query.category);
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numBlogs = await Blog.countDocuments();
      if (skip >= numBlogs) throw new Error('This page does not exist');
    }

    const blogs = await query.populate('category');

    res.status(200).json({
      message: 'success',
      results: blogs.length,
      data: blogs,
    });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const getBlog = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    const blog = isValidId
      ? await Blog.findById(id)
      : await Blog.findOne({ slug: id });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: `get blog by id ${id}`, data: blog });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const createBlog = async (req, res, next) => {
  const { category: categoryId } = req.body;
  const imageCover = req?.files?.imageCover?.map(file => file?.location)[0];

  const newBlogData = { ...req.body, imageCover };

  try {
    const blog = await Blog.create({
      ...newBlogData,
      category: categoryId,
    });

    await Category.findByIdAndUpdate(categoryId, {
      $addToSet: { blogs: blog._id },
    });
    console.log(blog);
    res.status(201).json({ message: 'success', data: blog });
  } catch (error) {
    res.status(404).json({ message: 'Fail', error: error.message });
    // next(error);
  }
};

const updateBlog = async (req, res, next) => {
  const { id } = req.params;
  const { slug, ...newBlogData } = req.body;
  console.log(newBlogData);

  try {
    const isValidId = mongoose.Types.ObjectId.isValid(id);
    const blog = isValidId
      ? await Blog.findById(id)
      : await Blog.findOne({
          slug: id,
        });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    let imageCover;

    if (req?.files?.imageCover?.length) {
      imageCover = req?.files?.imageCover?.map(file => file?.location)[0];
    } else if (req.body.imageCover) {
      imageCover = req.body.imageCover[0].preview;
    } else {
      imageCover = blog.imageCover;
    }
    // const imageCover =
    //   req?.files?.imageCover?.map(file => file?.location)[0] ||
    //   req.body.imageCover ||
    //   blog.imageCover;

    await Blog.findByIdAndUpdate(
      id,
      {
        ...newBlogData,
        imageCover,
      },
      {
        new: true,
        // revalidate: true,
      }
    );

    res.status(200).json({ message: `Blog updated ${id}` });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: `Blog deleted ${id}` });
  } catch (error) {
    // next(error);
    res.status(404).json({ message: 'Fail', error: error.message });
  }
};

export { getAllBlogs, getBlog, createBlog, updateBlog, deleteBlog };
