import { Link } from "react-router-dom";
import { Film, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary flex items-center justify-center">
                <Film className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <span className="text-lg md:text-xl font-display font-bold text-gradient-gold">
                TixWix
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your premier destination for cinema and concert tickets. Experience entertainment like never before.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-1.5 -ml-1.5">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-1.5">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-1.5">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-1.5">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/movies" className="text-muted-foreground hover:text-primary transition-colors text-sm py-1 inline-block">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/concerts" className="text-muted-foreground hover:text-primary transition-colors text-sm py-1 inline-block">
                  Upcoming Concerts
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-muted-foreground hover:text-primary transition-colors text-sm py-1 inline-block">
                  Order History
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-muted-foreground hover:text-primary transition-colors text-sm py-1 inline-block">
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm py-1 inline-block">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm py-1 inline-block">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm py-1 inline-block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm py-1 inline-block">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Rampura, Dhaka, Bangladesh</span>
              </li>
              <li>
                <a href="tel:+8801403350770" className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors py-0.5">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>+880 1403-350770</span>
                </a>
              </li>
              <li>
                <a href="mailto:rspriyo9s3@gmail.com" className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors py-0.5">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>rspriyo9s3@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-muted-foreground text-xs md:text-sm">
            © 2026 TixWix. All rights reserved. Made by Priyo, Likhan, Mercy for the love of CSE370
          </p>
        </div>
      </div>
    </footer>
  );
};
