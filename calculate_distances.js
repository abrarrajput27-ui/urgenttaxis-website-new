const fs = require('fs');
const https = require('https');

const API_KEY = 'AIzaSyCF9yECkioNqOo3hWW9tv3tG8YKJ17FozM';

const STATES_DATA = {
  "Delhi": ["New Delhi", "Delhi Airport", "Connaught Place", "Dwarka", "Rohini", "Vasant Kunj", "Karol Bagh", "Lajpat Nagar", "Hauz Khas", "Saket", "Chandni Chowk", "Mayur Vihar", "Janakpuri", "Pitampura", "Okhla", "Chanakyapuri", "Greater Kailash", "Defense Colony", "South Extension", "Sarojini Nagar", "Rajouri Garden", "Punjabi Bagh", "Kirti Nagar", "Patel Nagar", "Paharganj", "Sadar Bazar", "Kashmere Gate", "Shahdara", "Seelampur", "Narela", "Bawana", "Najafgarh", "Palam", "Mahipalpur", "Chattarpur", "Mehrauli", "Vasant Vihar", "R.K. Puram", "Moti Bagh", "Dhaula Kuan", "Delhi Cantonment", "Rajendra Place", "Paschim Vihar", "Peera Garhi", "Mangolpuri", "Sultanpuri", "Nangloi", "Mundka", "Tikri Border"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Karnal", "Ambala", "Hisar", "Rohtak", "Sonipat", "Kurukshetra", "Yamunanagar", "Panchkula", "Sirsa", "Jind", "Kaithal", "Rewari", "Bhiwani", "Palwal", "Jhajjar", "Fatehabad", "Bahadurgarh", "Charkhi Dadri", "Nuh", "Mewat", "Gohana", "Hansi", "Tohana", "Narwana", "Safidon", "Pehowa", "Shahbad", "Ladwa", "Radaur", "Jagadhri", "Kalka", "Pinjore", "Narnaul", "Mahendragarh", "Bawal", "Dharuhera", "Kosli", "Hodal", "Hathin", "Punhana", "Taoru", "Sohna", "Pataudi", "Farrukhnagar", "Manesar", "Kharkhoda", "Ganaur", "Samalkha", "Gharaunda", "Assandh", "Nilokheri", "Indri", "Taraori", "Cheeka", "Pundri", "Kalayat", "Uchana"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Dalhousie", "Kullu", "Kasol", "Kasauli", "Chamba", "Mandi", "Solan", "Palampur", "Kangra", "Bilaspur", "Una", "Hamirpur", "Nahan", "Kinnaur", "Spiti", "Keylong", "Rohtang", "Sissu", "Kaza", "Kalpa", "Sangla", "Chitkul", "Reckong Peo", "Rampur", "Narkanda", "Theog", "Kufri", "Mashobra", "Naldehra", "Tattapani", "Arki", "Kunihar", "Nalagarh", "Baddi", "Parwanoo", "Barog", "Chail", "Kandaghat", "Sundernagar", "Nerchowk", "Jogindernagar", "Baijnath", "Dehra", "Jwalamukhi", "Pragpur", "Nadaun", "Sujanpur", "Ghumarwin", "Swarghat", "Naina Devi", "Mcleodganj", "Bhagsu", "Dharamkot", "Khajjiar", "Bharmour", "Pangi", "Tissa"],
  "Jammu & Kashmir": ["Jammu", "Srinagar", "Katra", "Gulmarg", "Pahalgam", "Anantnag", "Baramulla", "Udhampur", "Patnitop", "Sonamarg", "Kargil", "Leh", "Kathua", "Rajouri", "Poonch", "Kupwara", "Pulwama", "Shopian", "Kulgam", "Bandipora", "Ganderbal", "Budgam", "Samba", "Reasi", "Ramban", "Doda", "Kishtwar", "Bhaderwah", "Banihal", "Qazigund", "Awantipora", "Pampore", "Tral", "Bijbehara", "Mattan", "Kokernag", "Achabal", "Verinag", "Sopore", "Pattan", "Uri", "Tangmarg", "Magam", "Khag", "Chadoora", "Charari Sharief", "Kangan", "Mansar", "Surinsar", "Akhnoor", "Jourian", "Khour", "Bishnah", "R S Pura", "Arnia", "Ramgarh", "Vijaypur", "Hiranagar", "Billawar", "Basohli"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Ratlam", "Rewa", "Satna", "Khandwa", "Burhanpur", "Dewas", "Chhindwara", "Murwara", "Bhind", "Morena", "Vidisha", "Shivpuri", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Hoshangabad", "Itarsi", "Sehore", "Betul", "Seoni", "Datia", "Nagda", "Dhar", "Guna", "Damoh", "Mhow", "Tikamgarh", "Chhatarpur", "Harda", "Ashoknagar", "Shajapur", "Rajgarh", "Barwani", "Sheopur", "Sidhi", "Singrauli", "Shahdol", "Umaria", "Anuppur", "Dindori", "Mandla", "Balaghat", "Narsinghpur", "Raisen", "Agar Malwa", "Alirajpur", "Jhabua", "Panna", "Niwari", "Katni", "Amarkantak", "Pachmarhi", "Khajuraho", "Orchha", "Sanchi", "Bhedaghat"],
  "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Pathankot", "Moga", "Hoshiarpur", "Abohar", "Phagwara", "Khanna", "Zirakpur", "Rajpura", "Firozpur", "Kapurthala", "Barnala", "Muktsar", "Faridkot", "Fazilka", "Tarn Taran", "Gurdaspur", "Nawanshahr", "Rupnagar (Ropar)", "Mansa", "Sangrur", "Malerkotla", "Fatehgarh Sahib", "Sunam", "Batala", "Patti", "Zira", "Jalalabad", "Malout", "Giddarbaha", "Kot Kapura", "Jaitu", "Rampura Phul", "Talwandi Sabo", "Mauri", "Dhuri", "Ahmedgarh", "Samana", "Nabha", "Sirhind", "Bassi Pathana", "Amloh", "Kharar", "Kurali", "Morinda", "Anandpur Sahib", "Nangal", "Nurpur Bedi", "Balachaur", "Banga", "Phillaur", "Nakodar", "Shahkot", "Kartarpur", "Dasuya", "Mukerian"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Bikaner", "Ajmer", "Kota", "Bhilwara", "Alwar", "Sikar", "Pali", "Chittorgarh", "Kishangarh", "Ganganagar", "Bharatpur", "Beawar", "Tonk", "Sawai Madhopur", "Pushkar", "Jaisalmer", "Mount Abu", "Hanumangarh", "Churu", "Jhunjhunu", "Barmer", "Jalore", "Sirohi", "Rajsamand", "Dungarpur", "Banswara", "Pratapgarh", "Nathdwara", "Kumbhalgarh", "Ranakpur", "Haldighati", "Bundi", "Jhalawar", "Baran", "Karauli", "Dholpur", "Dausa", "Bandikui", "Mahwa", "Neem Ka Thana", "Khetri", "Pilani", "Chirawa", "Suratgarh", "Anupgarh", "Nohar", "Bhadra", "Sadulpur", "Ratangarh", "Sujangarh", "Nokha", "Deshnoke", "Kolayat", "Phalodi", "Pokaran", "Balotra"],
  "Uttar Pradesh": ["Noida", "Greater Noida", "Ghaziabad", "Agra", "Mathura", "Vrindavan", "Varanasi", "Lucknow", "Kanpur", "Allahabad", "Meerut", "Aligarh", "Bareilly", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Muzaffarnagar", "Ayodhya", "Firozabad", "Shahjahanpur", "Rampur", "Etawah", "Mainpuri", "Etah", "Kasganj", "Hathras", "Budaun", "Pilibhit", "Lakhimpur Kheri", "Sitapur", "Hardoi", "Unnao", "Raebareli", "Amethi", "Sultanpur", "Pratapgarh", "Kaushambi", "Fatehpur", "Banda", "Chitrakoot", "Mahoba", "Hamirpur", "Jalaun", "Lalitpur", "Kanpur Dehat", "Kannauj", "Farrukhabad", "Auraiya", "Ghazipur", "Ballia", "Mau", "Azamgarh", "Deoria", "Kushinagar", "Maharajganj", "Siddharthnagar", "Basti", "Sant Kabir Nagar", "Gonda", "Balrampur", "Shravasti", "Bahraich", "Barabanki", "Ambedkar Nagar", "Jaunpur", "Sant Ravidas Nagar", "Mirzapur", "Sonbhadra", "Chandauli"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Mussoorie", "Jim Corbett", "Ramnagar", "Almora", "Ranikhet", "Kausani", "Pithoragarh", "Kashipur", "Roorkee", "Kotdwar", "Rudrapur", "Mukteshwar", "Badrinath", "Kedarnath", "Auli", "Joshimath", "Gopeshwar", "Chamoli", "Rudraprayag", "Uttarkashi", "Barkot", "Gangotri", "Yamunotri", "Tehri", "New Tehri", "Chamba", "Devprayag", "Srinagar", "Pauri", "Lansdowne", "Dugadda", "Bageshwar", "Baijnath", "Garur", "Someshwar", "Dwarahat", "Chaukhutia", "Syalde", "Bhikiyasain", "Bhowali", "Bhimtal", "Naukuchiatal", "Sattal", "Khurpatal", "Ramgarh", "Peora", "Lohaghat", "Champawat", "Tanakpur", "Banbasa", "Khatima", "Sitarganj", "Kichha", "Pantnagar", "Gadarpur", "Bajpur", "Jaspur", "Kaladhungi"]
};

