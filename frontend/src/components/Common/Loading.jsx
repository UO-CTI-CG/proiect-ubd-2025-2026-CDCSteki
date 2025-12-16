const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 border-4 border-primary-200 rounded-full"></div>
        {/* Inner spinning ring */}
        <div className="w-20 h-20 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        {/* Heart icon in center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg className="w-8 h-8 text-primary-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      </div>
      <p className="mt-6 text-gray-600 font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default Loading;