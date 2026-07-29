const fs = require('fs');
const https = require('https');

// Define the target states and cities based on user request
const STATES = {
  "Delhi": ["Delhi", "New Delhi", "Delhi Airport"],
  "Haryana": ["Gurugram", "Faridabad", "Rohtak", "Hisar", "Panipat", "Karnal", "Ambala"],
  "Uttar Pradesh": ["Noida", "Greater Noida", "Ghaziabad", "Agra", "Mathura", "Varanasi", "Lucknow", "Kanpur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Mussoorie", "Jim Corbett"],
  "Rajasthan": ["Jaipur", "Udaipur", "Jodhpur", "Pushkar", "Ajmer", "Bikaner", "Jaisalmer"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Dalhousie", "Kullu", "Kasol"],
  "Punjab": ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
  "Madhya Pradesh": ["Gwalior", "Indore", "Bhopal", "Ujjain"],
  "Jammu & Kashmir": ["Jammu", "Srinagar", "Katra"]
};

// OSRM Public API for distances (Note: In production, use your own instance or paid API)
// Wikipedia API for fetching city images

async function getDistance(origin, destination) {
  // Logic to call OSRM or Google Distance Matrix
  // Returning mock data for the skeleton
  return {
    distance_km: Math.floor(Math.random() * 400) + 50,
    duration_mins: Math.floor(Math.random() * 300) + 60
  };
}

async function getCityImage(cityName) {
  // Logic to call Wikipedia API: https://en.wikipedia.org/w/api.php?action=query&prop=pageimages...
  return `/destinations/${cityName.toLowerCase().replace(/ /g, '-')}.jpg`;
}

async function generateRoutes() {
  console.log("Starting massive route generation...");
  const routes = [];
  
  const stateNames = Object.keys(STATES);
  
  for (let i = 0; i < stateNames.length; i++) {
    const originState = stateNames[i];
    const originCities = STATES[originState];
    
    for (const originCity of originCities) {
      // Connect to all cities in OTHER states
      for (let j = 0; j < stateNames.length; j++) {
        if (i === j) continue; // Skip same state or uncomment to allow internal state routes
        
        const destState = stateNames[j];
        const destCities = STATES[destState];
        
        for (const destCity of destCities) {
          console.log(`Generating route: ${originCity} (${originState}) -> ${destCity} (${destState})`);
          
          const metrics = await getDistance(originCity, destCity);
          const image = await getCityImage(destCity);
          
          routes.push({
            origin_city: originCity,
            origin_state: originState,
            dest_city: destCity,
            dest_state: destState,
            distance_km: metrics.distance_km,
            duration_mins: metrics.duration_mins,
            image_url: image,
            seo_title: `${originCity} to ${destCity} Taxi Service`,
            seo_keywords: `${originCity} to ${destCity} cab, taxi from ${originCity} to ${destCity}, ${destCity} outstation cabs`
          });
        }
      }
    }
  }
  
  fs.writeFileSync('generated_routes.json', JSON.stringify(routes, null, 2));
  console.log(`Successfully generated ${routes.length} routes! Ready for Supabase injection.`);
}

// generateRoutes();
