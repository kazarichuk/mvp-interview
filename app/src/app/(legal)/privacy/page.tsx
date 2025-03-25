import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          Privacy Policy
        </h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-6">
            Last Updated: 25 Feb 2025
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Personal Information:</strong> We collect details like 
                your name, email, and contact information when you create an account.
              </li>
              <li>
                <strong>Usage Data:</strong> We track how you interact with our platform, 
                including IP address, browser type, and visited pages.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies to enhance your user experience 
                and analyze platform usage.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide and maintain our platform</li>
              <li>Communicate updates and administrative information</li>
              <li>Improve user experience and develop new features</li>
              <li>Comply with legal requirements</li>
            </ul>
          </section>

          <div className="bg-gray-50 p-4 rounded-md mt-8">
            <p className="text-sm text-gray-600">
              Have questions? Contact us at{' '}
              <a 
                href="mailto:kazarichuk@gmail.com" 
                className="text-blue-600 hover:underline"
              >
                kazarichuk@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}