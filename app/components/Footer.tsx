import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">StockLot</h3>
            <p className="mt-2 text-gray-600">
              The #1 marketplace for livestock.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Marketplace
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Buy Requests
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">Follow Us</h3>
            <div className="mt-2 flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Subscribe to our Newsletter
            </h3>
            <div className="mt-2 flex">
              <Input
                type="email"
                placeholder="Enter your email"
                className="rounded-r-none"
              />
              <Button className="rounded-l-none bg-emerald-600 text-white hover:bg-emerald-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-gray-600">
          <p>&copy; 2025 StockLot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
