import wmsuPagadian from "../../assets/images/wmsu_pagadian_campus.jpg";
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <img src={logoImg} alt="" className="z-10 h-70 " />
          <div>
            <h1 className="text-[#FF7C0C] text-8xl font-extrabold drop-shadow-[2px_2px_0px_white]">
              ptiSched
            </h1>
            <p className="text-white text-8xl font-extrabold drop-shadow-[2px_2px_0px_#FF7C0C]">
              SYSTEM
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <h1 className="text-white text-4xl font-bold">
            Input. Optimized. Schedule.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
