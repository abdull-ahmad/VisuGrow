import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import { ArrowRight, Book, FileCode, Server, Copy, Check, ChevronRight, Database, Info, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DocumentationPage = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('introduction');
    const [copied, setCopied] = useState({
        json: false,
        nodejs: false,
        django: false
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Determine active section based on scroll position
            const sections = ['introduction', 'nodejs', 'django', 'additional'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150 && rect.bottom >= 150) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCopy = (text: any, type: any) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [type]: true });

        setTimeout(() => {
            setCopied({ ...copied, [type]: false });
        }, 2000);
    };

    const scrollToSection = (id: any) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: 'smooth'
        });
        setActiveSection(id);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative bg-gradient-to-b from-blue-50 to-white min-h-screen">
            {/* Navigation */}
            <header
                className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-2' : 'bg-transparent py-4'
                    }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <a href="/" className="flex items-center">
                        <img
                            src="/logo_black.png"
                            alt="VisuGrow"
                            className="h-24 md:h-26"
                        />
                    </a>

                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => scrollToSection('introduction')}
                            className={`font-poppins transition-colors ${activeSection === 'introduction' ? 'text-[#053252] font-medium' : 'text-gray-600 hover:text-[#053252]'}`}
                        >
                            Introduction
                        </button>
                        <button
                            onClick={() => scrollToSection('nodejs')}
                            className={`font-poppins transition-colors ${activeSection === 'nodejs' ? 'text-[#053252] font-medium' : 'text-gray-600 hover:text-[#053252]'}`}
                        >
                            Node.js API
                        </button>
                        <button
                            onClick={() => scrollToSection('django')}
                            className={`font-poppins transition-colors ${activeSection === 'django' ? 'text-[#053252] font-medium' : 'text-gray-600 hover:text-[#053252]'}`}
                        >
                            Django API
                        </button>
                        <button
                            onClick={() => scrollToSection('additional')}
                            className={`font-poppins transition-colors ${activeSection === 'additional' ? 'text-[#053252] font-medium' : 'text-gray-600 hover:text-[#053252]'}`}
                        >
                            Notes
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-[#053252] hover:text-blue-700 font-poppins transition-colors flex items-center"
                        >
                            <span className="mr-1">Back to Home</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-24 px-6 bg-gradient-to-br text-gray-800">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-white/10 p-3 rounded-2xl">
                                <Database className="w-12 h-12" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-rowdies leading-tight mb-6">
                            Store Sales API Documentation
                        </h1>
                        <p className="text-lg text-gray-600 mb-10 font-poppins leading-relaxed">
                            Learn how to build a powerful backend API that exposes store sales data for visualization and AI-powered analytics.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => document.getElementById('introduction')?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-white text-[#053252] hover:bg-blue-50 font-poppins px-8 py-4 rounded-lg transition-colors flex items-center shadow-lg group"
                            >
                                Get Started
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-16 relative z-10 bg-white">
                {/* Introduction */}
                <section id="introduction" className="mb-24 scroll-mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex items-center mb-8">
                            <div className="bg-[#053252]/10 p-2 rounded-lg mr-4">
                                <Book className="text-[#053252]" size={28} />
                            </div>
                            <h2 className="text-3xl font-rowdies text-gray-800">Introduction</h2>
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
                            <p className="text-gray-700 font-poppins mb-6 leading-relaxed">
                                This guide explains how to create a backend API that fetches store sales data from a database and exposes it in JSON format. Your API will be the backbone of powerful visualizations and AI-driven analytics in VisuGrow.
                            </p>

                            <div className="mb-8">
                                <h3 className="text-xl font-poppins font-semibold mb-4 text-gray-800">Expected JSON Structure</h3>
                                <div className="rounded-lg overflow-hidden shadow-md relative">
                                    <div className="absolute right-2 top-2 z-10">
                                        <button
                                            onClick={() => handleCopy(`[
  {
    "price": "price",
    "qty_ordered": "qty_ordered",
    "grand_total": "grand_total",
    "category_name_1": "category_name_1",
    "Working Date": "Working Date"
  },
  {
    "price": 899,
    "qty_ordered": 1,
    "grand_total": 3309,
    "category_name_1": "Men's Fashion",
    "Working Date": "2018-08-21T07:00:00.000Z"
  }
]`, "json")}
                                            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                                        >
                                            {copied.json ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <SyntaxHighlighter language="json" style={vscDarkPlus} className="rounded-lg">
                                        {`[
  {
    "price": "price",
    "qty_ordered": "qty_ordered",
    "grand_total": "grand_total",
    "category_name_1": "category_name_1",
    "Working Date": "Working Date"
  },
  {
    "price": 899,
    "qty_ordered": 1,
    "grand_total": 3309,
    "category_name_1": "Men's Fashion",
    "Working Date": "2018-08-21T07:00:00.000Z"
  }
]`}
                                    </SyntaxHighlighter>
                                </div>
                            </div>

                            <div className="mb-8 p-6 bg-blue-50 rounded-xl">
                                <h3 className="flex items-center text-xl font-poppins font-semibold mb-4 text-[#053252]">
                                    <Info size={20} className="mr-2" />
                                    Data Requirements
                                </h3>
                                <p className="text-gray-700 font-poppins mb-4">
                                    While the key-value pairs in the JSON object can have any name and value, your API should provide <strong>valid product and sales information</strong> for optimal results. This includes:
                                </p>
                                <ul className="space-y-2 text-gray-700 font-poppins list-disc pl-6 mb-6">
                                    <li className="font-medium">Accurate pricing data (unit prices, discounts, total amounts)</li>
                                    <li className="font-medium">Product information (categories, names, SKUs, descriptions)</li>
                                    <li className="font-medium">Transaction details (quantities, order dates, customer segments)</li>
                                    <li className="font-medium">Time-series data with proper date formatting</li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-r from-[#053252]/5 to-blue-50 p-6 rounded-xl border-l-4 border-[#053252]">
                                <h3 className="text-xl font-rowdies mb-4 text-gray-800">Benefits of Quality Data</h3>
                                <p className="font-poppins text-gray-700 mb-4">
                                    High-quality sales and product data significantly enhances both visualization capabilities and AI analysis:
                                </p>
                                <motion.ul
                                    variants={container}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true }}
                                    className="space-y-4"
                                >
                                    <motion.li variants={item} className="flex items-start">
                                        <div className="bg-[#053252] rounded-full min-w-6 h-6 mt-1 mr-3 flex items-center justify-center text-white font-medium">1</div>
                                        <div>
                                            <h4 className="font-poppins font-semibold mb-1">Enhanced Visualizations</h4>
                                            <p className="text-gray-600 font-poppins">
                                                Clean, structured data reveals meaningful patterns, trends, and correlations in your business performance through stunning charts and dashboards.
                                            </p>
                                        </div>
                                    </motion.li>

                                    <motion.li variants={item} className="flex items-start">
                                        <div className="bg-[#053252] rounded-full min-w-6 h-6 mt-1 mr-3 flex items-center justify-center text-white font-medium">2</div>
                                        <div>
                                            <h4 className="font-poppins font-semibold mb-1">Powerful AI Analytics</h4>
                                            <p className="text-gray-600 font-poppins">
                                                Our AI algorithms can provide more accurate forecasts, anomaly detection, and product recommendations when fed with well-formed sales data.
                                            </p>
                                        </div>
                                    </motion.li>

                                    <motion.li variants={item} className="flex items-start">
                                        <div className="bg-[#053252] rounded-full min-w-6 h-6 mt-1 mr-3 flex items-center justify-center text-white font-medium">3</div>
                                        <div>
                                            <h4 className="font-poppins font-semibold mb-1">Data-Driven Decisions</h4>
                                            <p className="text-gray-600 font-poppins">
                                                Make confident business decisions based on reliable insights into customer behavior and product performance.
                                            </p>
                                        </div>
                                    </motion.li>
                                </motion.ul>
                            </div>

                            <p className="text-gray-600 font-poppins mt-8">
                                For best results, maintain consistent data structures and ensure all dates, numerical values, and categories follow standardized formats.
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* Node.js Boilerplate */}
                <section id="nodejs" className="mb-24 scroll-mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex items-center mb-8">
                            <div className="bg-[#053252]/10 p-2 rounded-lg mr-4">
                                <Server className="text-[#053252]" size={28} />
                            </div>
                            <h2 className="text-3xl font-rowdies text-gray-800">Node.js Backend API</h2>
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
                            <div className="flex items-center mb-6">
                                <img src="/nodejs-logo.svg" alt="Node.js" className="h-14 mr-2" />
                                <p className="text-gray-700 font-poppins">
                                    Build your API with Node.js, Express, and MongoDB for a scalable and efficient backend solution.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-poppins font-semibold mb-4 text-gray-800">Installation</h3>
                                <div className="bg-gray-800 text-white font-mono rounded-lg p-4 mb-4">
                                    npm install express mongoose cors
                                </div>
                            </div>

                            <div className="rounded-lg overflow-hidden shadow-md relative">
                                <div className="absolute right-2 top-2 z-10">
                                    <button
                                        onClick={() => handleCopy(`// Install dependencies: npm install express mongoose cors
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/visugrow', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a schema and model
const salesSchema = new mongoose.Schema({
    price: Number,
    qty_ordered: Number,
    grand_total: Number,
    category_name_1: String,
    working_date: Date,
});
const Sale = mongoose.model('Sale', salesSchema);

// Store Sales Data API
app.get('/api/store-sales', async (req, res) => {
    try {
        // Fetch sales data from the database
        const salesData = await Sale.find();
        res.json(salesData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(\`Server is running on http://localhost:\${PORT}\`);
});`, "nodejs")}
                                        className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                                    >
                                        {copied.nodejs ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <SyntaxHighlighter language="javascript" style={vscDarkPlus} className="rounded-lg">
                                    {`// Install dependencies: npm install express mongoose cors
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/visugrow', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a schema and model
const salesSchema = new mongoose.Schema({
    price: Number,
    qty_ordered: Number,
    grand_total: Number,
    category_name_1: String,
    working_date: Date,
});
const Sale = mongoose.model('Sale', salesSchema);

// Store Sales Data API
app.get('/api/store-sales', async (req, res) => {
    try {
        // Fetch sales data from the database
        const salesData = await Sale.find();
        res.json(salesData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(\`Server is running on http://localhost:\${PORT}\`);
});`}
                                </SyntaxHighlighter>
                            </div>

                            <div className="mt-8 p-5 bg-yellow-50 rounded-xl border border-yellow-100">
                                <div className="flex items-center mb-2">
                                    <AlertTriangle className="text-amber-500 mr-2" size={20} />
                                    <h3 className="font-poppins font-semibold text-gray-800">Important</h3>
                                </div>
                                <p className="text-gray-600 font-poppins">
                                    This example includes CORS support which is essential for browser-based applications to access your API. Make sure to configure it properly for production environments.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Django Boilerplate */}
                <section id="django" className="mb-24 scroll-mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex items-center mb-8">
                            <div className="bg-[#053252]/10 p-2 rounded-lg mr-4">
                                <FileCode className="text-[#053252]" size={28} />
                            </div>
                            <h2 className="text-3xl font-rowdies text-gray-800">Django Backend API</h2>
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
                            <div className="flex items-center mb-6">
                                <img src="/django-logo.svg" alt="Django" className="h-14 mr-2" />
                                <p className="text-gray-700 font-poppins">
                                    Create your API with Django and Django REST Framework for a robust Python-based backend.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-poppins font-semibold mb-4 text-gray-800">Installation</h3>
                                <div className="bg-gray-800 text-white font-mono rounded-lg p-4 mb-4">
                                    pip install django djangorestframework django-cors-headers
                                </div>
                            </div>

                            <div className="rounded-lg overflow-hidden shadow-md relative">
                                <div className="absolute right-2 top-2 z-10">
                                    <button
                                        onClick={() => handleCopy(`# Install dependencies: pip install django djangorestframework django-cors-headers
# settings.py
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    # ...
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ...
]

CORS_ALLOW_ALL_ORIGINS = True  # Set to False in production

# models.py
from django.db import models

class Sale(models.Model):
    price = models.FloatField()
    qty_ordered = models.IntegerField()
    grand_total = models.FloatField()
    category_name_1 = models.CharField(max_length=255)
    working_date = models.DateField()

# serializers.py
from rest_framework import serializers
from .models import Sale

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Sale
from .serializers import SaleSerializer

@api_view(['GET'])
def store_sales(request):
    sales = Sale.objects.all()
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/store-sales/', views.store_sales),
]`, "django")}
                                        className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                                    >
                                        {copied.django ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-lg">
                                    {`# Install dependencies: pip install django djangorestframework django-cors-headers
# settings.py
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    # ...
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ...
]

CORS_ALLOW_ALL_ORIGINS = True  # Set to False in production

# models.py
from django.db import models

class Sale(models.Model):
    price = models.FloatField()
    qty_ordered = models.IntegerField()
    grand_total = models.FloatField()
    category_name_1 = models.CharField(max_length=255)
    working_date = models.DateField()

# serializers.py
from rest_framework import serializers
from .models import Sale

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Sale
from .serializers import SaleSerializer

@api_view(['GET'])
def store_sales(request):
    sales = Sale.objects.all()
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/store-sales/', views.store_sales),
]`}
                                </SyntaxHighlighter>
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                                    <h4 className="font-poppins font-semibold text-gray-800 mb-2">Django REST Framework</h4>
                                    <p className="text-gray-600 font-poppins">
                                        This example uses DRF's serializers to automatically convert database models to JSON.
                                    </p>
                                </div>
                                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                                    <h4 className="font-poppins font-semibold text-gray-800 mb-2">CORS Configuration</h4>
                                    <p className="text-gray-600 font-poppins">
                                        django-cors-headers is included to enable cross-origin requests from your frontend.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Additional Notes */}
                <section id="additional" className="scroll-mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex items-center mb-8">
                            <div className="bg-[#053252]/10 p-2 rounded-lg mr-4">
                                <Info className="text-[#053252]" size={28} />
                            </div>
                            <h2 className="text-3xl font-rowdies text-gray-800">Best Practices</h2>
                        </div>
                        <div className="bg-gradient-to-b from-white to-blue-50 rounded-xl p-8 shadow-xl border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                                >
                                    <div className="flex items-start mb-4">
                                        <div className="bg-[#053252] p-2 rounded-lg mr-3">
                                            <Shield className="text-white" size={20} />
                                        </div>
                                        <h3 className="text-lg font-poppins font-semibold text-gray-800">Security</h3>
                                    </div>
                                    <ul className="space-y-3 font-poppins text-gray-600">
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Always use HTTPS for production APIs</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Implement proper authentication (JWT, OAuth)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Set specific CORS policies in production</span>
                                        </li>
                                    </ul>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                                >
                                    <div className="flex items-start mb-4">
                                        <div className="bg-[#053252] p-2 rounded-lg mr-3">
                                            <Database className="text-white" size={20} />
                                        </div>
                                        <h3 className="text-lg font-poppins font-semibold text-gray-800">Data Structure</h3>
                                    </div>
                                    <ul className="space-y-3 font-poppins text-gray-600">
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Use consistent date formats (ISO 8601 recommended)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Provide numerical data as numbers, not strings</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Include descriptive category and product names</span>
                                        </li>
                                    </ul>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                    className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                                >
                                    <div className="flex items-start mb-4">
                                        <div className="bg-[#053252] p-2 rounded-lg mr-3">
                                            <Server className="text-white" size={20} />
                                        </div>
                                        <h3 className="text-lg font-poppins font-semibold text-gray-800">Performance</h3>
                                    </div>
                                    <ul className="space-y-3 font-poppins text-gray-600">
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Implement pagination for large datasets</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Use database indexes for commonly queried fields</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Consider caching for frequently accessed data</span>
                                        </li>
                                    </ul>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                    className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                                >
                                    <div className="flex items-start mb-4">
                                        <div className="bg-[#053252] p-2 rounded-lg mr-3">
                                            <Book className="text-white" size={20} />
                                        </div>
                                        <h3 className="text-lg font-poppins font-semibold text-gray-800">Documentation</h3>
                                    </div>
                                    <ul className="space-y-3 font-poppins text-gray-600">
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Document your API endpoints with Swagger/OpenAPI</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Include response examples in documentation</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="bg-[#053252] rounded-full w-2 h-2 mt-2 mr-2 flex-shrink-0"></div>
                                            <span>Provide clear error messages and status codes</span>
                                        </li>
                                    </ul>
                                </motion.div>
                            </div>

                            <div className="mt-10 bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-xl font-poppins font-semibold mb-4 text-gray-800 flex items-center">
                                    <ExternalLink size={18} className="mr-2 text-[#053252]" />
                                    Additional Resources
                                </h3>
                                <ul className="space-y-3 font-poppins">
                                    <li>
                                        <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer" className="text-[#053252] hover:text-blue-700 flex items-center">
                                            <ChevronRight size={16} className="mr-1" />
                                            Express.js Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.djangoproject.com/" target="_blank" rel="noopener noreferrer" className="text-[#053252] hover:text-blue-700 flex items-center">
                                            <ChevronRight size={16} className="mr-1" />
                                            Django Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.django-rest-framework.org/" target="_blank" rel="noopener noreferrer" className="text-[#053252] hover:text-blue-700 flex items-center">
                                            <ChevronRight size={16} className="mr-1" />
                                            Django REST Framework
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-br from-[#053252] to-[#0a4d7e] text-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-rowdies mb-6">Ready to build your API?</h2>
                        <p className="text-blue-100 mb-10 max-w-2xl mx-auto font-poppins leading-relaxed">
                            Start implementing these examples to connect your data with VisuGrow's powerful visualization and AI analytics tools.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="bg-white text-[#053252] hover:bg-blue-50 font-poppins px-8 py-3 rounded-lg transition-colors w-full sm:w-auto"
                            >
                                Back to Dashboard
                            </motion.button>

                        </div>
                    </motion.div>
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

export default DocumentationPage;