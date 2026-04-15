import React from "react";

const Home = () => {
  return (
    <div className="w-full">

      {/* HERO SECTION */}
      <section className="relative h-screen">
        
        {/* Background Image */}
        <img
          src="/landingPage-bg.png"
          className="absolute w-full h-full object-cover"
          alt="bg"
        />

        {/* Overlay */}
        <div className="absolute w-full h-full bg-black/30"></div>

        {/* CONTENT */}
        <div className="relative z-10 flex items-center h-full px-10">
          
          {/* LEFT CARD */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl max-w-md shadow-lg">
            <h1 className="text-2xl font-bold mb-4">
              Welcome to Barangay Iba!
            </h1>
            <p className="text-sm text-gray-700">
              A Barangay Portal System is an online platform designed to optimize
              services and transactions within local barangay.
            </p>
          </div>

          {/* RIGHT LOGO */}
          <div className="ml-auto hidden md:block">
            <img src="/logo.png" className="w-60 opacity-90" />
          </div>

        </div>
      </section>

      {/* FUND TRANSPARENCY */}
      <section className="bg-gray-100 py-10 px-6">
        <div className="max-w-3xl mx-auto text-center">

          <button className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold mb-6">
            FUND TRANSPARENCY
          </button>

          <div className="space-y-4">
            {[
              "Project: Preparation for the Upcoming Basketball and Volleyball League",
              "Project: Kontra Dengue Clean-Up Drive",
              "Project: Nutrisyon para sa Kabataan",
              "Project: Medical Mission and Free Check-Up",
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-300 rounded-full py-3 px-6 text-left font-medium"
              >
                {item}
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-600 cursor-pointer">
            View More
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;