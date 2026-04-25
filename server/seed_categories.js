require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskarena');

    const categories = [
      { name: 'Math', slug: 'math', iconName: 'Calculator', color: 'blue' },
      { name: 'Math Basics', slug: 'math-basics', iconName: 'Calculator', color: 'sky' },
      { name: 'HTML', slug: 'html', iconName: 'Code', color: 'orange' },
      { name: 'React', slug: 'react', iconName: 'Layout', color: 'cyan' },
      { name: 'Logic', slug: 'logic', iconName: 'Brain', color: 'purple' },
      { name: 'CSS', slug: 'css', iconName: 'Palette', color: 'pink' },
      { name: 'JavaScript', slug: 'javascript', iconName: 'Terminal', color: 'yellow' }
    ];

    for (const cat of categories) {
      await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
    }

    console.log('Categories seeded successfully!');
  } catch (err) {
    console.error('Error seeding categories:', err);
  } finally {
    process.exit(0);
  }
}

seed();
