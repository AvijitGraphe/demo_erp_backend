import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Nouser from './Nouser';
import ProtectedRoute from '../../components/PrivateRoute';
import ProfileDetails from './Profiledetails';
const Newuser = () => {

  return (
    <div>
      <Routes>
        {/* Define the nested route */}
        <Route path="home" element={<ProtectedRoute element={Nouser} allowedRoles={['Unverified']}/>} />
        <Route path="profiledetails" element={<ProtectedRoute element={ProfileDetails} allowedRoles={['Unverified']} />} />
      </Routes>
    </div>
  );
}

export default Newuser;

