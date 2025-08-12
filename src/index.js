import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ Use ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom';
import './index.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './Redux/redux-store';
import App from './App';
import { AuthProvider } from './Context/AuthProvider';

// ✅ Use createRoot instead of ReactDOM.render
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Provider store={store}>
        <HashRouter>
            <PersistGate persistor={persistor}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </PersistGate>
        </HashRouter>
    </Provider>
);
