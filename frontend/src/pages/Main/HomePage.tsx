import React , {useEffect} from 'react';
import './custom.css';
import Area from '../../components/Charts/Area'
import Line from '../../components/Charts/Line'
import Bar from '../../components/Charts/Bar'
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const HomePage = () => {

  const navigate = useNavigate();

  const { isAuthenticated, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/'); // Redirect to home after logout if desired
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

  const components = [
    ["Area", Area],
    ["Line", Line],
    ["Bar", Bar],
  ]

  return (
    <div>
      <div className='header flex flex-row w-full justify-between'>
        <a href="/">
          <img src="/Logo.png" alt="logo" width={200} />
        </a>
        <div className='flex flex-row justify-end items-center w-1/5'>
                {isAuthenticated ? (
                    <button 
                        className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-2/3 h-1/2 gap-2'
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                ) : (
                    <>
                        <button 
                            className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-2/3 h-1/2 gap-2'
                            onClick={() => navigate('/register')}
                        >
                            Sign up
                        </button>
                        <button 
                            className='customColorButton font-rowdies text-white text-l p-2 m-2 rounded-3xl w-2/3 h-1/2 gap-2'
                            onClick={() => navigate('/login')}
                        >
                            Sign in
                        </button>
                    </>
                )}
            </div>
      </div>
      <div className='flex flex-row justify-between items-center px-20'>
        <div className='flex flex-col justify-center items-center '>
          <h1 className='customColorFont font-rowdies text-5xl text-center'>Grow Your Business With <br />
            Data-Driven Insights</h1>
          <p className='font-poppins text-lg text-center pt-10'>
            VisuGrow is a user-friendly data visualization tool. <br />
            Empower your business with actionable insights and <br />
            make data-driven decisions effortlessly.
          </p>
          <button
            className='customColorButton font-rowdies text-white text-l p-2 mt-5 rounded-3xl w-1/3 h-1/2 gap-2 text-center'
            onClick={() => navigate('/upload')}
          >
            Get Started
          </button>
        </div>
        <div>
          <img src="/home.png" alt="" />
        </div>
      </div>
      <div className='flex flex-col justify-center items-center mainCenter'>
        <h1 className='customColorFont font-rowdies text-5xl text-center p-10'>Why Choose VisuGrow?</h1>
        <div className='flex flex-row justify-between items-center w-3/4 p-10'>
          <div className='flex flex-col justify-center items-center gap-2'>
            <img src="/free.png" alt="" />
            <p className='font-poppins customColorFont text-center'>Free of Cost</p>
          </div >
          <div className='flex flex-col justify-center items-center gap-2'>
            <img src="/store.png" alt="" />
            <p className='font-poppins customColorFont text-center'>Simple Platform <br />
              Integration</p>
          </div>
          <div className='flex flex-col justify-center items-center gap-2'>
            <img src="/web.png" alt="" />
            <p className='font-poppins customColorFont text-center'>Web Access</p>
          </div>
          <div className='flex flex-col justify-center items-center gap-2'>
            <img src="/sheet.png" alt="" />
            <p className='font-poppins customColorFont text-center'>In-app Data <br />
              SheetEntry</p>
          </div >
          <div className='flex flex-col justify-center items-center gap-2'>
            <img src="/ai.png" alt="" />
            <p className='font-poppins customColorFont text-center'>Ai Predictive <br />
              Analysis</p>
          </div>
        </div>
      </div>
      <div className='flex flex-col justify-center items-center'>
        <h1 className='customColorFont font-rowdies text-5xl text-center p-10'>Interactive Graphs</h1>
        <div className='flex flex-row justify-between items-center w-3/4'>
          {components.map(([label, Comp]) => {
            return (
              <div key={label + ""}  >
                <div style={{ width: "400px", height: "300px" }}>
                  <Comp />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className='flex flex-col pt-10'>
        <div className='flex flex-row justify-between items-center px-52'>
          <h1 className='customColorFont font-rowdies text-5xl text-center'>
            Fully customizable <br /> reports to address <br /> your needs.
          </h1>
          <img src="/report.png" alt="" />
        </div>
        <div className='flex flex-row justify-between items-center px-52'>
          <img src="/aianalysis.png" alt="" />
          <h1 className='customColorFont font-rowdies text-5xl text-center'>
            Ai Predictive <br /> Analysis to make <br /> informed decisions.
          </h1>
        </div>
        <div className='flex flex-row justify-between items-center px-52'>
          <h1 className='customColorFont font-rowdies text-5xl text-center'>
            Seamless E-commerce <br /> Platform Integration to <br /> empower your business <br /> through actionable <br /> insights.
          </h1>
          <img src="/estore.png" alt="" />
        </div>
      </div>
      <div className='flex flex-col justify-center items-center mainCenter'>
        <h1 className='customColorFont font-rowdies text-5xl text-center py-5' > Our Vision </h1>
        <p className='font-poppins text-lg text-center p-5 mb-5  bg-white w-1/2 rounded-2xl border border-gray-300'>
          VisuGrow is a free, user-friendly data visualization platform designed for small E-commerce entrepreneurs who face challenges with complex tools and tight budgets. It enables users to explore, understand, and leverage insights from their data for informed decisions and sustainable growth. Unlike costly, complex business intelligence tools, VisuGrow offers a seamless, no-code experience tailored to E-commerce needs, empowering entrepreneurs to become data-driven and maximize profitability.
        </p>
      </div>
      <div>
        <h1 className='font-bold text-2xl text-center py-5'>© 2024 VisuGrow - All Rights Reserved</h1>
      </div>
    </div>
  )

};

export default HomePage;