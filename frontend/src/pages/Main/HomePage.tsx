import { useState, useEffect, useRef } from 'react';
import './custom.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import {
  BarChart, LineChart, AreaChart,
  XAxis, YAxis, Tooltip, Legend, Bar, Line, Area,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { ArrowRight, ChartArea, ChartColumnIncreasing, ChartLine, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  // References for scroll functionality
  const featuresRef = useRef(null);
  const chartsRef = useRef(null);
  const visionRef = useRef(null);

  // Sample data for charts
  const sampleData = [
    { month: 'Jan', sales: 5000, revenue: 8000, profit: 3000 },
    { month: 'Feb', sales: 7000, revenue: 10000, profit: 4500 },
    { month: 'Mar', sales: 3000, revenue: 5000, profit: 2000 },
    { month: 'Apr', sales: 8000, revenue: 12000, profit: 6000 },
    { month: 'May', sales: 6000, revenue: 9000, profit: 5000 },
    { month: 'Jun', sales: 9000, revenue: 14000, profit: 8000 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const scrollToSection = (ref : any ) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const features = [
    {
      icon: "/free.png",
      title: "Free of Cost",
      description: "No hidden fees or subscriptions"
    },
    {
      icon: "/store.png",
      title: "Simple Integration",
      description: "Connect with your e-commerce platforms easily"
    },
    {
      icon: "/web.png",
      title: "Web Access",
      description: "Access your analytics from anywhere"
    },
    {
      icon: "/sheet.png",
      title: "In-app Data Entry",
      description: "Edit and manage your data seamlessly"
    },
    {
      icon: "/ai.png",
      title: "AI Predictive Analysis",
      description: "Get insights and forecasts powered by AI"
    }
  ];

  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Navigation */}
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <a href="/" className="flex items-center">
            {/* Increased logo size */}
            <img
              src="/logo_black.png"
              alt="VisuGrow"
              className="h-26 md:h-28"
            />
          </a>

          <div className="hidden md:flex items-center space-x-8 text-gray-700">
            <button
              onClick={() => scrollToSection(featuresRef)}
              className="hover:text-blue-600 transition-colors font-poppins"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection(chartsRef)}
              className="hover:text-blue-600 transition-colors font-poppins"
            >
              Charts
            </button>
            <button
              onClick={() => scrollToSection(visionRef)}
              className="hover:text-blue-600 transition-colors font-poppins"
            >
              Our Vision
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-[#053252] hover:bg-blue-700 text-white font-poppins py-2 px-6 rounded-lg transition-colors shadow-sm"
              >
                Sign out
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#053252] hover:text-blue-700 font-poppins transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-[#053252] hover:bg-blue-700 text-white font-poppins py-2 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <h1 className="text-5xl font-rowdies leading-tight text-gray-800 mb-6">
              Grow Your Business With <span className="text-[#053252]">Data-Driven Insights</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 font-poppins">
              VisuGrow is a user-friendly data visualization tool.
              Empower your business with actionable insights and
              make data-driven decisions effortlessly.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/upload')}
                className="bg-[#053252] hover:bg-blue-700 text-white font-poppins px-8 py-3 rounded-lg transition-colors flex items-center shadow-md group"
              >
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => scrollToSection(featuresRef)}
                  className="border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 font-poppins px-8 py-3 rounded-lg transition-colors"
                >
                  Learn more
                </button>
              )}
            </div>
          </motion.div>

          <img
            src="/home.png"
            alt="Data visualization dashboard"
            className="object-cover rounded-lg shadow-xl"
          />

        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-rowdies text-gray-800 mb-4">Why Choose VisuGrow?</h2>
            <p className="text-gray-600 font-poppins">
              Our platform offers everything you need to transform your business data into actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="bg-blue-50 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4">
                  <img src={feature.icon} alt="" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-rowdies text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 font-poppins">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chart Showcase with Recharts */}
      <section ref={chartsRef} id="charts" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-rowdies text-gray-800 mb-4">Interactive Visualizations</h2>
            <p className="text-gray-600 font-poppins">
              Explore your data with our powerful, interactive charting tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Area Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-poppins text-gray-800">Area Chart</h3>
                <ChartArea  className="text-blue-600" size={24} />
              </div>
              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#053252" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#053252" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#053252" fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-poppins text-gray-800">Bar Chart</h3>
                <ChartColumnIncreasing className="text-blue-600" size={24} />
              </div>
              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#053252" />
                    <Bar dataKey="profit" fill="#4a8cbb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-poppins text-gray-800">Line Chart</h3>
                <ChartLine  className="text-blue-600" size={24} />
              </div>
              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#053252" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="profit" stroke="#4a8cbb" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center mb-24"
          >
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-rowdies text-gray-800 mb-6">
                Fully customizable reports to address your needs
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 font-poppins">Create personalized dashboards</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 font-poppins">Export your reports</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <img src="/report.png" alt="Customizable reports" className="rounded-lg shadow-lg" />
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center mb-24"
          >
            <div>
              <img src="/aianalysis.png" alt="AI Predictive Analysis" className="rounded-lg shadow-lg" />
            </div>
            <div>
              <h2 className="text-3xl font-rowdies text-gray-800 mb-6">
                AI Predictive Analysis to make informed decisions
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 font-poppins">Forecast future trends</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 font-poppins">Identify sales opportunities</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 font-poppins">Optimize inventory management</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-rowdies text-gray-800 mb-6">
                Seamless E-commerce Platform Integration
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 font-poppins">Connect with your e-commerce platforms</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 font-poppins">Import data with one click</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={18} />
                  <span className="text-gray-700 font-poppins">Real-time synchronization</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <img src="/estore.png" alt="E-commerce Integration" className="rounded-lg shadow-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section ref={visionRef} id="vision" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-rowdies text-gray-800 mb-6">Our Vision</h2>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl shadow-md">
              <p className="text-gray-700 leading-relaxed font-poppins">
                VisuGrow is a free, user-friendly data visualization platform designed for small E-commerce entrepreneurs
                who face challenges with complex tools and tight budgets. It enables users to explore, understand, and
                leverage insights from their data for informed decisions and sustainable growth. Unlike costly, complex
                business intelligence tools, VisuGrow offers a seamless, no-code experience tailored to E-commerce needs,
                empowering entrepreneurs to become data-driven and maximize profitability.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-[#053252] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-rowdies mb-6">Ready to transform your data into insights?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto font-poppins">
            Join thousands of businesses already using VisuGrow to make better decisions
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/upload' : '/register')}
            className="bg-white text-[#053252] hover:bg-blue-50 font-poppins px-8 py-3 rounded-lg transition-colors"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="border-t border-gray-800  p-8 flex flex-col md:flex-row justify-center items-center font-poppins">
          <p>© 2025 VisuGrow - All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;