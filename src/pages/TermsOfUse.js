import React from 'react';
import { motion } from 'framer-motion';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Use</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using our gaming platform, you agree to be bound by these Terms of Use 
                and all applicable laws and regulations. If you do not agree with any of these terms, 
                you are prohibited from using or accessing this platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                To use certain features of our platform, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Conduct</h2>
              <p className="text-gray-600 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Use the platform for any illegal purposes</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Use cheats, exploits, or automated systems</li>
                <li>Interfere with the platform's operation</li>
                <li>Share inappropriate or offensive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
              <p className="text-gray-600">
                All content, features, and functionality of our platform, including but not limited to 
                text, graphics, logos, and software, are owned by us or our licensors and are protected 
                by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              <p className="text-gray-600 mb-4">
                For any paid services or features:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>All payments are non-refundable unless required by law</li>
                <li>Prices are subject to change with notice</li>
                <li>You are responsible for all applicable taxes</li>
                <li>We use secure payment processors for transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600">
                We shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages resulting from your use or inability to use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-600">
                We reserve the right to terminate or suspend your account and access to the platform at 
                our sole discretion, without notice, for conduct that we believe violates these Terms of 
                Use or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. We will notify users of any 
                material changes by posting the new Terms of Use on this page and updating the 
                "Last Updated" date.
              </p>
              <p className="text-gray-500 mt-4">
                Last Updated: March 15, 2024
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Use, please contact us at:
                <br />
                <a href="mailto:legal@gamingplatform.com" className="text-blue-500 hover:text-blue-600">
                  legal@gamingplatform.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfUse; 