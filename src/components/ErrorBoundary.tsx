import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
                    <div className="text-center p-8 max-w-md bg-gray-900 border border-red-500/20 rounded-2xl shadow-2xl backdrop-blur-xl">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold mb-2 text-white">Something went wrong</h1>
                        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                            {this.state.error?.message || 'An unexpected error occurred. Please try reloading the page.'}
                        </p>

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="border-gray-700 hover:bg-gray-800 text-gray-300"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-0"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Reload
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
