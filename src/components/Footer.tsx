import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`content-footer footer bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 ${className}`}>
      <div className="container-fluid px-4 py-6">
        <div className="d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="mb-2 mb-md-0 flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              © <span className="current-year">{currentYear}</span>
              <a href="#" className="footer-link fw-bolder font-semibold text-gray-900 ml-2">
                <span className="px-2" style={{ fontSize: '20px' }}>We Care</span>
              </a>
            </p>
            <img 
                  src="/assets/images/superdoll_logo.jpeg" 
                  width="50" 
                  alt="STM Logo" 
                  className="h-8"
                />
          </div>
          
          <div className="d-none d-lg-inline-block text-sm text-gray-500">
            <a href="#" className="text-secondary me-4 text-gray-700">
              Powered by Digital Innovation Team
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;