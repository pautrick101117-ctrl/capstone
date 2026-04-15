import React from 'react'

const captain = {
  name: 'Cynthia D. Cervantes',
  role: 'BARANGAY CAPTAIN',
  committee: 'Health and Sanitation',
  image: '/images/image4.png',
}

const kagawadsRow1 = [
  {
    name: 'Kevin Andrew T. Dionisio',
    role: 'KAGAWAD',
    committee: 'Social Services, Management and Information Systems',
    image: '/images/image4.png',
  },
  {
    name: 'Jean O. Asuncion',
    role: 'KAGAWAD',
    committee: 'Beautification and Cleanliness Committee, Barangay Disaster Risk Reduction Management',
    image: '/images/image4.png',
  },
  {
    name: 'Constancia Q. Lichauco',
    role: 'KAGAWAD',
    committee: 'Peace and Order Committee',
    image: '/images/image4.png',
  },
  {
    name: 'Ma. Bella R. Oposa',
    role: 'KAGAWAD',
    committee: 'Seniors and PWD Committee',
    image: '/images/image4.png',
  },
]

const kagawadsRow2 = [
  {
    name: 'Maria Carmen R. Guerzon',
    role: 'KAGAWAD',
    committee: 'Education, Arts and Culture Committee',
    image: '/images/image4.png',
  },
  {
    name: 'Jean O. Asuncion',
    role: 'KAGAWAD',
    committee: 'Beautification and Cleanliness Committee, Barangay Disaster Risk Reduction Management',
    image: '/images/image4.png',
  },
  {
    name: 'Constancia Q. Lichauco',
    role: 'KAGAWAD',
    committee: 'Peace and Order Committee',
    image: '/images/image4.png',
  },
  {
    name: 'Ma. Bella R. Oposa',
    role: 'KAGAWAD',
    committee: 'Seniors and PWD Committee',
    image: '/images/image4.png',
  },
]

const MemberCard = ({ member, small = false }) => (
  <div className="flex flex-col items-center text-center gap-2">
    <div
      className={`overflow-hidden rounded-lg border-2 border-green-500 shadow-sm ${
        small ? 'w-28 h-32' : 'w-32 h-36'
      }`}
    >
      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
    </div>
    <div>
      <p className="text-xs font-bold text-gray-800 leading-tight">{member.name}</p>
      <p className="text-xs font-semibold text-green-700 tracking-wide">{member.role}</p>
      <p className="text-xs text-gray-500 leading-tight mt-0.5 max-w-[130px]">{member.committee}</p>
    </div>
  </div>
)

const Officials = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Hero: Barangay Council Banner ── */}
      <section
        className="relative pt-28 pb-16 px-6 bg-cover bg-center"
        style={{ backgroundImage: "url('/landingPage-bg.png')" }}
      >
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative  flex flex-col items-center">
          {/* Title badge */}
          <div className="flex justify-center mb-6">
            <h1 className="bg-green-600 text-white font-extrabold text-xl px-10 py-2 rounded tracking-widest uppercase shadow">
              BARANGAY COUNCIL
            </h1>
          </div>

          {/* Welcome card */}
          <div className="bg-white/95 rounded-xl shadow-lg p-6 w-[600px] flex flex-col md:flex-row gap-6 items-start">
            {/* Text */}
            <div className="flex-1 text-sm text-gray-700 leading-relaxed">
              <h2 className="text-lg font-extrabold text-gray-900 mb-2">
                Welcome to Barangay Iba!
              </h2>
              <p className="mb-3">
                We have provided you with a guidebook to acquaint you with the many services we
                offer our constituents. We at the Barangay hope you find it useful and inform
                you of the many ways we take care of you.
              </p>
              <p className="italic text-gray-500 text-xs">
                Very Truly Yours,
                <br />
                <span className="font-bold text-gray-800 not-italic text-sm">
                  John Patrick D. Mendoza
                </span>
                <br />
                BARANGAY CHAIRPERSON
              </p>
            </div>

            {/* Captain photo card */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-48 h-52 rounded-lg overflow-hidden border-4 border-green-500 shadow-md">
                <img
                  src="/images/image4.png"
                  alt="Barangay Captain"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Elected Officials ── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-extrabold text-green-800 text-center mb-10 tracking-tight">
          Elected Officials
        </h2>

        {/* Barangay Captain row */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-6 bg-white rounded-xl shadow-sm border border-green-100 px-8 py-5">
            <div className="w-32 h-36 rounded-lg overflow-hidden border-2 border-green-500 shadow-sm flex-shrink-0">
              <img src={captain.image} alt={captain.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-700 tracking-widest uppercase">
                {captain.role}
              </p>
              <p className="text-lg font-extrabold text-gray-900">{captain.name}</p>
              <p className="text-sm text-gray-500 mt-1">{captain.committee}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-green-200" />
          <span className="text-xs text-green-600 font-semibold tracking-widest uppercase">
            Kagawads
          </span>
          <div className="flex-1 h-px bg-green-200" />
        </div>

        {/* Kagawads Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {kagawadsRow1.map((member, i) => (
            <MemberCard key={i} member={member} />
          ))}
        </div>

        {/* Kagawads Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
          {kagawadsRow2.map((member, i) => (
            <MemberCard key={i} member={member} />
          ))}
        </div>

        {/* Group photo */}
        <div className="flex justify-center">
          <div className="w-full max-w-lg h-62 rounded-2xl overflow-hidden border-4 border-green-500 shadow-lg">
            <img
              src="/images/image5.png"
              alt="Barangay Officials Group Photo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Officials