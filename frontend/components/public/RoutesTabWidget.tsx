"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Car, Clock, Search, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { resolveOneWayFare, buildWhatsAppBookingLink } from '@/lib/pricing';
import { getDestinationImage } from '@/lib/destination-images';

// -----------------------------------------------------------------------------
// STRICT STATE-BY-STATE DESTINATION DIRECTORY (ZERO CROSS-STATE CONTAMINATION)
// Mandate: "popular routes me jitne bhi states hain unka alag alag tab banao 
// ek hi state me dusre state ko show mat karao un state me har chhoti se chhoti 
// location cover karo village cities and every single location that is available on maps"
// -----------------------------------------------------------------------------
const STATE_DESTINATIONS: Record<string, string[]> = {
  "Bihar": [
    "Adhaura", "Akbarpur", "Akorhi Gola", "Aliganj", "Alinagar", "Amarpur",
    "Amarpur (Banka)", "Amarpur Sadar", "Amas", "Amnour", "Antichak", "Areraj",
    "Ariari", "Arrah", "Arwal", "Asarganj", "Asthawan", "Aurangabad (Bihar)",
    "Babubarhi", "Bagaha", "Bahadurpur", "Baheri", "Baheri Rural", "Baikunthpur (Bihar)",
    "Bairgania", "Baisi", "Bajpatti", "Bakhri", "Bakhtiarpur Rural", "Bakhtiyarpur",
    "Ballia (Bihar)", "Baniapur", "Banka", "Barachatti", "Barahara", "Barahat",
    "Barahiya", "Barari (Katihar)", "Barauli", "Barbigha", "Barh", "Barhara Kothi",
    "Barharia", "Barhat", "Bariarpur", "Barun", "Baunsi", "Begusarai",
    "Belaganj", "Belhar", "Belhar (Banka)", "Belsand", "Ben", "Benipatti",
    "Bettiah", "Bhabhua Sadar", "Bhabua", "Bhagalpur", "Bhagwanpur (Vaishali)", "Bhargama",
    "Bhelwa", "Bhojpur Rural", "Bidupur", "Bihta", "Bihta Rural", "Bikram",
    "Bikramganj", "Bikramganj Rural", "Bind", "Biraul", "Biraul Sadar", "Birpur Border",
    "Bisfi", "Bisfi (Madhubani)", "Bochahan", "Bodh Gaya", "Bounsi", "Brahmpur",
    "Buxar", "Chainpur", "Chakai", "Chakia", "Chakia Rural", "Chanan",
    "Chanan (Lakhisarai)", "Chand", "Chandan (Banka)", "Chandi", "Chanpatia", "Chanpatia Rural",
    "Chapra (Saran)", "Chenari", "Cheria Bariarpur", "Chewara", "Chhatapur", "Chhatapur Supaul",
    "Chhauradano", "Chhaurahi", "Chiraiya (Champaran)", "Colgong", "Dalsinghsarai", "Dalsinghsarai Rural",
    "Danapur", "Darauli", "Darbhanga", "Daudnagar", "Daulatpur", "Dehri-on-Sone",
    "Desri", "Dhaka", "Dharhara", "Dhauraiya", "Dhoraiya", "Dighwara",
    "Dighwara Rural", "Dinara", "Dumaria", "Dumra", "Dumraon", "Ekangarsarai",
    "Ekma", "Fatehpur (Gaya)", "Fatuha", "Forbesganj", "Gamhariya", "Garkha",
    "Garkha Dehat", "Garkha Rural", "Gaunaha", "Gaunaha West Champaran", "Gaya", "Ghanshyampur",
    "Ghat Kusumbha", "Ghorasahan", "Ghosi (Jehanabad)", "Gidhaur", "Giriyak", "Goh",
    "Goh (Aurangabad)", "Gopalganj", "Goraul", "Govindpur", "Gurua", "Harlakhi",
    "Harnaut", "Hasanpur", "Hasanpur Rural", "Haspura", "Hathua", "Haveli Kharagpur",
    "Hayaghat", "Hayaghat Darbhanga", "Hilsa", "Hilsa Rural", "Hisua", "Imamganj",
    "Islampur", "Islampur Rural", "Itarhi", "Jagdishpur (Bhagalpur)", "Jagdishpur (Bhojpur)", "Jagdishpur Dehat",
    "Jainagar", "Jalalpur", "Jale", "Jamalpur", "Jamui", "Jandaha",
    "Janta Bazar", "Janta Bazar Saran", "Jehanabad", "Jhajha", "Jhajha (Jamui)", "Jhanjharpur",
    "Jogbani", "Kahalgaon", "Kahalgaon Rural", "Kalyanpur (East Champaran)", "Kalyanpur (Samastipur)", "Kanti Rural",
    "Karakat", "Karakat (Rohtas)", "Karakat Rural", "Kargahar", "Kasba", "Kasmar",
    "Katihar", "Katoria", "Katra (Muzaffarpur)", "Keoti", "Kesaria", "Kesaria Stupa",
    "Khagaria", "Khagaria Sadar", "Khagaul", "Khaira", "Khajauli", "Khanpur",
    "Kishanganj", "Kochar", "Kochas", "Koilwar", "Korha", "Kuchaikote",
    "Kudra (Kaimur)", "Kurhani", "Kurhani Muzaffarpur", "Kusheshwar Asthan", "Kusheshwar Asthan Bird Sanctuary", "Ladania",
    "Ladania Madhubani", "Lakhisarai", "Lalganj", "Laukaha", "Lauriya", "Madhepur",
    "Madhepura", "Madhuban", "Madhuban Dehat", "Madhubani", "Maharajganj (Bihar)", "Mahua",
    "Mahua Rural", "Mairwa", "Majhaulia", "Majorganj", "Maker", "Makhdumpur",
    "Makhdumpur Sadar", "Maner", "Maner Sharif", "Manihari", "Manjhi", "Manjhi (Saran)",
    "Marhaura", "Marhaura Rural", "Marwan", "Masaurhi", "Masaurhi Rural", "Meenapur (Muzaffarpur)",
    "Mehandar", "Mehandar Siwan", "Mehsi", "Minapur", "Mirganj", "Mohania",
    "Mohanpur", "Mohanpur (Gaya)", "Mokama", "Morwa", "Morwa (Samastipur)", "Motihari",
    "Munger", "Mushahari", "Muzaffarpur", "Nabinagar", "Nabinagar Power Hub", "Nagar Untari",
    "Nalanda", "Nanpur", "Narkatiaganj", "Narkatiaganj Rural", "Nathnagar", "Naubatpur",
    "Nautan", "Nawada", "Nawanagar", "Nirmali", "Nokha", "Obra",
    "Obra Carpet Town", "Paharpur", "Pakribarawan", "Pakridayal", "Pandaul", "Parihar",
    "Paroo", "Paroo Rural", "Parsa", "Parsa Bazar", "Patahi", "Patepur",
    "Patna", "Patna Airport", "Patna City", "Patori", "Phulparas", "Phulwari Sharif",
    "Pipariya", "Pipra", "Piprakothi", "Piro", "Pirpainti", "Pratapganj",
    "Pupri", "Pupri (Sitamarhi)", "Purnia", "Rafiganj", "Raghopur", "Raghopur Diyara",
    "Raghopur Diyara Vaishali", "Raghunathpur", "Rajauli", "Rajaun", "Rajaun (Banka)", "Rajgir",
    "Rajnagar (Madhubani)", "Rajpur", "Ramgarh (Bihar)", "Ramgarh (Kaimur)", "Ramgarh Chowk", "Ramnagar (Bihar)",
    "Raniganj", "Raniganj (Araria)", "Raxaul", "Revelganj", "Riga", "Rivilganj",
    "Rosera", "Rosera Rural", "Runi Saidpur", "Rupauli (Purnia)", "Sabour", "Sahajitpur",
    "Saharsa", "Sahdai Buzurg", "Sahebganj", "Sakaldiha", "Samastipur", "Samho",
    "Sandesh", "Sangrampur", "Sarairanjan", "Saraiya", "Saraiya (Muzaffarpur)", "Sarath",
    "Sarmera", "Sasaram", "Shahkund", "Shahpur (Bhojpur)", "Shahpur Patori", "Shahpur Patori Samastipur",
    "Sheikhopur Sarai", "Sheikhpura", "Shekhopur", "Sheohar", "Sherghati", "Sherghati Rural",
    "Shikarpur", "Shivaji Nagar", "Shivala", "Sidhwalia", "Sikandra", "Sikta",
    "Silao", "Silao Rural", "Simri", "Simri Bakhtiarpur", "Simri Bakhtiarpur Saharsa", "Singhia",
    "Siswan", "Sitamarhi", "Siwan", "Sonbarsa", "Sonbarsa (Saharsa)", "Sonepur",
    "Sonho", "Sono", "Sugauli", "Sugauli Dehat", "Sultanganj", "Supaul",
    "Sursand", "Sursand Border", "Suryagarha", "Suryagarha (Lakhisarai)", "Tajpur", "Taraiya",
    "Taraiya Saran", "Tarapur", "Tarapur (Munger)", "Tarari", "Teghra", "Teghra (Begusarai)",
    "Tekari", "Tekari Rural", "Thakurganj", "Tharthari (Nalanda)", "Triveniganj", "Triveniganj Supaul",
    "Ujiarpur", "Ujiarpur (Samastipur)", "Vaishali", "Vidyapati Nagar", "Warisaliganj Dehat", "Warisnagar",
    "Warisnagar (Samastipur)", "Warsaliganj", "Wazirganj (Gaya)"
  ],
  "Delhi NCR": [
    "Abul Fazal Enclave", "Abul Fazal Part 2", "Ahinsa Sthal", "Akshardham Mandir", "Ali Village", "Alipur",
    "Alipur Garhi", "Anand Parbat", "Anand Vihar", "Apsara Border", "Arjan Garh", "Ashok Nagar",
    "Ashok Vihar", "Ashram Chowk", "Asiad Village", "Aya Nagar", "Azadpur", "Azadpur Mandi",
    "Badarpur", "Badarpur Border", "Badarpur Mehrauli Road", "Badli", "Badli Industrial Area", "Badli Village",
    "Bakhtawarpur", "Bakhtawarpur Village", "Bakkarwala", "Bakkarwala JJ", "Baljit Nagar", "Bankner",
    "Bankner Village", "Bapa Nagar", "Baprola", "Baprola Village", "Barakhamba Road", "Barwala (Delhi)",
    "Barwala Delhi", "Bawana", "Bawana Industrial Area", "Bawana JJ", "Bawana Village", "Begumpur",
    "Begumpur Extension", "Begumpur Village", "Ber Sarai", "Bhagirath Palace", "Bhalswa Dairy", "Bhalswa Jahangirpuri",
    "Bhalswa Lake", "Bhalswa Lake Promenade", "Bharat Nagar", "Bhati Mines", "Bhati Mines Sanctuary", "Bhikaji Cama Place",
    "Bijwasan", "Bijwasan Border", "Bijwasan Village", "Bindapur", "Brahmpuri", "Brij Vihar (Ghaziabad)",
    "Burari", "Burari Extension", "Burari Kaushik Enclave", "Burari Sant Nagar", "Central Secretariat", "Chanakyapuri",
    "Chander Nagar", "Chandni Chowk", "Chandpur", "Chawla", "Chawri Bazar", "Chhatarpur",
    "Chhatarpur Enclave", "Chhatarpur Extension", "Chhattarpur Mandir", "Chhawla BSF Camp", "Chhawla Camp", "Chirag Dilli",
    "Civil Lines", "Civil Lines Metro", "Connaught Place", "Crossings Republik (Ghaziabad)", "Dadri (Greater Noida)", "Dankaur (Greater Noida)",
    "Daryaganj", "Daryaganj Heritage", "Daryapur Kalan", "Dasna (Ghaziabad)", "Daulatpur (Delhi)", "Daulatpur Delhi",
    "Dayalpur", "Defence Colony", "Delhi Airport (IGI T1)", "Delhi Airport (IGI T2)", "Delhi Airport (IGI T3)", "Delhi Cantonment",
    "Delhi Cantt", "Delhi Gate", "Delhi High Court Area", "Delhi University North Campus", "Delhi University South Campus", "Deoli",
    "Deorala", "Dera Mandi", "Dera Mandi Village", "Dhansa", "Dhansa Border", "Dhaula Kuan",
    "Dichaon Kalan", "Dilshad Colony", "Dilshad Garden", "Dujana (Greater Noida)", "Dwarka Mor", "Dwarka Sector 1",
    "Dwarka Sector 10", "Dwarka Sector 12", "Dwarka Sector 14", "Dwarka Sector 19", "Dwarka Sector 21", "Dwarka Sector 23",
    "Dwarka Sector 6", "Dwarka Sector 8", "East Patel Nagar", "East Vinod Nagar", "Faridabad Ballabhgarh", "Faridabad Greenfield",
    "Faridabad NIT", "Faridabad Old", "Faridabad Sector 15", "Faridabad Sector 16", "Faridabad Sector 21", "Faridabad Surajkund",
    "Fatehpur Beri", "Friends Colony", "Gagan Vihar", "Gandhi Nagar", "Garhi Harsaru (NCR)", "Garhmukteshwar Border (NCR)",
    "Gaur City (Greater Noida West)", "Gautam Nagar", "Geeta Colony", "Ghaziabad Crossings", "Ghaziabad Govindpuram", "Ghaziabad Indirapuram",
    "Ghaziabad Kavi Nagar", "Ghaziabad Loni", "Ghaziabad Masuri HQ", "Ghaziabad Mohan Nagar", "Ghaziabad Morta", "Ghaziabad Muradnagar",
    "Ghaziabad Pratap Vihar", "Ghaziabad Raj Nagar Ext", "Ghaziabad Sahibabad", "Ghaziabad Shastri Nagar", "Ghaziabad Surya Nagar", "Ghaziabad Vaishali",
    "Ghaziabad Vasundhara", "Ghaziabad Vijay Nagar", "Ghazipur Mandi", "Ghevra", "Ghevra Village", "Ghitorni",
    "Ghitorni Extension", "Ghitorni Village", "Ghonda", "Goela Khurd", "Gokalpur", "Gokalpuri Village",
    "Govindpuri", "Govindpuri Extension", "Greater Kailash 1", "Greater Kailash 2", "Greater Kailash Enclave", "Greater Noida Alpha 1",
    "Greater Noida Alpha 2", "Greater Noida Beta 1", "Greater Noida Beta 2", "Greater Noida Delta 1", "Greater Noida Delta 2", "Greater Noida Ecotech",
    "Greater Noida Gamma 1", "Greater Noida Gamma 2", "Greater Noida Knowledge Park 1", "Greater Noida Knowledge Park 2", "Greater Noida Knowledge Park 3", "Greater Noida Omicron 1",
    "Greater Noida Pari Chowk", "Greater Noida Surajpur", "Greater Noida Zeta", "Green Park", "Green Park Extension", "GTB Enclave",
    "GTB Nagar", "Gulabi Bagh", "Gurugram Ardee City", "Gurugram Badshahpur", "Gurugram Cyber City", "Gurugram DLF Phase 1",
    "Gurugram DLF Phase 2", "Gurugram DLF Phase 3", "Gurugram DLF Phase 4", "Gurugram DLF Phase 5", "Gurugram Golf Course Ext", "Gurugram Golf Course Road",
    "Gurugram IMT Manesar", "Gurugram MG Road", "Gurugram Nirvana Country", "Gurugram Palam Vihar", "Gurugram Sector 14", "Gurugram Sector 29",
    "Gurugram Sector 31", "Gurugram Sector 43", "Gurugram Sector 48", "Gurugram Sector 54", "Gurugram Sector 56", "Gurugram Sohna Road",
    "Gurugram South City", "Gurugram Sushant Lok", "Haiderpur", "Haiderpur Village", "Hari Nagar", "Hastsal",
    "Hastsal Village", "Hauz Khas", "Hauz Khas Enclave", "Hauz Khas Village", "Holambi Kalan", "Holambi Khurd",
    "Inderlok", "Inderpuri", "India Gate", "IP Extension", "Issapur", "Issapur Border",
    "ITO Delhi", "Jafarpur", "Jafarpur Kalan", "Jaffarpur Kalan", "Jahangirpuri", "Jaitpur",
    "Jaitpur Extension", "Jaitpur Khurd", "Jamia Nagar", "Janakpuri", "Janakpuri District Centre", "Jangpura",
    "Jangpura Extension", "Jasola", "Jasola Vihar", "Jewar (Noida Airport)", "Jhandewalan", "Jharoda Dairy",
    "Jharoda Kalan", "Jharoda Majra", "Jhilmil", "Jhilmil Industrial Area", "Jor Bagh", "Kadipur",
    "Kadipur Village", "Kailash Colony", "Kakrola", "Kakrola Village", "Kalindi Kunj", "Kalkaji",
    "Kalkaji Mandir", "Kalyanpuri", "Kamla Nagar", "Kanganheri", "Kanganheri Adventure Hub", "Kanjhawala",
    "Kanjhawala Industrial", "Kanjhawala Village", "Kapashera", "Kapashera Border", "Kapashera Extension", "Kapriwas",
    "Karawal Nagar", "Karawal Nagar West", "Karkardooma Village", "Karol Bagh", "Kashmere Gate", "Kashmere Gate ISBT",
    "Kasna (Greater Noida)", "Katwaria Sarai", "Kaushambi (NCR)", "Keshopur", "Khan Market", "Khanpur",
    "Khel Gaon", "Khera Dabar", "Khera Kalan", "Khera Khurd", "Khirki Extension", "Khirki Village",
    "Kingsway Camp", "Kirari Extension", "Kirari Suleman Nagar", "Kirti Nagar", "Kirti Nagar Industrial Area", "Kondli",
    "Kotla Mubarakpur", "Krishna Nagar", "Kundli (NCR Border)", "Lado Sarai", "Lajpat Nagar 1", "Lajpat Nagar 2",
    "Lajpat Nagar 3", "Lajpat Nagar 4", "Lawrence Road", "Laxmi Nagar", "Libaspur", "Libaspur Industrial",
    "Lodhi Colony", "Lodhi Estate", "Loni (Ghaziabad)", "Loni Border", "Madangir", "Madhu Vihar",
    "Maharani Bagh", "Mahipalpur", "Mahipalpur Extension", "Mahipalpur Vasant Kunj Road", "Malikpur", "Malikpur Village",
    "Malviya Nagar", "Mandawali", "Mandi House", "Mandi Village", "Manglapuri", "Mangolpuri",
    "Mangolpuri Phase 1", "Mansarovar Garden", "Masoodpur", "Matiala", "Mayapuri", "Mayapuri Industrial Area",
    "Mayur Vihar Extension", "Mayur Vihar Phase 1", "Mayur Vihar Phase 2", "Mayur Vihar Phase 3", "Mehrauli", "Mehrauli Archaeological Park",
    "Mehrauli Village", "Minto Road", "Mithapur", "Mithapur Village", "Model Town 1", "Model Town 2",
    "Model Town 3", "Modinagar (NCR)", "Mohan Cooperative", "Molarband", "Mori Gate", "Moti Bagh",
    "Moti Nagar", "Mukherjee Nagar", "Mukhmelpur", "Mundka", "Mundka Industrial", "Mundka Industrial Area",
    "Mundka Metro", "Mundka Village", "Munirka", "Muradnagar (NCR)", "Najafgarh", "Najafgarh Dichaon Kalan",
    "Nangal Dewat", "Nangli Sakrawati", "Nangloi", "Nangloi Jat", "Naraina", "Naraina Industrial Area",
    "Naraina Vihar", "Narela", "Narela Industrial Area", "Nauroji Nagar", "Neb Sarai", "Neeti Bagh",
    "Nehru Place", "New Ashok Nagar", "New Delhi Railway Station", "New Friends Colony", "New Moti Nagar", "New Rajinder Nagar",
    "Nirman Vihar", "Nithari", "Nithari Village", "Nizamuddin East", "Nizamuddin Railway Station", "Nizamuddin West",
    "Noida City Centre", "Noida Electronic City", "Noida Extension", "Noida Golf Course", "Noida Sector 128", "Noida Sector 137",
    "Noida Sector 142", "Noida Sector 15", "Noida Sector 150 Sports City", "Noida Sector 16", "Noida Sector 18 (Atta Market)", "Noida Sector 37",
    "Noida Sector 50", "Noida Sector 62", "Noida Sector 62 Metro Hub", "Noida Sector 76", "Noida Sector 93 Grand Omaxe", "Okhla Bird Sanctuary",
    "Okhla Industrial Area", "Okhla Phase 1", "Okhla Phase 2", "Okhla Phase 3", "Old Delhi Railway Station", "Old Rajinder Nagar",
    "Pahar Ganj", "Palam", "Palam Colony", "Palam Village", "Palla", "Palla Border",
    "Pandav Nagar", "Pankha Road", "Paschim Vihar", "Paschim Vihar West", "Patel Nagar", "Patel Nagar East",
    "Patel Nagar West", "Patparganj", "Patparganj Industrial Area", "Pilkhuwa (NCR)", "Pitampura", "Pooth Kalan",
    "Pooth Khurd", "Pragati Maidan", "Pratap Nagar", "Preet Vihar", "Pul Prahladpur", "Punjabi Bagh",
    "Punjabi Bagh Club Road", "Punjabi Bagh West", "Pusa Road", "Qutub Minar Complex", "Qutubgarh", "Qutubgarh Border",
    "R.K. Puram", "Raja Garden", "Rajendra Place", "Rajokri", "Rajokri Village", "Rajouri Garden",
    "Ramesh Nagar", "Rangpuri", "Rani Bagh", "Rithala", "Rithala Metro", "Rohini Sector 1",
    "Rohini Sector 11", "Rohini Sector 16", "Rohini Sector 24", "Rohini Sector 3", "Rohini Sector 7", "Rohini Sector 8",
    "Rohini Sector 9", "Roop Nagar", "Saboli", "Saboli Village", "Sadhu Vaswani Marg", "Safdarjung Enclave",
    "Safdarjung Tomb Area", "Sahibabad Industrial Area", "Sainik Farm East", "Saket", "Saket District Centre", "Samalka",
    "Samalka Village", "Sangam Vihar", "Sanoth", "Sanoth Village", "Sarai Kale Khan ISBT", "Sarai Rohilla Railway Station",
    "Saraswati Vihar", "Sarita Vihar", "Sarita Vihar Pocket A", "Sarojini Nagar", "Sarojini Nagar Market", "Satya Niketan",
    "Shahbad Daulatpur", "Shahdara", "Shahdara Metro Hub", "Shahpur Jat", "Shakur Basti", "Shakurpur",
    "Shakurpur Village", "Shalimar Bagh", "Shalimar Bagh Club Road", "Shanti Niketan", "Shastri Nagar", "Shastri Park",
    "Sheikh Sarai", "Siraspur", "Siraspur Village", "Siri Fort", "South Extension 1", "South Extension 2",
    "Subhash Nagar", "Sukhdev Vihar", "Sultanpur Majra", "Sultanpur Village", "Sunder Nagar", "Surajpur Industrial Area",
    "Tagore Garden", "Tajpur Kalan", "Tekhand", "Tikri Border", "Tikri Border Industrial", "Tikri Kalan",
    "Tikri Kalan Border", "Tilak Marg", "Tilak Nagar", "Tilak Nagar Metro", "Tilangpur Kotla", "Timarpur",
    "Tis Hazari", "Trilokpuri", "Tughlakabad", "Tughlakabad Fort Area", "Ujwa", "Ujwa Village",
    "Uttam Nagar", "Uttam Nagar East", "Uttam Nagar West", "Vasant Enclave", "Vasant Kunj", "Vasant Kunj Institutional",
    "Vasant Kunj Mall Area", "Vasant Vihar", "Vasant Vihar Enclave", "Vasundhara Enclave", "Vasundhara Sector 14", "Vikas Marg",
    "Vikas Puri", "Vinod Nagar East", "Vinod Nagar West", "Vishnu Garden", "Vivek Vihar", "Wazirabad",
    "Wazirpur", "Wazirpur Industrial Area", "Yamuna Sports Complex", "Yamuna Vihar", "Yamuna Vihar C Block", "Yusuf Sarai",
    "Zakhira", "Zakir Nagar"
  ],
  "Goa": [
    "Agassaim", "Agassaim Heritage", "Agonda", "Agonda Beach", "Aguada", "Aldona",
    "Aldona Church", "Ambora", "Amona", "Amona Mineral Hub", "Anjuna", "Anjuna Flea Market",
    "Aquem", "Aquem Margao", "Arambol", "Arambol Sweet Water Lake", "Arlem", "Arpora",
    "Arpora Night Market", "Arpora Village", "Ashwem Beach", "Assagao", "Assagao Badem", "Assolna",
    "Assonora", "Baga", "Bambolim", "Bambolim Beach", "Batim", "Benaulim",
    "Benaulim Beach Road", "Betalbatim", "Betalbatim Beach", "Betim Ferry Point", "Betul", "Betul Fort",
    "Bhati", "Bicholim", "Calangute", "Calvim Island", "Camurlim", "Canacona",
    "Canaguinim", "Candolim", "Candolim Beach Road", "Cansaulim", "Caranzalem", "Carmona",
    "Carmona Beach", "Carmona Village", "Cavelossim", "Chapora", "Chapora Fort Area", "Chicalim",
    "Chinchinim", "Chorao", "Chorao Island Sanctuary", "Cola Beach", "Collem", "Colva",
    "Colva Beach Road", "Corlim", "Corlim Industrial", "Cortalim", "Cortalim Junction", "Cotta Chandor",
    "Curca", "Curchorem", "Curtorim Heritage", "Dabolim (Goa Airport)", "Davorlim", "Davorlim Margao",
    "Divar Island", "Dona Paula", "Galgibaga", "Goa Velha", "Guirim", "Guirim Cross",
    "Keri Beach", "Loutolim", "Majorda", "Majorda Beach", "Majorda Railway Station", "Majorda Village",
    "Mandrem", "Mandrem Beach", "Mapusa", "Marcaim", "Marcel Heritage", "Margao (Madgaon)",
    "Marna", "Miramar", "Moira", "Mopa (Goa Airport)", "Morjim", "Morjim Ashwem Link",
    "Morjim Turtle Beach", "Nachinola", "Nagoa", "Nagoa Arpora", "Navelim", "Nerul",
    "Nerul Riverfront", "Nuvem", "Nuvem Bypass", "Olaulim", "Old Goa", "Orlim",
    "Pale", "Pale Kotombi", "Panaji", "Parra", "Parra Church Road", "Pernem",
    "Pomburpa", "Ponda", "Porvorim", "Quepem", "Raia", "Raia Santxamol",
    "Raia Village", "Reis Magos", "Ribandar Causeway", "Rivona", "Saligao", "Saligao Church",
    "Saligao Heritage", "Salvador do Mundo", "Salvador do Mundo Church", "Sanguem", "Sanquelim", "Santa Cruz (Goa)",
    "Santa Cruz Goa", "Sanvordem", "Sernabatim", "Sinquerim", "Sinquerim Beach", "Siolim",
    "Siridao", "Socorro", "Taleigao", "Taleigao Plateau", "Tivim", "Tivim Railway Hub",
    "Ucassaim", "Usgao", "Utorda", "Utorda Beach", "Vagator", "Valpoi",
    "Varca", "Varca Beach Road", "Vasco da Gama", "Velim", "Velsao", "Verna Industrial SEZ"
  ],
  "Gujarat": [
    "Ahmedabad", "Ahmedabad Airport", "Ahmedabad Ashram Road", "Ahmedabad Bopal", "Ahmedabad CG Road", "Ahmedabad Chandkheda",
    "Ahmedabad Gandhinagar Link", "Ahmedabad Maninagar", "Ahmedabad Naroda", "Ahmedabad Navrangpura", "Ahmedabad Paldi", "Ahmedabad Prahlad Nagar",
    "Ahmedabad SG Highway", "Ahmedabad Thaltej", "Ahmedabad Vastrapur", "Ambaji Temple Road", "Amod", "Amod Bharuch",
    "Amreli", "Amreli Rural", "Anand", "Anjar Kutch", "Anklav", "Anklav Anand",
    "Ankleshwar", "Babra", "Babra Amreli", "Balasinor", "Balasinor Dinosaur Park", "Bardoli",
    "Bardoli Rural", "Bavla", "Bayad", "Bayad Aravalli", "Bechraji", "Bechraji Temple",
    "Bhadran", "Bhanvad", "Bhanvad Devbhumi", "Bharuch", "Bhavnagar", "Bhuj",
    "Bilimora", "Borsad", "Borsad Anand", "Botad", "Chanasma", "Chanasma Patan",
    "Chhota Udaipur", "Chikhli (Navsari)", "Chikhli Navsari", "Dabhoi Heritage Fort", "Dabhoi Rural", "Dahej",
    "Dahej Port", "Dahej SEZ", "Dahej SEZ Port", "Dahod", "Dakor Temple Town", "Daman Border (GJ)",
    "Danta", "Danta Banaskantha", "Deesa", "Deesa Rural", "Dehgam", "Dehgam Gandhinagar",
    "Devgadh Baria", "Dhanera", "Dhanera Border", "Dholera", "Dholka", "Dholka Ancient Hub",
    "Dhrangadhra", "Dwarka", "Dwarka Bet", "Dwarka Bet Island", "Gadhada", "Gadhada Swaminarayan Temple",
    "Gandevi", "Gandevi Bilimora", "Gandevi Sugar Belt", "Gandhidham", "Gandhinagar", "Gandhinagar GIFT City",
    "Gandhinagar Infocity", "Garbada", "Garbada Dahod", "Gariadhar", "Gariadhar Bhavnagar", "Ghogha",
    "Ghogha Ro-Pax Terminal", "Godhra", "Gondal", "Gondal Rural", "Halol", "Halol Industrial",
    "Harij", "Harij Patan", "Himatnagar", "Idar", "Idar Gadh Fort", "Idar Hill Town",
    "Jambusar", "Jambusar Port", "Jamnagar", "Jasdan", "Jasdan Rajkot", "Jetpur",
    "Jetpur (Rajkot)", "Jhagadia", "Jhagadia Industrial", "Jodiya", "Jodiya Jamnagar", "Junagadh",
    "Kadi", "Kadi Industrial", "Kalol", "Kalol (Gandhinagar)", "Kaloor", "Kamrej",
    "Kamrej Surat Toll", "Kapadvanj", "Kapadvanj Kheda", "Karjan", "Karjan Vadodara", "Kathor",
    "Kawant", "Kawant Chhota Udaipur", "Keshod", "Khambhat", "Khedbrahma", "Kheralu",
    "Kheralu Mehsana", "Kodinar", "Kodinar Somnath Link", "Kotda Sangani", "Kutiyana", "Kutiyana Porbandar",
    "Lakhpat", "Lakhpat Historic Fort", "Lathi", "Lathi Amreli", "Limbdi", "Limbdi Surendranagar",
    "Lunawada", "Mahuva", "Mahuva Port", "Malpur", "Malpur Aravalli", "Manavadar",
    "Manavadar Junagadh", "Mandvi (Kutch)", "Mandvi Beach (Kutch)", "Mansa", "Mansa Gandhinagar", "Meghraj",
    "Meghraj Aravalli", "Mehsana", "Mithapur", "Modasa", "Modasa Aravalli HQ", "Morbi",
    "Morva Hadaf", "Morva Hadaf Panchmahal", "Mundra", "Mundra Port", "Mundra Port Kutch", "Nadiad",
    "Nakhatrana", "Nakhatrana Kutch", "Navsari", "Olpad", "Olpad Surat", "Padra",
    "Padra Vadodara", "Palanpur", "Palitana", "Palitana Shatrunjaya Hills", "Patan", "Petlad",
    "Petlad Anand", "Porbandar", "Prantij", "Prantij Sabarkantha", "Radhanpur", "Radhanpur Gateway",
    "Rajkot", "Rajkot Kalawad Road", "Rajpipla", "Sanand", "Sanand Industrial", "Santrampur",
    "Santrampur Mahisagar", "Savli", "Savli Vadodara", "Sayan", "Sayan Surat", "Sayla",
    "Sayla Surendranagar", "Shehra", "Shehra Panchmahal", "Shinor", "Shinor Narmada", "Siddhpur",
    "Sihor", "Sihor Bhavnagar", "Sojitra", "Sojitra Anand", "Somnath", "Songadh Fort",
    "Surat", "Surat Adajan", "Surat Dumas", "Surat Ring Road", "Surat Textile Market", "Surat Varachha",
    "Surendranagar", "Sutrapada", "Sutrapada Coastal", "Talaja", "Talala (Gir)", "Talala Gir Sasan Gateway",
    "Taranga Hill", "Thara", "Thara Banaskantha", "Tharad", "Tharad Border", "Tilakwada",
    "Tilakwada Statue of Unity Link", "Umargam", "Una", "Una (Gir)", "Unjha", "Upleta",
    "Upleta Rajkot", "Vadali", "Vadali Sabarkantha", "Vadnagar", "Vadnagar Heritage City", "Vadodara",
    "Vadodara Airport", "Vadodara Alkapuri", "Vadodara Fatehgunj", "Vadodara Makarpura", "Vadodara Sayajigunj", "Vaghodia",
    "Vaghodia Industrial", "Vallabh Vidyanagar", "Vallabh Vidyanagar Anand", "Valsad", "Vansda", "Vansda National Park",
    "Vapi", "Vav", "Vav Banaskantha", "Veraval", "Vijapur", "Vijapur Mehsana",
    "Viramgam", "Virpur (Jalaram)", "Virpur Jalaram Bapa Temple", "Visnagar", "Vyara", "Vyara Tapi",
    "Vyara Tapi HQ", "Wadhwan", "Wankaner", "Wankaner Palace"
  ],
  "Haryana": [
    "Adampur", "Agroha", "Ahar", "Ahirka", "Ahirka Jind", "Alahar",
    "Alahar Yamunanagar", "Alewa", "Alika", "Ambala", "Ambala Cantt", "Ambala City",
    "Arya Nagar", "Assandh", "Assandh Mandi", "Assandh Rural", "Ateli", "Babain",
    "Babarpur (HR)", "Badalpur", "Badhra", "Badhra Charkhi Dadri", "Badhra Rural", "Badkhal",
    "Badli", "Badli Jhajjar", "Badopal", "Badopal Fatehabad", "Bahadurgarh", "Bahin",
    "Bahin Hathin", "Ballabhgarh", "Bangu", "Bapauli", "Bapoli", "Baragudha",
    "Barara", "Barara Rural", "Baraut Border (HR)", "Barhi Industrial", "Baroda", "Barwala",
    "Barwala (Hisar)", "Barwala Hisar", "Bass", "Bass Hansi", "Bassan", "Bata",
    "Baund Kalan", "Bawal", "Bawal IMT", "Bawal IMT Industrial", "Bawal Industrial", "Bawani Khera",
    "Behal", "Beri", "Beri Jhajjar", "Beri Jhajjar Bhimeshwari", "Beri Town", "Bhadas",
    "Bhadas Mewat", "Bhagwanpur (HR)", "Bhagwi", "Bhalaut", "Bhalaut Rohtak", "Bhattu Kalan",
    "Bheni Chanderpal", "Bhirrana", "Bhirrana Ancient Site", "Bhirrana Fatehabad", "Bhiwani", "Bhiwani Khera",
    "Bhondsi", "Bhudana", "Bhuna", "Bhurkalan", "Bilaspur (HR)", "Bilaspur Gurgaon",
    "Bilaspur Yamunanagar", "Bir Ghaggar", "Bir Sikargah", "Chandi Mandir", "Charkhi", "Charkhi Dadri",
    "Charkhi Dadri Rural", "Cheeka", "Chhachhrauli", "Chhachhrauli Rural", "Chhapar", "Chhara",
    "Chhara Jhajjar", "Chhuchhakwas", "Dabra", "Dabra Hisar", "Dabwali", "Dabwali Mandi",
    "Dabwali Mandi Border", "Dahina", "Dahina Jatusana", "Dhand", "Dharuhera", "Dharuhera Industrial Hub",
    "Dhatir", "Dighal", "Ding", "Ding Sirsa", "Dubaldhan", "Ellenabad",
    "Farakhpur", "Faridabad", "Faridabad Ballabhgarh", "Faridabad NIT", "Faridabad Old", "Faridabad Sector 15",
    "Farrukhnagar", "Farrukhnagar Gurgaon", "Farrukhnagar Rural", "Farrukhnagar Sultanpur Link", "Fatehabad", "Ferozepur Jhirka",
    "Gajuwala", "Ganaur", "Ganaur GT Road", "Ganaur Mandi", "Ganaur Rural", "Garhi Sampla",
    "Gharaunda", "Gharaunda Highway", "Gharaunda Mandi", "Ghirai", "Ghirau", "Gohana",
    "Gohana City", "Gohana Rural", "Gohana Subcity", "Guhla", "Guhla Cheeka", "Gurugram",
    "Gurugram Badshahpur", "Gurugram Cyber City", "Gurugram DLF Phase 1", "Gurugram DLF Phase 5", "Gurugram Golf Course Ext", "Gurugram Golf Course Road",
    "Gurugram IMT Manesar", "Gurugram MG Road", "Gurugram Palam Vihar", "Gurugram Sector 14", "Gurugram Sector 29", "Gurugram Sector 48",
    "Gurugram Sector 56", "Gurugram Sohna Road", "Haily Mandi", "Hansi", "Hansi Rural", "Hasanpur",
    "Hasanpur Mewat", "Hathin", "Hathin Palwal", "Hathin Rural", "Hisar", "Hisar Cantt",
    "Hisar Textile Hub", "Hodal", "Hodal Mandi Border", "Hodal Rural", "Indri", "Indri Karnal",
    "Indri Rural", "Indri Subcity", "Indus Industrial Corridor", "Ismailabad", "Ismailabad Kurukshetra", "Israna",
    "Israna Textile Hub", "Jabalpur Link", "Jagadhri", "Jakhal", "Jakhal Mandi", "Jakhod Khera",
    "Jansui", "Jatusana", "Jatusana Rewari", "Jhajjar", "Jhajjar Road", "Jhansa",
    "Jind", "Jind Cantt", "Julana", "Julana Jind", "Jundla", "Kaithal",
    "Kalanaur", "Kalanaur Rohtak", "Kalanwali", "Kalanwali Mandi", "Kalayat", "Kalka",
    "Kalka Cantt", "Kalka Pinjore", "Kanina", "Kanina Mandi", "Kanina Mohindergarh", "Karnal",
    "Karnal Smart City", "Kathura", "Kharak Kalan", "Kharkhoda", "Kharkhoda IMT", "Kharkhoda IMT Maruti Zone",
    "Khol", "Khol Rewari", "Kosli", "Kosli Rewari", "Kosli Rural", "Kundli",
    "Kundli IMT Industrial", "Kundli Industrial", "Kundli Industrial Area", "Kurukshetra", "Kurukshetra University Area", "Ladwa",
    "Ladwa Kurukshetra", "Ladwa Rural", "Lakhan Majra", "Loharu", "Loharu Bhiwani Fort", "Loharu Fort Town",
    "Loharu Subcity", "Machhrauli", "Madhuban", "Madhuban Police Academy", "Madina", "Madina Rohtak",
    "Madlauda", "Maham", "Maham Rohtak", "Mahendragarh", "Mandi Dabwali", "Manesar",
    "Manesar Industrial", "Manesar Industrial IMT", "Manesar Maruti Hub", "Mangali", "Matanhail", "Matanhail Jhajjar",
    "Mattanhail", "Mayyer", "Meham", "Mirchpur", "Mullana", "Mullana University Area",
    "Mundlana", "Murthal", "Mustafabad", "Mustafabad Yamunanagar", "Naggal", "Naggal Ambala",
    "Nagina", "Nangal Chaudhry", "Naraingarh", "Naraingarh Ambala", "Narnaul", "Narnaund",
    "Narwana", "Nigdu", "Nilokheri", "Nilokheri Karnal", "Nissing", "Nissing Karnal",
    "Nuh", "Nuh Mewat", "Odhan", "Odhan Sirsa", "Palwal", "Palwal Bypass",
    "Panchkula", "Panchkula MDC", "Panchkula Sector 5", "Panipat", "Panipat Textile Hub", "Pataudi",
    "Pataudi Gurgaon", "Pataudi Palace Area", "Pehowa", "Pehowa Teerth", "Pillukhera", "Pillukhera Jind",
    "Pingwan", "Pinjore", "Pinjore Garden", "Pinjore Gardens", "Pinjore Kalka Gardens", "Prithla",
    "Prithla Industrial Hub", "Prithla Palwal", "Pundri", "Punhana", "Punhana Mewat", "Radaur",
    "Radaur Yamunanagar", "Rai", "Raipur Rani", "Raipur Rani Panchkula", "Rajound", "Rampura",
    "Rania", "Rania Sirsa", "Ratia", "Ratia Fatehabad", "Raya", "Rewari",
    "Rewari Brass Market", "Rohtak", "Rohtak PGI Hub", "Rojka Meo", "Sadhaura", "Sadhaura Yamunanagar",
    "Safidon", "Saha", "Saha Ambala", "Salhawas", "Salwan", "Samalkha",
    "Samalkha Panipat", "Sampla", "Sampla Rohtak", "Sandhai", "Sanoli", "Sarsod",
    "Satnali", "Satnali Mohindergarh", "Sehlang", "Shahabad Markanda", "Shahbad", "Shahbad Dairy",
    "Shahbad Markanda", "Sikanderpur", "Siwan", "Siwani", "Siwani Bhiwani", "Siwani Mandi",
    "Siwani Mandi Bhiwani", "Sohna", "Sohna Badshahpur Expressway", "Sohna Damdama Lake", "Sohna Road Badshahpur", "Sohna Rural",
    "Sonipat", "Sonipat DCRUST", "Taoru", "Taoru Mewat", "Taoru Nuh Corridor", "Taraori",
    "Taraori Karnal Battleground", "Taraori Rice Hub", "Tatarpur", "Tauru", "Tigaon", "Tigaon Faridabad",
    "Tohana", "Tohana Mandi", "Tosham", "Tosham Bhiwani Hills", "Tosham Hills", "Uchana",
    "Uchana Jind", "Uchana Jind Mandi", "Uchana Kalan", "Ugrakheri", "Uklana", "Uklana Mandi",
    "Uklana Mandi Hisar", "Uklanamandi", "Uncha Majra", "Unchagaon", "Unchagaon Faridabad", "Yamunanagar",
    "Yamunanagar Jagadhri Twin City", "Zirakpur Border", "Zirakpur Panchkula Border"
  ],
  "Himachal Pradesh": [
    "Amb", "Amb Una", "Amb Una Railway Hub", "Andretta", "Anni", "Anni Kullu Valley",
    "Arki", "Arki Fort Area", "Arki Historic Fort", "Baddi", "Baddi Barotiwala Industrial", "Baddi Industrial",
    "Baddi Industrial Hub", "Baghi", "Baijnath", "Baijnath (HP)", "Baijnath Mandir Kangra", "Bajoura",
    "Bakloh", "Banjar", "Banjar Tirthan Gateway", "Barmana", "Barmana Cement Works", "Barog",
    "Barog Railway Tunnel", "Barog Tunnel Area", "Barot", "Barot Valley", "Barot Valley Hydel", "Bathri",
    "Bharmour Tribal Chamba", "Bharmour Tribal Hub", "Bhuntar", "Bhuntar Valley Airport", "Bhunter Airport", "Bijli Mahadev Base",
    "Bilaspur (HP)", "Bilaspur Sadar", "Bilaspur Sadar Gobind Sagar", "Bir", "Bir Billing (Paragliding Hub)", "Chail",
    "Chail Palace Area", "Chail Wildlife Sanctuary", "Chamba", "Chamba Heritage Town", "Chamba Town", "Chaupal",
    "Chaupal Apple Belt", "Chindi", "Chintpurni", "Chirgaon", "Chitkul", "Chopal",
    "Chowari", "Chowari Chamba", "Churah Valley", "Dadahu", "Dadahu Renuka", "Dagshai",
    "Dagshai Cantonment", "Dalhousie", "Dalhousie Cantonment", "Dalhousie Khajjiar Road", "Darlaghat", "Daulatpur",
    "Dehra Gopipur", "Dehra Gopipur Kangra", "Dharamkot", "Dharampur", "Dharampur (Solan)", "Dharamshala",
    "Dharamshala Cricket Stadium", "Dhaula Kuan (HP)", "Dhaula Kuan Sirmour", "Doon Valley", "Gagal Airport", "Gagret",
    "Gagret Industrial Una", "Gagret Una", "Ghumarwin", "Ghumarwin Bilaspur", "Gohar", "Hamirpur (HP)",
    "Haripurdhar", "Haripurdhar Sirmour", "Haroli", "Indora", "Indora Kangra", "Jaisinghpur",
    "Jaisinghpur Kangra", "Janjehli", "Janjehli Scenic Valley", "Janjehli Valley", "Jawala Mukhi", "Jawalamukhi",
    "Jawalamukhi Shaktipeeth", "Jawali", "Jawali Kangra", "Jeevan Nagar", "Jibhi", "Joginder Nagar",
    "Jogindernagar", "Jogindernagar Valley", "Jubbal", "Kalpa", "Kalpa Kinnaur Kinner Kailash", "Kamru",
    "Kandaghat", "Kandaghat Solan", "Kangra", "Kangra Brajeshwari Temple", "Kangra Fort Area", "Kangra Temple",
    "Karsog", "Kasauli", "Kasauli Mall", "Kasauli Mall Road", "Kasauli Mall Road Heritage", "Kasol",
    "Kaza", "Kaza Spiti", "Kaza Spiti Valley Monasteries", "Keylong", "Keylong Lahaul", "Keylong Lahaul Valley",
    "Khajjiar", "Kotgarh Apple Belt", "Kotgarh Apple Orchards", "Kotkhai", "Kotkhai Apple Belt", "Kotla",
    "Kotla Kangra", "Kufri", "Kufri Fun World", "Kullu", "Kullu Valley", "Kumarhatti",
    "Kumarsain", "Kumarsain Shimla", "Kupvi", "Lad Bharol", "Ladbharol", "Ladbharol Mandi",
    "Larji", "Manali", "Manali Mall Road", "Manali Old", "Manali Old Town", "Manali Solang Valley",
    "Mandi", "Manikaran Sahib", "Manikaran Sahib Gurudwara", "Mashobra", "Mashobra Green", "Mashobra Pine Forest",
    "McLeod Ganj", "Mehatpur", "Mehatpur (HP)", "Mehatpur Industrial", "Mehatpur Industrial Una", "Moorang",
    "Nadaun", "Nadaun Hamirpur Beas", "Naggar", "Naggar Castle", "Naggar Castle Heritage", "Nahan",
    "Nahan Sirmour Heritage", "Naina Devi", "Naina Devi (HP)", "Naina Devi Temple Shivalik", "Nalagarh", "Nalagarh Fort",
    "Nalagarh Fort Area", "Narkanda", "Narkanda Hatu Peak", "Narkanda Peak", "Nirmand", "Nurpur",
    "Nurpur Fort", "Nurpur Kangra Fort", "Palampur", "Palampur Tea Gardens", "Paonta Sahib", "Paonta Sahib Gurudwara",
    "Parashar Lake", "Parashar Lake Holy Shrine", "Parwanoo", "Parwanoo Timber Trail", "Parwanoo Timber Trail Cableway", "Pooh",
    "Pragpur", "Pragpur Heritage Village", "Rakchham", "Rakchham Baspa Valley", "Rampur Bushahr", "Rampur Bushahr Palace",
    "Rampur Bushahr Royal Palace", "Rawalsar", "Reckong Peo", "Recong Peo", "Recong Peo Kinnaur HQ", "Rewalsar",
    "Rewalsar Holy Lake", "Rewalsar Sacred Lake", "Rewalsar Sacred Lotus Lake", "Rohru", "Rohru Pabbar Trout Valley", "Rohru Pabbar Valley",
    "Salooni", "Sangla Kinnaur", "Sangla Valley", "Sangla Valley Apple Belt", "Sangrah", "Sansarpur Terrace",
    "Sarahan", "Sarahan Bhimakali", "Sarahan Bhimakali Temple", "Sarkaghat", "Sarkaghat Mandi", "Seoni (HP)",
    "Shahpur", "Shahpur (HP)", "Shillai", "Shimla", "Shimla Annandale", "Shimla Chotta Shimla",
    "Shimla Jakhoo Temple", "Shimla Kalka Heritage", "Shimla Mall Road", "Shimla Ridge", "Shimla Sanjauli", "Shoghi",
    "Shoghi Pine Ridge", "Shoghi Solan", "Shoja", "Solan", "Solan Brewery", "Solang",
    "Spiti Valley", "Sundernagar", "Sundernagar Canal", "Sundernagar Canal Promenade", "Suni", "Tabo",
    "Tabo Monastery", "Tattapani", "Tattapani Hot Springs", "Thanedar Apple Cradle", "Thanedar Orchards", "Theog",
    "Theog Apple Mart", "Tirthan River Eco Valley", "Tirthan Valley", "Tirthan Valley River", "Tissa", "Trilokpur",
    "Trilokpur Mahamaya Mandir", "Udaipur (Lahaul)", "Udaipur Lahaul Trilokinath", "Udaipur Pattan Valley", "Uhl Valley", "Una",
    "Vashisht", "Vashisht Hot Water Springs"
  ],
  "Jammu & Kashmir": [
    "Achabal", "Achabal Mughal Garden", "Achabal Mughal Gardens", "Aharbal Falls", "Aharbal Waterfall", "Aharbal Waterfall Kulgam",
    "Ajas Bandipora", "Akhnoor", "Akhnoor Chenab Bank", "Akhnoor Chenab Fort", "Akhnoor Fort", "Amarnath Baltal Base Camp",
    "Amarnath Baltal Camp", "Amarnath Base Baltal", "Amarnath Base Pahalgam", "Amarnath Chandanwari Base", "Amarnath Holy Cave", "Amarnath Pahalgam Nunwan Base",
    "Anantnag", "Anantnag City", "Aripal", "Aripal Tral", "Arnia", "Arnia International Border",
    "Aru Valley", "Aru Valley Pahalgam", "Awantipora", "Awantipora Ruins", "Awantipora Sun Temple Ruins", "Badgam",
    "Badgam (Budgam)", "Badgam Charar", "Badgam Charar-e-Sharief", "Bahu Fort Jammu", "Baisaran Valley", "Bandipora",
    "Bandipora Wular", "Bandipora Wular Hub", "Bandipora Wular Lake View", "Banihal", "Banihal Pass", "Banihal Qazigund Tunnel",
    "Baramulla", "Baramulla Jhelum Bank", "Baramulla Jhelum Riverfront", "Baramulla Riverside", "Basantgarh", "Basantgarh Udhampur",
    "Basholi", "Basholi Art Heritage", "Basohli", "Basohli Miniature Painting Hub", "Basohli Paintings Hub", "Batote",
    "Batote Highway", "Batote Highway Conifer Hub", "Batote NH44", "Beerwah", "Beerwah Budgam", "Betaab Valley",
    "Betaab Valley Pahalgam", "Bhaderwah", "Bhaderwah Mini Kashmir", "Bhaderwah Mini Kashmir Valley", "Bhaderwah Valley", "Bijbehara",
    "Billawar", "Billawar Ancient Temple", "Bishna", "Bishnah", "Chadoora", "Chadoora Budgam",
    "Chandanwari", "Chandanwari Glacier", "Charar-i-Sharief", "Charar-i-Sharief Shrine", "Chari Sharief", "Chatpal Valley",
    "Chenani", "Chenani Nashri Tunnel", "Chenani Nashri Tunnel Portal", "Chenani-Nashri Tunnel", "Chuchot", "Dalgate (Srinagar)",
    "Dalgate Srinagar", "Devsar", "Devsar Kulgam", "Dinga Amb", "Doda", "Doda Chenab Gorge",
    "Doda City", "Doda Riverside", "Doodhpathri", "Doodhpathri Lush Meadow", "Doodhpathri Meadow", "Dras",
    "Dras Kargil War Memorial", "Dudu", "Dudu Basantgarh", "Ganderbal", "Ganderbal Manasbal Lake", "Ganderbal Sindh River",
    "Ghagwal", "Ghagwal Samba", "Gool", "Gool Gulabgarh", "Gulmarg", "Gulmarg Apharwat Peak",
    "Gulmarg Gondola Base", "Gulmarg Gondola Base Station", "Gulmarg Gondola Hub", "Gurez Valley", "Gurez Valley Dawar", "Gurez Valley Dawar Border",
    "Handwara", "Handwara Kupwara", "Harwan Garden", "Hiranagar", "Hiranagar Border", "Hiranagar Kathua",
    "Jammu", "Jammu Airport", "Jammu City", "Jammu Raghunath Temple", "Jammu Tawi Station", "Jourian",
    "Jourian Akhnoor", "Kangan", "Kangan Sindh River", "Kangan Sindh River Valley", "Kangan Sonamarg Route", "Kargil",
    "Kargil Suru Valley", "Karnah", "Karnah Kupwara Border", "Kathua", "Kathua Industrial Hub", "Katra (Vaishno Devi)",
    "Katra Banganga", "Katra Vaishno Devi Base", "Khansahib", "Khansahib Budgam", "Khour", "Khour Border",
    "Khrew", "Khrew Pulwama", "Kishtwar", "Kishtwar Chowgan", "Kishtwar Saffron Hub", "Kishtwar Saffron Plateaus",
    "Kokernag", "Kokernag Botanical Garden", "Kokernag Rose Gardens", "Kokernag Springs", "Kud", "Kud Patnitop",
    "Kulgam", "Kulgam Apple Belt", "Kupwara", "Kupwara Border Hub", "Kupwara Lolab Gateway", "Ladakh Khardung La",
    "Ladakh Leh Town", "Ladakh Nubra Valley", "Ladakh Pangong Tso", "Lakhanpur", "Lakhanpur Gateway to JK", "Langate",
    "Langate Kupwara", "Latti", "Leh", "Leh Main Market", "Leh Pangong Lake", "Leh Shanti Stupa",
    "Lolab Valley", "Lolab Valley Kupwara", "Lolab Valley Sogam", "Lolab Valley Sogam Meadow", "Magam", "Magam Tangmarg Link",
    "Magam Tangmarg Route", "Mahanpur", "Mahanpur Kathua", "Majalta", "Majalta Udhampur", "Manasbal Lake",
    "Mansar Lake Jammu", "Marheen", "Mata Vaishno Devi Holy Shrine", "Mata Vaishno Devi Shrine", "Mendhar", "Mendhar Poonch Border",
    "Moungri", "Moungri Udhampur", "Nagrota", "Nagrota Jammu Army Hub", "Nigeen Lake Area", "Nigeen Lake Srinagar",
    "Nobra (Nubra Valley)", "Nowshera", "Nowshera Rajouri", "Nowshera Rajouri Border", "Pahalgam", "Pahalgam Club",
    "Pahalgam Valley of Shepherds", "Pampore", "Pampore Saffron Capital", "Pampore Saffron Fields", "Pampore Saffron Town", "Panchari",
    "Panchari Hills Udhampur", "Pangong Tso", "Patnitop", "Patnitop Circular", "Patnitop Circular Meadow Walk", "Patnitop Circular Road",
    "Patnitop Hill Station", "Pattan", "Pattan Baramulla", "Pattan Historic Monoliths", "Peer Ki Gali Mughal Road", "Poonch",
    "Poonch Border", "Poonch Historic Fort", "Poonch Historic Haveli", "Pulwama", "Pulwama City", "Pulwama Highway Industrial",
    "Pulwama Saffron Hub", "Qaimoh", "Qaimoh Kulgam", "Qazigund", "Qazigund Banihal Tunnel Gateway", "Qazigund Gate of Kashmir",
    "Qazigund Gateway", "R.S. Pura Indo-Pak Border", "Rajouri", "Rajouri Border City", "Rajouri Dhanidhar Fort", "Ramban",
    "Ramban Chenab Bridge", "Ramban Chenab Highway", "Ramban Highway Hub", "Ramgarh (JK)", "Ramnagar (J&K)", "Ramnagar (JK)",
    "Ramnagar Udhampur", "Ramnagar Udhampur Fort", "Ranbir Singh Pora (R.S. Pura)", "Reasi", "Reasi Bhimgarh Fort", "Reasi Chenab Bridge",
    "Reasi Chenab Rail Bridge Base", "Reasi Chenab Rail Bridge Hub", "Reasi Chenab Railway Bridge", "RS Pura", "RS Pura Suchetgarh Border", "Samba",
    "Samba Border Town", "Samba Historic Fort", "Sanasar", "Sanasar High Altitude Lake", "Sanasar Lake", "Sanasar Lake & Paragliding",
    "Sanat Nagar", "Shankaracharya Hill", "Shankaracharya Hill Srinagar", "Shiv Khori Cave Ransoo", "Shopian", "Shopian Apple Bowl",
    "Shopian Apple Heartland", "Sonamarg", "Sonamarg Glacier Base", "Sonamarg Meadow of Gold", "Sonamarg Thajiwas Glacier", "Sopore",
    "Sopore Apple Mandi", "Sopore Apple Town", "Srinagar", "Srinagar Boulevard Road", "Srinagar Dal Lake", "Srinagar Dal Lake Shikara Hub",
    "Srinagar Lal Chowk", "Srinagar Nishat Bagh", "Srinagar Pari Mahal", "Srinagar Shalimar Bagh", "Sudh Mahadev", "Sudh Mahadev Temple",
    "Sukrala Mata Billawar", "Sumbal", "Sumbal Sonawari", "Sunderbani", "Sunderbani Rajouri", "Surankote",
    "Surankote Peer Ki Gali Base", "Surinsar Lake Jammu", "Tangdar", "Tangdar Karnah Valley", "Tangmarg", "Tangmarg Gulmarg Base",
    "Tangmarg Gulmarg Gateway", "Thannamandi", "Thannamandi Rajouri", "Tral", "Tral Forest", "Tral Pulwama Valley",
    "Tral Town", "Tsrar-e-Sharief", "Tulian Lake Pahalgam", "Udhampur", "Udhampur Northern Command", "Uri",
    "Uri Border Town", "Uri Jhelum Border Corridor", "Vaishno Devi Ardhkuwari", "Vaishno Devi Bhawan", "Vaishno Devi Sanjichhat", "Verinag",
    "Verinag Jhelum Spring", "Verinag Mughal Spring Source", "Verinag Source of Jhelum", "Vijaypur", "Vijaypur AIIMS Corridor", "Vijaypur AIIMS Hub",
    "Warwan", "Warwan High Valley", "Wular Lake Area", "Wular Lake Bandipora", "Yusmarg", "Yusmarg Alpine Pine Meadow",
    "Yusmarg Meadow", "Zanskar", "Zanskar Valley Padum"
  ],
  "Madhya Pradesh": [
    "Agar", "Agar Malwa", "Agar Malwa Temple Town", "Ajaigarh", "Alirajpur", "Alirajpur Tribal Hub",
    "Amanganj", "Amarkantak", "Amarkantak Narmada Source", "Amarkantak Narmada Udgam", "Amarpatan", "Amarpatan Satna",
    "Ambah", "Ambah Morena", "Amla", "Anjad", "Anjad Barwani", "Anuppur",
    "Anuppur Thermal Hub", "Aron", "Ashoknagar", "Ashoknagar Grain Hub", "Ashta", "Ashta Sehore",
    "Asirgarh Fort", "Babai", "Babai Makhan Nagar", "Badnagar", "Badnagar Ujjain", "Badnawar",
    "Badnawar Dhar", "Badnawar Malwa", "Badwani", "Bagli", "Bagli Dewas", "Baihar",
    "Baihar Balaghat", "Bajna Ratlam", "Bakshwaho", "Bakswaha", "Bakswaha Chhatarpur", "Balaghat",
    "Balaghat City", "Baldeogarh", "Bamore", "Bamore Industrial Morena", "Bandhavgarh", "Bandhavgarh Tala Hub",
    "Bandhavgarh Tiger Gate", "Bandhavgarh Tiger Gate Tala", "Barela", "Barghat", "Barghat Seoni", "Bargi Dam",
    "Bargi Dam Jabalpur", "Bargi Dam Narmada Cruise", "Barhi", "Barwaha", "Barwaha Narmada Ghat", "Barwani",
    "Barwani City", "Basoda", "Batiyagarh Damoh", "Bawankaja Barwani", "Bawankaja Jain Teerth 84ft", "Begamganj",
    "Begamganj Raisen", "Beohari", "Berasia", "Berasia Bhopal", "Betul", "Betul Ganj",
    "Bhabhra", "Bhaderwah (MP)", "Bhander", "Bhanpura", "Bhedaghat Dhuandhar", "Bhedaghat Marble Rocks Dhuandhar",
    "Bhikangaon", "Bhikangaon Nimar", "Bhimbetka Caves", "Bhimbetka Rock Art UNESCO", "Bhind", "Bhind Mandi",
    "Bhitwarwar", "Bhopal", "Bhopal Airport", "Bhopal BHEL", "Bhopal Kolar Road", "Bhopal MP Nagar",
    "Bhopal Shahpura", "Bhopal Upper Lake", "Biaora", "Biaora Rajgarh", "Bijawar", "Bina",
    "Bina Oil Refinery Hub", "Birsinghpur", "Birsinghpur Pali", "Burhanpur", "Burhanpur Asirgarh Fort", "Burhanpur Historic",
    "Burhanpur Historic Hub", "Chanderi", "Chanderi Handloom City", "Chanderi Handloom Hub", "Chanderi Handloom Saree Hub", "Chhatarpur",
    "Chhatarpur Khajuraho Hub", "Chhatarpur Rural", "Chhindwara", "Chhindwara City", "Chitrakoot (MP Border)", "Chitrakoot Ghats (MP)",
    "Dabra", "Dabra Gwalior", "Dabra Sugar Mill Gwalior", "Damoh", "Damoh City", "Damoh Rural",
    "Datia", "Datia Peeth", "Deori (Sagar)", "Deori Sagar", "Depalpur", "Depalpur Indore",
    "Dewas", "Dewas Chamunda Tekri", "Dhamnod", "Dhar", "Dhar Bhojshala", "Dindori",
    "Dindori Baiga Tribal", "Gadarwara", "Ganj Basoda", "Ganj Basoda Vidisha", "Garhakota", "Garoth",
    "Garoth Mandsaur", "Gautampura", "Ghansor", "Ghatigaon Gwalior", "Ghatiya", "Ghatiya Ujjain",
    "Gohad", "Gohad Historic Fort", "Gotegaon", "Gotegaon Narsinghpur", "Guna", "Guna Cantt",
    "Gwalior", "Gwalior Cantt", "Gwalior Fort", "Gwalior Morar", "Hanuwantiya Islands", "Hanuwantiya Tapu Water Sports",
    "Harda", "Harda Agricultural Mandi", "Harda Mandi", "Harpalpur", "Hatta", "Hatta Damoh",
    "Hindoria", "Hindoria Damoh", "Hoshangabad", "Hoshangabad Narmada Ghats", "Hoshangabad Narmadapuram", "Hoshangabad Rural",
    "Ichhawar", "Ichhawar Sehore", "Indore", "Indore AB Road", "Indore Airport", "Indore Bypass Hub",
    "Indore Palasia", "Indore Rajwada", "Indore Vijay Nagar", "Isagarh", "Itarsi", "Itarsi Railway Hub",
    "Itarsi Railway Junction Hub", "Jabalpur", "Jabalpur Bhedaghat", "Jabalpur Bhedaghat Link", "Jabalpur Cantt", "Jabalpur Civil Lines",
    "Jabalpur Dhuandhar", "Jaisinghnagar", "Jaora", "Jaora Sugar City", "Jaora Sugar Mills Ratlam", "Jatara",
    "Jatara Tikamgarh", "Jawad", "Jawad Neemuch", "Jhabua", "Jhabua Tribal Heartland", "Jhabua Tribal Hub",
    "Jobat", "Jobat Alirajpur", "Kailaras", "Kalapipal", "Kanha Kisli Gate", "Kanha National Park",
    "Kannod", "Kannod Dewas", "Kareli", "Kareli Sugar Belt Narsinghpur", "Karera", "Karera Bird Sanctuary",
    "Kasrawad", "Kasrawad Nimari Hub", "Katangi", "Katangi Balaghat", "Katni", "Katni City",
    "Khachrod", "Khachrod Ujjain", "Khajuraho", "Khajuraho Western Temples", "Khandwa", "Khargone",
    "Khargone Nimad", "Khargone Nimar Cotton Hub", "Khategaon", "Khilchipur", "Khilchipur Rajgarh", "Khirkiya",
    "Khirkiya Harda", "Khurai", "Kolaras", "Korba Link", "Kotma", "Kukshi",
    "Kukshi Dhar Nimar", "Kukshi Nimar", "Kurwai", "Kurwai Betwa River Vidisha", "Lahar", "Lahar Bhind",
    "Lakhnadon", "Lakhnadon Seoni", "Lateri", "Laundi", "Maheshwar Ahilya Fort", "Maheshwar Ahilya Fort Ghats",
    "Maihar", "Maihar Maa Sharda Devi Temple", "Maihar Sharda Devi", "Malhargarh", "Manasa", "Manawar",
    "Manawar Dhar", "Mandideep", "Mandideep Industrial Corridor", "Mandideep Industrial Hub", "Mandla", "Mandla City",
    "Mandleshwar", "Mandsaur", "Mandu", "Mandu Historic Fort", "Mandu Jahaz Mahal", "Mandu Jahaz Mahal Heritage",
    "Mangawan", "Mauganj", "Mauganj New District HQ", "Mehgaon", "Mehgaon Bhind", "Mhow",
    "Mhow Army Cantt", "Mhow Cantonment", "Mhow Dr Ambedkar Nagar", "Morena", "Morena Chambal Hub", "Multai",
    "Multai Tapti Udgam", "Mungaoli", "Nagda", "Nagda Birlas Grasim Hub", "Nagda Industrial", "Nagda Industrial City",
    "Nagod", "Nainpur", "Narsinghgarh", "Narsinghgarh Peacock Sanctuary", "Narsinghpur", "Narsinghpur City",
    "Narsinghpur Rural", "Narwar", "Narwar Fort", "Nasrullaganj", "Nasrullaganj Sehore", "Nateran",
    "Neemuch", "Neemuch Cantt", "Neemuch Mandi", "Niwari", "Niwari (MP)", "Niwari Orchha Border",
    "Nowgong", "Nowgong Chhatarpur", "Obaidullaganj", "Obaidullaganj Sanchi Corridor", "Omkareshwar", "Omkareshwar Jyotirlinga",
    "Omkareshwar Jyotirlinga Island", "Orchha", "Orchha Ram Raja Temple", "Orchha Ram Raja Temple Heritage", "Pachmarhi", "Pachmarhi Hill Station",
    "Pachmarhi Queen of Satpura", "Palera", "Panagar", "Pandhana", "Pandhurna", "Pandhurna Orange Hub",
    "Panna", "Panna Diamond City", "Panna Diamond Hub", "Parasia", "Parasia Coal Hub", "Pasan",
    "Patan (MP)", "Patan Jabalpur", "Patur", "Pawai", "Pench National Park", "Pench National Park Turia Gate",
    "Pench Turia Gate", "Petlawad", "Pichhore", "Pichhore Shivpuri", "Pipariya", "Pipariya (Hoshangabad)",
    "Pipariya Pachmarhi Gate", "Pipariya Pachmarhi Railhead", "Piro", "Pithampur", "Pithampur Auto Cluster", "Pithampur Auto Manufacturing SEZ",
    "Pithampur Industrial", "Porsa", "Porsa Morena", "Prithvipur", "Raghogarh", "Raghogarh Guna",
    "Raghogarh Guna Fort", "Rahatgarh", "Rahatgarh Falls", "Rahatgarh Waterfall Sagar", "Raisen", "Raisen Fort",
    "Raisen Rural", "Rajgarh", "Rajgarh (Biaora)", "Rajgarh Biaora", "Rajnagar", "Rajpur",
    "Rajpur Barwani", "Rampura (MP)", "Ranapur", "Ratlam", "Ratlam Namkeen City", "Rau Indore",
    "Rehli", "Rehti", "Rewa", "Rewa White Tiger Hub", "Sabalgarh", "Sagar",
    "Sagar Smart City", "Sailana", "Sanawad", "Sanawad Narmada", "Sanchi", "Sanchi Stupa Complex",
    "Sanchi Stupa World Heritage", "Sanchi World Heritage Stupas", "Sanwer", "Sanwer Indore", "Sarangpur", "Sarni",
    "Sarni Satpura Thermal", "Satna", "Satna City", "Sausar", "Sehore", "Sehore City",
    "Sendhwa", "Sendhwa Agra-Mumbai Highway Border", "Sendhwa Border", "Seonde", "Seoni", "Seoni City",
    "Seoni Malwa", "Seoni Malwa Hoshangabad", "Shahdol", "Shahdol City", "Shahgarh", "Shahpura (Dindori)",
    "Shahpura (Jabalpur)", "Shajapur", "Shajapur City", "Shamshabad", "Shamshabad (MP)", "Shamshabad Vidisha",
    "Sheopur", "Sheopur Kuno Cheetah Sanctuary", "Sheopur Kuno National Park", "Shivpuri", "Shivpuri Madhav National Park", "Shivpuri National Park",
    "Shujalpur", "Shujalpur Shajapur", "Sidhi", "Sidhi City", "Sihora", "Sihora Jabalpur",
    "Sihora Mineral Belt Jabalpur", "Silwani", "Singrauli", "Singrauli Energy Hub", "Sirmaur", "Sironj",
    "Sironj Vidisha", "Sitamau", "Sohagpur", "Sohagpur Satpura Gateway", "Sontalai", "Susner",
    "Susner Cow Sanctuary", "Tarana", "Tarana Ujjain", "Tekanpur", "Tekanpur BSF Academy", "Tendukheda",
    "Tendukheda Narsinghpur", "Thandla", "Thandla Jhabua", "Tikamgarh", "Tikamgarh City", "Timarni",
    "Timarni Harda", "Tirodi", "Udaipura", "Ujjain", "Ujjain Mahakal Corridor", "Ujjain Mahakal Corridor Teerth",
    "Ujjain Mahakal Jyotirlinga", "Ujjain Mahakaleshwar", "Ujjain Ramghat", "Umaria", "Umaria Bandhavgarh Gateway", "Unchehara",
    "Vidisha", "Vidisha Historic Town", "Vijaypur", "Vijaypur Sheopur", "Waraseoni"
  ],
  "Maharashtra": [
    "Achalpur", "Achara Beach", "Achara Beach Sindhudurg", "Ahiwantwadi", "Ahiwantwadi Nashik", "Ahmednagar",
    "Ajanta Caves Gateway", "Ajanta Caves Gateway Fardapur", "Akola", "Akole", "Akole Kalsubai Base", "Alandi Sant Dnyaneshwar",
    "Alandi Sant Dnyaneshwar Samadhi", "Alibaug", "Alibaug Beach", "Allapalli", "Allapalli Teak Forest Gadchiroli", "Amalner",
    "Ambad", "Ambad Jalna", "Ambajogai", "Ambajogai Yogeshwari Temple", "Amboli Hill Station", "Amboli Hill Station Waterfall",
    "Amravati", "Anjangaon", "Anjangaon Surji Amravati", "Anjanvel", "Arvi", "Arvi Wardha",
    "Arvi Wardha Cotton Belt", "Ashti", "Ashti Beed", "Aurangabad (Chhatrapati Sambhajinagar)", "Ausa", "Ausa Historic Fort Latur",
    "Babhulgaon", "Babhulgaon Yavatmal", "Badlapur", "Ballarpur", "Baramati", "Barshi",
    "Barshitakli", "Barshitakli Akola", "Beed", "Bhadravati", "Bhadravati Chandrapur", "Bhandara",
    "Bhandardara Arthur Lake", "Bhandardara Lake", "Bhigwan", "Bhimashankar Jyotirlinga", "Bhimashankar Jyotirlinga Shrine", "Bhiwandi",
    "Bhokardan", "Bhokardan Jalna", "Bhusawal", "Boisar", "Bramhapuri", "Bramhapuri Chandrapur",
    "Buldhana", "Chakan (Pune)", "Chalisgaon", "Chandrapur", "Chandur", "Chandur Railway Amravati",
    "Chikhaldara Coffee Hill Station", "Chikhaldara Hill Station", "Chikhli", "Chikhli Buldhana", "Chiplun", "Chopda",
    "Chopda Tapi Jalgaon", "Dahanu", "Dapoli", "Dapoli Beach", "Dapoli Murud Beach Ratnagiri", "Daund",
    "Deolali", "Deori", "Deori Gondia", "Devgad Alphonso Hub", "Devgad Alphonso Mango Port", "Dhadgaon",
    "Dhadgaon Toranmal Gateway", "Dharangaon", "Dharangaon Jalgaon", "Dhule", "Digras", "Digras Yavatmal",
    "Dombivli", "Ellora Caves Gateway", "Ellora Caves Kailasa Temple", "Erandol", "Erandol Jalgaon", "Gadchiroli",
    "Gangakhed", "Gangakhed Godavari Parbhani", "Ganpatipule Beach Temple", "Ganpatipule Temple Beach", "Georai", "Georai Beed",
    "Ghatanji", "Ghatanji Yavatmal", "Ghoti", "Ghoti Igatpuri Ghats", "Gondia", "Harihareshwar Beach",
    "Harihareshwar Dakshin Kashi Beach", "Hatkanangale", "Hatkanangale Kolhapur", "Himayatnagar", "Himayatnagar Nanded", "Hinganghat",
    "Hingna", "Hingna Industrial Nagpur", "Hingoli", "Ichalkaranji", "Igatpuri", "Jalgaon",
    "Jalna", "Jawhar Hill Station", "Jawhar Palace Hill Station", "Jaysingpur", "Jejuri", "Jintur",
    "Jintur Neminath Digambar Jain", "Kalamb", "Kalamb Yavatmal", "Kalyan", "Kandhar", "Kandhar Water Fort Nanded",
    "Kannad", "Kannad Aurangabad", "Karad", "Karanja", "Karanja Lad Swami Samarth", "Karjat",
    "Karla Bhaja Buddhist Caves", "Karla Caves Lonavala", "Karmala", "Karmala Solapur", "Kashid Beach", "Kashid White Sand Beach",
    "Khamgaon", "Khandala Ghats", "Khandala Ghats Scenic Valley", "Khopoli", "Kinwat", "Kinwat Waterfall Nanded",
    "Kolad Kundalika River Rafting", "Kolad White Water", "Kolhapur", "Kopargaon", "Koregaon", "Koregaon Satara",
    "Korpana", "Korpana Chandrapur", "Kudal", "Kuhi", "Kuhi Nagpur", "Kurkheda",
    "Kurkheda Gadchiroli", "Latur", "Lavasa City", "Lavasa Lake City Dasve", "Loha", "Loha Nanded",
    "Lonavala", "Lonavala Bhushi Dam", "Mahabaleshwar", "Mahabaleshwar Venna Lake", "Mahad", "Mahagaon",
    "Mahagaon Yavatmal", "Majalgaon", "Majalgaon Dam Beed", "Malegaon", "Malkapur", "Malshej Ghat",
    "Malshej Ghat Flamingo Mist", "Manchar", "Mangaon", "Mangrulpir", "Mangrulpir Washim", "Manmad",
    "Manora", "Manora Washim", "Matheran", "Matheran Eco Vehicle Free Hill", "Matheran Toy Train Base", "Mehkar",
    "Mehkar Buldhana", "Mira-Bhayandar", "Miraj", "Mohol", "Mohol Solapur", "Mukhed",
    "Mukhed Nanded", "Mumbai", "Mumbai Airport (BOM)", "Mumbai Andheri", "Mumbai Bandra", "Mumbai BKC Hub",
    "Mumbai Borivali", "Mumbai Chembur", "Mumbai Colaba", "Mumbai Dadar", "Mumbai Ghatkopar", "Mumbai Juhu",
    "Mumbai Lower Parel", "Mumbai Marine Drive", "Mumbai Mulund", "Mumbai Navi Mumbai", "Mumbai Powai", "Mumbai Thane",
    "Mumbai Vashi", "Mumbai Worli", "Murtizapur", "Murtizapur Junction Akola", "Murud", "Murud Janjira Fort",
    "Murud Janjira Sea Fort", "Nagbhid", "Nagbhid Chandrapur", "Nagpur", "Nagpur Airport", "Nagpur Sitabuldi",
    "Nanded", "Nandgaon", "Nandgaon Manmad Nashik", "Nandurbar", "Naneghat", "Narayangaon",
    "Narkhed", "Narkhed Nagpur Orange Hub", "Nashik", "Nashik Panchavati", "Nashik Road", "Nashik Trimbakeshwar",
    "Navi Mumbai Belapur", "Navi Mumbai Kharghar", "Navi Mumbai Nerul", "Navi Mumbai Panvel", "Navi Mumbai Vashi", "Ner",
    "Ner Yavatmal", "Nilanga", "Nilanga Latur", "Osmanabad (Dharashiv)", "Paithan", "Palghar",
    "Palus", "Palus Sangli Vineyards", "Panchgani Table Land", "Panchgani Table Land Plateau", "Pandharpur", "Panhala Fort",
    "Panhala Historic Hill Fort", "Panvel", "Paratwada", "Parbhani", "Pauni", "Pauni Brass City Bhandara",
    "Pen", "Phaltan", "Pimpri-Chinchwad", "Pune", "Pune Airport", "Pune Baner",
    "Pune Camp", "Pune Hadapsar", "Pune Hinjawadi", "Pune Kalyani Nagar", "Pune Kothrud", "Pune Shivaji Nagar",
    "Pune Viman Nagar", "Pune Wakad", "Pusad", "Pusad Yavatmal", "Rahuri", "Raigad",
    "Raigad Capital Fort Gateway", "Raigad Fort Base", "Ralegaon", "Ralegaon Yavatmal", "Ratnagiri", "Ratnagiri Bhagwati Fort Mandvi",
    "Ratnagiri Mandvi Beach", "Risod", "Risod Washim", "Sailu", "Sailu Parbhani", "Sangamner",
    "Sangli", "Sangole", "Sangole Pomegranate Hub", "Satara", "Sawantwadi", "Selu",
    "Selu Parbhani", "Shahada", "Shegaon", "Shevgaon", "Shevgaon Ahmednagar", "Shirala",
    "Shirala Snake Festival Sangli", "Shirdi", "Shirdi Saibaba Temple", "Shirpur", "Shirwal", "Shivneri Fort",
    "Shrigonda", "Shrigonda Ahmednagar", "Shrirampur", "Sillod", "Sillod Aurangabad", "Sindhudurg",
    "Sindkhed Raja", "Sindkhed Raja Jijabai Birthplace", "Sinhagad Fort", "Sinhagad Tanaji Fort Pune", "Sinnar", "Solapur",
    "Tadoba Moharli Gate", "Tadoba Tiger Reserve Moharli Gate", "Talegaon", "Tarapur", "Tarkarli Coral Scuba Beach", "Tarkarli Scuba Hub",
    "Tasgaon", "Tasgaon Sangli Grapes Hub", "Telhara", "Telhara Akola", "Toranmal Hill Station", "Toranmal Satpura Hill Station",
    "Trimbak", "Trimbakeshwar Jyotirlinga", "Trimbakeshwar Shiva Jyotirlinga", "Tuljapur", "Umarkhed", "Umarkhed Yavatmal",
    "Umred", "Umred Karhandla Tiger Gateway", "Uran", "Vaijapur", "Vaijapur Aurangabad", "Vajreshwari Hot Springs",
    "Vajreshwari Hot Springs Shrine", "Varangaon", "Varangaon Ordnance Hub Jalgaon", "Vasai-Virar", "Vita", "Vita Sangli",
    "Wadwani", "Wadwani Beed", "Wai", "Wardha", "Warora", "Warora Baba Amte Anandwan",
    "Washim", "Yavatmal", "Yawal", "Yawal Banana Belt Jalgaon", "Yeola", "Yeola Paithani Silk Capital"
  ],
  "Punjab": [
    "Abohar", "Abohar Cotton City", "Abohar Cotton Hub", "Adampur (PB)", "Adampur (Punjab)", "Adampur Air Force Base",
    "Ahmedgarh", "Ahmedgarh Sangrur", "Ajnala", "Ajnala Shaheedan Gurudwara", "Alawalpur", "Alawalpur Jalandhar",
    "Amloh", "Amloh Fatehgarh Sahib", "Amritsar", "Amritsar Airport (ATQ)", "Amritsar Golden Temple", "Amritsar Golden Temple Harmandir",
    "Amritsar Hall Gate", "Amritsar Ranjit Avenue", "Anandpur Sahib", "Anandpur Sahib Virasat-e-Khalsa", "Attari Border (Wagah)", "Attari Wagah Border",
    "Attari Wagah Border Retreat", "Baba Bakala", "Baba Bakala Ninth Guru Shrine", "Baba Bakala Sahib", "Bagha Purana", "Balachaur",
    "Balachaur SBS Nagar", "Banga", "Banga Shahid Bhagat Singh Museum", "Bareta", "Bareta Mansa", "Barnala",
    "Bassi Pathana", "Batala", "Bathinda Qila Mubarak", "Bathinda Qila Mubarak Razia", "Begowal", "Bhadaur",
    "Bhadaur Barnala", "Bhatinda", "Bhatinda Cantt", "Bhawanigarh", "Bhawanigarh Sangrur", "Bhikhi",
    "Bhikhi Mansa", "Bhikhiwind", "Bhikhiwind Tarn Taran", "Bhiki", "Bholath", "Bholath Kapurthala",
    "Budhlada", "Budhlada Mansa Cotton", "Chamkaur Sahib", "Chamkaur Sahib Garhi Heritage", "Chamkaur Sahib Heritage", "Chandigarh Airport (IXC)",
    "Chandigarh Border", "Chandigarh Sector 17", "Chandigarh Sector 35", "Chandigarh Sector 43 ISBT", "Cheema", "Chogawan",
    "Chogawan Amritsar", "Dasuya", "Dasuya Mahabharat Virat Nagri", "Dera Baba Nanak", "Dera Baba Nanak Kartarpur Corridor", "Dera Bassi",
    "Dera Bassi Mohali Hub", "Dhanaula", "Dhanaula Barnala", "Dharamkot", "Dharamkot Moga", "Dhariwal",
    "Dhariwal Woollen Mills", "Dhilwan", "Dhilwan Kapurthala", "Dhuri", "Dhuri Sugar Mills Sangrur", "Dina Nagar",
    "Dina Nagar Gurdaspur", "Dirba", "Dirba Sangrur", "Doraha", "Doraha Ludhiana", "Fatehgarh Churian",
    "Fatehgarh Sahib", "Fatehgarh Sahib Gurudwara", "Fatehgarh Sahib Gurudwara Fateh", "Fazilka", "Fazilka Border", "Fazilka India-Pak Border",
    "Ferozepur", "Ferozepur Cantt", "Ferozepur Hussainiwala Border", "Firozpur", "Firozpur Cantt Hussainiwala", "Garhdiwala",
    "Garhshankar", "Garhshankar Hoshiarpur", "Ghanaur", "Ghuman", "Ghuman Namdev Mandir Gurdaspur", "Giddarbaha",
    "Gidderbaha", "Gidderbaha Muktsar", "Gobindgarh", "Gobindgarh Steel Capital of India", "Goindwal Sahib", "Goindwal Sahib Baoli",
    "Goindwal Sahib Sacred 84 Baoli", "Gojra", "Goraya", "Goraya Industrial Jalandhar", "Gurdaspur", "Guru Har Sahai",
    "Guru Har Sahai Firozpur", "Hajipur (PB)", "Hariana", "Hariana Hoshiarpur", "Harike Wetland Bird Sanctuary", "Harike Wetland Ramsar Lake",
    "Hathur", "Hoshiarpur", "Hussainiwala National Martyrs Memorial", "Jagraon", "Jagraon Nanaksar Gurudwara", "Jaitu",
    "Jalalabad", "Jalalabad (PB)", "Jalalabad Fazilka", "Jalandhar", "Jalandhar Cantt", "Jalandhar Cantt Military Base",
    "Jalandhar Civil Lines", "Jalandhar Model Town", "Jandiala Guru", "Jandiala Guru Brass Vessel Hub", "Kalanaur (PB)", "Kapurthala",
    "Kapurthala Jagatjit French Palace", "Kapurthala Jagatjit Palace", "Kapurthala Rail Coach Factory", "Kartarpur", "Kartarpur (Punjab)", "Kartarpur Corridor Hub",
    "Kartarpur Corridor Zero Point", "Khadur Sahib", "Khadur Sahib Gurudwara", "Khamanon", "Khamanon Fatehgarh Sahib", "Khanna",
    "Khanna Grain Market", "Khanna Grand Asian Grain Mart", "Kharar", "Khemkaran", "Khemkaran Asal Uttar Tank Battle", "Kiratpur Sahib",
    "Kiratpur Sahib Patalpuri", "Kot Fatta", "Kot Kapura", "Kotkapura", "Kotkapura Cloth Market Faridkot", "Kurali",
    "Kurali (Punjab)", "Kurali Industrial Mohali", "Lalru", "Lehra Gaga", "Lehragaga", "Lehragaga Sangrur",
    "Ludhiana", "Ludhiana Civil Lines", "Ludhiana Clock Tower", "Ludhiana Focal Point", "Ludhiana Hosiery & Focal Point", "Ludhiana Industrial Area",
    "Ludhiana Model Town", "Machhiwara", "Machhiwara Sacred Forest Gurudwara", "Majitha", "Majitha Amritsar", "Makhu",
    "Malerkotla", "Malerkotla Nawab Historic Palace", "Malerkotla Nawab Town", "Maloud", "Malout", "Malout Muktsar Cotton Hub",
    "Mandi Gobindgarh", "Mandi Gobindgarh Iron Hub", "Mandi Gobindgarh Steel City", "Mansa", "Mansa (Punjab)", "Mansa Cotton Belt",
    "Mansa Malwa Cotton Belt", "Maur", "Maur Mandi Bathinda", "Mehatpur", "Moga", "Moga GT Road Commercial",
    "Moonak", "Morinda", "Morinda Ropar Historic", "Mukerian", "Mukerian Hydel Project", "Muktsar",
    "Muktsar (Sri Muktsar Sahib)", "Muktsar Mela Maghi", "Muktsar Mela Maghi 40 Muktas", "Mullanpur Dakha", "Nabha", "Nabha Hira Mahal Patiala",
    "Nakodar", "Nakodar Dargah Baba Murad Shah", "Nangal", "Nangal Bhakra Dam", "Nangal Bhakra Nangal Dam", "Nangal Dam",
    "Nawanshahr (Shaheed Bhagat Singh Nagar)", "Nihal Singh Wala", "Nihal Singh Wala Moga", "Nihalsinghwala", "Nurmahal", "Nurmahal Mughal Serai",
    "Pathankot", "Pathankot Cantt", "Pathankot Junction Defense Gateway", "Patiala", "Patiala Baradari", "Patiala Moti Bagh",
    "Patiala Moti Bagh Palace", "Patiala Urban Estate", "Patran", "Patti", "Patti Tarn Taran Historic", "Payal",
    "Payal Ludhiana Fort", "Phagwara", "Phagwara Lovely Professional Hub", "Phagwara Sugar Mill Town", "Phillaur", "Phillaur Maharaja Ranjit Singh Fort",
    "Qadian", "Qadian Ahmadiyya World Hub", "Raikot", "Raikot Ludhiana", "Raja Sansi (Airport)", "Rajpura",
    "Rajpura Industrial Corridor", "Raman", "Rampura Phul", "Rampura Phul Bathinda", "Rayya", "Rayya Beas Dera Hub",
    "Ropar (Roopnagar)", "Ropar Archaeological Harappan Site", "Ropar Rural", "Rupnagar IIT Area", "Rupnagar Wetland", "Sahnewal",
    "Samana", "Samana Patiala", "Samrala", "Samrala Ludhiana", "Sanaur", "Sangrur",
    "Sangrur Royal Sunam Link", "Sardulgarh", "Sardulgarh Mansa", "Shahkot", "Shahkot Jalandhar", "Sham Chaurasi",
    "Sham Churasi", "Sham Churasi Classical Music Hub", "Shekhupura", "Sirhind", "Sirhind Fatehgarh Historic Battleground", "Sirhind Historic",
    "Sri Hargobindpur", "Sri Hargobindpur Beas", "Sujanpur (PB)", "Sultanpur Lodhi", "Sultanpur Lodhi Ber Sahib", "Sultanpur Lodhi Sacred Ber Sahib",
    "Sunam", "Sunam Shaheed Udham Singh Birthplace", "Talwandi Bhai", "Talwandi Sabo", "Talwandi Sabo (Damdama Sahib)", "Talwandi Sabo Damdama Sahib",
    "Talwandi Sabo Takht Damdama Sahib", "Tanda Urmar", "Tanda Urmar Hoshiarpur", "Tapa", "Tarn Taran", "Tarn Taran Darbar Sahib",
    "Tarn Taran Golden Sarovar Darbar", "Urmar Tanda", "Urmar Tanda Timber Hub", "Zira", "Zira Ferozepur", "Zirakpur"
  ],
  "Rajasthan": [
    "Abu Road", "Abu Road Railway Gateway", "Abu Road Station", "Ahore", "Ahore Jalor Granite", "Ajmer",
    "Ajmer Ana Sagar", "Ajmer Dargah Sharif", "Aklera", "Aklera Jhalawar", "Alsisar", "Alwar",
    "Alwar City", "Alwar Siliserh Lake", "Alwar Siliserh Palace Lake", "Amer Fort & Maota Lake", "Amer Fort Heritage", "Amet",
    "Antah", "Antah Thermal Power Baran", "Anupgarh", "Anupgarh International Border", "Asind", "Asind Devnarayan Teerth",
    "Aspur", "Aspur Dungarpur", "Bagar Shekhawati", "Bagar Shekhawati Haveli", "Bagidora", "Bagidora Banswara",
    "Bagru", "Bagru Handblock Dabu Printing", "Balaji Mehandipur", "Balaji Mehandipur Sacred Dham", "Balesar", "Balesar Jodhpur Sandstone",
    "Bali", "Bali Pali Shivalik Base", "Balotra", "Bamanwas", "Bamanwas Ranthambore Link", "Bandikui",
    "Bandikui Railway Junction Dausa", "Bangarh Fort Area", "Bangarh Haunted Fort Archaeological", "Banswara", "Bap", "Bap Phalodi Salt Lake",
    "Baran", "Bari", "Bari Dholpur Red Stone", "Bari Sadri", "Bari Sadri Chittorgarh", "Barmer",
    "Barmer Desert Border", "Barmer Desert Border Thar", "Bassi", "Bassi (Jaipur)", "Bassi Jaipur Industrial", "Bayana",
    "Bayana Historic Mughal Fort", "Beawar", "Beawar Cement & Tilpatti Hub", "Beawar Industrial", "Begun", "Begun Fort Chittorgarh",
    "Behror", "Bhadra", "Bhadra Hanumangarh Mandi", "Bhandarej", "Bhandarej Baori Dausa", "Bhangarh Archaeological Heritage",
    "Bhangarh Historic", "Bharatpur", "Bharatpur Bird Sanctuary (Keoladeo)", "Bhilwara", "Bhilwara Textile City", "Bhilwara Textile City of India",
    "Bhim", "Bhinder", "Bhinder Udaipur", "Bhinmal", "Bhinmal Ancient Poet Magha Hub", "Bhiwadi",
    "Bhopalgarh", "Bhopalgarh Jodhpur", "Bikaner", "Bikaner Junagarh Camel Country", "Bikaner Junagarh Fort", "Bilara",
    "Bilara Jodhpur", "Bishangarh", "Chaksu", "Chhabra", "Chhabra Thermal Power Baran", "Chhapar (Churu)",
    "Chhoti Sadri", "Chhoti Sadri Pratapgarh", "Chirawa", "Chirawa Shekhawati Pedas", "Chittorgarh", "Chittorgarh Fort",
    "Chittorgarh Vijay Stambha", "Chittorgarh Vijay Stambha Fort", "Chohtan", "Chohtan Barmer Gond Dunes", "Chomu", "Churu",
    "Danta Ramgarh", "Danta Ramgarh Sikar", "Dausa", "Deedwana", "Deeg", "Deeg Palace",
    "Deeg Water Palaces", "Deeg Water Palaces & Fountains", "Degana", "Degana Tungsten Nagaur", "Deshnoke", "Deshnoke (Karni Mata)",
    "Deshnoke Karni Mata Rat Temple", "Deshnoke Karni Mata Temple", "Dhariawad", "Dhariawad Sita Mata Forest", "Dholpur", "Didwana",
    "Didwana Salt Lake Nagaur", "Dudu", "Dungarpur", "Dungarpur City of Stepwells", "Fatehnagar", "Fatehpur Shekhawati",
    "Fatehpur Shekhawati Fresco Walk", "Fatehpur Shekhawati Haveli", "Gajner", "Gajner Palace", "Galiakot", "Galiakot Fakhruddin Dargah",
    "Gangapur City", "Gangapur City Malai Ghewar", "Garhi", "Garhi Banswara", "Ghatol", "Ghatol Banswara Island Link",
    "Gogunda", "Goredi Chancha", "Goredi Chancha Nagaur", "Govindgarh (RJ)", "Gudha Gorji", "Gudha Gorji Jhunjhunu",
    "Hanumangarh", "Hindaun", "Hindaun City", "Hindaun City Stone Craft", "Jahazpur", "Jahazpur Bhilwara",
    "Jaipur", "Jaipur Airport", "Jaipur Amer Fort", "Jaipur Bapu Bazar", "Jaipur C-Scheme", "Jaipur Hawa Mahal",
    "Jaipur Malviya Nagar", "Jaipur Mansarovar", "Jaipur Nahargarh", "Jaipur Raja Park", "Jaipur Tonk Road", "Jaipur Vaishali Nagar",
    "Jaisalmer", "Jaisalmer Fort", "Jaisalmer Sam Dunes", "Jaisalmer Sam Sand Dunes", "Jaisalmer Sam Sand Dunes Desert", "Jaitaran",
    "Jaitaran Pali", "Jalor", "Jalor Golden Granite City", "Jalore", "Jamwa Ramgarh", "Jamwa Ramgarh Leopard Reserve",
    "Jayal", "Jayal Nagaur", "Jhadol", "Jhadol Forest Udaipur", "Jhalawar", "Jhalawar Garh Palace",
    "Jhalawar Garh Palace Jhalrapatan", "Jhalrapatan", "Jhalrapatan City of Bells", "Jhunjhunu", "Jhunjhunu Rani Sati", "Jhunjhunu Rani Sati Dadi Temple",
    "Jodhpur", "Jodhpur Airport", "Jodhpur Mandore", "Jodhpur Mehrangarh Fort", "Kaman", "Kapasan",
    "Kapasan Chittorgarh", "Karanpur", "Karanpur Border Sri Ganganagar", "Kekri", "Kekri Ajmer Marble", "Keshoraipatan",
    "Khandela", "Khandela Sikar Toran Town", "Khatu Shyam Ji", "Khatushyamji Dham", "Kherwara", "Kherwara Udaipur Tribal",
    "Khetri", "Khetri Copper Complex", "Khimsar", "Khimsar Dunes", "Kishangarh", "Kishangarh Bas",
    "Kishangarh Bas Alwar", "Kishangarh Marble Capital & Bani Thani", "Kishangarh Marble Hub", "Kishangarh Marble Market", "Kolayat", "Kolayat Kapil Muni Sacred Lake",
    "Kota", "Kota Chambal Riverfront", "Kota Coaching Hub", "Kotputli", "Kotputli Cement & Industrial", "Kotputli Rural",
    "Kotra", "Kotra Forest Udaipur", "Kuchaman City", "Kuchaman City Salt Fort", "Kumbhalgarh", "Kumbhalgarh Fort Area",
    "Kumbhalgarh Great Wall", "Kumbhalgarh Great Wall of India", "Lachhmangarh", "Ladnun", "Ladnun Jain Vishva Bharati", "Lalsot",
    "Lalsot Dausa Mandi", "Losal", "Losal Sikar", "Mahwa", "Mahwa Dausa Express Link", "Makrana",
    "Makrana World Renowned White Marble", "Malpura", "Malpura Tonk", "Mandal", "Mandal Bhilwara", "Mandalgarh",
    "Mandalgarh Heritage Fort", "Mandawa", "Mandawa Haveli Walk", "Mandawa Havelis", "Mandawa Open Air Art Gallery", "Mangrol",
    "Mangrol Baran", "Marwar Junction", "Marwar Junction Pali", "Mehandipur Balaji", "Merta City", "Merta City Sant Meera Bai Birthplace",
    "Mount Abu", "Mount Abu Dilwara Temples", "Mount Abu Nakki Lake", "Mount Abu Nakki Lake Hill Station", "Mukundgarh", "Nadbai",
    "Nadbai Bharatpur", "Nadbhai", "Nagar (Bharatpur)", "Nagar Bharatpur", "Nagaur", "Nainwa",
    "Nathdwara (Shreenathji)", "Nathdwara Shrinathji", "Nathdwara Shrinathji Temple Haveli", "Nawa", "Nawa Sambhar Salt Depot", "Nawalgarh",
    "Nawalgarh Painted Haveli Capital", "Neem Ka Thana", "Neemrana", "Neemrana Fort", "Neemrana Japanese Zone", "Nimbahera",
    "Nimrana Japanese Industrial SEZ", "Nimrana Japanese Zone", "Niwai", "Nohar", "Nohar Hanumangarh", "Nokha",
    "Nokha (Rajasthan)", "Nokha Bikaner Mathania", "Osian", "Osian Ancient Sun Temples Dunes", "Osian Sand Dunes", "Padampur",
    "Padampur Sri Ganganagar", "Pali", "Pali Marwar Industrial Textile", "Parbatsar", "Phalodi", "Phalodi World Largest Solar Park",
    "Pilani", "Pilani BITS Educational Capital", "Pilibanga", "Pilibanga Indus Civilization", "Pindwara", "Pipar City",
    "Pipar City Jodhpur", "Pirawa", "Pirawa Jhalawar", "Pokhran", "Pokhran Nuclear Heritage Fort", "Pratapgarh (Rajasthan)",
    "Pratapgarh (RJ)", "Pratapgarh Thewa Jewellery Capital", "Pushkar", "Pushkar Brahma Temple", "Pushkar Desert Camp", "Pushkar World Only Brahma Temple",
    "Raipur (Pali)", "Raisinghnagar", "Rajakhera", "Rajakhera Dholpur", "Rajaldesar", "Rajaldesar Churu",
    "Rajgarh (Alwar)", "Rajgarh (Churu)", "Rajgarh Alwar Sariska Link", "Rajgarh Churu Sadulpur", "Rajsamand", "Rajsamand Marble Embankment Lake",
    "Ramdevra Baba Ramdevji Teerth", "Ramdevra Temple", "Ramganj Mandi", "Ramganj Mandi Kota Stone Hub", "Ramgarh (Shekhawati)", "Ranakpur 1444 Pillar Jain Temple",
    "Ranakpur Jain Temples", "Rani", "Rani (Pali)", "Rani Pali Railway Junction", "Ranthambore (Sawai Madhopur)", "Ranthambore National Park",
    "Ranthambore Royal Tiger Sanctuary", "Ratangarh", "Ratangarh Churu Heritage", "Rawatbhata", "Rawatbhata Atomic Power Station", "Rawatsar",
    "Rawatsar Hanumangarh", "Sadri", "Sadri Pali Gateway", "Sadulpur", "Sadulpur (Rajgarh)", "Sadulpur Churu Sports Town",
    "Salasar Balaji", "Salasar Balaji Dham", "Salasar Balaji Siddha Peeth Dham", "Salumbar", "Salumbar Udaipur Mewar", "Sambhar Lake",
    "Sambhar Salt Lake Flamingos", "Samode Palace", "Samode Palace Shekhawati", "Sanchore", "Sanchore Jalor Dairy Heartland", "Sangaria",
    "Sangaria Border Hanumangarh", "Sardarshahar", "Sariska Tiger Reserve", "Sariska Tiger Reserve Alwar", "Sarmathura", "Sarmathura Dholpur Sandstone",
    "Sarwar", "Sarwar Dargah Ajmer", "Sawai Madhopur", "Shahpura (Bhilwara)", "Shahpura (Jaipur)", "Shahpura Bhilwara Phad Painting",
    "Shekhawati Fresco Belt", "Shekhawati Heritage Fresco Belt", "Sheoganj", "Sheoganj Sirohi Mandi", "Shri Dungargarh", "Shri Dungargarh Bikaner",
    "Shri Madhopur", "Shri Madhopur Sikar", "Sikar", "Sirohi", "Siwana", "Sojat",
    "Sojat World Mehndi Henna Capital", "Sri Dungargarh", "Sri Ganganagar", "Sri Madhopur", "Sujangarh", "Sumerpur",
    "Sumerpur Jawai Leopard Hills", "Surajgarh", "Surajgarh Jhunjhunu Fort", "Suratgarh", "Suratgarh Thermal Power City", "Takhatgarh",
    "Takhatgarh Pali", "Taragarh Ajmer", "Taragarh Ajmer Strategic Fort", "Tijara", "Tijara Chandraprabhu Atishaya Teerth", "Todabhim",
    "Todabhim Karauli", "Todaraisingh", "Todaraisingh Stepwell City", "Tonk", "Tonk Nawab Sunehri Kothi", "Udaipur",
    "Udaipur City Palace", "Udaipur Fatehsagar", "Udaipur Lake Pichola", "Udaipur Sukher", "Udaipur Venice of the East", "Udaipurwati",
    "Udaipurwati Shakambhari Devi", "Uniara", "Uniara Tonk", "Vallabhnagar", "Vallabhnagar Udaipur", "Viratnagar",
    "Viratnagar Buddhist Ashokan Caves", "Weir", "Weir Bird Sanctuary Bharatpur", "Wer"
  ],
  "Uttar Pradesh": [
    "Achhnera", "Afzalgarh", "Afzalgarh Bijnor", "Agra", "Agra Cantt", "Agra Dayalbagh",
    "Agra Fatehabad Road", "Agra Fort Area", "Agra Idgah", "Agra Khandari", "Agra Raja Ki Mandi", "Agra Sanjay Place",
    "Agra Shamshabad Road", "Agra Sikandra", "Agra Taj East Gate", "Agra Taj East Gate VIP Terminal", "Agra Tajganj", "Ahraura",
    "Ahraura Chunar Stone Mirzapur", "Air Force Station Hindon", "Ajhuwa", "Ajhuwa Kaushambi", "Ajitmal", "Akbarpur",
    "Akbarpur (Ambedkar Nagar)", "Akbarpur Ambedkar Nagar", "Aliganj", "Aliganj (Etah)", "Aliganj Etah", "Aligarh",
    "Aligarh AMU Area", "Aligarh Civil Lines", "Allapur", "Allapur Badaun", "Amanpur", "Amanpur Kasganj",
    "Ambehta", "Ambehta Saharanpur", "Amethi", "Amethi Royal Heritage Hub", "Amila", "Amila Mau",
    "Aminagar Sarai", "Aminagar Sarai Baghpat", "Amroha", "Amroha City", "Anandnagar", "Anpara",
    "Anupshahr", "Anupshahr Chhoti Kashi Ganga", "Aonla", "Atarra", "Atarra Banda Bundelkhand", "Atrauli",
    "Atrauli Aligarh", "Atraulia", "Atraulia Azamgarh", "Auraiya", "Auras", "Auras Unnao",
    "Avadh", "Ayodhya", "Ayodhya Cantt", "Ayodhya Hanumangarhi", "Ayodhya Naya Ghat", "Ayodhya Ram Janmabhoomi",
    "Ayodhya Ram Mandir", "Ayodhya Ram Mandir Janmabhoomi", "Babarpur", "Baberu", "Baberu Banda", "Babrala",
    "Babrala Chemical Fertilizer Sambhal", "Babugarh", "Babugarh Chhavni Hapur", "Bachhrawan", "Bachhrawan Rae Bareli", "Badaun",
    "Baghpat", "Baghpat Khekra", "Bagpat Rural", "Bagpat Sugar Belt", "Bah", "Bah Agra Chambal Safari Gateway",
    "Baheri", "Bahjoi", "Bahraich", "Bahsuma", "Bahsuma Meerut", "Bairia",
    "Bairia Ballia Suraha Tal", "Bakewar", "Ballia", "Balrampur", "Banda", "Banda Mandi",
    "Bangar Mau", "Bansgaon", "Bansi", "Bansi Siddharthnagar", "Barabanki", "Baraut",
    "Baraut Subcity", "Bareilly", "Bareilly Cantt", "Bareilly Civil Lines", "Bareilly Izzatnagar", "Barhaj",
    "Barhalganj", "Barkhera", "Barkhera Pilibhit", "Barsana", "Barsana Dham", "Barsana Radha Rani Mandir Lathmar",
    "Barsana Radha Rani Temple", "Barsana Rural", "Basti", "Basti City", "Bateshwar 101 Shiva Temples Yamuna", "Bateshwar Temples",
    "Bawan", "Bawan Hardoi", "Behat", "Behat Saharanpur", "Behat Wooden Handicrafts Saharanpur", "Belthara Road",
    "Belthara Road Ballia", "Beniganj", "Beniganj Hardoi", "Beswan", "Beswan Aligarh", "Bewar",
    "Bewar Mainpuri", "Bhabua Border (UP)", "Bhabua Border Chandauli", "Bhadohi", "Bhadohi Carpet Hub", "Bhadohi South Asia Carpet Capital",
    "Bhagwant Nagar", "Bharatana", "Bharthana", "Bharthana Etawah", "Bharwari", "Bharwari Kaushambi",
    "Bhawan Bahadur Nagar", "Bhawan Bahadur Nagar Bulandshahr", "Bhimsen", "Bhinga", "Bhinga Shravasti Forest", "Bhitargaon 5th Century Brick Temple",
    "Bhitargaon Ancient Temple", "Bhogaon", "Bhongaon", "Bhongaon Mainpuri", "Bidhuna", "Bidhuna Auraiya",
    "Bijnor", "Bijnor Kotwali", "Bikapur", "Bilari", "Bilari Moradabad", "Bilaspur (Rampur)",
    "Bilaspur (UP)", "Bilaspur Rampur", "Bilgram", "Bilhaur", "Bilhaur Ganga Ghat Kanpur", "Bilram",
    "Bilram Kasganj", "Bilsanda", "Bilsanda Pilibhit", "Bilsi", "Bilsi Badaun", "Bindki",
    "Bindki Fatehpur", "Bisalpur", "Bisalpur Pilibhit", "Bisauli", "Biswan", "Biswan Sugar Sitapur",
    "Brijghat", "Budaun", "Budaun Badaun Sufi Shrine", "Budaun City", "Budaun Rural", "Budhana",
    "Budhana Muzaffarnagar", "Bulandshahr", "Bulandshahr Sikandrabad", "Captainganj", "Captainganj Sugar Kushinagar", "Chandauli",
    "Chandauli Rice Bowl of UP", "Chandausi", "Chandausi Mandi", "Chandpur", "Chandpur (Bijnor)", "Chandpur Bijnor",
    "Charkhari", "Charkhari Kashmir of Bundelkhand", "Chhata", "Chhata Mathura", "Chhata Mathura Highway", "Chhatari",
    "Chhatari Bulandshahr", "Chhibramau", "Chhibramau Kannauj Potato Belt", "Chhutmalpur", "Chhutmalpur Saharanpur Foothills", "Chitrakoot",
    "Chitrakoot Dham", "Chitrakoot Ramghat", "Chunar", "Chunar Fort Area", "Chunar Fort Mirzapur", "Chunar Historic Stone Fort",
    "Chunar Mirzapur", "Colonelganj", "Colonelganj Gonda", "Dadri NTPC Hub", "Dadri NTPC Power Gautam Buddha Nagar", "Dadri Rural",
    "Dalmau", "Dalmau King Dal Sacred Ganga Ghat", "Dankaur Formula 1 Buddh Circuit", "Dankaur Rural", "Dariyabad", "Dariyabad Barabanki",
    "Dataganj", "Dayalbagh", "Dayalbagh Agra", "Dayalbagh Educational Ashram Agra", "Deoband", "Deoband Darul Uloom Islamic Seat",
    "Deoband Islamic Seminary", "Deoband Rural", "Deoria", "Deva Sharif Barabanki", "Deva Sharif Waris Ali Shah Dargah", "Dewa Sharif",
    "Dewa Sharif Shrine", "Dhampur", "Dhampur Bijnor", "Dhampur Bijnor Sugar", "Dhanauha", "Dhanauha Jaunpur",
    "Dhanghata", "Dhanghata Sant Kabir Nagar", "Dhaurahra", "Dhaurahra Dudhwa Gateway", "Dibai", "Dibai Bulandshahr",
    "Dibiyapur", "Dildarnagar", "Dohrighat", "Dohrighat Ghaghra Sangam Mau", "Dostpur", "Dostpur Sultanpur",
    "Dudhi", "Dudhi Mineral Belt Sonbhadra", "Dudhwa National Park Palia", "Dudhwa National Park Palia Gate", "Ekdil", "Ekdil Etawah",
    "Etah", "Etah City", "Etawah", "Etawah Saifai", "Faizabad", "Farrukhabad",
    "Farrukhabad City", "Farrukhabad Zardozi Handprint Capital", "Fatehabad (Agra)", "Fatehabad Agra Express Junction", "Fatehganj Bareilly", "Fatehgarh",
    "Fatehgarh Cantt", "Fatehgarh Military Cantonment", "Fatehpur", "Fatehpur Chaurasi", "Fatehpur Chaurasi Unnao", "Fatehpur Sikri",
    "Fatehpur Sikri Buland Darwaza", "Fatehpur Sikri World Heritage Buland Darwaza", "Firozabad", "Firozabad Glass Hub", "Gajraula", "Gajraula Industrial Hub",
    "Ganj Dundwara", "Ganj Dundwara Kasganj", "Garautha", "Garautha Jhansi", "Garhi Pukhta", "Garhi Pukhta Shamli",
    "Garhmukteshwar", "Garhmukteshwar Brijghat", "Gauri Bazar", "Gauri Bazar Deoria", "Gawan", "Gawan Ganga Snan Sambhal",
    "Ghatampur", "Ghatampur Power Project Kanpur", "Ghaziabad", "Ghaziabad Morta", "Ghazipur", "Ghorawal",
    "Ghorawal Sonbhadra Rock Art", "Gokul", "Gokul Nanda Bhavan", "Gokul Nanda Bhavan Cowherds", "Gola Gokarannath", "Gola Gokarannath Chhoti Kashi Shiva",
    "Gonda", "Gonda City", "Gorakhpur", "Gorakhpur AIIMS Area", "Gorakhpur Cantt", "Gorakhpur Gorakhnath Temple",
    "Goshainganj", "Goshainganj Ayodhya Corridor", "Govardhan", "Govardhan 21km Parikrama Teerth", "Govardhan Parikrama", "Govardhan Parikrama Marg",
    "Goverdhan", "Gunnaur", "Gunnaur Sambhal", "Gyanpur", "Gyanpur Bhadohi Administrative", "Haldaur",
    "Haldaur Bijnor", "Hamirpur (UP)", "Handia", "Hapur", "Hapur Dehat", "Hapur Dehat Industrial",
    "Hapur Pilkhuwa", "Hardoi", "Hardoi City", "Hasanpur (Amroha)", "Hasanpur (UP)", "Hasanpur Amroha",
    "Hasanpur Amroha Mango Belts", "Hastinapur", "Hastinapur Jain Teerth", "Hastinapur Jain Teerth Mahabharat", "Hathras", "Hathras City",
    "Hindon", "Jahangirabad", "Jalalabad", "Jalalabad (Shahjahanpur)", "Jalalabad Shahjahanpur", "Jalalpur (Ambedkar Nagar)",
    "Jalalpur Handloom Ambedkar Nagar", "Jalaun", "Jalesar", "Jalesar World Famous Brass Bell Metal", "Jasrana", "Jasrana Firozabad",
    "Jaswantnagar", "Jaswantnagar Etawah", "Jaunpur", "Jaunpur City", "Jaunpur Shahi Atala Bridge & Perfumes", "Jaunpur Shahi Bridge",
    "Jewar Airport Hub", "Jhansi", "Jhansi Cantt", "Jhansi Civil Lines", "Jhansi Fort Area", "Jhansi Rani Laxmibai Fort Mahal",
    "Jhansi Rani Mahal", "Kadaura", "Kadipur", "Kaimganj", "Kaimganj Farrukhabad Tobacco", "Kaimoor Wildlife Sanctuary",
    "Kairana", "Kairana Shamli", "Kairana Shamli Classical Music", "Kakori", "Kakori Historic Railway Dashahari Mango", "Kalinjar Fort",
    "Kalinjar Fort Banda", "Kalinjar Impenetrable Hill Fort Banda", "Kalpi", "Kalpi Historic Mint Jalaun", "Kannauj", "Kannauj Perfume Capital",
    "Kannauj World Perfume Ittar Capital", "Kanpur", "Kanpur Cantt", "Kanpur Civil Lines", "Kanpur Kalyanpur", "Kanpur Mall Road",
    "Kant Shahjahanpur", "Kanth", "Kanth Moradabad", "Kanth Moradabad Brass", "Kapilvastu Piprahwa", "Kapilvastu Piprahwa Buddha Relics",
    "Karhal", "Karhal Mainpuri Express Access", "Kasganj", "Kasganj City", "Kasganj Satyagrah Heritage", "Kashi Vishwanath Corridor",
    "Kashi Vishwanath Corridor Varanasi", "Kashipur Moradabad Corridor", "Kaushambi (UP)", "Khaga", "Khaga Fatehpur GT Road", "Khair",
    "Khair Aligarh", "Khalilabad", "Khalilabad Handloom Cotton Market", "Khatima Border UP", "Khekra", "Kheragarh",
    "Kheragarh Agra", "Khurja", "Khurja Pottery City", "Kiratpur", "Konch", "Konch Jalaun",
    "Kosi Kalan", "Kunda", "Kunda Pratapgarh", "Kundarki", "Kushinagar", "Kushinagar Mahaparinirvana",
    "Kushinagar Mahaparinirvana Temple", "Kushinagar Mahaparinirvana Temple Stupa", "Laharpur", "Laharpur Sitapur", "Lakhimpur", "Lakhimpur Kheri",
    "Lalganj", "Lalganj (Azamgarh)", "Lalganj (Pratapgarh)", "Lalganj Azamgarh", "Lalganj Rail Coach Factory Pratapgarh", "Lalitpur",
    "Loni Dehat", "Lucknow", "Lucknow Airport (Amausi)", "Lucknow Alambagh", "Lucknow Aminabad", "Lucknow Charbagh",
    "Lucknow Chowk", "Lucknow Gomti Nagar", "Lucknow Hazratganj", "Lucknow Indira Nagar", "Machhlishahr", "Madhogarh",
    "Madhogarh Jalaun", "Madhotanda", "Madhotanda Pilibhit Tiger Reserve Source", "Maghar Kabir Samadhi", "Maghar Sant Kabir Samadhi Shrine", "Mahaban",
    "Maharajganj", "Maharajganj (Gorakhpur)", "Maharajganj Gorakhpur Terai", "Mahoba", "Mahoba Bundelkhand Ancient Lakes", "Mahoba City",
    "Mahoba Lakes Bundelkhand", "Maholi", "Maholi Sitapur", "Mailani", "Mailani Tiger Reserve Meter Gauge Link", "Mainpuri",
    "Mainpuri City", "Manjhanpur", "Manjhanpur Kaushambi Headquarters", "Manjhanpur Rural", "Mankapur", "Mariahu",
    "Mariahu Jaunpur", "Mathura", "Mathura Cantt", "Mathura Janmabhoomi", "Mathura Krishna Janmabhoomi", "Mathura Krishna Janmabhoomi Complex",
    "Mathura Krishna Nagar", "Mathura Refinery Area", "Mauranipur", "Mawana", "Mawana Meerut", "Meerut",
    "Meerut Cantt", "Meerut Civil Lines", "Meerut Expressway Toll", "Meerut Partapur", "Meerut Shastri Nagar", "Mehnagar",
    "Mehnagar Azamgarh", "Milak", "Milak Rampur", "Milak Rampur Highway", "Miranpur", "Miranpur Muzaffarnagar",
    "Mirzapur", "Mirzapur Vindhyachal", "Misrikh", "Misrikh Naimisharanya", "Misrikh Naimisharanya Parikrama", "Modinagar Textile Hub",
    "Mohammadabad", "Mohammadabad Ghazipur", "Mohammadi", "Mohammadi Fragrant Rice Kheri", "Mohammadi Kheri", "Mohanlalganj",
    "Mohanlalganj Lucknow Outer Ring", "Moradabad", "Moradabad Brass Market", "Moradabad Bypass", "Moradabad Civil Lines", "Mughalsarai",
    "Muradnagar Ordnance Hub", "Musafirkhana", "Musafirkhana Amethi", "Muzaffarnagar", "Muzaffarnagar Jansath", "Muzaffarnagar New Mandi",
    "Muzaffarnagar Sukartal", "Nagina", "Nagina Bijnor", "Naimisharanya 88000 Sages Meditation Teerth", "Naimisharanya Chakra Teerth", "Nandgaon",
    "Nandgaon Mathura", "Nandgaon Nandbaba Mandir", "Nandgaon Nandbaba Temple Hill", "Nanpara", "Nanpara Bahraich Nepal Route", "Naugarh",
    "Nautanwa", "Nautanwa Indo-Nepal Border Transit", "Nawabganj", "Nawabganj (Bareilly)", "Nawabganj (Gonda)", "Nawabganj Bird Sanctuary Bareilly",
    "Nawabganj Gonda", "Nehtaur", "Nihtaur", "Nihtaur Bijnor", "Noorpur", "Obra",
    "Oel Dhakwa", "Oel Dhakwa Historic Frog Temple", "Orai", "Orai City", "Pachperwa", "Pachperwa Balrampur",
    "Padrauna", "Pahasu", "Pali (Hardoi)", "Pali Hardoi", "Palia Kalan", "Partapur (Meerut)",
    "Pawayan", "Pawayan Shahjahanpur", "Phoolpur (Azamgarh)", "Phoolpur Azamgarh", "Phulpur", "Pihani",
    "Pihani Hardoi", "Pilibhit", "Pilibhit Tiger Reserve", "Pilkhuwa", "Pilkhuwa Handloom Hub", "Pindara",
    "Pipraich", "Pratapgarh", "Prayagraj", "Prayagraj Civil Lines", "Prayagraj Sangam", "Prayagraj Triveni Sangam",
    "Prayagraj Triveni Sangam Kumbh Ground", "Puranpur", "Purkaji", "Purkaji NH334", "Puwayan", "Puwayan Shahjahanpur",
    "Radha Kund Govardhan", "Radha Kund Govardhan Sacred Pond", "Radhakund", "Radhakund Mathura", "Raebareli", "Raebareli City",
    "Rajaji Nagar", "Ramnagar (Varanasi)", "Ramnagar Varanasi", "Rampur", "Rampur Khas", "Rampur Maniharan",
    "Rampur Maniharan Saharanpur", "Rath", "Rath Hamirpur", "Rath Historic Bundelkhand Hamirpur", "Rath Rural", "Renukoot",
    "Robertsganj", "Rudauli", "Sadabad", "Sadabad Hathras Potato Belt", "Sadabad Rural", "Safipur",
    "Safipur Rural", "Safipur Unnao Sufi Hub", "Saharanpur", "Saharanpur Clock Tower", "Saharanpur Woodcraft Hub", "Sahaswan",
    "Sahawar", "Saidpur", "Salempur", "Salon", "Salon Rae Bareli", "Sambhal",
    "Sambhal City", "Sambhal Rural", "Sambhal Rural Historic", "Sandi", "Sandi Bird Sanctuary Hardoi", "Sandila",
    "Sandila Laddu Hub", "Sant Kabir Nagar", "Sarnath Dhamek Stupa", "Sarnath Dhamek Stupa First Sermon", "Sasni", "Seohara",
    "Shahabad (Hardoi)", "Shahabad (Rampur)", "Shahabad (UP)", "Shahabad Hardoi", "Shahabad Rampur", "Shahganj",
    "Shahjahanpur", "Shamli", "Shamli Sugar Hub", "Shikarpur (Bulandshahr)", "Shikarpur Bulandshahr", "Shikohabad",
    "Shishgarh", "Shravasti", "Shravasti Jetavana Buddhist Monasteries", "Shravasti Jetavana Monasteries", "Siddharthnagar", "Sikanderpur",
    "Sikanderpur Ballia Flower Essence", "Sikandra Rao", "Sikandrabad", "Sirathu", "Sirsaganj", "Sirsaganj Glass Bangles Firozabad",
    "Sirsaganj Rural", "Sitapur", "Sitapur City", "Sonauli (Nepal Border)", "Sonauli Indo-Nepal International Gate", "Sonbhadra",
    "Soron", "Soron Shukarkhetra", "Suar Rampur", "Sukartal", "Sultanpur", "Sultanpur City",
    "Swar", "Swar Rampur", "Tanda", "Tanda Ambedkar Nagar", "Thakurdwara", "Tilhar",
    "Tiloi", "Tiloi Amethi", "Tulsipur", "Tundla", "Tundla Railway Junction", "Ujhani",
    "Unnao", "Utraula", "Utraula Balrampur", "Utraula Rural", "Varanasi", "Varanasi Airport (Babatpur)",
    "Varanasi Assi Ghat", "Varanasi Cantt", "Varanasi Dashashwamedh", "Varanasi Godowlia", "Varanasi Kashi Vishwanath", "Varanasi Lanka",
    "Varanasi Sarnath", "Vrindavan", "Vrindavan Bankey Bihari", "Vrindavan Bankey Bihari & Prem Mandir", "Vrindavan Chandrodaya", "Vrindavan ISKCON",
    "Vrindavan Prem Mandir", "Vrindavan Raman Reti", "Zaidpur", "Zaidpur Barabanki Handloom", "Zaidpur Rural", "Zamania"
  ],
  "Uttarakhand": [
    "Agastyamuni", "Agastyamuni Mandakini River", "Almora", "Almora Bright End Corner", "Almora Bright End Corner Heritage", "Almora Kasar Devi",
    "Almora Mall Road", "Almora Rural", "Askot", "Askot Musk Deer Sanctuary", "Auli", "Auli International Skiing Slopes",
    "Auli Ski Resort", "Badhangarh", "Badhangarh Historic Fortress Chamoli", "Badrinath", "Badrinath Mana Village", "Badrinath Sacred Dham Neelkanth Peak",
    "Badrinath Temple Complex", "Badrinath Temple Hub", "Bageshwar", "Bageshwar Bagnath Sangam Kanda", "Bageshwar Baijnath", "Bageshwar Kanda",
    "Bagnath Temple", "Bareth", "Bareth Chamoli", "Barkot", "Barkot Yamunotri Link", "Barkot Yamunotri Valley Base",
    "Bazpur", "Berinag", "Berinag Rural", "Berinag Tea Gardens View", "Betalghat", "Bhaisiachhana",
    "Bhatwari", "Bhatwari Uttarkashi", "Bhikiyasain", "Bhilangana", "Bhilangana Tehri Hydro Valley", "Bhimtal",
    "Bhimtal Island", "Bhimtal Lake", "Bhimtal Lake Island Aquarium", "Bhimtal Lake Link", "Bhowali", "Bhowali Himalayan Fruit Market",
    "Bhowali Valley", "Bindukhatta", "Binsar", "Binsar Valley", "Binsar Wildlife Sanctuary", "Binsar Wildlife Sanctuary Viewpoint",
    "Budha Kedar", "Budha Kedar Tehri Temple", "Byasi", "Byasi White Water Camp Ganga", "Chakrata", "Chakrata Tiger Falls",
    "Chakrata Tiger Falls Shivalik", "Chamba (UK)", "Champawat", "Chaubattia", "Chaubattia Royal Apple Orchards Ranikhet", "Chaukhutia",
    "Chaukhutia Valley", "Chaukhutia Valley Almora", "Chharba", "Chharba Dehradun", "Chiniyalisaur", "Chinyalisaur",
    "Chinyalisaur Himalayan Airstrip", "Chopta", "Chopta Mini Switzerland", "Chopta Mini Switzerland Tungnath Base", "Chopta Tungnath Trek", "Dakpathar",
    "Dakpathar Yamuna Hydro Barrage", "Dalanwala", "Dalanwala Heritage Dehradun", "Damta", "Damta Yamuna Bridge Gateway", "Deghat",
    "Deghat Almora", "Dehradun", "Dehradun Airport (Jolly Grant)", "Dehradun Chakrata Road", "Dehradun Clement Town", "Dehradun Clock Tower",
    "Dehradun FRI Campus", "Dehradun GMS Road", "Dehradun Hathibarkala", "Dehradun Jakhan", "Dehradun Patel Nagar", "Dehradun Rajpur Road",
    "Dehradun Robbers Cave", "Dehradun Sahastradhara", "Devikhal", "Devikhal Pauri Hills", "Devprayag", "Devprayag Sangam",
    "Dhalwala", "Dhalwala Tapovan Rishikesh Link", "Dhanaulti", "Dhanaulti Eco Park", "Dhanaulti Eco Park Apple Trail", "Dharchula",
    "Dharchula Indo-Nepal Kali Bridge", "Dhari", "Dhikuli", "Dhikuli Corbett Hub", "Didihat", "Didihat Pithoragarh Hills",
    "Doiwala", "Doiwala Dehradun Aerotropolis", "Doiwala Rural", "Duggada", "Dwarahat", "Dwarahat Dunagiri Shaktipeeth Temple",
    "Dwarahat Ranikhet Link", "Gairsain", "Gaja", "Gaja Tehri Scenic Ridge", "Gangolihat", "Gangolihat Mahakali Pithoragarh Temple",
    "Gangotri", "Gangotri Gaumukh Base", "Gangotri Holy Shrine Bhagirathi Source", "Gangotri Temple Base", "Gaurikund", "Ghandiyal",
    "Ghandiyal Pauri Garhwal", "Ghangaria Valley of Flowers", "Ghangaria Valley of Flowers Gateway", "Ghansali", "Ghattugad", "Ghattugad Lansdowne Stream",
    "Ghuttu", "Ghuttu Bhilangana Valley Trek", "Gopeshwar", "Gopeshwar Chamoli", "Gopeshwar Chamoli Gopinath Temple", "Govindghat Hemkund Base",
    "Govindghat Hemkund Valley Start", "Guptkashi", "Guptkashi Ardhanarishwar Shiva Temple", "Guptkashi Kedarnath Base", "Haldwani", "Haldwani Bareilly Road",
    "Haldwani Kaladhungi Road", "Haldwani Kathgodam Gateway", "Haldwani Nainital Road", "Haridwar", "Haridwar BHEL Hub", "Haridwar Bhupatwala",
    "Haridwar Har Ki Pauri", "Haridwar Har Ki Pauri Ganga Aarti", "Haridwar Jwalapur", "Haridwar Kankhal", "Haridwar Mansa Devi", "Haridwar Motichur",
    "Haridwar Railway Station", "Haridwar Rural", "Haridwar Shanti Kunj", "Harshil Himalayan Apple Valley", "Harshil Valley", "Harsil",
    "Hawalbagh", "Hemkund Sahib Alpine Sacred Lake 14000ft", "Hemkund Sahib Base", "Herbertpur", "Hindolakhal", "Jakhnidhar",
    "Jakhnidhar Tehri Ridge", "Jaspur", "Jauljibi", "Jauljibi Indo-Nepal Trade Confluence", "Jaurasi", "Jim Corbett (Ramnagar)",
    "Jim Corbett Bijrani Zone", "Jim Corbett Dhikala Gate", "Jim Corbett Dhikala Jeep Safari", "Jim Corbett Dhikala Zone", "Jim Corbett Jhirna Zone", "Jim Corbett Ramnagar",
    "Jim Corbett Ramnagar Kosi River", "Joshimath", "Joshimath Auli Cableway", "Joshimath Auli Ropeway", "Joshimath Jyotirmath Shankaracharya Peeth", "Joshimath Ropeway Base",
    "Kainchi Dham", "Kainchi Dham Ashram", "Kaladhungi", "Kaladhungi Corbett Museum", "Kalagarh", "Kaliasaur",
    "Kaliasaur Alaknanda Landslide View", "Kalimath", "Kalimath Tantrik Shaktipeeth Shrine", "Kalsi", "Kalsi Ashoka 250 BC Rock Edicts", "Kalsi Dehradun",
    "Kanatal", "Kapkot", "Kapkot Bageshwar Sarju River", "Karnaprayag", "Karnaprayag Alaknanda Pindar Sangam", "Karnaprayag Rural",
    "Karnaprayag Sangam", "Kashipur", "Kashipur IIM Area", "Kathgodam", "Kathgodam Railway Station", "Kausani",
    "Kausani Tea Estate", "Kedarnath", "Kedarnath Dham Shrine", "Kedarnath Gaurikund Base", "Kedarnath Jyotirlinga Holy Himalayan Shrine", "Kedarnath Temple",
    "Kempty", "Kempty Falls Mussoorie Cascades", "Khatima", "Khatima Border", "Khirsu Pauri Hill", "Khirsu Pauri Oak Forest Panoramic Vista",
    "Khurpatal", "Kichha", "Kirtinagar", "Kotabagh", "Kotdwar", "Kotdwar Kanvashram",
    "Koti Colony", "Koti Colony New Tehri Lake Marina", "Kulri (Mussoorie)", "Kulri Mussoorie Mall Road", "Lalkuan", "Lambgaon",
    "Lambgaon Tehri Ridge", "Lamgara", "Landour (Mussoorie)", "Landour Cantt", "Landour Sister Bazaar Mussoorie", "Lansdowne",
    "Lansdowne Bhulla Lake Pine Forest", "Lansdowne Bhulla Tal", "Lansdowne Cantt", "Lansdowne Tip N Top", "Lohaghat", "Loharkhet",
    "Loharkhet Pindari Glacier Base", "Madhyamaheshwar Base", "Madhyamaheshwar Second Kedar Alpine Meadow", "Madhyamaheshwar Trek", "Mahakali Corridor", "Majkhali",
    "Maldevta", "Malsi", "Malsi Dehradun Zoo Foothills", "Mana Last Indian Border Village", "Mana Last Indian Village", "Mana Village",
    "Mandal Chamoli Anusuya Devi Base", "Mandal Valley", "Manglaur", "Manglaur Historic Roorkee Link", "Manglaur Roorkee", "Marchula",
    "Mawana Link", "Mayali", "Mayali Rudraprayag", "Mehuwala", "Mehuwala Dehradun Valley", "Mohan",
    "Mohan Chatti", "Mohan Chatti Bungee Jumping Canyon", "Mohand", "Mori", "Mori Tons River Valley Rafting", "Mukhem",
    "Mukhem Nagraja Temple Tehri", "Mukteshwar", "Mukteshwar Chauli Ki Jali", "Mukteshwar Chauli Ki Jali Viewpoint", "Munsiyari", "Munsiyari Base",
    "Munsiyari Panchachuli Alpine Vista", "Munsiyari Panchachuli View", "Mussoorie", "Mussoorie Camel Back Road", "Mussoorie Company Garden", "Mussoorie Kempty Falls",
    "Mussoorie Mall Road", "Mussoorie Queen of the Hills Mall", "Nainidanda", "Nainidanda Pauri", "Nainital", "Nainital Ayarpatta",
    "Nainital China Peak", "Nainital Emerald Naini Lake Yachting", "Nainital Mallital", "Nainital Naini Lake", "Nainital Snow View", "Nainital Tallital",
    "Nanda Prayag", "Nanda Prayag Alaknanda Nandakini Sangam", "Narendra Nagar", "Narendra Nagar Ananda Himalayan Palace", "Naugaon", "Naugaon Uttarkashi Valley",
    "Naukuchiatal", "New Tehri", "New Tehri Dam View", "Niti Valley", "Okhalkanda", "Pabo",
    "Pabo Pauri Garhwal", "Pangot", "Pangot Bird Sanctuary", "Pangot Himalayan Bird Watching Reserve", "Pantnagar", "Pantnagar Airport",
    "Pauri", "Pauri Kandoliya", "Pithoragarh", "Pithoragarh Airport", "Pithoragarh Miniature Kashmir Soar Valley", "Pithoragarh Soar Valley",
    "Pokhari", "Pokhari Chamoli Hill Orchard", "Pratitnagar", "Pratitnagar Raiwala Ganga Army Base", "Purola", "Raipur (UK)",
    "Raipur Maldevta River Dehradun", "Raipur Valley", "Ramgarh", "Ramgarh Apple Orchards", "Ramgarh Orchards", "Ramgarh Tagore Himalayan Fruit Bowl",
    "Ramnagar", "Ramnagar Kosi River", "Ranikhet", "Ranikhet Chaubatia", "Ranikhet Golf Course", "Ranikhet Upat Kumaon Golf Course",
    "Rikhad", "Rikhad Pauri", "Riknikhal", "Rishikesh", "Rishikesh AIIMS Area", "Rishikesh Barrage",
    "Rishikesh Laxman Jhula", "Rishikesh Laxman Jhula Yoga Capital", "Rishikesh Muni Ki Reti", "Rishikesh Neem Beach", "Rishikesh Ram Jhula", "Rishikesh Shivpuri",
    "Rishikesh Swarg Ashram", "Rishikesh Tapovan", "Rishikesh Triveni Ghat", "Roorkee", "Roorkee Civil Lines", "Roorkee IIT Hub",
    "Rudraprayag", "Rudraprayag Alaknanda Mandakini Sangam", "Rudraprayag Alaknanda Sangam", "Rudraprayag Koteshwar", "Rudraprayag Sangam", "Rudrapur",
    "Rudrapur Industrial Hub", "Rudrapur SIDCUL Hub", "Sahaspur", "Saikot", "Salt", "Satpuli",
    "Satpuli Pauri East Nayar River", "Sattal", "Sattal Christian Ashram", "Selakui", "Selakui Pharma City Dehradun", "Shivpuri",
    "Shivpuri Rafting Camps", "Shrikot", "Shrikot Srinagar Medical Hub", "Simli", "Simli Karnaprayag Airstrip Base", "Sitarganj",
    "Sitlakhet", "Sitlakhet Kumaoni Pine Forest Retreat", "Someshwar", "Sonprayag", "Srinagar Garhwal", "Srinagar Garhwal Kamleshwar Mahadev",
    "Srinagar Garhwal NIT Area", "Srinagar Pauri", "Syalde", "Syalsaur", "Syalsaur Mandakini River Bank", "Takula",
    "Tapovan", "Tarikhet", "Tehri Garhwal Asia Tallest Dam Lake", "Tehri Garhwal Lake", "Thal", "Thal Pithoragarh Ramganga",
    "Thalisain", "Thalisain Pauri High Ridge", "Tilwara", "Tilwara Mandakini Confluence", "Triyuginarayan", "Triyuginarayan Celestial Shiva-Parvati Wedding Temple",
    "Tungnath", "Tungnath Highest Shiva Shrine in World 12000ft", "Tungnath Highest Temple", "Tyuni", "Tyuni Tons River Confluence", "Ukhimath",
    "Ukhimath Mandir", "Ukhimath Winter Seat of Kedarnath", "Uttarkashi", "Uttarkashi Nehru Institute of Mountaineering", "Uttarkashi NIM", "Uttarkashi NIM Hub",
    "Valley of Flowers Gate", "Valley of Flowers National Park World Heritage", "Vikasnagar", "Vikasnagar Rural", "Vikasnagar Yamuna Hydro Valley", "Yamunotri",
    "Yamunotri Dham Base", "Yamunotri Dham Hot Springs Sacred Source", "Yamunotri Janki Chatti"
  ],
  "West Bengal": [
    "Adra", "Adra Railway Division Purulia", "Ahmedpur", "Ahmedpur Birbhum Sugar", "Alipurduar", "Amta",
    "Amta Damodar Howrah", "Arambagh", "Asansol", "Bagnan", "Bagnan Howrah Highway", "Baharampur",
    "Bakkhali Sea Beach", "Bakkhali White Sand Sea Beach", "Bakreswar", "Bakreswar Geothermal Hot Springs", "Balagarh", "Balagarh Hooghly Boat Building",
    "Balarampur", "Balarampur Lac Craft Purulia", "Bally", "Ballygunge", "Ballygunge South Kolkata Heritage", "Balurghat",
    "Bandel 1599 Portuguese Basilica Church", "Bandel Church Historic", "Bankura", "Bansberia", "Bansberia Hangseshwari Terracotta Temple", "Barabazar",
    "Barabazar Purulia", "Barakar", "Baranagar", "Barasat", "Bardhaman", "Barjora",
    "Barjora Bankura Industrial", "Barrackpore", "Baruipur", "Baruipur South 24 Parganas Guava Hub", "Basanti", "Basanti Sundarbans Estuary Gateway",
    "Basirhat", "Belda", "Belda Paschim Medinipur", "Beldanga", "Beldanga Murshidabad Silk", "Belgharia",
    "Belur Math Ramakrishna Global HQ", "Belur Math Riverside", "Berhampore", "Berhampore Murshidabad Silk Hub", "Bhangar", "Bhangar Kolkata Outskirts",
    "Bhatpara", "Bhatpara Hooghly Riverfront", "Bidhannagar", "Birpara", "Birpara Dooars Tea Gardens", "Bishnupur",
    "Bishnupur Terracotta Temples", "Bishnupur Terracotta Temples & Baluchari", "Bolpur (Shantiniketan)", "Bolpur Shantiniketan", "Bolpur Shantiniketan Kopai River", "Bongaon",
    "Budge Budge", "Budge Budge Petroleum Port", "Budge Budge Rural", "Calcutta Victoria Memorial Area", "Calcutta Victoria Memorial Maidan", "Canning",
    "Canning Sundarbans River Gateway", "Chakdaha", "Chakdaha Nadia", "Chakdaha Rural", "Champdani", "Champdani Hooghly Jute Mills",
    "Chandannagar", "Chandrakona", "Chandrakona Heritage Fort Midnapore", "Chinsurah", "Chinsurah Dutch Heritage Hooghly", "Contai",
    "Contai Marine Drive Gateway", "Contai Rural", "Cooch Behar", "Cooch Behar Palatial Rajbari Palace", "Cooch Behar Rajbari", "Dakshineswar Bhavatarini Kali Temple",
    "Dakshineswar Kali Temple", "Dalkhola", "Dantan", "Dantan Ancient Buddhist Road", "Darjeeling", "Darjeeling Mall",
    "Darjeeling Mall Chowrasta Viewpoint", "Darjeeling Mall Road", "Darjeeling Tiger Hill", "Darjeeling Tiger Hill Kanchenjunga Sunrise", "Debra", "Debra Paschim Medinipur Highway",
    "Dhulian", "Dhupguri", "Dhupguri Jalpaiguri Agricultural", "Diamond Harbour", "Digha", "Digha New Marine Drive Promenade",
    "Digha New Sea Beach", "Digha Old Sea Beach", "Digha Old Sea Beach Waves", "Domjur", "Domjur Howrah Industrial", "Dooars Gorumara Gate",
    "Dooars Gorumara Rhino Sanctuary", "Dooars Jaldapara Elephant Safari", "Dooars Jaldapara Gate", "Dubrajpur", "Dubrajpur Birbhum Mama Bhagne Hills", "Durgapur",
    "Durgapur City Centre", "Egra", "Egra Purba Medinipur", "Falakata", "Farakka", "Farakka Barrage Road",
    "Farakka Barrage Super Highway", "Gangarampur", "Gangasagar Kapil Muni", "Gangasagar Kapil Muni Pilgrimage Sangam", "Garhbeta", "Garhbeta Gangani Grand Canyon of Bengal",
    "Gazole", "Gazole Malda Mango Belt", "Ghatal", "Ghoom", "Ghoom World Highest Altitude Toy Train Station", "Ghum Monasteries",
    "Guskara", "Guskara Purba Bardhaman Dokra Craft", "Habra", "Haldia", "Haldia Deep Water Petrochemical Port", "Haldia Port",
    "Haldibari", "Haripal", "Haripal Hooghly Rural", "Hasimara", "Hasimara Strategic Airbase", "Hemtabad",
    "Hemtabad Uttar Dinajpur", "Henry Island Bakkhali", "Henry Island Mangrove Eco Beach", "Hili", "Hili International Border Depot", "Hingalganj",
    "Hingalganj Sundarbans Border River", "Howrah", "Howrah Cantilever Bridge Rail Heritage", "Howrah Railway Heritage", "Howrah Railway Station", "Islampur (WB)",
    "Jalpaiguri", "Jangipur", "Jaynagar", "Jaynagar World Famous Moa Sweet Hub", "Jayrambati Holy Matri Mandir", "Jayrambati Matri Mandir",
    "Jhargram", "Jhargram Royal Palace & Forest", "Jhargram Rural", "Joynagar Majilpur", "Joynagar Majilpur Historical", "Kakdwip",
    "Kakdwip Hatania Doania Ferry", "Kakdwip Port", "Kaliaganj", "Kaliaganj Wooden Mask Craft", "Kalimpong", "Kalimpong Deolo Hill",
    "Kalimpong Deolo Panoramic Pine Hill", "Kalna", "Kalna 108 Shiva Concentric Temples", "Kalyani", "Kamarhati", "Kamarpukur Ramakrishna",
    "Kamarpukur Sri Ramakrishna Holy Abode", "Kanchrapara", "Kandi", "Kandi Murshidabad Royal Palace", "Katwa", "Katwa Sacred Chaitanya Sanyas Pitha",
    "Kharagpur", "Kharagpur IIT", "Khatra", "Khatra Bankura Kangsabati Link", "Koch Bihar", "Kolkata",
    "Kolkata Airport (CCU)", "Kolkata Alipore", "Kolkata Ballygunge", "Kolkata Howrah Bridge Area", "Kolkata Jadavpur", "Kolkata New Town",
    "Kolkata Park Street", "Kolkata Salt Lake", "Kotrung", "Kotrung Hooghly", "Krishnanagar", "Krishnarajpur",
    "Kurseong", "Kurseong Dow Hill", "Kurseong Dow Hill Pine Whispers", "Kurseong Hills", "Labpur", "Labpur Birbhum Tara Shankar Heritage",
    "Lalgola", "Lalgola Border Murshidabad", "Lava Hill Cloud Forest Kalimpong", "Lava Hill Forest", "Madarihat", "Madarihat Jaldapara Gateway",
    "Madhyamgram", "Mahishadal", "Mahishadal Ancient Rajbari Palace", "Mainaguri", "Mainaguri Jalpaiguri Jalpesh Temple", "Malbazar",
    "Malda", "Mandarmoni Longest Drive-in Sea Beach", "Mandarmoni Sea Beach", "Manikchak", "Manikchak Malda Ganga Ghat", "Mathabhanga",
    "Mathabhanga Cooch Behar", "Mayapur (ISKCON)", "Mayapur ISKCON Chandrodaya", "Mayapur ISKCON Vedic Planetarium Temple", "Medinipur", "Memari",
    "Mirik", "Mirik Lake", "Mirik Sumendu Lake", "Mirik Sumendu Pine Lake Boating", "Mohanpur (WB)", "Mohanpur Paschim Medinipur Agriculture",
    "Moyna", "Moyna Fish Capital of Bengal", "Mukutmanipur Dam", "Mukutmanipur Kangsabati Earthen Dam", "Murshidabad", "Murshidabad Hazarduari Palace",
    "Murshidabad Hazarduari Palace of 1000 Doors", "Nabadwip", "Naihati", "Nalhati", "Nalhati Laliteshwari Shaktipeeth", "Nandigram",
    "Nandigram Purba Medinipur Coastal", "Onda", "Onda Bankura", "Pandua", "Pandua Ancient Minar Hooghly", "Panihati",
    "Panskura", "Panskura Valley of Flowers Bengal", "Purulia", "Purulia Ayodhya Hills", "Purulia Ayodhya Hills Tribal Landscape", "Raghunathganj",
    "Raghunathganj Murshidabad", "Raghunathpur (WB)", "Raiganj", "Rampurhat", "Rampurhat Tarapith Tantrik Shaktipeeth", "Rampurhat Temple",
    "Ranaghat", "Ranibandh", "Ranibandh Bankura Forest", "Raniganj", "Rhenock Border", "Rhenock Kalimpong Border Ridge",
    "Rishra", "Rishyap 360 Degree Himalayan Panorama", "Rishyap Hills", "Sainthia", "Sainthia Nandikeshwari Shaktipeeth", "Sainthia Rural",
    "Salboni", "Salboni Currency Press Paschim Medinipur", "Santipur", "Serampore", "Sevoke", "Sevoke Teesta River Coronation Bridge",
    "Shantiniketan Visva-Bharati", "Shantiniketan Visva-Bharati Nobel Seat", "Siliguri", "Siliguri Bagdogra", "Siliguri Sevoke Road", "Singur",
    "Singur Hooghly Agricultural", "Sonamukhi", "Sonamukhi Terracotta Silk Bankura", "Sonarpur", "Srirampore", "Sunderbans Gateway",
    "Sunderbans Sajnekhali Watchtower", "Sunderbans World Largest Mangrove Tiger Reserve", "Suri", "Suri Birbhum Headquarter", "Suri Rural", "Taherpur",
    "Tajpur Marine Drive", "Tajpur Pristine Red Ghost Crab Beach", "Taki", "Taki Indo-Bangla Border Ichamati River", "Tamluk", "Tamluk Ancient Maritime Port Tamralipta",
    "Tamluk Rural", "Tarakeswar", "Tarakeswar Sacred Taraknath Shiva Temple", "Tarakeswar Temple", "Tarapith", "Tarapith Maa Tara Pilgrimage Mahashamshan",
    "Tarapith Temple Rampurhat", "Titagarh", "Toofanganj", "Toofanganj Cooch Behar Border", "Uluberia"
  ],
};

