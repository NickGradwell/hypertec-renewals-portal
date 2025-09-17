import React from 'react';

const Login = ({ onLogin, error }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img
            src="https://www.hypertec.co.uk/wp-content/uploads/2023/08/Hypertec-Logo-White.svg"
            alt="Hypertec Logo"
            className="h-12 w-auto mx-auto mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/200x60/1A237E/FFFFFF?text=Hypertec";
            }}
          />
          <h1 className="text-2xl font-bold text-gray-800">
            Hypertec Renewal Platform
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to manage your renewals and licenses
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
               <div className="space-y-4">
                 <button
                   onClick={onLogin}
                   className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                 >
                   {import.meta.env.VITE_AZURE_CLIENT_ID && import.meta.env.VITE_AZURE_CLIENT_ID !== 'your-client-id' 
                     ? 'Sign in with Microsoft' 
                     : 'Sign in (Mock Authentication)'
                   }
                 </button>
               </div>

               <div className="mt-8 text-center">
                 <p className="text-xs text-gray-500">
                   {import.meta.env.VITE_AZURE_CLIENT_ID && import.meta.env.VITE_AZURE_CLIENT_ID !== 'your-client-id'
                     ? 'Secure authentication powered by Azure AD B2C'
                     : 'Local development mode - using mock authentication'
                   }
                 </p>
               </div>
      </div>
    </div>
  );
};

export default Login;
