import React, { useState } from 'react';
import { DatabaseService, CustomerLoginRecord } from '../../services/dbStore';

interface CommonProps {
  onNavigate: (page: string) => void;
  userRole?: 'Admin' | 'Customer';
}

export const InfoPageDisplay: React.FC<CommonProps> = ({ onNavigate, userRole }) => {
  return (
    <div className="relative z-10 w-full max-w-lg mx-auto my-12 p-8 hub-panel">
      <h2 className="text-xl sm:text-2xl font-bold text-center tracking-wider uppercase mb-6 text-white drop-shadow">
        PROPERTY INFORMATION
      </h2>

      <div className="space-y-3.5 text-sm divide-y divide-white/10 mb-8">
        <div className="flex justify-between pt-2">
          <span className="text-white/80 font-semibold">Residency Name:</span>
          <span className="font-bold text-white">Tenant Hub Residency</span>
        </div>
        <div className="flex justify-between pt-3">
          <span className="text-white/80 font-semibold">Property Office:</span>
          <span className="font-bold text-white">Building A, Ground Floor</span>
        </div>
        <div className="flex justify-between pt-3">
          <span className="text-white/80 font-semibold">Emergency Helpline:</span>
          <span className="font-bold text-white">+91 98765 00000</span>
        </div>
        <div className="flex justify-between pt-3">
          <span className="text-white/80 font-semibold">Water Timing:</span>
          <span className="font-bold text-white">6 AM - 10 AM & 5 PM - 9 PM</span>
        </div>
        <div className="flex justify-between pt-3">
          <span className="text-white/80 font-semibold">Rent Payment Due:</span>
          <span className="font-bold text-white">1st - 5th of every month</span>
        </div>
        <div className="flex justify-between pt-3">
          <span className="text-white/80 font-semibold">Landlord PhonePe / UPI:</span>
          <span className="font-bold text-amber-300">9916913919@ibl</span>
        </div>
      </div>

      <div className="text-center">
        <button
          id="btnBack"
          onClick={() => onNavigate(userRole === 'Customer' ? 'customermainpage' : 'adminmainpage')}
          className="hub-btn px-8 py-2.5 text-xs font-bold uppercase tracking-wider"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export const PasswordAllPageDisplay: React.FC<CommonProps> = ({ onNavigate }) => {
  const [logins, setLogins] = useState<CustomerLoginRecord[]>(DatabaseService.getCustomerLogins());
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [status, setStatus] = useState('');

  const refreshData = () => {
    setLogins(DatabaseService.getCustomerLogins());
  };

  const clearForm = () => {
    setUserName('');
    setPassword('');
    setSelectedId(null);
  };

  const handleSelectRow = (rec: CustomerLoginRecord) => {
    setSelectedId(rec.id);
    setUserName(rec.USERNAME);
    setPassword(rec.PASSWORD);
    setStatus(`Selected user '${rec.USERNAME}' from CUSTOMERLOGIN table`);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !password.trim()) {
      setStatus('Username and Password cannot be empty.');
      return;
    }
    DatabaseService.insertCustomerLogin(userName.trim(), password.trim());
    refreshData();
    clearForm();
    setStatus(`User '${userName}' added to CUSTOMERLOGIN table.`);
  };

  const handleUpdate = () => {
    if (!selectedId) {
      setStatus('Please select a login record from the GridView first.');
      return;
    }
    DatabaseService.updateCustomerLogin(selectedId, userName.trim(), password.trim());
    refreshData();
    setStatus(`Password for user '${userName}' updated in database.`);
  };

  const handleDelete = () => {
    if (!selectedId) {
      setStatus('Please select a login record from the GridView first.');
      return;
    }
    DatabaseService.deleteCustomerLogin(selectedId);
    refreshData();
    clearForm();
    setStatus(`Login record deleted from CUSTOMERLOGIN table.`);
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto my-8 p-6 sm:p-8 hub-panel">
      <h2 className="text-xl sm:text-2xl font-bold text-center tracking-wider uppercase mb-2 text-white">
        CUSTOMER LOGIN & PASSWORD MANAGEMENT (ADMIN)
      </h2>
      <p className="text-center text-xs text-white/80 mb-6">
        ASP.NET Code-Behind Simulation for Table: <strong className="text-white">[CUSTOMERLOGIN]</strong>
      </p>

      {status && (
        <div className="p-3 bg-emerald-500/20 text-emerald-200 border border-emerald-400 rounded-lg text-xs font-semibold text-center mb-6 shadow">
          {status}
        </div>
      )}

      {/* Form with ASP.NET TextBoxes and Buttons */}
      <form onSubmit={handleAdd} className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtUserName (Tenant Suffix):</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. 11 or 12"
              className="w-full hub-input font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">txtPassword:</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. tenant11"
              className="w-full hub-input font-mono text-sm"
              required
            />
          </div>
        </div>

        {/* Action Buttons: btnAdd, btnUpdate, btnDelete, btnClear, btnBack */}
        <div className="flex flex-wrap gap-2.5 justify-center pt-2">
          <button type="submit" id="btnAdd" className="hub-btn px-5 py-2 text-xs font-bold">
            Add Login
          </button>
          <button
            type="button"
            id="btnUpdate"
            onClick={handleUpdate}
            className="hub-btn px-5 py-2 text-xs font-bold"
          >
            Update Password
          </button>
          <button
            type="button"
            id="btnDelete"
            onClick={handleDelete}
            className="hub-btn hub-btn-danger px-5 py-2 text-xs font-bold"
          >
            Delete Record
          </button>
          <button
            type="button"
            id="btnClear"
            onClick={clearForm}
            className="hub-btn px-5 py-2 text-xs font-bold"
          >
            Clear
          </button>
          <button
            type="button"
            id="btnBack"
            onClick={() => onNavigate('adminmainpage')}
            className="hub-btn px-5 py-2 text-xs font-bold"
          >
            Back to Admin
          </button>
        </div>
      </form>

      {/* GridView: gvPassword */}
      <div className="overflow-x-auto rounded-xl border border-white/15 shadow-xl">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white/10 text-white text-xs uppercase tracking-wider">
              <th className="p-3 border-b border-white/10">Action</th>
              <th className="p-3 border-b border-white/10">ID</th>
              <th className="p-3 border-b border-white/10">USERNAME</th>
              <th className="p-3 border-b border-white/10">PASSWORD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logins.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <tr
                  key={item.id}
                  className={`hover:bg-white/5 transition ${isSelected ? 'bg-white/10' : ''}`}
                >
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleSelectRow(item)}
                      className="text-xs px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-white font-semibold"
                    >
                      Select
                    </button>
                  </td>
                  <td className="p-3 font-mono text-xs text-white/70">{item.id}</td>
                  <td className="p-3 font-bold text-white font-mono">{item.USERNAME}</td>
                  <td className="p-3">
                    <span className="font-mono text-xs text-amber-200 bg-white/10 px-2.5 py-1 rounded">
                      {item.PASSWORD}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
