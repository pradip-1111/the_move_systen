import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiMail, FiPhone, FiMapPin, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';

const ContactPage = () => {
  const { mode } = useSelector((state) => state.theme);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission for demo
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-20 ${
        mode === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'
          : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            Have questions, suggestions, or need support? We'd love to hear from you.
            Get in touch with our team today.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className={`text-3xl font-bold mb-8 ${
                mode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className={`absolute left-3 top-3 h-5 w-5 ${
                      mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:outline-none ${
                        mode === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className={`absolute left-3 top-3 h-5 w-5 ${
                      mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:outline-none ${
                        mode === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:outline-none ${
                      mode === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Message
                  </label>
                  <div className="relative">
                    <FiMessageSquare className={`absolute left-3 top-3 h-5 w-5 ${
                      mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:outline-none resize-none ${
                        mode === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center space-x-3 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    mode === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                  }`}
                >
                  <FiSend className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="lg:pl-8">
              <h2 className={`text-3xl font-bold mb-8 ${
                mode === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Get in Touch
              </h2>

              <div className="space-y-8">
                <div className={`p-6 rounded-2xl ${
                  mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <FiMail className={`h-8 w-8 mb-4 ${
                    mode === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Email Us
                  </h3>
                  <p className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    sarrafpradeep857@gmail.com
                  </p>
                  <p className={`text-sm mt-1 ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    We'll respond within 24 hours
                  </p>
                </div>

                <div className={`p-6 rounded-2xl ${
                  mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <FiPhone className={`h-8 w-8 mb-4 ${
                    mode === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Call Us
                  </h3>
                  <p className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Available via email
                  </p>
                  <p className={`text-sm mt-1 ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    We'll respond promptly
                  </p>
                </div>

                <div className={`p-6 rounded-2xl ${
                  mode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <FiMapPin className={`h-8 w-8 mb-4 ${
                    mode === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Visit Us
                  </h3>
                  <p className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Tamil Nadu, India<br />
                    Thiruvallur 601103
                  </p>
                </div>
              </div>

              <div className="mt-12">
                <h3 className={`text-xl font-semibold mb-4 ${
                  mode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  <a
                    href="https://www.linkedin.com/in/pradip-sah-sonar-331681281"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                      mode === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.instagram.com/pradip__shroff?igsh=OHRrbXk4ZHBvcGo3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                      mode === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;