import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';

function Settings() {
  const [agency, setAgency] = useState({ name: '', address: '', gstin: '' });
  const [logo, setLogo] = useState(null);
  const [logoURL, setLogoURL] = useState('');
  const [loginSettings, setLoginSettings] = useState({
    loginLogo: null,
    loginLogoURL: '',
    softwareName: 'Bill Ease',
    slogan: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const loginSettingsRef = doc(db, 'users', auth.currentUser.uid, 'loginSettings', 'settings');
        
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setAgency(userDocSnap.data().agency || { name: '', address: '', gstin: '' });
          setLogoURL(userDocSnap.data().logoURL || '');
        }

        const loginSettingsSnap = await getDoc(loginSettingsRef);
        if (loginSettingsSnap.exists()) {
          setLoginSettings(loginSettingsSnap.data());
        }
      }
    };
    fetchSettings();
  }, []);

  const handleAgencyChange = (e) => {
    setAgency({ ...agency, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleLoginSettingsChange = (e) => {
    setLoginSettings({ ...loginSettings, [e.target.name]: e.target.value });
  };

  const handleLoginLogoChange = (e) => {
    if (e.target.files[0]) {
      setLoginSettings({ ...loginSettings, loginLogo: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('Please log in to save settings.');
      return;
    }
    setLoading(true);
    try {
      let newLogoURL = logoURL;
      let newLoginLogoURL = loginSettings.loginLogoURL;

      if (logo) {
        const logoRef = ref(storage, `logos/${auth.currentUser.uid}/${logo.name}`);
        await uploadBytes(logoRef, logo);
        newLogoURL = await getDownloadURL(logoRef);
      }

      if (loginSettings.loginLogo) {
        const loginLogoRef = ref(storage, `logos/${auth.currentUser.uid}/login_${loginSettings.loginLogo.name}`);
        await uploadBytes(loginLogoRef, loginSettings.loginLogo);
        newLoginLogoURL = await getDownloadURL(loginLogoRef);
      }

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        agency,
        logoURL: newLogoURL,
      }, { merge: true });

      await setDoc(doc(db, 'users', auth.currentUser.uid, 'loginSettings', 'settings'), {
        loginLogoURL: newLoginLogoURL,
        softwareName: loginSettings.softwareName,
        slogan: loginSettings.slogan,
        description: loginSettings.description,
      }, { merge: true });

      alert('Settings saved successfully!');
      setLogo(null);
      setLoginSettings({ ...loginSettings, loginLogo: null, loginLogoURL: newLoginLogoURL });
      setLogoURL(newLogoURL);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-4">Agency Details</h2>
          <input
            type="text"
            name="name"
            value={agency.name}
            onChange={handleAgencyChange}
            placeholder="Agency Name"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="address"
            value={agency.address}
            onChange={handleAgencyChange}
            placeholder="Agency Address"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="gstin"
            value={agency.gstin}
            onChange={handleAgencyChange}
            placeholder="Agency GSTIN"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <h2 className="text-xl font-semibold mb-4">Invoice Logo</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full p-2 mb-4 border rounded"
          />
          {logoURL && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Current Invoice Logo:</p>
              <img src={logoURL} alt="Agency Logo" className="h-20 mt-2" />
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">Login Page Settings</h2>
          <input
            type="text"
            name="softwareName"
            value={loginSettings.softwareName}
            onChange={handleLoginSettingsChange}
            placeholder="Software Name (e.g., Bill Ease)"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleLoginLogoChange}
            className="w-full p-2 mb-4 border rounded"
          />
          {loginSettings.loginLogoURL && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Current Login Page Logo:</p>
              <img src={loginSettings.loginLogoURL} alt="Login Logo" className="h-20 mt-2" />
            </div>
          )}
          <input
            type="text"
            name="slogan"
            value={loginSettings.slogan}
            onChange={handleLoginSettingsChange}
            placeholder="Slogan (e.g., Streamline Your Billing)"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            value={loginSettings.description}
            onChange={handleLoginSettingsChange}
            placeholder="Software Description (e.g., Bill Ease is a GST-compliant billing software...)"
            className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} transition`}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;