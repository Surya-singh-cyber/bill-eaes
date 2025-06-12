import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  HiHome,
  HiDocumentAdd,
  HiCollection,
  HiCube,
  HiCog,
  HiUserCircle,
  HiChartBar,
  HiCurrencyDollar,
  HiClock
} from 'react-icons/hi';

function Dashboard() {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <HiCube className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Bill Ease</h2>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <Link 
            to="/dashboard" 
            className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
          >
            <HiHome className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          
          <Link 
            to="/create-invoice" 
            className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
          >
            <HiDocumentAdd className="w-5 h-5 mr-3" />
            Create Invoice
          </Link>
          
          <Link 
            to="/invoice-list" 
            className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
          >
            <HiCollection className="w-5 h-5 mr-3" />
            Invoices
          </Link>
          
          <Link 
            to="/inventory" 
            className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
          >
            <HiCube className="w-5 h-5 mr-3" />
            Inventory
          </Link>
          
          <Link 
            to="/settings" 
            className="flex items-center p-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
          >
            <HiCog className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>

        {/* User Section */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <HiUserCircle className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">{auth.currentUser?.email}</p>
              <button 
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-500">Welcome back! Here's your business summary</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">$24,500</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <HiCurrencyDollar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending Invoices</p>
                  <p className="text-2xl font-bold text-gray-800">12</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <HiClock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Stock Value</p>
                  <p className="text-2xl font-bold text-gray-800">$45,200</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <HiChartBar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Invoices</h2>
              <button className="text-blue-600 text-sm hover:underline">View all</button>
            </div>
            <div className="space-y-4">
              {/* Sample Recent Activity Item */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HiDocumentAdd className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">INV-00123</p>
                    <p className="text-sm text-gray-500">ABC Motors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-700">$1,250.00</p>
                  <p className="text-sm text-gray-500">Due: 15 Aug</p>
                </div>
              </div>
              {/* Add more activity items here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;