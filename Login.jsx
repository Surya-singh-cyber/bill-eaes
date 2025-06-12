import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginSettings, setLoginSettings] = useState({
    loginLogoURL: '',
    softwareName: 'Bill Ease'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoginSettings = async () => {
      try {
        const docRef = doc(db, 'users', 'admin', 'loginSettings', 'settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLoginSettings(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching login settings:', error);
      }
    };
    fetchLoginSettings();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col">
      {/* Logo and Software Name Section */}
      <div className="flex justify-center items-center py-8">
        {loginSettings.loginLogoURL && (
          <img
            src={loginSettings.loginLogoURL}
            alt="Software Logo"
            className="h-16 mr-4"
          />
        )}
        <h1 className="text-4xl font-bold text-white">{loginSettings.softwareName}</h1>
      </div>

      {/* Login Form */}
      <div className="flex items-center justify-center flex-1">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;