import { useState } from "react";
import Logo from "../../assets/images/logo1.png";
import { IoMdNotificationsOutline } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";
import userIcon from "../../assets/images/user_icon.png";
import { Link, useLocation } from "react-router-dom";
import Login from "../../pages/Auth/Login";
import Register from "../../pages/Auth/Register";

const Navbar = () => {
  const userData = null;
  const loading = false;
  const profilePic = userIcon;
  const unread = 0;
  const showNotification = false;
  const showProfile = false;
  const location = useLocation();
  const [loginModal, setLoginModal] = useState(false);
  const [registerModal, setRegisterModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeModal = () => {
    setLoginModal(false);
    setRegisterModal(false);
  };

  const toggleLoginModal = () => {
    setLoginModal(!loginModal);
    setRegisterModal(false);
  };
  const toggleRegisterModal = () => {
    setLoginModal(false);
    setRegisterModal(!registerModal);
  };

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <div className="h-16 w-full flex items-center bg-primary">
      <div className="px-8 flex justify-between items-center w-full relative">
        <div className="flex items-center just">
          <div className="p-1 rounded shadow-sm">
            <img src={Logo} alt="logo" className="h-10 w-auto" />
          </div>
          <div className="">
            <h1 className="text-white text-lg font-bold tracking-wide">
              ptiSched
            </h1>
            <p className="text-yellow-300 text-sm font-bold tracking-wide">
              SYSTEM
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center flex-1 px-4">
          <ul className="flex gap-5 items-center justify-center text-white lg:text-lg text-sm">
            <li>
              <Link
                to={"/home"}
                className={`relative w-fit h-10 p-2 text-white focus:outline-none group ${
                  isActiveLink("/home") || isActiveLink("/")
                    ? "border-b-2 border-white"
                    : ""
                }`}
              >
                Home
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link
                to={"/about"}
                className={`relative w-fit h-10 p-2 text-white focus:outline-none group ${
                  isActiveLink("/about") ? "border-b-2 border-white" : ""
                }`}
              >
                About
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link
                to="/contact-us"
                className={`relative w-fit h-10 p-2 text-white focus:outline-none group ${
                  isActiveLink("/contact-us") ? "border-b-2 border-white" : ""
                }`}
              >
                Contact Us
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="hidden md:flex items-center">
          <ul className="flex md:gap-5 gap-3 items-center text-white lg:text-lg text-sm">
            {loading ? (
              <li>Loading...</li>
            ) : userData ? (
              <>
                <li>
                  <div className="relative">
                    {unread > 0 && (
                      <span className="text-sm absolute right-0 top-0 text-white bg-red-600 rounded-full px-1.5">
                        {unread}
                      </span>
                    )}
                    <div className="h-10 w-10 text-white cursor-pointer flex justify-center items-center">
                      <IoMdNotificationsOutline className="text-3xl" />
                    </div>
                  </div>
                  {showNotification && (
                    <div className="absolute z-50 right-5">
                      {/* <Notification /> */}
                    </div>
                  )}
                </li>
                <li className="font-bold">Name</li>
                <li>
                  <img
                    src={profilePic}
                    alt="profile"
                    className="h-10 w-10 rounded-full bg-gray-100 cursor-pointer"
                  />
                  {showProfile && (
                    <div className="absolute right-5 text-sm text-gray-700">
                      {/* <NavProfile /> */}
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    className="px-4 h-10 bg-yellow rounded-lg bg-primary_hover hover:bg-[#5c0011] cursor-pointer"
                    onClick={() => setLoginModal(!loginModal)}
                  >
                    Login
                  </button>
                  {loginModal && (
                    <Login
                      isOpen={loginModal}
                      closeModal={closeModal}
                      toggleRegisterModal={toggleRegisterModal}
                    />
                  )}
                </li>
                <li>
                  <button
                    className="px-4 h-10 bg-yellow rounded-lg bg-primary_hover hover:bg-[#5c0011]"
                    onClick={() => setRegisterModal(!registerModal)}
                  >
                    Register
                  </button>
                  {registerModal && (
                    <Register
                      isOpen={registerModal}
                      closeModal={closeModal}
                      toggleLoginModal={toggleLoginModal}
                    />
                  )}
                </li>
              </>
            )}
          </ul>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <HiX className="h-6 w-6" />
          ) : (
            <HiMenu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-gray-200 md:hidden z-50 shadow-lg rounded-b-lg border-t border-rose-300">
            <ul className="flex flex-col text-gray-800 divide-y divide-rose-300">
              <li>
                <Link
                  to={"/home"}
                  className={`text-center block px-6 py-3 hover:bg-white/50 transition-colors duration-200 ${
                    isActiveLink("/home") || isActiveLink("/")
                      ? "bg-white/50 text-rose-800 font-medium"
                      : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to={"/about"}
                  className={`text-center block px-6 py-3 hover:bg-white/50 transition-colors duration-200 ${
                    isActiveLink("/about")
                      ? "bg-white/50 text-rose-800 font-medium"
                      : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact-us"
                  className={`text-center block px-6 py-3 hover:bg-white/50 transition-colors duration-200 ${
                    isActiveLink("/contact-us")
                      ? "bg-white/50 text-rose-800 font-medium"
                      : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </li>
            </ul>

            {!loading && !userData && (
              <div className="p-6 flex flex-col gap-3 border-t border-rose-300">
                <button
                  className="w-full px-4 h-10 bg-rose-600 hover:bg-rose-700 rounded-lg text-white font-medium transition-colors duration-200"
                  onClick={() => {
                    setLoginModal(!loginModal);
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </button>
                <button
                  className="w-full px-4 h-10 border-2 border-rose-600 hover:bg-rose-50 rounded-lg text-rose-600 font-medium transition-colors duration-200"
                  onClick={() => {
                    setRegisterModal(!registerModal);
                    setIsMenuOpen(false);
                  }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
