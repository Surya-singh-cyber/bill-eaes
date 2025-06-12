import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'invoices'),
          where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const invoiceList = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const logoURL = userDoc.exists() ? userDoc.data().logoURL || '' : '';
            return { id: docSnapshot.id, ...docSnapshot.data(), logoURL };
          })
        );
        setInvoices(invoiceList);
      } catch (error) {
        setError('Error fetching invoices: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.buyer.gstin && invoice.buyer.gstin.includes(searchTerm)) ||
    invoice.id.includes(searchTerm)
  );

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Tax Invoice', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Invoice No: ${invoice.id}`, 20, 30);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 35);

    // Logo (if available)
    if (invoice.logoURL) {
      try {
        doc.addImage(invoice.logoURL, 'PNG', 160, 15, 30, 15);
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    // Seller and Buyer Details
    doc.text('Seller:', 20, 45);
    doc.text(invoice.agency.name || 'N/A', 20, 50);
    doc.text(invoice.agency.address || 'N/A', 20, 55);
    doc.text(`GSTIN: ${invoice.agency.gstin || 'N/A'}`, 20, 60);
    doc.text('Bill To:', 105, 45);
    doc.text(invoice.buyer.name || 'N/A', 105, 50);
    doc.text(invoice.buyer.address || 'N/A', 105, 55);
    doc.text(`GSTIN: ${invoice.buyer.gstin || 'N/A'}`, 105, 60);

    // Items Table
    const tableData = invoice.items.map((item, index) => [
      index + 1,
      item.productName,
      item.quantity,
      item.price.toFixed(2),
      (item.price * item.quantity).toFixed(2),
    ]);
    autoTable(doc, {
      startY: 70,
      head: [['Sl No', 'Description', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 20, right: 20 },
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.text(`Subtotal: $${invoice.total.subtotal.toFixed(2)}`, 140, finalY + 10);
    doc.text(`CGST (6%): $${invoice.total.cgst.toFixed(2)}`, 140, finalY + 15);
    doc.text(`SGST (6%): $${invoice.total.sgst.toFixed(2)}`, 140, finalY + 20);
    doc.text(`Hypothecation: $${invoice.charges.hypothecation}`, 140, finalY + 25);
    doc.text(`RTO Charges: $${invoice.charges.rto}`, 140, finalY + 30);
    doc.setFontSize(12);
    doc.text(`Total: $${invoice.total.total.toFixed(2)}`, 140, finalY + 35);

    // Vehicle Details
    doc.setFontSize(10);
    doc.text(`Vehicle Details:`, 20, finalY + 45);
    doc.text(`Model: ${invoice.vehicle.model || 'N/A'}`, 20, finalY + 50);
    doc.text(`Chassis: ${invoice.vehicle.chassis || 'N/A'}`, 20, finalY + 55);
    doc.text(`Serial: ${invoice.vehicle.serial || 'N/A'}`, 20, finalY + 60);

    // Terms
    doc.text('Terms and Conditions:', 20, finalY + 70);
    doc.text('1. Payment due within 30 days.', 20, finalY + 75);
    doc.text('2. Goods once sold will not be returned.', 20, finalY + 80);

    doc.save(`invoice-${invoice.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Invoice List</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading && <p className="text-blue-500 mb-4">Loading invoices...</p>}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by buyer name, GSTIN, or invoice number"
          className="w-full p-2 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        {filteredInvoices.length === 0 && !loading ? (
          <p className="text-gray-500">No invoices found.</p>
        ) : (
          <ul className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <li key={invoice.id} className="p-4 bg-gray-50 rounded shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{invoice.buyer.name}</p>
                    <p className="text-sm text-gray-600">Invoice ID: ${invoice.id}</p>
                    <p className="text-sm text-gray-600">
                      Total: $${invoice.total.total.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => generatePDF(invoice)}
                    disabled={loading}
                    className={`p-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'} transition`}
                  >
                    Download PDF
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default InvoiceList;