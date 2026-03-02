import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('App crashed:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a0f1e', color: '#ef4444', minHeight: '100vh' }}>
                    <h2 style={{ color: '#f1f5f9' }}>⚠️ App Error</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#111827', padding: 20, borderRadius: 8, color: '#f87171' }}>
                        {this.state.error?.toString()}
                        {'\n\n'}
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
