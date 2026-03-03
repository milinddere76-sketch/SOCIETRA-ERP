import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const PageNavigation = () => {
    const navigate = useNavigate();

    return (
        <div className="absolute top-4 left-6 right-6 z-50 flex justify-between pointer-events-none print-hidden">
            <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-surface/80 backdrop-blur-md border border-glass-border shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all pointer-events-auto"
                title="Go Back"
            >
                <ArrowLeft size={20} />
            </button>
            <button
                onClick={() => navigate(1)}
                className="w-10 h-10 rounded-xl bg-surface/80 backdrop-blur-md border border-glass-border shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all pointer-events-auto"
                title="Go Forward"
            >
                <ArrowRight size={20} />
            </button>
        </div>
    );
};

export default PageNavigation;
