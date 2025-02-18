import { useState } from 'react';
import  Hero  from '@/components/sections/Hero';
import  Categories  from '@/components/sections/Categories';
import  AddItemButton  from '@/components/shared/AddItemButton';
import { items, clothingCategories } from '@/utils/data/mockData';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50">

      <Hero />
      <Categories 
        categories={clothingCategories}
        items={items}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <AddItemButton />
      
    </div>
  );
};

export default Home;