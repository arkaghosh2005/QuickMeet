import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);