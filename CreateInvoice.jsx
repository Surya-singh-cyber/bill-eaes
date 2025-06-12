import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function CreateInvoice() {
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [inventory, setInventory] = useState([]);
  const [buyer, setBuyer] = useState({ name: '', address: '', gstin: '' });
  const [vehicle, setVehicle] = useState({ model: '', chassis: '', serial: '' });
  const [charges, setCharges] = useState({ hypothecation: 0, rto: 0 });
  const [agency, setAgency] = useState({ name: '', address: '', gstin: '' });
  const [logoURL, setLogoURL] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const inventoryList = inventorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInventory(inventoryList);

      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAgency(docSnap.data().agency || { name: '', address: '', gstin: '' });
          setLogoURL(docSnap.data().logoURL || '');
        }
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'quantity' ? Number(value) : value;
    setItems(newItems);
  };

  const handleBuyerChange = (e) => {
    setBuyer({ ...buyer, [e.target.name]: e.target.value });
  };

  const handleVehicleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleChargesChange = (e) => {
    setCharges({ ...charges, [e.target.name]: Number(e.target.value) || 0 });
  };

  const calculateTotal = () => {
    let subtotal = 0;
    items.forEach((item) => {
      const product = inventory.find((prod) => prod.id === item.productId);
      if (product) {
        subtotal += product.price * item.quantity;
      }
    });
    const gst = subtotal * 0.12; // 12% GST
    const total = subtotal + gst + charges.hypothecation + charges.rto;
    return {
      subtotal: Number(subtotal),
      gst: Number(gst),
      total: Number(total)
    };
  };

  const generatePDF = (invoiceData) => {
    const doc = new jsPDF();
    let yPos = 10;

    // Logo
    if (logoURL) {
      try {
        doc.addImage(logoURL, 'PNG', 10, yPos, 30, 30);
        yPos += 35;
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    // Agency Details
    doc.setFontSize(16);
    doc.text(agency.name || 'Agency Name', 10, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(agency.address || 'Agency Address', 10, yPos);
    yPos += 7;
    doc.text(`GSTIN: ${agency.gstin || 'Not Provided'}`, 10, yPos);
    yPos += 10;

    // Invoice Title and Details
    doc.setFontSize(18);
    doc.text('Tax Invoice', 190, 20, { align: 'right' });
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoiceData.id}`, 190, 30, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 40, { align: 'right' });

    // Buyer Details
    yPos += 5;
    doc.setFontSize(14);
    doc.text('Bill To:', 10, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(buyer.name || 'Buyer Name', 10, yPos);
    yPos += 7;
    doc.text(buyer.address || 'Buyer Address', 10, yPos);
    yPos += 7;
    doc.text(`GSTIN: ${buyer.gstin || 'Not Provided'}`, 10, yPos);
    yPos += 10;

    // Vehicle Details
    doc.setFontSize(14);
    doc.text('Vehicle Details:', 10, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.text(`Model: ${vehicle.model || 'N/A'}`, 10, yPos);
    yPos += 7;
    doc.text(`Chassis: ${vehicle.chassis || 'N/A'}`, 10, yPos);
    yPos += 7;
    doc.text(`Serial: ${vehicle.serial || 'N/A'}`, 10, yPos);
    yPos += 10;

    // Items Table
    const tableData = items.map((item, index) => {
      const product = inventory.find((prod) => prod.id === item.productId);
      const price = product ? product.price : 0;
      const total = price * item.quantity;
      return [
        index + 1,
        product ? product.name : 'Unknown',
        item.quantity,
        price,
        total
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: [['#', 'Item', 'Quantity', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Charges and Totals
    const { subtotal, gst, total } = calculateTotal();
    doc.setFontSize(12);
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 140, yPos);
    yPos += 7;
    doc.text(`CGST (6%): ₹${(gst / 2).toFixed(2)}`, 140, yPos);
    yPos += 7;
    doc.text(`SGST (6%): ₹${(gst / 2).toFixed(2)}`, 140, yPos);
    yPos += 7;
    doc.text(`Hypothecation Charges: ₹${charges.hypothecation.toFixed(2)}`, 140, yPos);
    yPos += 7;
    doc.text(`RTO Charges: ₹${charges.rto.toFixed(2)}`, 140, yPos);
    yPos += 7;
    doc.setFontSize(14);
    doc.text(`Total: ₹${total.toFixed(2)}`, 140, yPos);

    // Terms and Conditions
    yPos += 15;
    doc.setFontSize(12);
    doc.text('Terms and Conditions:', 10, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text('1. Payment due within 30 days.', 10, yPos);
    yPos += 5;
    doc.text('2. Goods once sold will not be taken back.', 10, yPos);

    // Save PDF
    doc.save(`invoice_${invoiceData.id}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totals = calculateTotal();
      const invoiceData = {
        userId: auth.currentUser.uid,
        items,
        buyer,
        vehicle,
        charges,
        createdAt: new Date().toISOString(),
        subtotal: totals.subtotal,
        gst: totals.gst,
        total: totals.total,
      };
      const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
      generatePDF({ id: docRef.id });
      alert('Invoice created and PDF downloaded!');
      setItems([{ productId: '', quantity: 1 }]);
      setBuyer({ name: '', address: '', gstin: '' });
      setVehicle({ model: '', chassis: '', serial: '' });
      setCharges({ hypothecation: 0, rto: 0 });
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 bg-blue-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Bill Ease</h2>
        <nav>
          <a href="/dashboard" className="block py-2 px-4 hover:bg-blue-700 rounded">Dashboard</a>
          <a href="/create-invoice" className="block py-2 px-4 hover:bg-blue-700 rounded">Create Invoice</a>
          <a href="/invoice-list" className="block py-2 px-4 hover:bg-blue-700 rounded">Invoice List</a>
          <a href="/inventory" className="block py-2 px-4 hover:bg-blue-700 rounded">Inventory</a>
          <a href="/settings" className="block py-2 px-4 hover:bg-blue-700 rounded">Settings</a>
          <button onClick={() => auth.signOut()} className="block w-full text-left py-2 px-4 hover:bg-blue-700 rounded">Logout</button>
        </nav>
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Create Invoice</h1>
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          {items.map((item, index) => (
            <div key={index} className="flex space-x-4 mb-4">
              <select
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                className="w-1/2 p-2 border rounded"
              >
                <option value="">Select Product</option>
                {inventory.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                placeholder="Quantity"
                className="w-1/4 p-2 border rounded"
                min="1"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-6 hover:bg-blue-600"
          >
            Add Item
          </button>

          <h2 className="text-xl font-semibold mb-4">Buyer Details</h2>
          <input
            type="text"
            name="name"
            value={buyer.name}
            onChange={handleBuyerChange}
            placeholder="Buyer Name"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            name="address"
            value={buyer.address}
            onChange={handleBuyerChange}
            placeholder="Buyer Address"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            name="gstin"
            value={buyer.gstin}
            onChange={handleBuyerChange}
            placeholder="Buyer GSTIN"
            className="w-full p-2 mb-4 border rounded"
          />

          <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
          <input
            type="text"
            name="model"
            value={vehicle.model}
            onChange={handleVehicleChange}
            placeholder="Vehicle Model"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            name="chassis"
            value={vehicle.chassis}
            onChange={handleVehicleChange}
            placeholder="Chassis Number"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            name="serial"
            value={vehicle.serial}
            onChange={handleVehicleChange}
            placeholder="Serial Number"
            className="w-full p-2 mb-4 border rounded"
          />

          <h2 className="text-xl font-semibold mb-4">Additional Charges</h2>
          <input
            type="number"
            name="hypothecation"
            value={charges.hypothecation}
            onChange={handleChargesChange}
            placeholder="Hypothecation Charges"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="number"
            name="rto"
            value={charges.rto}
            onChange={handleChargesChange}
            placeholder="RTO Charges"
            className="w-full p-2 mb-4 border rounded"
          />

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Save Invoice & Download PDF
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateInvoice;