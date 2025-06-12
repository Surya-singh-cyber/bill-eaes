import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import Landing from './components/Landing';
  import Login from './components/Login';
  import Dashboard from './components/Dashboard';
  import CreateInvoice from './components/CreateInvoice';
  import InvoiceList from './components/InvoiceList';
  import Inventory from './components/Inventory';
  import Settings from './components/Settings';
  import { auth } from './firebase';
  import { useEffect, useState } from 'react';

  function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    }, []);

    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/create-invoice" element={user ? <CreateInvoice /> : <Navigate to="/login" />} />
          <Route path="/invoice-list" element={user ? <InvoiceList /> : <Navigate to="/login" />} />
          <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  export default App;