const topDestinations = ["Jaipur", "Dehradun", "Shimla", "Chandigarh", "Agra", "Nainital", "Rishikesh", "Haridwar", "Manali", "Amritsar", "Udaipur", "Lucknow"];

const encodeCity = (city) => encodeURIComponent(city + ", India");

const fetchDistancesForOrigin = (origin, destinations) => {
  return new Promise((resolve, reject) => {
    const destString = destinations.map(encodeCity).join('|');
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeCity(origin)}&destinations=${destString}&key=${API_KEY}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', err => reject(err));
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  const result = {};
  
  const allOrigins = [];
  for (const state of Object.keys(STATES_DATA)) {
    for (const city of STATES_DATA[state]) {
      if (!allOrigins.includes(city)) {
        allOrigins.push(city);
      }
    }
  }

  console.log(`Starting fetch for ${allOrigins.length} origins to ${topDestinations.length} destinations.`);

  for (let i = 0; i < allOrigins.length; i++) {
    const origin = allOrigins[i];
    console.log(`[${i+1}/${allOrigins.length}] Fetching for: ${origin}`);
    
    try {
      const response = await fetchDistancesForOrigin(origin, topDestinations);
      
      if (response.status === 'OK' && response.rows[0]) {
        const elements = response.rows[0].elements;
        
        result[origin] = {};
        
        for (let j = 0; j < topDestinations.length; j++) {
          const dest = topDestinations[j];
          const elem = elements[j];
          
          if (elem && elem.status === 'OK') {
            const distanceKm = Math.round(elem.distance.value / 1000);
            const durationMins = Math.round(elem.duration.value / 60);
            
            result[origin][dest] = {
              distanceKm,
              durationMins
            };
          } else {
             // Fallback
            result[origin][dest] = {
              distanceKm: 250,
              durationMins: 300
            };
          }
        }
      } else {
        console.error("API Error or no rows for", origin, response.status);
      }
      
      // Delay to avoid hitting queries-per-second limits (approx 10 requests per second is usually safe for this API)
      await delay(100); 
    } catch (err) {
      console.error("Error fetching", origin, err);
    }
  }
  
  const libDir = './frontend/lib';
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  fs.writeFileSync('./frontend/lib/distances.json', JSON.stringify(result, null, 2));
  console.log("Successfully wrote frontend/lib/distances.json");
}

main();
