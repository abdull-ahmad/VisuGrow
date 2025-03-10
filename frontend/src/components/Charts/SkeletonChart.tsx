export const EmptyStateDisplay: React.FC<{ title: string; message: string }> = ({ title, message }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="mb-3 w-48 h-32">
            <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Y-axis */}
                <line x1="30" y1="20" x2="30" y2="100" stroke="#E5E7EB" strokeWidth="2" />
                {/* X-axis */}
                <line x1="30" y1="100" x2="180" y2="100" stroke="#E5E7EB" strokeWidth="2" />
                {/* Chart skeleton elements */}
                <rect x="45" y="40" width="15" height="60" rx="2" fill="#F3F4F6" />
                <rect x="70" y="60" width="15" height="40" rx="2" fill="#F3F4F6" />
                <rect x="95" y="30" width="15" height="70" rx="2" fill="#F3F4F6" />
                <rect x="120" y="50" width="15" height="50" rx="2" fill="#F3F4F6" />
                <rect x="145" y="70" width="15" height="30" rx="2" fill="#F3F4F6" />
                {/* Grid lines */}
                <line x1="30" y1="60" x2="180" y2="60" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4" />
                <line x1="30" y1="80" x2="180" y2="80" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4" />
            </svg>
        </div>
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm">{message}</p>
    </div>
);