// Popular departure origins for quick switching
const ORIGIN_CHIPS = [
  "Delhi",
  "Ghaziabad",
  "Noida",
  "Greater Noida",
  "Gurugram",
  "Faridabad",
  "Delhi Airport",
  "Haridwar",
  "Rishikesh",
  "Dehradun",
  "Nainital",
  "Haldwani",
  "Agra",
  "Mathura",
  "Meerut",
  "Chandigarh",
  "Amritsar",
  "Shimla",
  "Jaipur",
  "Lucknow",
  "Bhopal",
  "Indore",
  "Jammu"
];

interface RoutesTabWidgetProps {
  initialOrigin?: string;
  initialActiveState?: string;
}

export default function RoutesTabWidget({ initialOrigin, initialActiveState }: RoutesTabWidgetProps = {}) {
  const [activeState, setActiveState] = useState<string>(initialActiveState || "Delhi NCR");
  const [activeOrigin, setActiveOrigin] = useState<string>(initialOrigin || "Ghaziabad");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Dynamic origin chips ensuring initialOrigin is prominent
  const availableChips = useMemo(() => {
    if (initialOrigin && !ORIGIN_CHIPS.some((chip) => chip.toLowerCase() === initialOrigin.toLowerCase())) {
      return [initialOrigin, ...ORIGIN_CHIPS];
    }
    return ORIGIN_CHIPS;
  }, [initialOrigin]);

  // Filter destination list strictly within the active state (Zero cross-state mixing!)
  const stateList = STATE_DESTINATIONS[activeState] || [];

  const filteredDestinations = useMemo(() => {
    let list = stateList.filter(
      (d) => d.toLowerCase() !== activeOrigin.toLowerCase()
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((d) => d.toLowerCase().includes(q));
    }

    // STRICT A-TO-Z ALPHABETICAL SORTING (User Mandate)
    return list.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  }, [stateList, activeOrigin, searchQuery]);

  // Compute live verified cards for the current view
  const currentRoutes = useMemo(() => {
    const subset = filteredDestinations.slice(0, visibleCount);

    return subset.map((dest, idx) => {
      const quote = resolveOneWayFare(activeOrigin, dest);
      const distance = quote?.distanceKm || 220;
      const price = quote?.sedanFare || Math.round(distance * 11);
      const duration = quote?.durationText || `${Math.round(distance / 50)} hrs`;
      const slug = quote?.slug || `${activeOrigin.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${dest.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-taxi`;
      const image = getDestinationImage(dest, activeState);

      return {
        id: `${activeOrigin}-${dest}-${idx}`,
        origin: activeOrigin,
        destination: dest,
        distance,
        price,
        duration,
        slug,
        image,
      };
    });
  }, [filteredDestinations, visibleCount, activeOrigin]);

  const hasMore = filteredDestinations.length > visibleCount;

  return (
    <div id="popular-routes-tabs" className="w-full max-w-full min-w-0 font-sans">
      
      {/* 1. STATE SELECTOR TABS (Strict Isolation) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 py-2 px-1 mb-3">
        {Object.keys(STATE_DESTINATIONS).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })).map((state) => {
          const isActive = activeState === state;
          const count = STATE_DESTINATIONS[state]?.length || 0;

          return (
            <button
              key={state}
              type="button"
              onClick={() => {
                setActiveState(state);
                setSearchQuery("");
                setVisibleCount(24);
              }}
              className={`whitespace-nowrap px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 border-2 cursor-pointer ${
                isActive
                  ? 'bg-[#1e1b4b] border-[#1e1b4b] text-white shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{state}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. SUB-BAR: ORIGIN CHIPS & DESTINATION SEARCH */}
      <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 border border-slate-200/80">
        
        {/* Origin Selector & Search Input Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200/70">
          
          {/* Origin Chips */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-brand-green" /> From:
            </span>
            {availableChips.map((chip) => {
              const isSelected = activeOrigin === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActiveOrigin(chip)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-brand-green border-brand-green text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-brand-green hover:text-brand-green'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Quick Search inside this State */}
          <div className="relative min-w-[260px] md:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(8);
              }}
              placeholder={`Search in ${activeState}...`}
              className="w-full bg-white border border-slate-300 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* State Notice & Total Results */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <div>
            Showing destinations exclusively in <strong className="text-slate-900 font-bold">{activeState}</strong>
          </div>
          <div>
            Found <strong className="text-brand-blue font-bold">{filteredDestinations.length}</strong> locations
          </div>
        </div>

        {/* 3. POPULAR CORRIDORS CARDS GRID */}
        {currentRoutes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-sm font-semibold text-slate-600 mb-2">
              No destination matching &ldquo;{searchQuery}&rdquo; in {activeState}.
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Urgent Taxis provides cab service to every village, town & city across {activeState}.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-brand-blue underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {currentRoutes.map((route) => {
              const whatsappUrl = buildWhatsAppBookingLink({
                serviceType: 'One-way',
                vehicleName: 'Sedan',
                origin: route.origin,
                destination: route.destination,
                estimatedFare: route.price,
                pageUrl: `https://www.urgenttaxis.in/cabs?pickup=${encodeURIComponent(route.origin)}&drop=${encodeURIComponent(route.destination)}&serviceType=one_way`,
              });

              return (
                <div
                  key={route.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Destination WebP Image */}
                  <Link href={`/routes/${route.slug}`} className="h-40 relative overflow-hidden bg-slate-100 block group/cardimg">
                    <Image
                      src={route.image}
                      alt={`${route.origin} to ${route.destination} cab`}
                      fill
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getDestinationImage('', activeState);
                      }}
                      sizes="(max-width: 640px) 360px, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent"></div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        {activeState}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <h3 className="text-white font-black tracking-tight leading-tight text-sm">
                        <span className="block text-[11px] font-medium text-slate-300">
                          {route.origin} to
                        </span>
                        {route.destination}, <span className="text-emerald-300 font-bold">{activeState}</span>
                      </h3>
                    </div>
                  </Link>

                  {/* Route Specs & Badges */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl">
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                          <span>
                            Approx. <strong className="text-slate-900">{route.distance} KM</strong>
                          </span>
                        </div>
                        <div className="flex items-center text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          <span>{route.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-slate-600 font-semibold bg-slate-50 p-2 rounded-xl">
                        <Car className="w-3.5 h-3.5 mr-1.5 text-brand-blue shrink-0" />
                        <span className="truncate">Hatchback, Sedan, Ertiga &amp; Innova</span>
                      </div>
                    </div>

                    {/* Pricing & Booking CTA */}
                    <div className="pt-3 border-t border-slate-100 space-y-2 mt-auto">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-500">Starts at</span>
                        <span className="text-lg font-black text-[#1e1b4b] tabular-nums">
                          ₹{route.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href={`/cabs?pickup=${encodeURIComponent(route.origin)}&drop=${encodeURIComponent(route.destination)}&serviceType=one_way`}
                          className="bg-[#1e1b4b] hover:bg-slate-800 text-white text-xs text-center font-bold px-3 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer"
                        >
                          Select Cab
                        </Link>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#059669] hover:bg-[#047857] text-white text-xs text-center font-bold px-3 py-2 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>💬</span> WhatsApp
                        </a>
                      </div>
                      <div className="text-center pt-1">
                        <Link
                          href={`/routes/${route.slug}`}
                          className="text-[11px] font-bold text-brand-blue hover:text-brand-green transition-colors inline-flex items-center gap-1"
                        >
                          <span>Explore Route, Hotels &amp; Stops</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. SHOW MORE DESTINATIONS BUTTON */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              <span>Explore More {activeState} Routes &amp; Corridors ({filteredDestinations.length - visibleCount} more)</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {visibleCount > 24 && !hasMore && filteredDestinations.length > 24 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount(24)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs px-4 py-2 rounded-full border border-slate-200 transition-all cursor-pointer"
            >
              <span>Show Less</span>
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
