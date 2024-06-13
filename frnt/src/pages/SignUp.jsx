import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';

const SignUp = () => {
    const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: '',
    pwd: '',
    usn: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    console.log(loginData)
    const { name, value } = event.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    const { email, pwd, usn } = loginData;

    if (email === '' || pwd === '' || usn === '') {
      setError('All fields are required');
    } else {
      setError('');
      // Proceed with form submission logic (e.g., API call)
      const result = await axios.post("http://localhost:8080/createUser",loginData);
      console.log('Form submitted', loginData);
      console.log('result', result.data.status);
      if (result.data.status === 200) {
        localStorage.setItem("login",email);
        navigate('/main');
      }
      else{
        alert(result.data.message);
      }
    }
  };

  return (
    <div className="login-form-container">
        <div className='login-main-container'>
            <div className="login-title">Sign Up</div>
            {error && <div className="error-message">{error}</div>}
            <form className="login-form" onSubmit={handleSubmit}>
              <input
              type='text'
              name='usn'
              placeholder='Username'
              value={loginData.usn}
              onChange={handleInputChange}
              />
              <input
              type='email'
              name='email'
              placeholder='Email'
              value={loginData.email}
              onChange={handleInputChange}
              />
              <input
              type='password'
              name='pwd'
              placeholder='Password'
              value={loginData.pwd}
              onChange={handleInputChange}
              />
              <div className="goto-signup" onClick={() => navigate("/login")}>Existing User?</div>
              <button type='submit' className='login-submit'>Create Account</button>
            </form>
        </div>
    </div>
  );
};

export default SignUp;
