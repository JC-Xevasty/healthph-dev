import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import LogoAlt from "../assets/images/logo-alt.png";
import WebLogo from "../assets/images/website-logo.svg";
import WebLogoAlt from "../assets/images/website-logo-alt.svg";
import { useEffect, useState } from "react";
import HamburgerMenu from "./HamburgerMenu";
import Icon from "./Icon";

import NULogo from "../assets/images/nu-logo.png";
import NULogoLg from "../assets/images/nu-logo-lg.png";
import NULogoLgAlt from "../assets/images/nu-logo-lg-alt.png";

const HomeNavbar = ({ background = "transparent" }) => {
  const location = useLocation();

  const [isMenuActive, setIsMenuActive] = useState(false);

  const [menuAnimate, setMenuAnimate] = useState("");

  const handleOpenMenu = () => {
    setIsMenuActive(!isMenuActive);
    setMenuAnimate(!isMenuActive ? "show-menu" : "hide-menu");
  };

  const handleAnimationEnd = (e) => {
    if (e.target.classList.contains("hide-menu")) {
      setMenuAnimate("");
    }
  };
  return (
    <nav
      className={
        "home-nav h-[96px] mx-[20px] flex justify-between items-center background-" +
        background
      }
    >
      <div className="flex justify-between items-center w-full max-w-[1326px] mx-auto">
        {/* LOGO */}
        <div className="flex">
          <Link to="/" className="logo-wrapper h-[44px] me-[16px]">
            <img
              src={isMenuActive || background == "solid" ? WebLogo : WebLogoAlt}
              alt=""
            />
          </Link>
        </div>

        <div className={"home-nav-links " + menuAnimate}>
          {/* NAV LINKS */}
          <ul>
            <li>
              <NavLink to="/">
                <Icon
                  iconName="Home"
                  height="20px"
                  width="20px"
                  className="icon"
                />
                <span>Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/about-us">
                <Icon
                  iconName="Information"
                  height="20px"
                  width="20px"
                  className="icon"
                />
                <span>About The Project</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/articles">
                <Icon
                  iconName="Document"
                  height="20px"
                  width="20px"
                  className="icon"
                />
                <span>Articles</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/research-team">
                <Icon
                  iconName="UserThree"
                  height="20px"
                  width="20px"
                  className="icon"
                />
                <span>Research Team</span>
              </NavLink>
            </li>
            {/* <li>
              <NavLink
                to="/about-us2"
                className={`prod-btn-lg ${
                  background == "solid" ? "prod-btn-ghost" : "prod-btn-white"
                }`}
              >
                <Icon
                  iconName="Information"
                  height="20px"
                  width="20px"
                  className="icon"
                />
                <span>About Us2</span>
              </NavLink>
            </li> */}
          </ul>

          <div className="flex justify-center items-center">
            <div className="w-[152px] h-full">
              <img
                src={isMenuActive ? NULogoLgAlt : NULogoLg}
                alt="national-university"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* CTA*/}
          {/* <div className="home-cta flex justify-center items-center"> */}
          {/* <Link
              to="/login"
              className="prod-btn-lg prod-btn-primary me-[16px]"
            >
              Sign In
            </Link> */}
          {/* <Link
              to="assets/healthph-pre-alpha.apk"
              target="_blank"
              className="prod-btn-lg prod-btn-secondary flex justify-center items-center"
            >
              <span>Download HealthPH</span>
              <Icon
                iconName="Download"
                height="24"
                width="24"
                fill="#8693A0"
                className="icon ms-[8px]"
              />
            </Link> */}

          {/* <Link to="/register" className="prod-btn-lg prod-btn-secondary">
            Join HealthPH
          </Link> */}
          {/* </div> */}
        </div>

        <HamburgerMenu
          isMenuActive={isMenuActive}
          handleClick={handleOpenMenu}
        />
      </div>
      <div
        className={`nav-backdrop min-[900px]:!hidden  ${
          isMenuActive ? "active" : ""
        } ${menuAnimate} `}
        onAnimationEnd={handleAnimationEnd}
        onClick={handleOpenMenu}
      ></div>
    </nav>
  );
};
export default HomeNavbar;
