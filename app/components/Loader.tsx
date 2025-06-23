interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                <rect x="16" y="8" width="32" height="8" rx="4" fill="#3B82F6" />
                <rect x="16" y="48" width="32" height="8" rx="4" fill="#3B82F6" />
                <path d="M20 16 Q32 32 44 16" stroke="#6366F1" strokeWidth="4" fill="none" />
                <path d="M20 48 Q32 32 44 48" stroke="#6366F1" strokeWidth="4" fill="none" />
                <ellipse cx="32" cy="32" rx="6" ry="4" fill="#FBBF24" />
            </svg>
        </div>
    );
};

export default Loader;