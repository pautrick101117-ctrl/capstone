import React from "react";

const chairperson = {
  name: "Cristina Anaena G. Canus",
  role: "BARANGAY CHAIRPERSON",
  image: "/images/image1.png",
};

const councilMembers = [
  { name: "John Patrick D. Mendoza", role: "SK KAGAWAD", image: "/images/image1.png" },
  { name: "John Patrick D. Mendoza", role: "SK KAGAWAD", image: "/images/image1.png" },
  { name: "John Patrick D. Mendoza", role: "SK KAGAWAD", image: "/images/image1.png" },
  { name: "John Patrick D. Mendoza", role: "SK KAGAWAD", image: "/images/image1.png" },
  { name: "John Patrick D. Mendoza", role: "SK KAGAWAD", image: "/images/image1.png" },
  { name: "John Patrick D. Mendoza", role: "SK KAGAWAD", image: "/images/image1.png" },
  { name: "John Patrick D. Mendoza", role: "SK KAGAWAD", image: "/images/image1.png" },
  { name: "John Patrick D. Mendoza", role: "SK KAGAWAD", image: "/images/image1.png" },
];

const SK = () => {
  return (
    <div className="relative min-h-screen">

      {/* BACKGROUND */}
      <img
        src="/landingPage-bg.png"
        className="absolute w-full h-full object-cover"
        alt="bg"
      />
      <div className="absolute w-full h-full bg-black/40"></div>

      {/* CONTENT */}
      <div className="relative z-10 pt-28 pb-16 px-6">

        {/* HERO SECTION */}
        <section className="max-w-6xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg">

          <div className="flex flex-col md:flex-row gap-10 items-start">

            {/* LEFT SIDE */}
            <div className="flex-1">
              <div className="inline-block bg-green-700 text-white font-bold text-xs px-3 py-1 rounded mb-3 uppercase tracking-widest">
                Sangguniang Kabataan
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4">
                SANGGUNIANG KABATAAN (SK)
              </h1>

              <div className="bg-green-700/80 text-white rounded-xl p-5 text-sm leading-relaxed shadow">
                <p className="mb-3">
                  The Sangguniang Kabataan is in charge of the youth, specifically ages 18 to 30
                  years old, within the barangay. The SK Chairperson leads the council together
                  with Kagawads in creating programs and activities.
                </p>

                <p className="mb-3">
                  Projects include sports programs, youth events, education support,
                  environmental activities, and disaster preparedness initiatives.
                </p>

                <p className="italic text-green-200 text-xs">
                  Very Truly Yours,
                  <br />
                  <span className="font-bold text-white not-italic text-sm">
                    John Patrick D. Mendoza
                  </span>
                  <br />
                  SK Chairperson
                </p>
              </div>
            </div>

            {/* RIGHT SIDE (IMAGE) */}
            <div className="flex-1">
              <div className="w-full h-full rounded-xl overflow-hidden border-4 border-green-400 shadow-lg">
                <img
                  src="/images/image3.png"
                  alt="SK Group"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </section>

        {/* MEMBERS SECTION */}
        <section className="max-w-6xl mx-auto mt-12 bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg">

          <h2 className="text-2xl font-extrabold text-green-800 text-center mb-10">
            SK Council Members
          </h2>

          {/* Chairperson */}
          <div className="flex justify-center mb-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-36 h-40 rounded-xl overflow-hidden border-4 border-green-500 shadow-md">
                <img
                  src={chairperson.image}
                  alt={chairperson.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center">
                <p className="font-bold text-gray-800 text-sm">
                  {chairperson.name}
                </p>
                <p className="text-xs text-green-700 font-semibold">
                  {chairperson.role}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-green-300" />
            <span className="text-xs text-green-700 font-bold uppercase tracking-widest">
              Kagawads
            </span>
            <div className="flex-1 h-px bg-green-300" />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {councilMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                
                <div className="w-28 h-32 rounded-xl overflow-hidden border-2 border-green-400 shadow-sm">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="font-semibold text-gray-800 text-xs mt-2 leading-tight">
                  {member.name}
                </p>

                <p className="text-xs text-green-600 font-semibold">
                  {member.role}
                </p>

              </div>
            ))}
          </div>

        </section>
      </div>
    </div>
  );
};

export default SK;