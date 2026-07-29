"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const STATES_DATA = {
  "Delhi": ["New Delhi", "Delhi Airport", "Connaught Place", "Dwarka", "Rohini", "Vasant Kunj", "Karol Bagh", "Lajpat Nagar", "Hauz Khas", "Saket", "Chandni Chowk", "Mayur Vihar", "Janakpuri", "Pitampura", "Okhla", "Chanakyapuri", "Greater Kailash", "Defense Colony", "South Extension", "Sarojini Nagar", "Rajouri Garden", "Punjabi Bagh", "Kirti Nagar", "Patel Nagar", "Paharganj", "Sadar Bazar", "Kashmere Gate", "Shahdara", "Seelampur", "Narela", "Bawana", "Najafgarh", "Palam", "Mahipalpur", "Chattarpur", "Mehrauli", "Vasant Vihar", "R.K. Puram", "Moti Bagh", "Dhaula Kuan", "Delhi Cantonment", "Karol Bagh", "Rajendra Place", "Paschim Vihar", "Peera Garhi", "Mangolpuri", "Sultanpuri", "Nangloi", "Mundka", "Tikri Border"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Karnal", "Ambala", "Hisar", "Rohtak", "Sonipat", "Kurukshetra", "Yamunanagar", "Panchkula", "Sirsa", "Jind", "Kaithal", "Rewari", "Bhiwani", "Palwal", "Jhajjar", "Fatehabad", "Bahadurgarh", "Charkhi Dadri", "Nuh", "Mewat", "Gohana", "Hansi", "Tohana", "Narwana", "Safidon", "Pehowa", "Shahbad", "Ladwa", "Radaur", "Jagadhri", "Kalka", "Pinjore", "Narnaul", "Mahendragarh", "Bawal", "Dharuhera", "Kosli", "Hodal", "Hathin", "Punhana", "Taoru", "Sohna", "Pataudi", "Farrukhnagar", "Manesar", "Kharkhoda", "Ganaur", "Samalkha", "Gharaunda", "Assandh", "Nilokheri", "Indri", "Taraori", "Cheeka", "Pundri", "Kalayat", "Uchana"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Dalhousie", "Kullu", "Kasol", "Kasauli", "Chamba", "Mandi", "Solan", "Palampur", "Kangra", "Bilaspur", "Una", "Hamirpur", "Nahan", "Kinnaur", "Spiti", "Keylong", "Rohtang", "Sissu", "Kaza", "Kalpa", "Sangla", "Chitkul", "Reckong Peo", "Rampur", "Narkanda", "Theog", "Kufri", "Mashobra", "Naldehra", "Tattapani", "Arki", "Kunihar", "Nalagarh", "Baddi", "Parwanoo", "Barog", "Chail", "Kandaghat", "Sundernagar", "Nerchowk", "Jogindernagar", "Baijnath", "Dehra", "Jwalamukhi", "Pragpur", "Nadaun", "Sujanpur", "Ghumarwin", "Swarghat", "Naina Devi", "Mcleodganj", "Bhagsu", "Dharamkot", "Khajjiar", "Bharmour", "Pangi", "Tissa"],
  "Jammu & Kashmir": ["Jammu", "Srinagar", "Katra", "Gulmarg", "Pahalgam", "Anantnag", "Baramulla", "Udhampur", "Patnitop", "Sonamarg", "Kargil", "Leh", "Kathua", "Rajouri", "Poonch", "Kupwara", "Pulwama", "Shopian", "Kulgam", "Bandipora", "Ganderbal", "Budgam", "Samba", "Reasi", "Ramban", "Doda", "Kishtwar", "Bhaderwah", "Banihal", "Qazigund", "Awantipora", "Pampore", "Tral", "Bijbehara", "Mattan", "Kokernag", "Achabal", "Verinag", "Sopore", "Pattan", "Uri", "Tangmarg", "Magam", "Khag", "Chadoora", "Charari Sharief", "Kangan", "Mansar", "Surinsar", "Akhnoor", "Jourian", "Khour", "Bishnah", "R S Pura", "Arnia", "Ramgarh", "Vijaypur", "Hiranagar", "Billawar", "Basohli"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Ratlam", "Rewa", "Satna", "Khandwa", "Burhanpur", "Dewas", "Chhindwara", "Murwara", "Bhind", "Morena", "Vidisha", "Shivpuri", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Hoshangabad", "Itarsi", "Sehore", "Betul", "Seoni", "Datia", "Nagda", "Dhar", "Guna", "Damoh", "Mhow", "Tikamgarh", "Chhatarpur", "Harda", "Ashoknagar", "Shajapur", "Rajgarh", "Barwani", "Sheopur", "Sidhi", "Singrauli", "Shahdol", "Umaria", "Anuppur", "Dindori", "Mandla", "Balaghat", "Narsinghpur", "Raisen", "Rajgarh", "Agar Malwa", "Alirajpur", "Jhabua", "Panna", "Niwari", "Katni", "Amarkantak", "Pachmarhi", "Khajuraho", "Orchha", "Sanchi", "Bhedaghat"],
  "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Pathankot", "Moga", "Hoshiarpur", "Abohar", "Phagwara", "Khanna", "Zirakpur", "Rajpura", "Firozpur", "Kapurthala", "Barnala", "Muktsar", "Faridkot", "Fazilka", "Tarn Taran", "Gurdaspur", "Nawanshahr", "Rupnagar (Ropar)", "Mansa", "Sangrur", "Malerkotla", "Fatehgarh Sahib", "Sunam", "Batala", "Patti", "Zira", "Jalalabad", "Malout", "Giddarbaha", "Kot Kapura", "Jaitu", "Rampura Phul", "Talwandi Sabo", "Mauri", "Dhuri", "Ahmedgarh", "Samana", "Nabha", "Sirhind", "Bassi Pathana", "Amloh", "Kharar", "Kurali", "Morinda", "Anandpur Sahib", "Nangal", "Nurpur Bedi", "Balachaur", "Banga", "Phillaur", "Nakodar", "Shahkot", "Kartarpur", "Dasuya", "Mukerian"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Bikaner", "Ajmer", "Kota", "Bhilwara", "Alwar", "Sikar", "Pali", "Chittorgarh", "Kishangarh", "Ganganagar", "Bharatpur", "Beawar", "Tonk", "Sawai Madhopur", "Pushkar", "Jaisalmer", "Mount Abu", "Hanumangarh", "Churu", "Jhunjhunu", "Barmer", "Jalore", "Sirohi", "Rajsamand", "Dungarpur", "Banswara", "Pratapgarh", "Nathdwara", "Kumbhalgarh", "Ranakpur", "Haldighati", "Chittorgarh", "Kota", "Bundi", "Jhalawar", "Baran", "Karauli", "Dholpur", "Dausa", "Bandikui", "Mahwa", "Neem Ka Thana", "Khetri", "Pilani", "Chirawa", "Suratgarh", "Anupgarh", "Nohar", "Bhadra", "Sadulpur", "Ratangarh", "Sujangarh", "Nokha", "Deshnoke", "Kolayat", "Phalodi", "Pokaran", "Balotra"],
  "Uttar Pradesh": ["Noida", "Greater Noida", "Ghaziabad", "Agra", "Mathura", "Vrindavan", "Varanasi", "Lucknow", "Kanpur", "Allahabad (Prayagraj)", "Meerut", "Aligarh", "Bareilly", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Muzaffarnagar", "Ayodhya", "Firozabad", "Shahjahanpur", "Rampur", "Etawah", "Mainpuri", "Etah", "Kasganj", "Hathras", "Budaun", "Pilibhit", "Lakhimpur Kheri", "Sitapur", "Hardoi", "Unnao", "Raebareli", "Amethi", "Sultanpur", "Pratapgarh", "Kaushambi", "Fatehpur", "Banda", "Chitrakoot", "Mahoba", "Hamirpur", "Jalaun", "Lalitpur", "Kanpur Dehat", "Kannauj", "Farrukhabad", "Auraiya", "Ghazipur", "Ballia", "Mau", "Azamgarh", "Deoria", "Kushinagar", "Maharajganj", "Siddharthnagar", "Basti", "Sant Kabir Nagar", "Gonda", "Balrampur", "Shravasti", "Bahraich", "Barabanki", "Ambedkar Nagar", "Jaunpur", "Sant Ravidas Nagar", "Mirzapur", "Sonbhadra", "Chandauli"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Mussoorie", "Jim Corbett", "Ramnagar", "Almora", "Ranikhet", "Kausani", "Pithoragarh", "Kashipur", "Roorkee", "Kotdwar", "Rudrapur", "Mukteshwar", "Badrinath", "Kedarnath", "Auli", "Joshimath", "Gopeshwar", "Chamoli", "Rudraprayag", "Uttarkashi", "Barkot", "Gangotri", "Yamunotri", "Tehri", "New Tehri", "Chamba", "Devprayag", "Srinagar", "Pauri", "Lansdowne", "Dugadda", "Bageshwar", "Baijnath", "Garur", "Kausani", "Someshwar", "Dwarahat", "Chaukhutia", "Syalde", "Bhikiyasain", "Bhowali", "Bhimtal", "Naukuchiatal", "Sattal", "Khurpatal", "Ramgarh", "Peora", "Lohaghat", "Champawat", "Tanakpur", "Banbasa", "Khatima", "Sitarganj", "Kichha", "Pantnagar", "Gadarpur", "Bajpur", "Jaspur", "Kaladhungi"]
};

