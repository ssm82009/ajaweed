import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import logo from '../assets/logo.png'; // Placeholder removed

const Header: React.FC = () => {
    const [title, setTitle] = useState('');

    useEffect(() => {
        axios.get('http://localhost:3001/api/settings/public')
            .then(res => setTitle(res.data.header_title))
            .catch(err => console.error(err));
    }, []);

    return (
        <header className="app-header" style={{
            textAlign: 'center',
            padding: '1rem',
            marginBottom: '2rem',
            borderBottom: '1px solid #334155',
            lineHeight: '1.6',
            whiteSpace: 'pre-line', // Important for newlines
            fontSize: '0.9rem',
            color: '#cbd5e1',
            fontWeight: 'bold'
        }}>
            {title || 'Loading...'}
        </header>
    );
};

export default Header;
