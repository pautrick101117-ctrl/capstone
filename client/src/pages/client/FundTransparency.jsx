import React from "react";

const FundTransparency = () => {
  const summary = [
    { label: "Total Funds", value: "₱ 300,000" },
    { label: "Spent Funds", value: "₱ 300,000" },
    { label: "Remaining Funds", value: "₱ 300,000" },
  ];

  const projects = [
    {
      project: "Preparation for the Upcoming Basketball and Volleyball League",
      date: "April 14, 2018",
      expenses:
        "Total Expenses: ₱4,500\nPaint (cost incl. labor) - ₱3,000\nLandscaping and repaving workers - ₱1,500",
      description:
        "Funds were utilized to purchase new sports equipment and improve facilities, successfully supporting the basketball and volleyball leagues.",
    },
    {
      project: "Kontra Dengue Clean-Up Drive",
      date: "August 22, 2023",
      expenses:
        "Total Expenses: ₱5,500\nCleaning materials (trash bags, gloves, disinfectant) - ₱2,500\nTools (broom, shovel, canal cleaning tools) - ₱1,500\nLabor (community helpers/volunteers) - ₱1,500",
      description:
        "A successful community-wide clean-up drive aimed at preventing dengue through the clearing of canals and conducting information campaigns.",
    },
    {
      project: "Nutrition para sa Kabataan",
      date: "November 22, 2024",
      expenses:
        "Total Expenses: ₱3,000\nFood supplies (rice, vegetables, protein) - ₱1,500\nCooking materials and utensils - ₱700\nLabor (food preparation and distribution) - ₱500\nNutrition education materials - ₱300",
      description:
        "Provided healthy meals and nutrition education to undernourished children in the barangay.",
    },
    {
      project: "Medical Mission and Free Check-Up",
      date: "December 18, 2025",
      expenses:
        "Total Expenses: ₱8,000\nMedicines and vitamins - ₱5,000\nMedical supplies (gloves, masks, syringes) - ₱1,500\nLabor (volunteer health workers) - ₱1,500",
      description:
        "Free medical consultations and essential health services were provided to residents in need, ensuring access to proper healthcare.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/landingPage-bg.png')" }}
    >
      <div className="pt-28 px-6 pb-10 bg-black/20 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 rounded-lg p-6 mb-6">
            <h1 className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-xl font-bold">
              FUND TRANSPARENCY
            </h1>
            <p className="mt-4 text-sm text-gray-800 max-w-3xl">
              At Barangay Iba, we are committed to ensuring transparency in how community funds are used. Here is a detailed breakdown of our recent projects and expenses.
            </p>
          </div>

          <section className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Fund Summary Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.map((item) => (
                <div key={item.label} className="bg-white/90 rounded-lg p-5 text-center shadow">
                  <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                  <p className="text-2xl font-bold text-green-700">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/90 rounded-lg overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="text-left p-4">Project</th>
                    <th className="text-left p-4">Date Implemented</th>
                    <th className="text-left p-4">Expenses</th>
                    <th className="text-left p-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((item, index) => (
                    <tr key={index} className="border-t align-top">
                      <td className="p-4 w-1/4">{item.project}</td>
                      <td className="p-4 w-1/6">{item.date}</td>
                      <td className="p-4 whitespace-pre-line w-1/4">{item.expenses}</td>
                      <td className="p-4 w-1/3">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FundTransparency;