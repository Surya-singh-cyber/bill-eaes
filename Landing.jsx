import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Bill Ease</h1>
          <p className="text-xl mb-8">
            Simplify your billing with GST-compliant invoices for e-rickshaw agencies.
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full hover:bg-blue-100 transition"
          >
            Login to Get Started
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
          Why Choose Bill Ease?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">GST Compliance</h3>
            <p className="text-gray-600">
              Generate invoices with accurate CGST/SGST calculations (12% total) tailored for Indian agencies.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Multi-User Support</h3>
            <p className="text-gray-600">
              Secure data isolation for multiple users, perfect for agency teams.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Inventory & Invoicing</h3>
            <p className="text-gray-600">
              Manage inventory, create invoices, and export professional PDFs with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Bill Ease. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Landing;