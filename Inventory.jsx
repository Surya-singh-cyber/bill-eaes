import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'inventory'));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        setError('Error fetching products: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const validateInputs = () => {
    if (!newProduct.name.trim()) {
      setError('Product name is required.');
      return false;
    }
    if (isNaN(newProduct.price) || Number(newProduct.price) <= 0) {
      setError('Price must be a positive number.');
      return false;
    }
    if (isNaN(newProduct.stock) || Number(newProduct.stock) < 0) {
      setError('Stock must be a non-negative number.');
      return false;
    }
    return true;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'inventory'), {
        name: newProduct.name,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
      });
      setNewProduct({ name: '', price: '', stock: '' });
      const querySnapshot = await getDocs(collection(db, 'inventory'));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
      alert('Product added successfully!');
    } catch (error) {
      setError('Error adding product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Inventory</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading && <p className="text-blue-500 mb-4">Loading...</p>}
        <form onSubmit={handleAddProduct}>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="Product Name"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            required
          />
          <input
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            placeholder="Price"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0.01"
            step="0.01"
            disabled={loading}
            required
          />
          <input
            type="number"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            placeholder="Stock Quantity"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} transition`}
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
        <h2 className="text-xl font-semibold mt-6 mb-4">Product List</h2>
        {loading ? (
          <p className="text-blue-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <ul className="space-y-4">
            {products.map((product) => (
              <li key={product.id} className="p-4 bg-gray-50 rounded shadow">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600">Price: $${product.price}</p>
                <p className="text-sm text-gray-600">Stock: ${product.stock}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Inventory;