require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

const categories = [
  { name: 'JavaScript', slug: 'javascript', iconName: 'JS', color: 'yellow' },
  { name: 'React', slug: 'react', iconName: 'Re', color: 'cyan' },
  { name: 'Node.js', slug: 'nodejs', iconName: 'No', color: 'green' },
  { name: 'Python', slug: 'python', iconName: 'Py', color: 'blue' },
  { name: 'Data Science', slug: 'data-science', iconName: 'DS', color: 'purple' },
  { name: 'DevOps', slug: 'devops', iconName: 'Op', color: 'slate' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskarena');
    console.log('MongoDB connected for seeding');

    await Category.deleteMany({});
    console.log('Existing categories removed');

    await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
