import { useState } from 'react';
import Hero from '@/components/sections/Hero';
import Categories from '@/components/sections/Categories';
import PopularCategoryItems from '@/components/sections/PopularCategoryItems';
import AddItemButton from '@/components/shared/AddItemButton';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <Categories 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <PopularCategoryItems 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <AddItemButton />
    </div>
  );
};

export default Home;