// Dynamically generate top routes by connecting the active city to major cities in other states
const generateDynamicRoutes = (originCity: string) => {
  const allDestinations = [];
  
  // Pick some top tier destinations from across all states
  const topDestinations = ["Jaipur", "Dehradun", "Shimla", "Chandigarh", "Agra", "Nainital", "Rishikesh", "Haridwar", "Manali", "Amritsar", "Udaipur", "Lucknow"];
  
  // Filter out the origin city itself
  const filteredDestinations = topDestinations.filter(d => d.toLowerCase() !== originCity.toLowerCase());
  
  // Return exactly 8 premium route cards for the UI grid
  return filteredDestinations.slice(0, 8).map((dest, i) => {
    // Generate a consistent pseudo-random distance and price based on string length to avoid pure randomness looking broken
    const hash = originCity.length + dest.length;
    return {
      id: i,
      origin: originCity,
      destination: dest,
      distance: (hash * 15) + 100, // E.g., 200-400km
      price: (hash * 150) + 2000,  // E.g., 3000-5000 INR
      image: `/destinations/${dest.toLowerCase().replace(/ /g, '-')}.jpg`
    };
  });
};

export default function RoutesTabWidget() {
  const [activeState, setActiveState] = useState("Delhi");
  const [activeCity, setActiveCity] = useState("Delhi");

  const generateDynamicRoutes = (originCity: string) => {
    const topDestinations = ["Jaipur", "Dehradun", "Shimla", "Chandigarh", "Agra", "Nainital", "Rishikesh", "Haridwar", "Manali", "Amritsar", "Udaipur", "Lucknow"];
    const filteredDestinations = topDestinations.filter(d => d.toLowerCase() !== originCity.toLowerCase()).slice(0, 8);
    
    return filteredDestinations.map((dest, i) => {
      const stringHash = originCity.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + dest.charCodeAt(0);
      const approxDistanceKm = (stringHash % 250) + 200; 
      const approxFare = (approxDistanceKm * 11) + (stringHash % 500);
      
      return {
        id: i,
        origin: originCity,
        destination: dest,
        distance: approxDistanceKm,
        price: approxFare,
        image: `/destinations/${dest.toLowerCase().replace(/ /g, '-')}.jpg`
      };
    });
  };

  const activeCities = STATES_DATA[activeState as keyof typeof STATES_DATA] || [];
  const currentRoutes = generateDynamicRoutes(activeCity);

  return (
    <div className="w-full font-sans">
      <div className="flex overflow-x-auto hide-scrollbar gap-2 sm:gap-4 pb-4 mb-4 sm:mb-8 mt-2 px-2">
        {Object.keys(STATES_DATA).map((state) => (
          <button
            key={state}
            onClick={() => {
              setActiveState(state);
              setActiveCity(STATES_DATA[state as keyof typeof STATES_DATA][0]);
            }}
            className={`whitespace-nowrap px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 border-2 ${
              activeState === state
                ? 'bg-brand-blue/90 border-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105'
                : 'bg-slate-100/30 border-slate-300 text-slate-700 hover:bg-slate-100/60 hover:border-slate-400'
            }`}
          >
            {state}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 sm:p-8 border border-slate-200">
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-10">
          {(STATES_DATA[activeState as keyof typeof STATES_DATA] || []).map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                activeCity === city
                  ? 'bg-brand-green/20 border-brand-green text-slate-900 shadow-sm'
                  : 'bg-white/50 border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-100'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentRoutes.map((route) => {
            const whatsappMessage = encodeURIComponent(`Hello Urgent Taxis! 👋\n\nI want to book an *Outstation Cab*. 🚕\n📍 *Route*: *${route.origin}* to *${route.destination}*\n\nPlease share the detailed fare and availability.`);
            const whatsappUrl = `https://wa.me/917310651940?text=${whatsappMessage}`;
            return (
              <div key={route.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-xl hover:border-brand-green/30 transition-all duration-300 flex flex-col h-full">
            <div className="h-44 relative overflow-hidden bg-slate-100">
              <Image
                src={route.image}
                alt={`${route.origin} to ${route.destination}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <h3 className="text-white font-black tracking-tight leading-tight">
                  <span className="block text-xs font-bold text-slate-300 mb-0.5">{route.origin} -</span>
                  {route.destination}
                </h3>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-slate-600 font-medium bg-slate-50 p-2 rounded-lg">
                  <MapPin className="w-4 h-4 mr-2 text-brand-green flex-shrink-0" />
                  <span>Approx. <span className="font-bold text-slate-800">{route.distance} km</span></span>
                </div>
                <div className="flex items-center text-sm text-slate-600 font-medium bg-slate-50 p-2 rounded-lg">
                  <Car className="w-4 h-4 mr-2 text-brand-blue flex-shrink-0" />
                  <span>Cab Availability: Hatchback to Innova</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Starts at</span>
                  <span className="text-xl font-black text-brand-blue">₹{route.price}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link
                    href={`/routes/${route.origin.toLowerCase().replace(/ /g, '-')}-to-${route.destination.toLowerCase().replace(/ /g, '-')}`}
                    className="bg-brand-blue hover:bg-blue-900 text-white text-xs text-center font-bold px-3 py-2.5 rounded-lg shadow-sm transition-colors"
                  >
                    View Fare
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-green hover:bg-emerald-600 text-white text-xs text-center font-bold px-3 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>💬</span> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
