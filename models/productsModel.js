import mongoose, { Schema } from 'mongoose';

const productSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    name: {
      type: String,
      required: [true, 'product name is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      index: { unique: true },
    },

    imageCover: {
      type: String,
      required: [true, 'Image cover is required'],
    },

    images: {
      type: [String],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
