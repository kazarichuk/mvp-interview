import React from 'react';

const FAQItem = ({ question, answer }: { question: string, answer: string | React.ReactNode }) => (
  <div className="mb-6 border-b pb-6 last:border-b-0">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{question}</h3>
    <div className="text-gray-600">{answer}</div>
  </div>
);

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">
          Frequently Asked Questions
        </h1>
        
        <div className="prose prose-gray max-w-none">
          <FAQItem 
            question="What is HireFlick?"
            answer="HireFlick is an AI-driven recruitment platform that helps businesses quickly identify, evaluate, and connect with top designers and developers. We streamline the hiring process by conducting in-depth technical interviews."
          />

          <FAQItem 
            question="How does the AI interview process work?"
            answer="Our AI conducts skill-based interviews and assessments tailored to the role you're hiring for. Candidates complete design or coding challenges, and our system evaluates their performance, communication, and problem-solving skills."
          />

          <FAQItem 
            question="What types of positions can I fill using HireFlick?"
            answer={
              <ul className="list-disc pl-5">
                <li>UX/UI Designers</li>
                <li>Front-End Developers (coming soon)</li>
                <li>Back-End Developers (coming soon)</li>
                <li>Analytics (coming soon)</li>
              </ul>
            }
          />

          <FAQItem 
            question="How quickly can I start seeing candidate results?"
            answer="In most cases, you can start receiving AI assessment reports within 10 minutes after the candidate finishes the assessment. Times may vary based on the complexity of the assessment."
          />

          <FAQItem 
            question="How much does it cost to use HireFlick?"
            answer={
              <ul className="list-disc pl-5">
                <li>5 Interviews -- Free (Try before you buy!)</li>
                <li>1 Interview -- $9 USD</li>
              </ul>
            }
          />

          <div className="bg-gray-50 p-4 rounded-md mt-8">
            <p className="text-sm text-gray-600">
              Need more help? Contact our support team at{' '}
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