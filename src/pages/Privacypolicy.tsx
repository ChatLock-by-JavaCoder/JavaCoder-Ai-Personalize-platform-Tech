import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
        <p className="text-gray-700 mb-6">
          <strong>Effective Date:</strong> March 23, 2024
        </p>

        <p className="text-gray-700 mb-4">
          JavaCoder Platform (“we,” “our,” “us”) is committed to protecting the privacy of our users (“you,” “your”). This Privacy Policy explains how we collect, use, and safeguard your personal information when you access or use our platform, services, and applications.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">1. Information We Collect</h2>
        <p className="text-gray-700 mb-2">
          <strong>a) Personal Information:</strong> Name, email address, phone number, profile picture, and account login credentials.
        </p>
        <p className="text-gray-700 mb-2">
          <strong>b) Usage Information:</strong> IP address, device information, browser type, pages visited, interactions with the platform, and session duration.
        </p>
        <p className="text-gray-700 mb-2">
          <strong>c) Cookies & Tracking Technologies:</strong> Cookies, local storage, and similar technologies to improve user experience.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Provide, operate, and maintain our platform and services.</li>
          <li>Authenticate and authorize user accounts.</li>
          <li>Personalize your experience and improve our services.</li>
          <li>Send updates, notifications, and marketing communications.</li>
          <li>Analyze usage trends to enhance platform performance and features.</li>
          <li>Comply with legal obligations.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">3. How We Share Your Information</h2>
        <p className="text-gray-700 mb-2">
          We do <strong>not</strong> sell your personal information. We may share your data in the following situations:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li><strong>Service Providers:</strong> Trusted third-party providers who assist with operations.</li>
          <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
          <li><strong>Business Transfers:</strong> In case of a merger, acquisition, or sale of assets.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">4. Your Privacy Rights</h2>
        <p className="text-gray-700 mb-4">
          Depending on your location, you may have the following rights:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Access, correct, or delete your personal information.</li>
          <li>Withdraw consent for data processing.</li>
          <li>Object to certain data processing activities.</li>
          <li>Receive your data in a portable format.</li>
        </ul>
        <p className="text-gray-700 mb-4">
          {/* To exercise your rights, contact us at <a href="mailto:privacy@javacoderplatform.com" className="text-blue-600 underline">privacy@javacoderplatform.com</a>. */}
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">5. Security</h2>
        <p className="text-gray-700 mb-4">
          We implement reasonable technical and organizational measures to protect your data against unauthorized access, loss, misuse, or disclosure. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">6. Children’s Privacy</h2>
        <p className="text-gray-700 mb-4">
          Our services are <strong>not directed to children under 13 years old</strong>. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete it.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">7. Third-Party Links</h2>
        <p className="text-gray-700 mb-4">
          Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to review their privacy policies.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">8. Updates to This Privacy Policy</h2>
        <p className="text-gray-700 mb-4">
          We may update this Privacy Policy from time to time. Any updates will be posted on this page with the “Effective Date” updated accordingly. We recommend reviewing this page periodically.
        </p>

        {/* <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">9. Contact Us</h2>
        <p className="text-gray-700 mb-4">
          If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us:
        </p>
        <ul className="list-disc list-inside text-gray-700">
          <li>Email: <a href="mailto:privacy@javacoderplatform.com" className="text-blue-600 underline">privacy@javacoderplatform.com</a></li>
          {/* <li>Address: JavaCoder Platform, [Your City, State, Country]</li> */}
        {/* </ul> */}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
