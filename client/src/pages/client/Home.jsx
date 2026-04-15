import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const Home = () => {
  const [election, setElection] = useState(null);
  const [content, setContent] = useState(null);

  useEffect(() => {
    Promise.all([api("/voting/live"), api("/content").catch(() => ({ content: null }))])
      .then(([live, landing]) => {
        setElection(live.election);
        setContent(landing.content);
      })
      .catch(() => {});
  }, []);

  const projects = content?.fund_projects || [
    "Project: Preparation for the Upcoming Basketball and Volleyball League",
    "Project: Kontra Dengue Clean-Up Drive",
    "Project: Nutrisyon para sa Kabataan",
    "Project: Medical Mission and Free Check-Up",
  ];

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
        <div className="relative z-10 flex h-full flex-col items-start justify-center gap-8 px-4 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          
          {/* LEFT CARD */}
          <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-xl max-w-md shadow-lg">
            <h1 className="text-2xl font-bold mb-4">
              {content?.hero?.title || "Welcome to Barangay Iba!"}
            </h1>
            <p className="text-sm text-gray-700">
              {content?.hero?.description ||
                "A Barangay Portal System is an online platform designed to optimize services and transactions within local barangay."}
            </p>
            {election ? (
              <div className="mt-5 rounded-2xl bg-green-700 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-100">Election is now live</p>
                <p className="mt-2 text-lg font-bold">{election.title}</p>
                <p className="mt-1 text-sm text-green-50">Current total votes: {election.totalVotes}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <NavLink to="/voting-result" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-700">
                    View Live Results
                  </NavLink>
                  <NavLink to="/voting-center" className="rounded-full border border-white px-4 py-2 text-sm font-semibold text-white">
                    Vote Now
                  </NavLink>
                </div>
              </div>
            ) : null}
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

          <NavLink to="/fund_transparency" className="bg-green-600 py-2  text-white px-4 rounded-full font-semibold ">
            FUND TRANSPARENCY
          </NavLink>

          <div className="space-y-4 mt-4">
            {projects.map((item, index) => (
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
