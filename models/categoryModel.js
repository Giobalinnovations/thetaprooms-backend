import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'category is required'],
      trim: true,
      index: { unique: true },
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
