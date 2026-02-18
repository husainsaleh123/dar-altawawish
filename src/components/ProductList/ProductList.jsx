// ./src/components/ProductList/ProductList.jsx

import { useState, useEffect } from 'react';
import { getAllItems } from '../../utilities/items-api.js';
import styles from './ProductsList.module.scss';

export default function ProductsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const productsData = await getAllItems();
      setItems(productsData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const categories = ['all', ...new Set(items.map(item => item.category))];

  if (loading) {
    return <div className={styles.loading}>Loading items...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchItems} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.ProductsList}>
      <div className={styles.filters}>
        <label htmlFor="category">Filter by Category:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.grid}>
        {filteredItems.map(item => (
          <div key={item._id} className={styles.itemCard}>
            <div className={styles.emoji}>{item.emoji}</div>
            <h3>{item.name}</h3>
            <p className={styles.category}>{item.category}</p>
            <p className={styles.price}>{item.formattedPrice}</p>
            <button 
              className={styles.addButton}
              onClick={() => handleAddToCart(item)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className={styles.noItems}>No items found in this category.</p>
      )}
    </div>
  );
}

function handleAddToCart(item) {
  // This will be implemented in the cart context
  console.log('Adding to cart:', item);
}