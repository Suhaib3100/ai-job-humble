import React from "react";

const CookieSettings: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">
    <h1 className="text-3xl font-bold mb-4">Cookie Settings</h1>
    <p className="mb-6">At PrimeChances, we use cookies and similar technologies to enhance your experience, analyze site usage, and deliver personalized content and ads. You can manage your cookie preferences below.</p>
    <h2 className="text-xl font-semibold mt-8 mb-2">Types of Cookies We Use</h2>
    <ul className="list-disc pl-6 mb-4">
      <li><b>Essential Cookies:</b> Necessary for the website to function and cannot be switched off in our systems.</li>
      <li><b>Performance Cookies:</b> Help us understand how visitors interact with our site by collecting and reporting information anonymously.</li>
      <li><b>Functional Cookies:</b> Enable enhanced functionality and personalization, such as remembering your preferences.</li>
      <li><b>Targeting/Advertising Cookies:</b> Used by advertising partners to build a profile of your interests and show you relevant ads on other sites.</li>
    </ul>
    <h2 className="text-xl font-semibold mt-8 mb-2">Manage Your Preferences</h2>
    <p className="mb-4">You can choose to accept or reject different categories of cookies. Please note that blocking some types of cookies may impact your experience on our site and the services we are able to offer.</p>
    <form className="mb-8">
      <div className="mb-4">
        <label className="flex items-center">
          <input type="checkbox" checked disabled className="mr-2" />
          Essential Cookies (Always Active)
        </label>
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          Performance Cookies
        </label>
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          Functional Cookies
        </label>
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          Targeting/Advertising Cookies
        </label>
      </div>
      <button type="submit" className="bg-[#008000] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#006400] transition-colors">Save Preferences</button>
    </form>
    <h2 className="text-xl font-semibold mt-8 mb-2">Learn More</h2>
    <p className="mb-2">For more information about how we use cookies and your data, please see our <a href="/privacy-policy" className="text-green-700 underline">Privacy Policy</a>.</p>
    <p>If you have questions, contact us at <a href="mailto:support@primechances.com" className="text-green-700 underline">support@primechances.com</a>.</p>
  </div>
);

export default CookieSettings;
