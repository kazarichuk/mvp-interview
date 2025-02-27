import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          Terms of Service
        </h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-6">
            Last Updated: 25 Feb 2025
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              1. Eligibility
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least 18 years old to use our platform</li>
              <li>You must have the legal capacity to enter into these terms</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              2. Account Responsibility
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate information when creating an account</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Immediately notify us of any unauthorized account use</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              3. Prohibited Conduct
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>No illegal or unauthorized use of the platform</li>
              <li>No fraudulent or misleading activities</li>
              <li>No interference with platform operations</li>
              <li>No uploading of harmful code or malware</li>
            </ul>
          </section>

          <div className="bg-gray-50 p-4 rounded-md mt-8">
            <p className="text-sm text-gray-600">
              Questions about our Terms? Contact us at{' '}
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