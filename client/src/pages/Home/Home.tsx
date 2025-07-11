import wmsuPagadian from "../../assets/images/wmsu_pagadian_campus.png";
import logoImg from "../../assets/images/logo1.png";

const Home = () => {
  return (
    <div>
      <div className="h-[calc(100vh-4rem)] relative">
        <img
          src={wmsuPagadian}
          alt="WMSU Pagadian Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 px-4 md:px-0">
          <img src={logoImg} alt="" className="z-10 h-40 md:h-70" />
          <div>
            <h1 className="text-[#FF7C0C] text-4xl md:text-8xl font-extrabold drop-shadow-[2px_2px_0px_white] text-center md:text-left">
              ptiSched
            </h1>
            <p className="text-white text-4xl md:text-8xl font-extrabold drop-shadow-[2px_2px_0px_#FF7C0C] text-center md:text-left">
              SYSTEM
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full px-4 md:px-0 md:w-auto">
          <h1 className="text-white text-2xl md:text-4xl font-bold text-center">
            Input. Optimized. Schedule.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
