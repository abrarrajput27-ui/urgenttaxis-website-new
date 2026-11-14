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
    "Adhaura", "Akbarpur", "Akorhi Gola", "Aliganj", "Amarpur", "Amarpur (Banka)",
    "Amas", "Amnour", "Antichak", "Areraj", "Ariari", "Arrah",
    "Arwal", "Asarganj", "Asthawan", "Aurangabad (Bihar)", "Bagaha", "Bahadurpur",
    "Baheri", "Baikunthpur (Bihar)", "Bairgania", "Baisi", "Bajpatti", "Bakhri",
    "Bakhtiarpur Rural", "Bakhtiyarpur", "Ballia (Bihar)", "Baniapur", "Banka", "Barachatti",
    "Barahara", "Barahat", "Barahiya", "Barauli", "Barbigha", "Barh",
    "Barhara Kothi", "Barharia", "Barhat", "Bariarpur", "Barun", "Baunsi",
    "Begusarai", "Belaganj", "Belhar", "Belsand", "Ben", "Benipatti",
    "Bettiah", "Bhabhua Sadar", "Bhabua", "Bhagalpur", "Bhagwanpur (Vaishali)", "Bhargama",
    "Bhelwa", "Bhojpur Rural", "Bidupur", "Bihta", "Bihta Rural", "Bikram",
    "Bikramganj", "Bikramganj Rural", "Bind", "Biraul", "Birpur Border", "Bisfi",
    "Bochahan", "Bodh Gaya", "Bounsi", "Brahmpur", "Buxar", "Chainpur",
    "Chakai", "Chakia", "Chakia Rural", "Chanan", "Chand", "Chandi",
    "Chanpatia", "Chanpatia Rural", "Chapra (Saran)", "Chenari", "Cheria Bariarpur", "Chewara",
    "Chhatapur", "Chhauradano", "Chhaurahi", "Colgong", "Dalsinghsarai", "Dalsinghsarai Rural",
    "Danapur", "Darauli", "Darbhanga", "Daudnagar", "Daulatpur", "Dehri-on-Sone",
    "Desri", "Dhaka", "Dharhara", "Dhoraiya", "Dighwara", "Dighwara Rural",
    "Dinara", "Dumaria", "Dumra", "Dumraon", "Ekangarsarai", "Ekma",
    "Fatehpur (Gaya)", "Fatuha", "Forbesganj", "Gamhariya", "Garkha", "Garkha Dehat",
    "Gaunaha", "Gaya", "Ghanshyampur", "Ghat Kusumbha", "Ghorasahan", "Gidhaur",
    "Giriyak", "Goh", "Gopalganj", "Goraul", "Govindpur", "Gurua",
    "Harlakhi", "Harnaut", "Hasanpur", "Hasanpur Rural", "Hathua", "Haveli Kharagpur",
    "Hayaghat", "Hilsa", "Hisua", "Imamganj", "Islampur", "Itarhi",
    "Jagdishpur (Bhagalpur)", "Jagdishpur (Bhojpur)", "Jagdishpur Dehat", "Jainagar", "Jalalpur", "Jale",
    "Jamalpur", "Jamui", "Jandaha", "Janta Bazar", "Jehanabad", "Jhajha",
    "Jhanjharpur", "Jogbani", "Kahalgaon", "Kahalgaon Rural", "Kalyanpur (East Champaran)", "Kalyanpur (Samastipur)",
    "Kanti Rural", "Karakat", "Karakat Rural", "Kargahar", "Kasba", "Kasmar",
    "Katihar", "Katoria", "Katra (Muzaffarpur)", "Keoti", "Kesaria", "Khagaria",
    "Khagaul", "Khaira", "Khajauli", "Khanpur", "Kishanganj", "Kochar",
    "Kochas", "Koilwar", "Korha", "Kuchaikote", "Kurhani", "Kusheshwar Asthan",
    "Ladania", "Lakhisarai", "Lalganj", "Laukaha", "Lauriya", "Madhepur",
    "Madhepura", "Madhuban", "Madhuban Dehat", "Madhubani", "Maharajganj (Bihar)", "Mahua",
    "Mahua Rural", "Mairwa", "Majhaulia", "Majorganj", "Maker", "Makhdumpur",
    "Maner", "Maner Sharif", "Manihari", "Manjhi", "Marhaura", "Marhaura Rural",
    "Marwan", "Masaurhi", "Masaurhi Rural", "Mehandar", "Mehsi", "Minapur",
    "Mirganj", "Mohania", "Mohanpur", "Mokama", "Morwa", "Motihari",
    "Munger", "Mushahari", "Muzaffarpur", "Nabinagar", "Nagar Untari", "Nalanda",
    "Nanpur", "Narkatiaganj", "Narkatiaganj Rural", "Nathnagar", "Naubatpur", "Nautan",
    "Nawada", "Nawanagar", "Nirmali", "Nokha", "Obra", "Paharpur",
    "Pakribarawan", "Pakridayal", "Pandaul", "Parihar", "Paroo", "Parsa",
    "Parsa Bazar", "Patahi", "Patepur", "Patna", "Patna Airport", "Patna City",
    "Patori", "Phulparas", "Phulwari Sharif", "Pipariya", "Pipra", "Piprakothi",
    "Piro", "Pirpainti", "Pratapganj", "Pupri", "Purnia", "Rafiganj",
    "Raghopur", "Raghopur Diyara", "Raghunathpur", "Rajauli", "Rajaun", "Rajgir",
    "Rajnagar (Madhubani)", "Rajpur", "Ramgarh (Bihar)", "Ramgarh Chowk", "Ramnagar (Bihar)", "Raniganj",
    "Raxaul", "Revelganj", "Riga", "Rivilganj", "Rosera", "Rosera Rural",
    "Runi Saidpur", "Sabour", "Saharsa", "Sahdai Buzurg", "Sahebganj", "Sakaldiha",
    "Samastipur", "Samho", "Sandesh", "Sangrampur", "Sarairanjan", "Saraiya",
    "Sarath", "Sarmera", "Sasaram", "Shahkund", "Shahpur (Bhojpur)", "Shahpur Patori",
    "Sheikhopur Sarai", "Sheikhpura", "Shekhopur", "Sheohar", "Sherghati", "Sherghati Rural",
    "Shikarpur", "Shivaji Nagar", "Shivala", "Sidhwalia", "Sikandra", "Sikta",
    "Silao", "Silao Rural", "Simri", "Simri Bakhtiarpur", "Singhia", "Siswan",
    "Sitamarhi", "Siwan", "Sonbarsa", "Sonepur", "Sonho", "Sono",
    "Sugauli", "Sugauli Dehat", "Sultanganj", "Supaul", "Sursand", "Sursand Border",
    "Suryagarha", "Tajpur", "Taraiya", "Tarapur", "Tarari", "Teghra",
    "Tekari", "Tekari Rural", "Thakurganj", "Triveniganj", "Ujiarpur", "Vaishali",
    "Vidyapati Nagar", "Warisaliganj Dehat", "Warisnagar", "Warsaliganj", "Wazirganj (Gaya)"
  ],
  "Delhi NCR": [
    "Abul Fazal Enclave", "Abul Fazal Part 2", "Ahinsa Sthal", "Akshardham Mandir", "Ali Village", "Alipur",
    "Alipur Garhi", "Anand Parbat", "Anand Vihar", "Apsara Border", "Arjan Garh", "Ashok Nagar",
    "Ashok Vihar", "Ashram Chowk", "Asiad Village", "Aya Nagar", "Azadpur", "Azadpur Mandi",
    "Badarpur", "Badarpur Border", "Badarpur Mehrauli Road", "Badli", "Badli Industrial Area", "Badli Village",
    "Bakhtawarpur", "Bakhtawarpur Village", "Bakkarwala", "Baljit Nagar", "Bankner", "Bapa Nagar",
    "Baprola", "Barakhamba Road", "Barwala (Delhi)", "Bawana", "Bawana Industrial Area", "Bawana JJ",
    "Bawana Village", "Begumpur", "Begumpur Extension", "Begumpur Village", "Ber Sarai", "Bhagirath Palace",
    "Bhalswa Dairy", "Bhalswa Jahangirpuri", "Bhalswa Lake", "Bharat Nagar", "Bhati Mines", "Bhikaji Cama Place",
    "Bijwasan", "Bijwasan Border", "Bijwasan Village", "Bindapur", "Brahmpuri", "Brij Vihar (Ghaziabad)",
    "Burari", "Burari Kaushik Enclave", "Burari Sant Nagar", "Central Secretariat", "Chanakyapuri", "Chander Nagar",
    "Chandni Chowk", "Chandpur", "Chawla", "Chawri Bazar", "Chhatarpur", "Chhatarpur Enclave",
    "Chhatarpur Extension", "Chhattarpur Mandir", "Chhawla Camp", "Chirag Dilli", "Civil Lines", "Civil Lines Metro",
    "Connaught Place", "Crossings Republik (Ghaziabad)", "Dadri (Greater Noida)", "Dankaur (Greater Noida)", "Daryaganj", "Daryaganj Heritage",
    "Daryapur Kalan", "Dasna (Ghaziabad)", "Daulatpur (Delhi)", "Dayalpur", "Defence Colony", "Delhi Airport (IGI T1)",
    "Delhi Airport (IGI T2)", "Delhi Airport (IGI T3)", "Delhi Cantonment", "Delhi Cantt", "Delhi Gate", "Delhi High Court Area",
    "Delhi University North Campus", "Delhi University South Campus", "Deoli", "Deorala", "Dera Mandi", "Dhansa",
    "Dhansa Border", "Dhaula Kuan", "Dichaon Kalan", "Dilshad Colony", "Dilshad Garden", "Dujana (Greater Noida)",
    "Dwarka Mor", "Dwarka Sector 1", "Dwarka Sector 10", "Dwarka Sector 12", "Dwarka Sector 14", "Dwarka Sector 19",
    "Dwarka Sector 21", "Dwarka Sector 23", "Dwarka Sector 6", "Dwarka Sector 8", "East Patel Nagar", "East Vinod Nagar",
    "Faridabad Ballabhgarh", "Faridabad Greenfield", "Faridabad NIT", "Faridabad Old", "Faridabad Sector 15", "Faridabad Sector 16",
    "Faridabad Sector 21", "Faridabad Surajkund", "Fatehpur Beri", "Friends Colony", "Gagan Vihar", "Gandhi Nagar",
    "Garhi Harsaru (NCR)", "Garhmukteshwar Border (NCR)", "Gaur City (Greater Noida West)", "Gautam Nagar", "Geeta Colony", "Ghaziabad Crossings",
    "Ghaziabad Govindpuram", "Ghaziabad Indirapuram", "Ghaziabad Kavi Nagar", "Ghaziabad Loni", "Ghaziabad Masuri HQ", "Ghaziabad Mohan Nagar",
    "Ghaziabad Morta", "Ghaziabad Muradnagar", "Ghaziabad Pratap Vihar", "Ghaziabad Raj Nagar Ext", "Ghaziabad Sahibabad", "Ghaziabad Shastri Nagar",
    "Ghaziabad Surya Nagar", "Ghaziabad Vaishali", "Ghaziabad Vasundhara", "Ghaziabad Vijay Nagar", "Ghazipur Mandi", "Ghevra",
    "Ghitorni", "Ghitorni Extension", "Ghitorni Village", "Ghonda", "Goela Khurd", "Gokalpur",
    "Gokalpuri Village", "Govindpuri", "Govindpuri Extension", "Greater Kailash 1", "Greater Kailash 2", "Greater Kailash Enclave",
    "Greater Noida Alpha 1", "Greater Noida Alpha 2", "Greater Noida Beta 1", "Greater Noida Beta 2", "Greater Noida Delta 1", "Greater Noida Delta 2",
    "Greater Noida Ecotech", "Greater Noida Gamma 1", "Greater Noida Gamma 2", "Greater Noida Knowledge Park 1", "Greater Noida Knowledge Park 2", "Greater Noida Knowledge Park 3",
    "Greater Noida Omicron 1", "Greater Noida Pari Chowk", "Greater Noida Surajpur", "Greater Noida Zeta", "Green Park", "Green Park Extension",
    "GTB Enclave", "GTB Nagar", "Gulabi Bagh", "Gurugram Ardee City", "Gurugram Badshahpur", "Gurugram Cyber City",
    "Gurugram DLF Phase 1", "Gurugram DLF Phase 2", "Gurugram DLF Phase 3", "Gurugram DLF Phase 4", "Gurugram DLF Phase 5", "Gurugram Golf Course Ext",
    "Gurugram Golf Course Road", "Gurugram IMT Manesar", "Gurugram MG Road", "Gurugram Nirvana Country", "Gurugram Palam Vihar", "Gurugram Sector 14",
    "Gurugram Sector 29", "Gurugram Sector 31", "Gurugram Sector 43", "Gurugram Sector 48", "Gurugram Sector 54", "Gurugram Sector 56",
    "Gurugram Sohna Road", "Gurugram South City", "Gurugram Sushant Lok", "Haiderpur", "Hari Nagar", "Hastsal",
    "Hastsal Village", "Hauz Khas", "Hauz Khas Enclave", "Hauz Khas Village", "Holambi Kalan", "Holambi Khurd",
    "Inderlok", "Inderpuri", "India Gate", "IP Extension", "Issapur", "ITO Delhi",
    "Jafarpur", "Jaffarpur Kalan", "Jahangirpuri", "Jaitpur", "Jaitpur Extension", "Jaitpur Khurd",
    "Jamia Nagar", "Janakpuri", "Janakpuri District Centre", "Jangpura", "Jangpura Extension", "Jasola",
    "Jasola Vihar", "Jewar (Noida Airport)", "Jhandewalan", "Jharoda Dairy", "Jharoda Kalan", "Jharoda Majra",
    "Jhilmil", "Jhilmil Industrial Area", "Jor Bagh", "Kadipur", "Kailash Colony", "Kakrola",
    "Kakrola Village", "Kalindi Kunj", "Kalkaji", "Kalkaji Mandir", "Kalyanpuri", "Kamla Nagar",
    "Kanganheri", "Kanjhawala", "Kanjhawala Industrial", "Kanjhawala Village", "Kapashera", "Kapashera Border",
    "Kapashera Extension", "Kapriwas", "Karawal Nagar", "Karawal Nagar West", "Karkardooma Village", "Karol Bagh",
    "Kashmere Gate", "Kashmere Gate ISBT", "Kasna (Greater Noida)", "Katwaria Sarai", "Kaushambi (NCR)", "Keshopur",
    "Khan Market", "Khanpur", "Khel Gaon", "Khera Dabar", "Khera Kalan", "Khera Khurd",
    "Khirki Extension", "Khirki Village", "Kingsway Camp", "Kirari Extension", "Kirari Suleman Nagar", "Kirti Nagar",
    "Kirti Nagar Industrial Area", "Kondli", "Kotla Mubarakpur", "Krishna Nagar", "Kundli (NCR Border)", "Lado Sarai",
    "Lajpat Nagar 1", "Lajpat Nagar 2", "Lajpat Nagar 3", "Lajpat Nagar 4", "Lawrence Road", "Laxmi Nagar",
    "Libaspur", "Lodhi Colony", "Lodhi Estate", "Loni (Ghaziabad)", "Loni Border", "Madangir",
    "Madhu Vihar", "Maharani Bagh", "Mahipalpur", "Mahipalpur Extension", "Mahipalpur Vasant Kunj Road", "Malikpur",
    "Malviya Nagar", "Mandawali", "Mandi House", "Mandi Village", "Manglapuri", "Mangolpuri",
    "Mangolpuri Phase 1", "Mansarovar Garden", "Masoodpur", "Matiala", "Mayapuri", "Mayapuri Industrial Area",
    "Mayur Vihar Extension", "Mayur Vihar Phase 1", "Mayur Vihar Phase 2", "Mayur Vihar Phase 3", "Mehrauli", "Mehrauli Archaeological Park",
    "Mehrauli Village", "Minto Road", "Mithapur", "Model Town 1", "Model Town 2", "Model Town 3",
    "Modinagar (NCR)", "Mohan Cooperative", "Molarband", "Mori Gate", "Moti Bagh", "Moti Nagar",
    "Mukherjee Nagar", "Mukhmelpur", "Mundka", "Mundka Industrial Area", "Mundka Metro", "Mundka Village",
    "Munirka", "Muradnagar (NCR)", "Najafgarh", "Najafgarh Dichaon Kalan", "Nangal Dewat", "Nangli Sakrawati",
    "Nangloi", "Nangloi Jat", "Naraina", "Naraina Industrial Area", "Naraina Vihar", "Narela",
    "Narela Industrial Area", "Nauroji Nagar", "Neb Sarai", "Neeti Bagh", "Nehru Place", "New Ashok Nagar",
    "New Delhi Railway Station", "New Friends Colony", "New Moti Nagar", "New Rajinder Nagar", "Nirman Vihar", "Nithari",
    "Nizamuddin East", "Nizamuddin Railway Station", "Nizamuddin West", "Noida City Centre", "Noida Electronic City", "Noida Extension",
    "Noida Golf Course", "Noida Sector 128", "Noida Sector 137", "Noida Sector 142", "Noida Sector 15", "Noida Sector 150 Sports City",
    "Noida Sector 16", "Noida Sector 18 (Atta Market)", "Noida Sector 37", "Noida Sector 50", "Noida Sector 62", "Noida Sector 62 Metro Hub",
    "Noida Sector 76", "Noida Sector 93 Grand Omaxe", "Okhla Bird Sanctuary", "Okhla Industrial Area", "Okhla Phase 1", "Okhla Phase 2",
    "Okhla Phase 3", "Old Delhi Railway Station", "Old Rajinder Nagar", "Pahar Ganj", "Palam", "Palam Colony",
    "Palam Village", "Palla", "Pandav Nagar", "Pankha Road", "Paschim Vihar", "Paschim Vihar West",
    "Patel Nagar", "Patel Nagar East", "Patel Nagar West", "Patparganj", "Patparganj Industrial Area", "Pilkhuwa (NCR)",
    "Pitampura", "Pooth Kalan", "Pooth Khurd", "Pragati Maidan", "Pratap Nagar", "Preet Vihar",
    "Pul Prahladpur", "Punjabi Bagh", "Punjabi Bagh Club Road", "Punjabi Bagh West", "Pusa Road", "Qutub Minar Complex",
    "Qutubgarh", "R.K. Puram", "Raja Garden", "Rajendra Place", "Rajokri", "Rajouri Garden",
    "Ramesh Nagar", "Rangpuri", "Rani Bagh", "Rithala", "Rithala Metro", "Rohini Sector 1",
    "Rohini Sector 11", "Rohini Sector 16", "Rohini Sector 24", "Rohini Sector 3", "Rohini Sector 7", "Rohini Sector 8",
    "Rohini Sector 9", "Roop Nagar", "Saboli", "Sadhu Vaswani Marg", "Safdarjung Enclave", "Safdarjung Tomb Area",
    "Sahibabad Industrial Area", "Sainik Farm East", "Saket", "Saket District Centre", "Samalka", "Sangam Vihar",
    "Sanoth", "Sarai Kale Khan ISBT", "Sarai Rohilla Railway Station", "Saraswati Vihar", "Sarita Vihar", "Sarita Vihar Pocket A",
    "Sarojini Nagar", "Sarojini Nagar Market", "Satya Niketan", "Shahbad Daulatpur", "Shahdara", "Shahdara Metro Hub",
    "Shahpur Jat", "Shakur Basti", "Shakurpur", "Shakurpur Village", "Shalimar Bagh", "Shalimar Bagh Club Road",
    "Shanti Niketan", "Shastri Nagar", "Shastri Park", "Sheikh Sarai", "Siraspur", "Siri Fort",
    "South Extension 1", "South Extension 2", "Subhash Nagar", "Sukhdev Vihar", "Sultanpur Majra", "Sultanpur Village",
    "Sunder Nagar", "Surajpur Industrial Area", "Tagore Garden", "Tajpur Kalan", "Tekhand", "Tikri Border",
    "Tikri Kalan", "Tikri Kalan Border", "Tilak Marg", "Tilak Nagar", "Tilak Nagar Metro", "Tilangpur Kotla",
    "Timarpur", "Tis Hazari", "Trilokpuri", "Tughlakabad", "Tughlakabad Fort Area", "Ujwa",
    "Uttam Nagar", "Uttam Nagar East", "Uttam Nagar West", "Vasant Enclave", "Vasant Kunj", "Vasant Kunj Institutional",
    "Vasant Kunj Mall Area", "Vasant Vihar", "Vasant Vihar Enclave", "Vasundhara Enclave", "Vasundhara Sector 14", "Vikas Marg",
    "Vikas Puri", "Vinod Nagar East", "Vinod Nagar West", "Vishnu Garden", "Vivek Vihar", "Wazirabad",
    "Wazirpur", "Wazirpur Industrial Area", "Yamuna Sports Complex", "Yamuna Vihar", "Yamuna Vihar C Block", "Yusuf Sarai",
    "Zakhira", "Zakir Nagar"
  ],
  "Goa": [
    "Agassaim", "Agonda", "Agonda Beach", "Aguada", "Aldona", "Amona",
    "Anjuna", "Aquem", "Arambol", "Arambol Sweet Water Lake", "Arpora", "Arpora Night Market",
    "Arpora Village", "Ashwem Beach", "Assagao", "Assagao Badem", "Assolna", "Baga",
    "Bambolim", "Bambolim Beach", "Batim", "Benaulim", "Betalbatim", "Betul",
    "Betul Fort", "Bhati", "Bicholim", "Calangute", "Camurlim", "Canacona",
    "Canaguinim", "Candolim", "Candolim Beach Road", "Cansaulim", "Caranzalem", "Carmona",
    "Carmona Beach", "Cavelossim", "Chapora", "Chapora Fort Area", "Chicalim", "Chinchinim",
    "Chorao", "Cola Beach", "Collem", "Colva", "Colva Beach Road", "Corlim",
    "Cortalim", "Curca", "Curchorem", "Dabolim (Goa Airport)", "Davorlim", "Davorlim Margao",
    "Dona Paula", "Galgibaga", "Goa Velha", "Guirim", "Guirim Cross", "Keri Beach",
    "Loutolim", "Majorda", "Majorda Beach", "Majorda Railway Station", "Mandrem", "Mapusa",
    "Marcaim", "Margao (Madgaon)", "Marna", "Miramar", "Moira", "Mopa (Goa Airport)",
    "Morjim", "Morjim Ashwem Link", "Morjim Turtle Beach", "Nachinola", "Nagoa", "Nagoa Arpora",
    "Navelim", "Nerul", "Nerul Riverfront", "Nuvem", "Nuvem Bypass", "Olaulim",
    "Old Goa", "Pale", "Panaji", "Parra", "Pernem", "Pomburpa",
    "Ponda", "Porvorim", "Quepem", "Raia", "Raia Santxamol", "Raia Village",
    "Reis Magos", "Rivona", "Saligao", "Saligao Church", "Salvador do Mundo", "Sanguem",
    "Sanquelim", "Santa Cruz (Goa)", "Sanvordem", "Sernabatim", "Sinquerim", "Sinquerim Beach",
    "Siolim", "Siridao", "Socorro", "Taleigao", "Tivim", "Ucassaim",
    "Usgao", "Utorda", "Vagator", "Valpoi", "Varca", "Varca Beach Road",
    "Vasco da Gama", "Velim", "Velsao"
  ],
  "Gujarat": [
    "Ahmedabad", "Ahmedabad Airport", "Ahmedabad Ashram Road", "Ahmedabad Bopal", "Ahmedabad CG Road", "Ahmedabad Chandkheda",
    "Ahmedabad Gandhinagar Link", "Ahmedabad Maninagar", "Ahmedabad Naroda", "Ahmedabad Navrangpura", "Ahmedabad Paldi", "Ahmedabad Prahlad Nagar",
    "Ahmedabad SG Highway", "Ahmedabad Thaltej", "Ahmedabad Vastrapur", "Ambaji Temple Road", "Amod", "Amreli",
    "Amreli Rural", "Anand", "Anjar Kutch", "Anklav", "Ankleshwar", "Babra",
    "Balasinor", "Bardoli", "Bardoli Rural", "Bavla", "Bayad", "Bechraji",
    "Bhadran", "Bhanvad", "Bharuch", "Bhavnagar", "Bhuj", "Bilimora",
    "Borsad", "Botad", "Chanasma", "Chhota Udaipur", "Chikhli (Navsari)", "Dabhoi Rural",
    "Dahej", "Dahej Port", "Dahej SEZ", "Dahod", "Dakor Temple Town", "Daman Border (GJ)",
    "Danta", "Deesa", "Deesa Rural", "Dehgam", "Devgadh Baria", "Dhanera",
    "Dholera", "Dholka", "Dhrangadhra", "Dwarka", "Dwarka Bet", "Gadhada",
    "Gandevi", "Gandevi Bilimora", "Gandhidham", "Gandhinagar", "Gandhinagar GIFT City", "Gandhinagar Infocity",
    "Garbada", "Gariadhar", "Ghogha", "Godhra", "Gondal", "Gondal Rural",
    "Halol", "Halol Industrial", "Harij", "Himatnagar", "Idar", "Idar Hill Town",
    "Jambusar", "Jambusar Port", "Jamnagar", "Jasdan", "Jetpur", "Jetpur (Rajkot)",
    "Jhagadia", "Jodiya", "Junagadh", "Kadi", "Kadi Industrial", "Kalol",
    "Kalol (Gandhinagar)", "Kaloor", "Kamrej", "Kapadvanj", "Karjan", "Kathor",
    "Kawant", "Keshod", "Khambhat", "Khedbrahma", "Kheralu", "Kodinar",
    "Kotda Sangani", "Kutiyana", "Lakhpat", "Lathi", "Limbdi", "Lunawada",
    "Mahuva", "Mahuva Port", "Malpur", "Manavadar", "Mandvi (Kutch)", "Mandvi Beach (Kutch)",
    "Mansa", "Meghraj", "Mehsana", "Mithapur", "Modasa", "Morbi",
    "Morva Hadaf", "Mundra", "Mundra Port", "Nadiad", "Nakhatrana", "Navsari",
    "Olpad", "Padra", "Padra Vadodara", "Palanpur", "Palitana", "Patan",
    "Petlad", "Porbandar", "Prantij", "Radhanpur", "Rajkot", "Rajkot Kalawad Road",
    "Rajpipla", "Sanand", "Sanand Industrial", "Santrampur", "Savli", "Sayan",
    "Sayla", "Shehra", "Shinor", "Siddhpur", "Sihor", "Sojitra",
    "Somnath", "Songadh Fort", "Surat", "Surat Adajan", "Surat Dumas", "Surat Ring Road",
    "Surat Textile Market", "Surat Varachha", "Surendranagar", "Sutrapada", "Talaja", "Talala (Gir)",
    "Taranga Hill", "Thara", "Tharad", "Tilakwada", "Umargam", "Una",
    "Una (Gir)", "Unjha", "Upleta", "Vadali", "Vadnagar", "Vadodara",
    "Vadodara Airport", "Vadodara Alkapuri", "Vadodara Fatehgunj", "Vadodara Makarpura", "Vadodara Sayajigunj", "Vaghodia",
    "Vallabh Vidyanagar", "Vallabh Vidyanagar Anand", "Valsad", "Vansda", "Vapi", "Vav",
    "Veraval", "Vijapur", "Viramgam", "Virpur (Jalaram)", "Visnagar", "Vyara",
    "Vyara Tapi", "Wadhwan", "Wankaner"
  ],
  "Haryana": [
    "Adampur", "Agroha", "Ahar", "Ahirka", "Alahar", "Alewa",
    "Alika", "Ambala", "Ambala Cantt", "Ambala City", "Arya Nagar", "Assandh",
    "Assandh Rural", "Ateli", "Babain", "Babarpur (HR)", "Badalpur", "Badhra",
    "Badhra Rural", "Badkhal", "Badli", "Badli Jhajjar", "Badopal", "Bahadurgarh",
    "Bahin", "Bahin Hathin", "Ballabhgarh", "Bangu", "Bapauli", "Bapoli",
    "Baragudha", "Barara", "Barara Rural", "Baraut Border (HR)", "Barhi Industrial", "Baroda",
    "Barwala", "Barwala (Hisar)", "Barwala Hisar", "Bass", "Bass Hansi", "Bassan",
    "Bata", "Baund Kalan", "Bawal", "Bawal IMT", "Bawal Industrial", "Bawani Khera",
    "Behal", "Beri", "Beri Jhajjar", "Beri Town", "Bhadas", "Bhagwanpur (HR)",
    "Bhagwi", "Bhalaut", "Bhattu Kalan", "Bheni Chanderpal", "Bhirrana", "Bhiwani",
    "Bhiwani Khera", "Bhondsi", "Bhudana", "Bhuna", "Bhurkalan", "Bilaspur (HR)",
    "Bilaspur Gurgaon", "Bilaspur Yamunanagar", "Bir Ghaggar", "Bir Sikargah", "Chandi Mandir", "Charkhi",
    "Charkhi Dadri", "Charkhi Dadri Rural", "Cheeka", "Chhachhrauli", "Chhachhrauli Rural", "Chhapar",
    "Chhara", "Chhuchhakwas", "Dabra", "Dabwali", "Dabwali Mandi", "Dahina",
    "Dahina Jatusana", "Dhand", "Dharuhera", "Dharuhera Industrial Hub", "Dhatir", "Dighal",
    "Ding", "Dubaldhan", "Ellenabad", "Farakhpur", "Faridabad", "Faridabad Ballabhgarh",
    "Faridabad NIT", "Faridabad Old", "Faridabad Sector 15", "Farrukhnagar", "Farrukhnagar Rural", "Fatehabad",
    "Ferozepur Jhirka", "Gajuwala", "Ganaur", "Ganaur GT Road", "Ganaur Mandi", "Ganaur Rural",
    "Garhi Sampla", "Gharaunda", "Gharaunda Highway", "Ghirai", "Ghirau", "Gohana",
    "Gohana City", "Gohana Rural", "Gohana Subcity", "Guhla", "Guhla Cheeka", "Gurugram",
    "Gurugram Badshahpur", "Gurugram Cyber City", "Gurugram DLF Phase 1", "Gurugram DLF Phase 5", "Gurugram Golf Course Ext", "Gurugram Golf Course Road",
    "Gurugram IMT Manesar", "Gurugram MG Road", "Gurugram Palam Vihar", "Gurugram Sector 14", "Gurugram Sector 29", "Gurugram Sector 48",
    "Gurugram Sector 56", "Gurugram Sohna Road", "Haily Mandi", "Hansi", "Hansi Rural", "Hasanpur",
    "Hasanpur Mewat", "Hathin", "Hathin Rural", "Hisar", "Hisar Cantt", "Hisar Textile Hub",
    "Hodal", "Hodal Rural", "Indri", "Indri Karnal", "Indri Rural", "Indri Subcity",
    "Indus Industrial Corridor", "Ismailabad", "Israna", "Israna Textile Hub", "Jabalpur Link", "Jagadhri",
    "Jakhal", "Jakhal Mandi", "Jakhod Khera", "Jansui", "Jatusana", "Jatusana Rewari",
    "Jhajjar", "Jhajjar Road", "Jhansa", "Jind", "Jind Cantt", "Julana",
    "Jundla", "Kaithal", "Kalanaur", "Kalanaur Rohtak", "Kalanwali", "Kalanwali Mandi",
    "Kalayat", "Kalka", "Kalka Cantt", "Kalka Pinjore", "Kanina", "Kanina Mandi",
    "Karnal", "Karnal Smart City", "Kathura", "Kharak Kalan", "Kharkhoda", "Kharkhoda IMT",
    "Khol", "Khol Rewari", "Kosli", "Kosli Rural", "Kundli", "Kundli Industrial",
    "Kundli Industrial Area", "Kurukshetra", "Kurukshetra University Area", "Ladwa", "Ladwa Rural", "Lakhan Majra",
    "Loharu", "Loharu Fort Town", "Loharu Subcity", "Machhrauli", "Madhuban", "Madhuban Police Academy",
    "Madina", "Madlauda", "Maham", "Mahendragarh", "Mandi Dabwali", "Manesar",
    "Manesar Industrial", "Manesar Maruti Hub", "Mangali", "Matanhail", "Matanhail Jhajjar", "Mattanhail",
    "Mayyer", "Meham", "Mirchpur", "Mullana", "Mullana University Area", "Mundlana",
    "Murthal", "Mustafabad", "Naggal", "Naggal Ambala", "Nagina", "Nangal Chaudhry",
    "Naraingarh", "Naraingarh Ambala", "Narnaul", "Narnaund", "Narwana", "Nigdu",
    "Nilokheri", "Nissing", "Nissing Karnal", "Nuh", "Nuh Mewat", "Odhan",
    "Palwal", "Palwal Bypass", "Panchkula", "Panchkula MDC", "Panchkula Sector 5", "Panipat",
    "Panipat Textile Hub", "Pataudi", "Pataudi Palace Area", "Pehowa", "Pehowa Teerth", "Pillukhera",
    "Pingwan", "Pinjore", "Pinjore Garden", "Pinjore Gardens", "Prithla", "Prithla Industrial Hub",
    "Prithla Palwal", "Pundri", "Punhana", "Punhana Mewat", "Radaur", "Radaur Yamunanagar",
    "Rai", "Raipur Rani", "Raipur Rani Panchkula", "Rajound", "Rampura", "Rania",
    "Rania Sirsa", "Ratia", "Ratia Fatehabad", "Raya", "Rewari", "Rewari Brass Market",
    "Rohtak", "Rohtak PGI Hub", "Rojka Meo", "Sadhaura", "Safidon", "Saha",
    "Saha Ambala", "Salhawas", "Salwan", "Samalkha", "Samalkha Panipat", "Sampla",
    "Sampla Rohtak", "Sandhai", "Sanoli", "Sarsod", "Satnali", "Sehlang",
    "Shahabad Markanda", "Shahbad", "Shahbad Dairy", "Shahbad Markanda", "Sikanderpur", "Siwan",
    "Siwani", "Siwani Bhiwani", "Siwani Mandi", "Sohna", "Sohna Damdama Lake", "Sohna Road Badshahpur",
    "Sohna Rural", "Sonipat", "Sonipat DCRUST", "Taoru", "Taoru Mewat", "Taraori",
    "Taraori Rice Hub", "Tatarpur", "Tauru", "Tigaon", "Tigaon Faridabad", "Tohana",
    "Tohana Mandi", "Tosham", "Tosham Hills", "Uchana", "Uchana Jind", "Uchana Kalan",
    "Ugrakheri", "Uklana", "Uklana Mandi", "Uklanamandi", "Uncha Majra", "Unchagaon",
    "Yamunanagar", "Yamunanagar Jagadhri Twin City", "Zirakpur Border"
  ],
  "Himachal Pradesh": [
    "Amb", "Amb Una", "Andretta", "Anni", "Arki", "Arki Fort Area",
    "Baddi", "Baddi Industrial", "Baddi Industrial Hub", "Baghi", "Baijnath", "Baijnath (HP)",
    "Bajoura", "Bakloh", "Banjar", "Barmana", "Barmana Cement Works", "Barog",
    "Barog Tunnel Area", "Barot", "Barot Valley", "Bathri", "Bharmour Tribal Hub", "Bhuntar",
    "Bhunter Airport", "Bijli Mahadev Base", "Bilaspur (HP)", "Bilaspur Sadar", "Bir", "Bir Billing (Paragliding Hub)",
    "Chail", "Chail Palace Area", "Chamba", "Chamba Town", "Chaupal", "Chindi",
    "Chintpurni", "Chirgaon", "Chitkul", "Chopal", "Chowari", "Churah Valley",
    "Dadahu", "Dadahu Renuka", "Dagshai", "Dalhousie", "Dalhousie Cantonment", "Dalhousie Khajjiar Road",
    "Darlaghat", "Daulatpur", "Dehra Gopipur", "Dharamkot", "Dharampur", "Dharampur (Solan)",
    "Dharamshala", "Dharamshala Cricket Stadium", "Dhaula Kuan (HP)", "Doon Valley", "Gagal Airport", "Gagret",
    "Gagret Una", "Ghumarwin", "Ghumarwin Bilaspur", "Gohar", "Hamirpur (HP)", "Haripurdhar",
    "Haroli", "Indora", "Jaisinghpur", "Janjehli", "Janjehli Valley", "Jawala Mukhi",
    "Jawalamukhi", "Jawali", "Jawali Kangra", "Jeevan Nagar", "Jibhi", "Joginder Nagar",
    "Jogindernagar", "Jogindernagar Valley", "Jubbal", "Kalpa", "Kamru", "Kandaghat",
    "Kangra", "Kangra Fort Area", "Kangra Temple", "Karsog", "Kasauli", "Kasauli Mall",
    "Kasauli Mall Road", "Kasol", "Kaza", "Kaza Spiti", "Keylong", "Keylong Lahaul",
    "Khajjiar", "Kotgarh Apple Belt", "Kotkhai", "Kotla", "Kufri", "Kufri Fun World",
    "Kullu", "Kullu Valley", "Kumarhatti", "Kumarsain", "Kupvi", "Lad Bharol",
    "Ladbharol", "Larji", "Manali", "Manali Mall Road", "Manali Old", "Manali Old Town",
    "Manali Solang Valley", "Mandi", "Manikaran Sahib", "Mashobra", "Mashobra Green", "McLeod Ganj",
    "Mehatpur", "Mehatpur (HP)", "Mehatpur Industrial", "Moorang", "Nadaun", "Naggar",
    "Naggar Castle", "Nahan", "Naina Devi", "Naina Devi (HP)", "Nalagarh", "Nalagarh Fort",
    "Nalagarh Fort Area", "Narkanda", "Narkanda Peak", "Nirmand", "Nurpur", "Nurpur Fort",
    "Palampur", "Palampur Tea Gardens", "Paonta Sahib", "Paonta Sahib Gurudwara", "Parashar Lake", "Parwanoo",
    "Parwanoo Timber Trail", "Pooh", "Pragpur", "Pragpur Heritage Village", "Rakchham", "Rampur Bushahr",
    "Rampur Bushahr Palace", "Rawalsar", "Reckong Peo", "Recong Peo", "Rewalsar", "Rewalsar Holy Lake",
    "Rewalsar Sacred Lake", "Rohru", "Rohru Pabbar Valley", "Salooni", "Sangla Kinnaur", "Sangla Valley",
    "Sangrah", "Sansarpur Terrace", "Sarahan", "Sarahan Bhimakali", "Sarahan Bhimakali Temple", "Sarkaghat",
    "Seoni (HP)", "Shahpur", "Shahpur (HP)", "Shillai", "Shimla", "Shimla Annandale",
    "Shimla Chotta Shimla", "Shimla Jakhoo Temple", "Shimla Kalka Heritage", "Shimla Mall Road", "Shimla Ridge", "Shimla Sanjauli",
    "Shoghi", "Shoghi Solan", "Shoja", "Solan", "Solan Brewery", "Solang",
    "Spiti Valley", "Sundernagar", "Sundernagar Canal", "Suni", "Tabo", "Tabo Monastery",
    "Tattapani", "Tattapani Hot Springs", "Thanedar Orchards", "Theog", "Tirthan Valley", "Tirthan Valley River",
    "Tissa", "Trilokpur", "Udaipur (Lahaul)", "Udaipur Pattan Valley", "Uhl Valley", "Una",
    "Vashisht", "Vashisht Hot Water Springs"
  ],
  "Jammu & Kashmir": [
    "Achabal", "Achabal Mughal Garden", "Achabal Mughal Gardens", "Aharbal Falls", "Aharbal Waterfall", "Ajas Bandipora",
    "Akhnoor", "Akhnoor Chenab Bank", "Akhnoor Fort", "Amarnath Baltal Camp", "Amarnath Base Baltal", "Amarnath Base Pahalgam",
    "Amarnath Chandanwari Base", "Amarnath Holy Cave", "Anantnag", "Anantnag City", "Aripal", "Aripal Tral",
    "Arnia", "Aru Valley", "Aru Valley Pahalgam", "Awantipora", "Awantipora Ruins", "Badgam",
    "Badgam (Budgam)", "Badgam Charar", "Bahu Fort Jammu", "Baisaran Valley", "Bandipora", "Bandipora Wular",
    "Bandipora Wular Hub", "Banihal", "Banihal Pass", "Banihal Qazigund Tunnel", "Baramulla", "Baramulla Jhelum Bank",
    "Baramulla Riverside", "Basantgarh", "Basantgarh Udhampur", "Basholi", "Basohli", "Basohli Miniature Painting Hub",
    "Basohli Paintings Hub", "Batote", "Batote Highway", "Batote NH44", "Beerwah", "Beerwah Budgam",
    "Betaab Valley", "Betaab Valley Pahalgam", "Bhaderwah", "Bhaderwah Mini Kashmir", "Bhaderwah Valley", "Bijbehara",
    "Billawar", "Bishna", "Bishnah", "Chadoora", "Chandanwari", "Chandanwari Glacier",
    "Charar-i-Sharief", "Charar-i-Sharief Shrine", "Chari Sharief", "Chatpal Valley", "Chenani", "Chenani Nashri Tunnel",
    "Chenani-Nashri Tunnel", "Chuchot", "Dalgate (Srinagar)", "Dalgate Srinagar", "Devsar", "Devsar Kulgam",
    "Dinga Amb", "Doda", "Doda City", "Doda Riverside", "Doodhpathri", "Doodhpathri Meadow",
    "Dras", "Dras Kargil War Memorial", "Dudu", "Dudu Basantgarh", "Ganderbal", "Ganderbal Sindh River",
    "Ghagwal", "Ghagwal Samba", "Gool", "Gool Gulabgarh", "Gulmarg", "Gulmarg Apharwat Peak",
    "Gulmarg Gondola Base", "Gulmarg Gondola Hub", "Gurez Valley", "Gurez Valley Dawar", "Handwara", "Handwara Kupwara",
    "Harwan Garden", "Hiranagar", "Hiranagar Border", "Hiranagar Kathua", "Jammu", "Jammu Airport",
    "Jammu City", "Jammu Raghunath Temple", "Jammu Tawi Station", "Jourian", "Jourian Akhnoor", "Kangan",
    "Kangan Sindh River", "Kangan Sonamarg Route", "Kargil", "Kargil Suru Valley", "Karnah", "Kathua",
    "Kathua Industrial Hub", "Katra (Vaishno Devi)", "Katra Banganga", "Katra Vaishno Devi Base", "Khansahib", "Khansahib Budgam",
    "Khour", "Khour Border", "Khrew", "Khrew Pulwama", "Kishtwar", "Kishtwar Chowgan",
    "Kishtwar Saffron Hub", "Kokernag", "Kokernag Botanical Garden", "Kokernag Springs", "Kud", "Kud Patnitop",
    "Kulgam", "Kulgam Apple Belt", "Kupwara", "Kupwara Border Hub", "Ladakh Khardung La", "Ladakh Leh Town",
    "Ladakh Nubra Valley", "Ladakh Pangong Tso", "Lakhanpur", "Lakhanpur Gateway to JK", "Langate", "Langate Kupwara",
    "Latti", "Leh", "Leh Main Market", "Leh Pangong Lake", "Leh Shanti Stupa", "Lolab Valley",
    "Lolab Valley Kupwara", "Lolab Valley Sogam", "Magam", "Magam Tangmarg Route", "Mahanpur", "Mahanpur Kathua",
    "Majalta", "Majalta Udhampur", "Manasbal Lake", "Mansar Lake Jammu", "Marheen", "Mata Vaishno Devi Shrine",
    "Mendhar", "Moungri", "Moungri Udhampur", "Nagrota", "Nigeen Lake Area", "Nigeen Lake Srinagar",
    "Nobra (Nubra Valley)", "Nowshera", "Nowshera Rajouri", "Pahalgam", "Pahalgam Club", "Pahalgam Valley of Shepherds",
    "Pampore", "Pampore Saffron Fields", "Pampore Saffron Town", "Panchari", "Panchari Hills Udhampur", "Pangong Tso",
    "Patnitop", "Patnitop Circular", "Patnitop Circular Road", "Patnitop Hill Station", "Pattan", "Pattan Baramulla",
    "Peer Ki Gali Mughal Road", "Poonch", "Poonch Border", "Poonch Historic Fort", "Pulwama", "Pulwama City",
    "Pulwama Saffron Hub", "Qaimoh", "Qaimoh Kulgam", "Qazigund", "Qazigund Gate of Kashmir", "Qazigund Gateway",
    "R.S. Pura Indo-Pak Border", "Rajouri", "Rajouri Border City", "Ramban", "Ramban Chenab Bridge", "Ramban Highway Hub",
    "Ramgarh (JK)", "Ramnagar (J&K)", "Ramnagar (JK)", "Ramnagar Udhampur", "Ranbir Singh Pora (R.S. Pura)", "Reasi",
    "Reasi Bhimgarh Fort", "Reasi Chenab Bridge", "Reasi Chenab Rail Bridge Hub", "Reasi Chenab Railway Bridge", "RS Pura", "Samba",
    "Samba Border Town", "Sanasar", "Sanasar Lake", "Sanasar Lake & Paragliding", "Sanat Nagar", "Shankaracharya Hill",
    "Shankaracharya Hill Srinagar", "Shiv Khori Cave Ransoo", "Shopian", "Shopian Apple Bowl", "Sonamarg", "Sonamarg Glacier Base",
    "Sonamarg Meadow of Gold", "Sonamarg Thajiwas Glacier", "Sopore", "Sopore Apple Town", "Srinagar", "Srinagar Boulevard Road",
    "Srinagar Dal Lake", "Srinagar Dal Lake Shikara Hub", "Srinagar Lal Chowk", "Srinagar Nishat Bagh", "Srinagar Pari Mahal", "Srinagar Shalimar Bagh",
    "Sudh Mahadev", "Sudh Mahadev Temple", "Sukrala Mata Billawar", "Sumbal", "Sumbal Sonawari", "Sunderbani",
    "Sunderbani Rajouri", "Surankote", "Surinsar Lake Jammu", "Tangdar", "Tangdar Karnah Valley", "Tangmarg",
    "Tangmarg Gulmarg Base", "Thannamandi", "Thannamandi Rajouri", "Tral", "Tral Forest", "Tral Town",
    "Tsrar-e-Sharief", "Tulian Lake Pahalgam", "Udhampur", "Udhampur Northern Command", "Uri", "Uri Border Town",
    "Vaishno Devi Ardhkuwari", "Vaishno Devi Bhawan", "Vaishno Devi Sanjichhat", "Verinag", "Verinag Jhelum Spring", "Verinag Source of Jhelum",
    "Vijaypur", "Vijaypur AIIMS Hub", "Warwan", "Wular Lake Area", "Wular Lake Bandipora", "Yusmarg",
    "Yusmarg Meadow", "Zanskar", "Zanskar Valley Padum"
  ],
  "Madhya Pradesh": [
    "Agar", "Agar Malwa", "Ajaigarh", "Alirajpur", "Amanganj", "Amarkantak",
    "Amarkantak Narmada Source", "Amarkantak Narmada Udgam", "Amarpatan", "Ambah", "Amla", "Anjad",
    "Anuppur", "Aron", "Ashoknagar", "Ashta", "Ashta Sehore", "Asirgarh Fort",
    "Babai", "Badnagar", "Badnawar", "Badnawar Malwa", "Badwani", "Bagli",
    "Baihar", "Bajna Ratlam", "Bakshwaho", "Bakswaha", "Balaghat", "Balaghat City",
    "Baldeogarh", "Bamore", "Bandhavgarh", "Bandhavgarh Tala Hub", "Bandhavgarh Tiger Gate", "Barela",
    "Barghat", "Bargi Dam", "Bargi Dam Jabalpur", "Barhi", "Barwaha", "Barwani",
    "Barwani City", "Basoda", "Batiyagarh Damoh", "Bawankaja Barwani", "Begamganj", "Beohari",
    "Berasia", "Betul", "Betul Ganj", "Bhabhra", "Bhaderwah (MP)", "Bhander",
    "Bhanpura", "Bhedaghat Dhuandhar", "Bhikangaon", "Bhimbetka Caves", "Bhind", "Bhind Mandi",
    "Bhitwarwar", "Bhopal", "Bhopal Airport", "Bhopal BHEL", "Bhopal Kolar Road", "Bhopal MP Nagar",
    "Bhopal Shahpura", "Bhopal Upper Lake", "Biaora", "Biaora Rajgarh", "Bijawar", "Bina",
    "Birsinghpur", "Burhanpur", "Burhanpur Historic", "Burhanpur Historic Hub", "Chanderi", "Chanderi Handloom City",
    "Chanderi Handloom Hub", "Chhatarpur", "Chhatarpur Khajuraho Hub", "Chhatarpur Rural", "Chhindwara", "Chhindwara City",
    "Chitrakoot (MP Border)", "Chitrakoot Ghats (MP)", "Dabra", "Dabra Gwalior", "Damoh", "Damoh City",
    "Damoh Rural", "Datia", "Datia Peeth", "Deori (Sagar)", "Deori Sagar", "Depalpur",
    "Dewas", "Dewas Chamunda Tekri", "Dhamnod", "Dhar", "Dhar Bhojshala", "Dindori",
    "Gadarwara", "Ganj Basoda", "Garhakota", "Garoth", "Gautampura", "Ghansor",
    "Ghatigaon Gwalior", "Ghatiya", "Gohad", "Gotegaon", "Guna", "Guna Cantt",
    "Gwalior", "Gwalior Cantt", "Gwalior Fort", "Gwalior Morar", "Hanuwantiya Islands", "Harda",
    "Harda Mandi", "Harpalpur", "Hatta", "Hindoria", "Hoshangabad", "Hoshangabad Narmada Ghats",
    "Hoshangabad Narmadapuram", "Hoshangabad Rural", "Ichhawar", "Indore", "Indore AB Road", "Indore Airport",
    "Indore Bypass Hub", "Indore Palasia", "Indore Rajwada", "Indore Vijay Nagar", "Isagarh", "Itarsi",
    "Itarsi Railway Hub", "Jabalpur", "Jabalpur Bhedaghat", "Jabalpur Bhedaghat Link", "Jabalpur Cantt", "Jabalpur Civil Lines",
    "Jabalpur Dhuandhar", "Jaisinghnagar", "Jaora", "Jaora Sugar City", "Jatara", "Jawad",
    "Jhabua", "Jhabua Tribal Hub", "Jobat", "Kailaras", "Kalapipal", "Kanha Kisli Gate",
    "Kanha National Park", "Kannod", "Kareli", "Karera", "Karera Bird Sanctuary", "Kasrawad",
    "Katangi", "Katni", "Katni City", "Khachrod", "Khajuraho", "Khajuraho Western Temples",
    "Khandwa", "Khargone", "Khargone Nimad", "Khategaon", "Khilchipur", "Khirkiya",
    "Khurai", "Kolaras", "Korba Link", "Kotma", "Kukshi", "Kukshi Nimar",
    "Kurwai", "Lahar", "Lakhnadon", "Lateri", "Laundi", "Maheshwar Ahilya Fort",
    "Maihar", "Maihar Sharda Devi", "Malhargarh", "Manasa", "Manawar", "Mandideep",
    "Mandideep Industrial Hub", "Mandla", "Mandla City", "Mandleshwar", "Mandsaur", "Mandu",
    "Mandu Historic Fort", "Mandu Jahaz Mahal", "Mangawan", "Mauganj", "Mehgaon", "Mhow",
    "Mhow Army Cantt", "Mhow Cantonment", "Morena", "Morena Chambal Hub", "Multai", "Multai Tapti Udgam",
    "Mungaoli", "Nagda", "Nagda Industrial", "Nagda Industrial City", "Nagod", "Nainpur",
    "Narsinghgarh", "Narsinghpur", "Narsinghpur City", "Narsinghpur Rural", "Narwar", "Narwar Fort",
    "Nasrullaganj", "Nateran", "Neemuch", "Neemuch Cantt", "Neemuch Mandi", "Niwari",
    "Niwari (MP)", "Niwari Orchha Border", "Nowgong", "Nowgong Chhatarpur", "Obaidullaganj", "Obaidullaganj Sanchi Corridor",
    "Omkareshwar", "Omkareshwar Jyotirlinga", "Orchha", "Orchha Ram Raja Temple", "Pachmarhi", "Pachmarhi Hill Station",
    "Palera", "Panagar", "Pandhana", "Pandhurna", "Pandhurna Orange Hub", "Panna",
    "Panna Diamond City", "Panna Diamond Hub", "Parasia", "Parasia Coal Hub", "Pasan", "Patan (MP)",
    "Patan Jabalpur", "Patur", "Pawai", "Pench National Park", "Pench Turia Gate", "Petlawad",
    "Pichhore", "Pichhore Shivpuri", "Pipariya", "Pipariya (Hoshangabad)", "Pipariya Pachmarhi Gate", "Piro",
    "Pithampur", "Pithampur Auto Cluster", "Pithampur Industrial", "Porsa", "Porsa Morena", "Prithvipur",
    "Raghogarh", "Raghogarh Guna", "Rahatgarh", "Rahatgarh Falls", "Raisen", "Raisen Fort",
    "Raisen Rural", "Rajgarh", "Rajgarh (Biaora)", "Rajgarh Biaora", "Rajnagar", "Rajpur",
    "Rajpur Barwani", "Rampura (MP)", "Ranapur", "Ratlam", "Ratlam Namkeen City", "Rau Indore",
    "Rehli", "Rehti", "Rewa", "Rewa White Tiger Hub", "Sabalgarh", "Sagar",
    "Sagar Smart City", "Sailana", "Sanawad", "Sanawad Narmada", "Sanchi", "Sanchi Stupa Complex",
    "Sanchi Stupa World Heritage", "Sanwer", "Sanwer Indore", "Sarangpur", "Sarni", "Satna",
    "Satna City", "Sausar", "Sehore", "Sehore City", "Sendhwa", "Sendhwa Border",
    "Seonde", "Seoni", "Seoni City", "Seoni Malwa", "Shahdol", "Shahdol City",
    "Shahgarh", "Shahpura (Dindori)", "Shahpura (Jabalpur)", "Shajapur", "Shajapur City", "Shamshabad",
    "Shamshabad (MP)", "Sheopur", "Sheopur Kuno National Park", "Shivpuri", "Shivpuri Madhav National Park", "Shivpuri National Park",
    "Shujalpur", "Sidhi", "Sidhi City", "Sihora", "Sihora Jabalpur", "Silwani",
    "Singrauli", "Singrauli Energy Hub", "Sirmaur", "Sironj", "Sitamau", "Sohagpur",
    "Sontalai", "Susner", "Susner Cow Sanctuary", "Tarana", "Tekanpur", "Tekanpur BSF Academy",
    "Tendukheda", "Thandla", "Tikamgarh", "Tikamgarh City", "Timarni", "Tirodi",
    "Udaipura", "Ujjain", "Ujjain Mahakal Corridor", "Ujjain Mahakal Jyotirlinga", "Ujjain Mahakaleshwar", "Ujjain Ramghat",
    "Umaria", "Umaria Bandhavgarh Gateway", "Unchehara", "Vidisha", "Vidisha Historic Town", "Vijaypur",
    "Waraseoni"
  ],
  "Maharashtra": [
    "Achalpur", "Achara Beach", "Ahiwantwadi", "Ahmednagar", "Ajanta Caves Gateway", "Akola",
    "Akole", "Alandi Sant Dnyaneshwar", "Alibaug", "Alibaug Beach", "Allapalli", "Amalner",
    "Ambad", "Ambajogai", "Amboli Hill Station", "Amravati", "Anjangaon", "Anjanvel",
    "Arvi", "Arvi Wardha", "Ashti", "Aurangabad (Chhatrapati Sambhajinagar)", "Ausa", "Babhulgaon",
    "Badlapur", "Ballarpur", "Baramati", "Barshi", "Barshitakli", "Beed",
    "Bhadravati", "Bhandara", "Bhandardara Lake", "Bhigwan", "Bhimashankar Jyotirlinga", "Bhiwandi",
    "Bhokardan", "Bhusawal", "Boisar", "Bramhapuri", "Buldhana", "Chakan (Pune)",
    "Chalisgaon", "Chandrapur", "Chandur", "Chikhaldara Hill Station", "Chikhli", "Chiplun",
    "Chopda", "Dahanu", "Dapoli", "Dapoli Beach", "Daund", "Deolali",
    "Deori", "Devgad Alphonso Hub", "Dhadgaon", "Dharangaon", "Dhule", "Digras",
    "Dombivli", "Ellora Caves Gateway", "Erandol", "Gadchiroli", "Gangakhed", "Ganpatipule Temple Beach",
    "Georai", "Ghatanji", "Ghoti", "Gondia", "Harihareshwar Beach", "Hatkanangale",
    "Himayatnagar", "Hinganghat", "Hingna", "Hingoli", "Ichalkaranji", "Igatpuri",
    "Jalgaon", "Jalna", "Jawhar Hill Station", "Jaysingpur", "Jejuri", "Jintur",
    "Kalamb", "Kalyan", "Kandhar", "Kannad", "Karad", "Karanja",
    "Karjat", "Karla Caves Lonavala", "Karmala", "Karmala Solapur", "Kashid Beach", "Khamgaon",
    "Khandala Ghats", "Khopoli", "Kinwat", "Kolad White Water", "Kolhapur", "Kopargaon",
    "Koregaon", "Korpana", "Kudal", "Kuhi", "Kurkheda", "Latur",
    "Lavasa City", "Loha", "Lonavala", "Lonavala Bhushi Dam", "Mahabaleshwar", "Mahabaleshwar Venna Lake",
    "Mahad", "Mahagaon", "Majalgaon", "Malegaon", "Malkapur", "Malshej Ghat",
    "Manchar", "Mangaon", "Mangrulpir", "Manmad", "Manora", "Matheran",
    "Matheran Toy Train Base", "Mehkar", "Mira-Bhayandar", "Miraj", "Mohol", "Mukhed",
    "Mumbai", "Mumbai Airport (BOM)", "Mumbai Andheri", "Mumbai Bandra", "Mumbai BKC Hub", "Mumbai Borivali",
    "Mumbai Chembur", "Mumbai Colaba", "Mumbai Dadar", "Mumbai Ghatkopar", "Mumbai Juhu", "Mumbai Lower Parel",
    "Mumbai Marine Drive", "Mumbai Mulund", "Mumbai Navi Mumbai", "Mumbai Powai", "Mumbai Thane", "Mumbai Vashi",
    "Mumbai Worli", "Murtizapur", "Murud", "Murud Janjira Fort", "Nagbhid", "Nagpur",
    "Nagpur Airport", "Nagpur Sitabuldi", "Nanded", "Nandgaon", "Nandurbar", "Naneghat",
    "Narayangaon", "Narkhed", "Nashik", "Nashik Panchavati", "Nashik Road", "Nashik Trimbakeshwar",
    "Navi Mumbai Belapur", "Navi Mumbai Kharghar", "Navi Mumbai Nerul", "Navi Mumbai Panvel", "Navi Mumbai Vashi", "Ner",
    "Nilanga", "Osmanabad (Dharashiv)", "Paithan", "Palghar", "Palus", "Panchgani Table Land",
    "Pandharpur", "Panhala Fort", "Panvel", "Paratwada", "Parbhani", "Pauni",
    "Pen", "Phaltan", "Pimpri-Chinchwad", "Pune", "Pune Airport", "Pune Baner",
    "Pune Camp", "Pune Hadapsar", "Pune Hinjawadi", "Pune Kalyani Nagar", "Pune Kothrud", "Pune Shivaji Nagar",
    "Pune Viman Nagar", "Pune Wakad", "Pusad", "Rahuri", "Raigad", "Raigad Fort Base",
    "Ralegaon", "Ratnagiri", "Ratnagiri Mandvi Beach", "Risod", "Sailu", "Sangamner",
    "Sangli", "Sangole", "Satara", "Sawantwadi", "Selu", "Shahada",
    "Shegaon", "Shevgaon", "Shirala", "Shirdi", "Shirdi Saibaba Temple", "Shirpur",
    "Shirwal", "Shivneri Fort", "Shrigonda", "Shrirampur", "Sillod", "Sindhudurg",
    "Sindkhed Raja", "Sinhagad Fort", "Sinnar", "Solapur", "Tadoba Moharli Gate", "Talegaon",
    "Tarapur", "Tarkarli Scuba Hub", "Tasgaon", "Telhara", "Toranmal Hill Station", "Trimbak",
    "Trimbakeshwar Jyotirlinga", "Tuljapur", "Umarkhed", "Umred", "Uran", "Vaijapur",
    "Vajreshwari Hot Springs", "Varangaon", "Vasai-Virar", "Vita", "Wadwani", "Wai",
    "Wardha", "Warora", "Washim", "Yavatmal", "Yawal", "Yeola"
  ],
  "Punjab": [
    "Abohar", "Abohar Cotton Hub", "Adampur (PB)", "Adampur (Punjab)", "Ahmedgarh", "Ajnala",
    "Alawalpur", "Amloh", "Amritsar", "Amritsar Airport (ATQ)", "Amritsar Golden Temple", "Amritsar Hall Gate",
    "Amritsar Ranjit Avenue", "Anandpur Sahib", "Anandpur Sahib Virasat-e-Khalsa", "Attari Border (Wagah)", "Attari Wagah Border", "Baba Bakala",
    "Baba Bakala Sahib", "Bagha Purana", "Balachaur", "Banga", "Bareta", "Barnala",
    "Bassi Pathana", "Batala", "Bathinda Qila Mubarak", "Begowal", "Bhadaur", "Bhatinda",
    "Bhatinda Cantt", "Bhawanigarh", "Bhikhi", "Bhikhiwind", "Bhiki", "Bholath",
    "Budhlada", "Chamkaur Sahib", "Chamkaur Sahib Heritage", "Chandigarh Airport (IXC)", "Chandigarh Border", "Chandigarh Sector 17",
    "Chandigarh Sector 35", "Chandigarh Sector 43 ISBT", "Cheema", "Chogawan", "Dasuya", "Dera Baba Nanak",
    "Dera Baba Nanak Kartarpur Corridor", "Dera Bassi", "Dhanaula", "Dharamkot", "Dhariwal", "Dhilwan",
    "Dhuri", "Dina Nagar", "Dirba", "Doraha", "Fatehgarh Churian", "Fatehgarh Sahib",
    "Fatehgarh Sahib Gurudwara", "Fazilka", "Fazilka Border", "Ferozepur", "Ferozepur Cantt", "Ferozepur Hussainiwala Border",
    "Firozpur", "Garhdiwala", "Garhshankar", "Ghanaur", "Ghuman", "Giddarbaha",
    "Gidderbaha", "Gobindgarh", "Goindwal Sahib", "Goindwal Sahib Baoli", "Gojra", "Goraya",
    "Gurdaspur", "Guru Har Sahai", "Hajipur (PB)", "Hariana", "Harike Wetland Bird Sanctuary", "Hathur",
    "Hoshiarpur", "Jagraon", "Jaitu", "Jalalabad", "Jalalabad (PB)", "Jalandhar",
    "Jalandhar Cantt", "Jalandhar Civil Lines", "Jalandhar Model Town", "Jandiala Guru", "Kalanaur (PB)", "Kapurthala",
    "Kapurthala Jagatjit Palace", "Kapurthala Rail Coach Factory", "Kartarpur", "Kartarpur (Punjab)", "Kartarpur Corridor Hub", "Khadur Sahib",
    "Khamanon", "Khanna", "Khanna Grain Market", "Kharar", "Khemkaran", "Kiratpur Sahib",
    "Kot Fatta", "Kot Kapura", "Kotkapura", "Kurali", "Kurali (Punjab)", "Lalru",
    "Lehra Gaga", "Lehragaga", "Ludhiana", "Ludhiana Civil Lines", "Ludhiana Clock Tower", "Ludhiana Focal Point",
    "Ludhiana Industrial Area", "Ludhiana Model Town", "Machhiwara", "Majitha", "Makhu", "Malerkotla",
    "Malerkotla Nawab Town", "Maloud", "Malout", "Mandi Gobindgarh", "Mandi Gobindgarh Steel City", "Mansa",
    "Mansa (Punjab)", "Mansa Cotton Belt", "Maur", "Mehatpur", "Moga", "Moonak",
    "Morinda", "Mukerian", "Muktsar", "Muktsar (Sri Muktsar Sahib)", "Muktsar Mela Maghi", "Mullanpur Dakha",
    "Nabha", "Nakodar", "Nangal", "Nangal Bhakra Dam", "Nangal Dam", "Nawanshahr (Shaheed Bhagat Singh Nagar)",
    "Nihal Singh Wala", "Nihalsinghwala", "Nurmahal", "Pathankot", "Pathankot Cantt", "Patiala",
    "Patiala Baradari", "Patiala Moti Bagh", "Patiala Urban Estate", "Patran", "Patti", "Payal",
    "Phagwara", "Phagwara Sugar Mill Town", "Phillaur", "Qadian", "Raikot", "Raja Sansi (Airport)",
    "Rajpura", "Raman", "Rampura Phul", "Rayya", "Ropar (Roopnagar)", "Ropar Rural",
    "Rupnagar IIT Area", "Rupnagar Wetland", "Sahnewal", "Samana", "Samrala", "Sanaur",
    "Sangrur", "Sardulgarh", "Shahkot", "Sham Chaurasi", "Sham Churasi", "Shekhupura",
    "Sirhind", "Sirhind Historic", "Sri Hargobindpur", "Sujanpur (PB)", "Sultanpur Lodhi", "Sultanpur Lodhi Ber Sahib",
    "Sunam", "Talwandi Bhai", "Talwandi Sabo", "Talwandi Sabo (Damdama Sahib)", "Talwandi Sabo Damdama Sahib", "Tanda Urmar",
    "Tapa", "Tarn Taran", "Tarn Taran Darbar Sahib", "Urmar Tanda", "Zira", "Zira Ferozepur",
    "Zirakpur"
  ],
  "Rajasthan": [
    "Abu Road", "Abu Road Station", "Ahore", "Ajmer", "Ajmer Ana Sagar", "Ajmer Dargah Sharif",
    "Aklera", "Alsisar", "Alwar", "Alwar City", "Alwar Siliserh Lake", "Amer Fort Heritage",
    "Amet", "Antah", "Anupgarh", "Asind", "Aspur", "Bagar Shekhawati",
    "Bagidora", "Bagru", "Balaji Mehandipur", "Balesar", "Bali", "Balotra",
    "Bamanwas", "Bandikui", "Bangarh Fort Area", "Banswara", "Bap", "Baran",
    "Bari", "Bari Sadri", "Barmer", "Barmer Desert Border", "Bassi", "Bassi (Jaipur)",
    "Bayana", "Beawar", "Beawar Industrial", "Begun", "Behror", "Bhadra",
    "Bhandarej", "Bhangarh Historic", "Bharatpur", "Bharatpur Bird Sanctuary (Keoladeo)", "Bhilwara", "Bhilwara Textile City",
    "Bhim", "Bhinder", "Bhinmal", "Bhiwadi", "Bhopalgarh", "Bikaner",
    "Bikaner Junagarh Fort", "Bilara", "Bishangarh", "Chaksu", "Chhabra", "Chhapar (Churu)",
    "Chhoti Sadri", "Chirawa", "Chittorgarh", "Chittorgarh Fort", "Chittorgarh Vijay Stambha", "Chohtan",
    "Chomu", "Churu", "Danta Ramgarh", "Dausa", "Deedwana", "Deeg",
    "Deeg Palace", "Deeg Water Palaces", "Degana", "Deshnoke", "Deshnoke (Karni Mata)", "Deshnoke Karni Mata Temple",
    "Dhariawad", "Dholpur", "Didwana", "Dudu", "Dungarpur", "Fatehnagar",
    "Fatehpur Shekhawati", "Fatehpur Shekhawati Haveli", "Gajner", "Gajner Palace", "Galiakot", "Gangapur City",
    "Garhi", "Ghatol", "Gogunda", "Goredi Chancha", "Govindgarh (RJ)", "Gudha Gorji",
    "Hanumangarh", "Hindaun", "Hindaun City", "Jahazpur", "Jaipur", "Jaipur Airport",
    "Jaipur Amer Fort", "Jaipur Bapu Bazar", "Jaipur C-Scheme", "Jaipur Hawa Mahal", "Jaipur Malviya Nagar", "Jaipur Mansarovar",
    "Jaipur Nahargarh", "Jaipur Raja Park", "Jaipur Tonk Road", "Jaipur Vaishali Nagar", "Jaisalmer", "Jaisalmer Fort",
    "Jaisalmer Sam Dunes", "Jaisalmer Sam Sand Dunes", "Jaitaran", "Jalor", "Jalore", "Jamwa Ramgarh",
    "Jayal", "Jhadol", "Jhalawar", "Jhalawar Garh Palace", "Jhalrapatan", "Jhunjhunu",
    "Jhunjhunu Rani Sati", "Jodhpur", "Jodhpur Airport", "Jodhpur Mandore", "Jodhpur Mehrangarh Fort", "Kaman",
    "Kapasan", "Karanpur", "Kekri", "Keshoraipatan", "Khandela", "Khatu Shyam Ji",
    "Khatushyamji Dham", "Kherwara", "Khetri", "Khimsar", "Khimsar Dunes", "Kishangarh",
    "Kishangarh Bas", "Kishangarh Marble Hub", "Kishangarh Marble Market", "Kolayat", "Kota", "Kota Chambal Riverfront",
    "Kota Coaching Hub", "Kotputli", "Kotputli Rural", "Kotra", "Kuchaman City", "Kumbhalgarh",
    "Kumbhalgarh Fort Area", "Kumbhalgarh Great Wall", "Lachhmangarh", "Ladnun", "Lalsot", "Losal",
    "Mahwa", "Makrana", "Malpura", "Mandal", "Mandalgarh", "Mandawa",
    "Mandawa Haveli Walk", "Mandawa Havelis", "Mangrol", "Marwar Junction", "Mehandipur Balaji", "Merta City",
    "Mount Abu", "Mount Abu Dilwara Temples", "Mount Abu Nakki Lake", "Mukundgarh", "Nadbai", "Nadbhai",
    "Nagar (Bharatpur)", "Nagaur", "Nainwa", "Nathdwara (Shreenathji)", "Nathdwara Shrinathji", "Nawa",
    "Nawalgarh", "Neem Ka Thana", "Neemrana", "Neemrana Fort", "Neemrana Japanese Zone", "Nimbahera",
    "Nimrana Japanese Zone", "Niwai", "Nohar", "Nokha", "Nokha (Rajasthan)", "Osian",
    "Osian Sand Dunes", "Padampur", "Pali", "Parbatsar", "Phalodi", "Pilani",
    "Pilibanga", "Pindwara", "Pipar City", "Pirawa", "Pokhran", "Pratapgarh (Rajasthan)",
    "Pratapgarh (RJ)", "Pushkar", "Pushkar Brahma Temple", "Pushkar Desert Camp", "Raipur (Pali)", "Raisinghnagar",
    "Rajakhera", "Rajaldesar", "Rajgarh (Alwar)", "Rajgarh (Churu)", "Rajsamand", "Ramdevra Temple",
    "Ramganj Mandi", "Ramgarh (Shekhawati)", "Ranakpur Jain Temples", "Rani", "Rani (Pali)", "Ranthambore (Sawai Madhopur)",
    "Ranthambore National Park", "Ratangarh", "Rawatbhata", "Rawatsar", "Sadri", "Sadulpur",
    "Sadulpur (Rajgarh)", "Salasar Balaji", "Salasar Balaji Dham", "Salumbar", "Sambhar Lake", "Samode Palace",
    "Sanchore", "Sangaria", "Sardarshahar", "Sariska Tiger Reserve", "Sarmathura", "Sarwar",
    "Sawai Madhopur", "Shahpura (Bhilwara)", "Shahpura (Jaipur)", "Shekhawati Fresco Belt", "Sheoganj", "Shri Dungargarh",
    "Shri Madhopur", "Sikar", "Sirohi", "Siwana", "Sojat", "Sri Dungargarh",
    "Sri Ganganagar", "Sri Madhopur", "Sujangarh", "Sumerpur", "Surajgarh", "Suratgarh",
    "Takhatgarh", "Taragarh Ajmer", "Tijara", "Todabhim", "Todaraisingh", "Tonk",
    "Udaipur", "Udaipur City Palace", "Udaipur Fatehsagar", "Udaipur Lake Pichola", "Udaipur Sukher", "Udaipurwati",
    "Uniara", "Vallabhnagar", "Viratnagar", "Weir", "Wer"
  ],
  "Uttar Pradesh": [
    "Achhnera", "Afzalgarh", "Agra", "Agra Cantt", "Agra Dayalbagh", "Agra Fatehabad Road",
    "Agra Fort Area", "Agra Idgah", "Agra Khandari", "Agra Raja Ki Mandi", "Agra Sanjay Place", "Agra Shamshabad Road",
    "Agra Sikandra", "Agra Taj East Gate", "Agra Tajganj", "Ahraura", "Air Force Station Hindon", "Ajhuwa",
    "Ajitmal", "Akbarpur", "Akbarpur (Ambedkar Nagar)", "Aliganj", "Aliganj (Etah)", "Aligarh",
    "Aligarh AMU Area", "Aligarh Civil Lines", "Allapur", "Amanpur", "Ambehta", "Amethi",
    "Amila", "Aminagar Sarai", "Amroha", "Amroha City", "Anandnagar", "Anpara",
    "Anupshahr", "Aonla", "Atarra", "Atrauli", "Atraulia", "Auraiya",
    "Auras", "Avadh", "Ayodhya", "Ayodhya Cantt", "Ayodhya Hanumangarhi", "Ayodhya Naya Ghat",
    "Ayodhya Ram Janmabhoomi", "Ayodhya Ram Mandir", "Babarpur", "Baberu", "Babrala", "Babugarh",
    "Bachhrawan", "Badaun", "Baghpat", "Baghpat Khekra", "Bagpat Rural", "Bah",
    "Baheri", "Bahjoi", "Bahraich", "Bahsuma", "Bairia", "Bakewar",
    "Ballia", "Balrampur", "Banda", "Banda Mandi", "Bangar Mau", "Bansgaon",
    "Bansi", "Barabanki", "Baraut", "Baraut Subcity", "Bareilly", "Bareilly Cantt",
    "Bareilly Civil Lines", "Bareilly Izzatnagar", "Barhaj", "Barhalganj", "Barkhera", "Barsana",
    "Barsana Dham", "Barsana Radha Rani Temple", "Barsana Rural", "Basti", "Basti City", "Bateshwar Temples",
    "Bawan", "Behat", "Behat Saharanpur", "Belthara Road", "Beniganj", "Beswan",
    "Bewar", "Bhabua Border (UP)", "Bhadohi", "Bhadohi Carpet Hub", "Bhagwant Nagar", "Bharatana",
    "Bharthana", "Bharwari", "Bhawan Bahadur Nagar", "Bhimsen", "Bhinga", "Bhitargaon Ancient Temple",
    "Bhogaon", "Bhongaon", "Bidhuna", "Bijnor", "Bijnor Kotwali", "Bikapur",
    "Bilari", "Bilaspur (Rampur)", "Bilaspur (UP)", "Bilgram", "Bilhaur", "Bilram",
    "Bilsanda", "Bilsi", "Bindki", "Bisalpur", "Bisauli", "Biswan",
    "Brijghat", "Budaun", "Budaun City", "Budaun Rural", "Budhana", "Budhana Muzaffarnagar",
    "Bulandshahr", "Bulandshahr Sikandrabad", "Captainganj", "Chandauli", "Chandausi", "Chandausi Mandi",
    "Chandpur", "Chandpur (Bijnor)", "Chandpur Bijnor", "Charkhari", "Chhata", "Chhata Mathura",
    "Chhatari", "Chhibramau", "Chhutmalpur", "Chitrakoot", "Chitrakoot Dham", "Chitrakoot Ramghat",
    "Chunar", "Chunar Fort Area", "Chunar Fort Mirzapur", "Chunar Mirzapur", "Colonelganj", "Dadri NTPC Hub",
    "Dadri Rural", "Dalmau", "Dankaur Rural", "Dariyabad", "Dataganj", "Dayalbagh",
    "Dayalbagh Agra", "Deoband", "Deoband Islamic Seminary", "Deoband Rural", "Deoria", "Deva Sharif Barabanki",
    "Dewa Sharif", "Dewa Sharif Shrine", "Dhampur", "Dhampur Bijnor", "Dhanauha", "Dhanghata",
    "Dhaurahra", "Dibai", "Dibiyapur", "Dildarnagar", "Dohrighat", "Dostpur",
    "Dudhi", "Dudhwa National Park Palia", "Ekdil", "Etah", "Etah City", "Etawah",
    "Etawah Saifai", "Faizabad", "Farrukhabad", "Farrukhabad City", "Fatehabad (Agra)", "Fatehganj Bareilly",
    "Fatehgarh", "Fatehgarh Cantt", "Fatehpur", "Fatehpur Chaurasi", "Fatehpur Sikri", "Fatehpur Sikri Buland Darwaza",
    "Firozabad", "Firozabad Glass Hub", "Gajraula", "Gajraula Industrial Hub", "Ganj Dundwara", "Garautha",
    "Garhi Pukhta", "Garhmukteshwar", "Garhmukteshwar Brijghat", "Gauri Bazar", "Gawan", "Ghatampur",
    "Ghaziabad", "Ghaziabad Morta", "Ghazipur", "Ghorawal", "Gokul", "Gokul Nanda Bhavan",
    "Gola Gokarannath", "Gonda", "Gonda City", "Gorakhpur", "Gorakhpur AIIMS Area", "Gorakhpur Cantt",
    "Gorakhpur Gorakhnath Temple", "Goshainganj", "Govardhan", "Govardhan Parikrama", "Govardhan Parikrama Marg", "Goverdhan",
    "Gunnaur", "Gyanpur", "Haldaur", "Hamirpur (UP)", "Handia", "Hapur",
    "Hapur Dehat", "Hapur Pilkhuwa", "Hardoi", "Hardoi City", "Hasanpur (Amroha)", "Hasanpur (UP)",
    "Hasanpur Amroha", "Hastinapur", "Hastinapur Jain Teerth", "Hathras", "Hathras City", "Hindon",
    "Jahangirabad", "Jalalabad", "Jalalabad (Shahjahanpur)", "Jalalpur (Ambedkar Nagar)", "Jalaun", "Jalesar",
    "Jasrana", "Jaswantnagar", "Jaunpur", "Jaunpur City", "Jaunpur Shahi Bridge", "Jewar Airport Hub",
    "Jhansi", "Jhansi Cantt", "Jhansi Civil Lines", "Jhansi Fort Area", "Jhansi Rani Mahal", "Kadaura",
    "Kadipur", "Kaimganj", "Kaimoor Wildlife Sanctuary", "Kairana", "Kairana Shamli", "Kakori",
    "Kalinjar Fort", "Kalinjar Fort Banda", "Kalpi", "Kannauj", "Kannauj Perfume Capital", "Kanpur",
    "Kanpur Cantt", "Kanpur Civil Lines", "Kanpur Kalyanpur", "Kanpur Mall Road", "Kant Shahjahanpur", "Kanth",
    "Kanth Moradabad", "Kapilvastu Piprahwa", "Karhal", "Kasganj", "Kasganj City", "Kashi Vishwanath Corridor",
    "Kashipur Moradabad Corridor", "Kaushambi (UP)", "Khaga", "Khair", "Khair Aligarh", "Khalilabad",
    "Khatima Border UP", "Khekra", "Kheragarh", "Khurja", "Khurja Pottery City", "Kiratpur",
    "Konch", "Kosi Kalan", "Kunda", "Kundarki", "Kushinagar", "Kushinagar Mahaparinirvana",
    "Kushinagar Mahaparinirvana Temple", "Laharpur", "Lakhimpur", "Lakhimpur Kheri", "Lalganj", "Lalganj (Azamgarh)",
    "Lalganj (Pratapgarh)", "Lalitpur", "Loni Dehat", "Lucknow", "Lucknow Airport (Amausi)", "Lucknow Alambagh",
    "Lucknow Aminabad", "Lucknow Charbagh", "Lucknow Chowk", "Lucknow Gomti Nagar", "Lucknow Hazratganj", "Lucknow Indira Nagar",
    "Machhlishahr", "Madhogarh", "Madhotanda", "Maghar Kabir Samadhi", "Mahaban", "Maharajganj",
    "Maharajganj (Gorakhpur)", "Mahoba", "Mahoba City", "Mahoba Lakes Bundelkhand", "Maholi", "Mailani",
    "Mainpuri", "Mainpuri City", "Manjhanpur", "Manjhanpur Rural", "Mankapur", "Mariahu",
    "Mathura", "Mathura Cantt", "Mathura Janmabhoomi", "Mathura Krishna Janmabhoomi", "Mathura Krishna Nagar", "Mathura Refinery Area",
    "Mauranipur", "Mawana", "Mawana Meerut", "Meerut", "Meerut Cantt", "Meerut Civil Lines",
    "Meerut Expressway Toll", "Meerut Partapur", "Meerut Shastri Nagar", "Mehnagar", "Milak", "Milak Rampur",
    "Miranpur", "Mirzapur", "Mirzapur Vindhyachal", "Misrikh", "Misrikh Naimisharanya", "Modinagar Textile Hub",
    "Mohammadabad", "Mohammadi", "Mohammadi Kheri", "Mohanlalganj", "Moradabad", "Moradabad Brass Market",
    "Moradabad Bypass", "Moradabad Civil Lines", "Mughalsarai", "Muradnagar Ordnance Hub", "Musafirkhana", "Muzaffarnagar",
    "Muzaffarnagar Jansath", "Muzaffarnagar New Mandi", "Muzaffarnagar Sukartal", "Nagina", "Nagina Bijnor", "Naimisharanya Chakra Teerth",
    "Nandgaon", "Nandgaon Mathura", "Nandgaon Nandbaba Mandir", "Nanpara", "Naugarh", "Nautanwa",
    "Nawabganj", "Nawabganj (Bareilly)", "Nawabganj (Gonda)", "Nehtaur", "Nihtaur", "Noorpur",
    "Obra", "Oel Dhakwa", "Orai", "Orai City", "Pachperwa", "Padrauna",
    "Pahasu", "Pali (Hardoi)", "Palia Kalan", "Partapur (Meerut)", "Pawayan", "Phoolpur (Azamgarh)",
    "Phulpur", "Pihani", "Pilibhit", "Pilibhit Tiger Reserve", "Pilkhuwa", "Pilkhuwa Handloom Hub",
    "Pindara", "Pipraich", "Pratapgarh", "Prayagraj", "Prayagraj Civil Lines", "Prayagraj Sangam",
    "Prayagraj Triveni Sangam", "Puranpur", "Purkaji", "Purkaji NH334", "Puwayan", "Radha Kund Govardhan",
    "Radhakund", "Radhakund Mathura", "Raebareli", "Raebareli City", "Rajaji Nagar", "Ramnagar (Varanasi)",
    "Ramnagar Varanasi", "Rampur", "Rampur Khas", "Rampur Maniharan", "Rath", "Rath Hamirpur",
    "Rath Rural", "Renukoot", "Robertsganj", "Rudauli", "Sadabad", "Sadabad Rural",
    "Safipur", "Safipur Rural", "Saharanpur", "Saharanpur Clock Tower", "Saharanpur Woodcraft Hub", "Sahaswan",
    "Sahawar", "Saidpur", "Salempur", "Salon", "Sambhal", "Sambhal City",
    "Sambhal Rural", "Sandi", "Sandila", "Sandila Laddu Hub", "Sant Kabir Nagar", "Sarnath Dhamek Stupa",
    "Sasni", "Seohara", "Shahabad (Hardoi)", "Shahabad (Rampur)", "Shahabad (UP)", "Shahabad Hardoi",
    "Shahganj", "Shahjahanpur", "Shamli", "Shamli Sugar Hub", "Shikarpur (Bulandshahr)", "Shikohabad",
    "Shishgarh", "Shravasti", "Shravasti Jetavana Monasteries", "Siddharthnagar", "Sikanderpur", "Sikandra Rao",
    "Sikandrabad", "Sirathu", "Sirsaganj", "Sirsaganj Rural", "Sitapur", "Sitapur City",
    "Sonauli (Nepal Border)", "Sonbhadra", "Soron", "Soron Shukarkhetra", "Suar Rampur", "Sukartal",
    "Sultanpur", "Sultanpur City", "Swar", "Tanda", "Tanda Ambedkar Nagar", "Thakurdwara",
    "Tilhar", "Tiloi", "Tulsipur", "Tundla", "Tundla Railway Junction", "Ujhani",
    "Unnao", "Utraula", "Utraula Rural", "Varanasi", "Varanasi Airport (Babatpur)", "Varanasi Assi Ghat",
    "Varanasi Cantt", "Varanasi Dashashwamedh", "Varanasi Godowlia", "Varanasi Kashi Vishwanath", "Varanasi Lanka", "Varanasi Sarnath",
    "Vrindavan", "Vrindavan Bankey Bihari", "Vrindavan Chandrodaya", "Vrindavan ISKCON", "Vrindavan Prem Mandir", "Vrindavan Raman Reti",
    "Zaidpur", "Zaidpur Rural", "Zamania"
  ],
  "Uttarakhand": [
    "Agastyamuni", "Almora", "Almora Bright End Corner", "Almora Kasar Devi", "Almora Mall Road", "Almora Rural",
    "Askot", "Auli", "Auli Ski Resort", "Badhangarh", "Badrinath", "Badrinath Mana Village",
    "Badrinath Temple Complex", "Badrinath Temple Hub", "Bageshwar", "Bageshwar Baijnath", "Bageshwar Kanda", "Bagnath Temple",
    "Bareth", "Barkot", "Barkot Yamunotri Link", "Bazpur", "Berinag", "Berinag Rural",
    "Betalghat", "Bhaisiachhana", "Bhatwari", "Bhikiyasain", "Bhilangana", "Bhimtal",
    "Bhimtal Island", "Bhimtal Lake", "Bhimtal Lake Link", "Bhowali", "Bhowali Valley", "Bindukhatta",
    "Binsar", "Binsar Valley", "Binsar Wildlife Sanctuary", "Budha Kedar", "Byasi", "Chakrata",
    "Chakrata Tiger Falls", "Chamba (UK)", "Champawat", "Chaubattia", "Chaukhutia", "Chaukhutia Valley",
    "Chharba", "Chiniyalisaur", "Chinyalisaur", "Chopta", "Chopta Mini Switzerland", "Chopta Tungnath Trek",
    "Dakpathar", "Dalanwala", "Damta", "Deghat", "Dehradun", "Dehradun Airport (Jolly Grant)",
    "Dehradun Chakrata Road", "Dehradun Clement Town", "Dehradun Clock Tower", "Dehradun FRI Campus", "Dehradun GMS Road", "Dehradun Hathibarkala",
    "Dehradun Jakhan", "Dehradun Patel Nagar", "Dehradun Rajpur Road", "Dehradun Robbers Cave", "Dehradun Sahastradhara", "Devikhal",
    "Devprayag", "Devprayag Sangam", "Dhalwala", "Dhanaulti", "Dhanaulti Eco Park", "Dharchula",
    "Dhari", "Dhikuli", "Dhikuli Corbett Hub", "Didihat", "Doiwala", "Doiwala Rural",
    "Duggada", "Dwarahat", "Dwarahat Ranikhet Link", "Gairsain", "Gaja", "Gangolihat",
    "Gangotri", "Gangotri Gaumukh Base", "Gangotri Temple Base", "Gaurikund", "Ghandiyal", "Ghangaria Valley of Flowers",
    "Ghansali", "Ghattugad", "Ghuttu", "Gopeshwar", "Gopeshwar Chamoli", "Govindghat Hemkund Base",
    "Guptkashi", "Guptkashi Kedarnath Base", "Haldwani", "Haldwani Bareilly Road", "Haldwani Kaladhungi Road", "Haldwani Kathgodam Gateway",
    "Haldwani Nainital Road", "Haridwar", "Haridwar BHEL Hub", "Haridwar Bhupatwala", "Haridwar Har Ki Pauri", "Haridwar Jwalapur",
    "Haridwar Kankhal", "Haridwar Mansa Devi", "Haridwar Motichur", "Haridwar Railway Station", "Haridwar Rural", "Haridwar Shanti Kunj",
    "Harshil Valley", "Harsil", "Hawalbagh", "Hemkund Sahib Base", "Herbertpur", "Hindolakhal",
    "Jakhnidhar", "Jaspur", "Jauljibi", "Jaurasi", "Jim Corbett (Ramnagar)", "Jim Corbett Bijrani Zone",
    "Jim Corbett Dhikala Gate", "Jim Corbett Dhikala Zone", "Jim Corbett Jhirna Zone", "Jim Corbett Ramnagar", "Joshimath", "Joshimath Auli Cableway",
    "Joshimath Auli Ropeway", "Joshimath Ropeway Base", "Kainchi Dham", "Kainchi Dham Ashram", "Kaladhungi", "Kaladhungi Corbett Museum",
    "Kalagarh", "Kaliasaur", "Kalimath", "Kalsi", "Kalsi Dehradun", "Kanatal",
    "Kapkot", "Karnaprayag", "Karnaprayag Rural", "Karnaprayag Sangam", "Kashipur", "Kashipur IIM Area",
    "Kathgodam", "Kathgodam Railway Station", "Kausani", "Kausani Tea Estate", "Kedarnath", "Kedarnath Dham Shrine",
    "Kedarnath Gaurikund Base", "Kedarnath Temple", "Kempty", "Khatima", "Khatima Border", "Khirsu Pauri Hill",
    "Khurpatal", "Kichha", "Kirtinagar", "Kotabagh", "Kotdwar", "Kotdwar Kanvashram",
    "Koti Colony", "Kulri (Mussoorie)", "Lalkuan", "Lambgaon", "Lamgara", "Landour (Mussoorie)",
    "Landour Cantt", "Lansdowne", "Lansdowne Bhulla Tal", "Lansdowne Cantt", "Lansdowne Tip N Top", "Lohaghat",
    "Loharkhet", "Madhyamaheshwar Base", "Madhyamaheshwar Trek", "Mahakali Corridor", "Majkhali", "Maldevta",
    "Malsi", "Mana Last Indian Village", "Mana Village", "Mandal Valley", "Manglaur", "Manglaur Roorkee",
    "Marchula", "Mawana Link", "Mayali", "Mehuwala", "Mohan", "Mohan Chatti",
    "Mohand", "Mori", "Mukhem", "Mukteshwar", "Mukteshwar Chauli Ki Jali", "Munsiyari",
    "Munsiyari Base", "Munsiyari Panchachuli View", "Mussoorie", "Mussoorie Camel Back Road", "Mussoorie Company Garden", "Mussoorie Kempty Falls",
    "Mussoorie Mall Road", "Nainidanda", "Nainital", "Nainital Ayarpatta", "Nainital China Peak", "Nainital Mallital",
    "Nainital Naini Lake", "Nainital Snow View", "Nainital Tallital", "Nanda Prayag", "Narendra Nagar", "Naugaon",
    "Naukuchiatal", "New Tehri", "New Tehri Dam View", "Niti Valley", "Okhalkanda", "Pabo",
    "Pangot", "Pangot Bird Sanctuary", "Pantnagar", "Pantnagar Airport", "Pauri", "Pauri Kandoliya",
    "Pithoragarh", "Pithoragarh Airport", "Pithoragarh Soar Valley", "Pokhari", "Pratitnagar", "Purola",
    "Raipur (UK)", "Raipur Valley", "Ramgarh", "Ramgarh Apple Orchards", "Ramgarh Orchards", "Ramnagar",
    "Ramnagar Kosi River", "Ranikhet", "Ranikhet Chaubatia", "Ranikhet Golf Course", "Rikhad", "Riknikhal",
    "Rishikesh", "Rishikesh AIIMS Area", "Rishikesh Barrage", "Rishikesh Laxman Jhula", "Rishikesh Muni Ki Reti", "Rishikesh Neem Beach",
    "Rishikesh Ram Jhula", "Rishikesh Shivpuri", "Rishikesh Swarg Ashram", "Rishikesh Tapovan", "Rishikesh Triveni Ghat", "Roorkee",
    "Roorkee Civil Lines", "Roorkee IIT Hub", "Rudraprayag", "Rudraprayag Alaknanda Sangam", "Rudraprayag Koteshwar", "Rudraprayag Sangam",
    "Rudrapur", "Rudrapur Industrial Hub", "Rudrapur SIDCUL Hub", "Sahaspur", "Saikot", "Salt",
    "Satpuli", "Sattal", "Sattal Christian Ashram", "Selakui", "Shivpuri", "Shivpuri Rafting Camps",
    "Shrikot", "Simli", "Sitarganj", "Sitlakhet", "Someshwar", "Sonprayag",
    "Srinagar Garhwal", "Srinagar Garhwal NIT Area", "Srinagar Pauri", "Syalde", "Syalsaur", "Takula",
    "Tapovan", "Tarikhet", "Tehri Garhwal Lake", "Thal", "Thalisain", "Tilwara",
    "Triyuginarayan", "Tungnath", "Tungnath Highest Temple", "Tyuni", "Ukhimath", "Ukhimath Mandir",
    "Uttarkashi", "Uttarkashi NIM", "Uttarkashi NIM Hub", "Valley of Flowers Gate", "Vikasnagar", "Vikasnagar Rural",
    "Yamunotri", "Yamunotri Dham Base", "Yamunotri Janki Chatti"
  ],
  "West Bengal": [
    "Adra", "Ahmedpur", "Alipurduar", "Amta", "Arambagh", "Asansol",
    "Bagnan", "Baharampur", "Bakkhali Sea Beach", "Bakreswar", "Balagarh", "Balarampur",
    "Bally", "Ballygunge", "Balurghat", "Bandel Church Historic", "Bankura", "Bansberia",
    "Barabazar", "Barakar", "Baranagar", "Barasat", "Bardhaman", "Barjora",
    "Barrackpore", "Baruipur", "Basanti", "Basirhat", "Belda", "Beldanga",
    "Belgharia", "Belur Math Riverside", "Berhampore", "Bhangar", "Bhatpara", "Bidhannagar",
    "Birpara", "Bishnupur", "Bishnupur Terracotta Temples", "Bolpur (Shantiniketan)", "Bolpur Shantiniketan", "Bongaon",
    "Budge Budge", "Budge Budge Rural", "Calcutta Victoria Memorial Area", "Canning", "Chakdaha", "Chakdaha Rural",
    "Champdani", "Chandannagar", "Chandrakona", "Chinsurah", "Contai", "Contai Rural",
    "Cooch Behar", "Cooch Behar Rajbari", "Dakshineswar Kali Temple", "Dalkhola", "Dantan", "Darjeeling",
    "Darjeeling Mall", "Darjeeling Mall Road", "Darjeeling Tiger Hill", "Debra", "Dhulian", "Dhupguri",
    "Diamond Harbour", "Digha", "Digha New Sea Beach", "Digha Old Sea Beach", "Domjur", "Dooars Gorumara Gate",
    "Dooars Jaldapara Gate", "Dubrajpur", "Durgapur", "Durgapur City Centre", "Egra", "Falakata",
    "Farakka", "Farakka Barrage Road", "Gangarampur", "Gangasagar Kapil Muni", "Garhbeta", "Gazole",
    "Ghatal", "Ghoom", "Ghum Monasteries", "Guskara", "Habra", "Haldia",
    "Haldia Port", "Haldibari", "Haripal", "Hasimara", "Hemtabad", "Henry Island Bakkhali",
    "Hili", "Hingalganj", "Howrah", "Howrah Railway Heritage", "Howrah Railway Station", "Islampur (WB)",
    "Jalpaiguri", "Jangipur", "Jaynagar", "Jayrambati Matri Mandir", "Jhargram", "Jhargram Rural",
    "Joynagar Majilpur", "Kakdwip", "Kakdwip Port", "Kaliaganj", "Kalimpong", "Kalimpong Deolo Hill",
    "Kalna", "Kalyani", "Kamarhati", "Kamarpukur Ramakrishna", "Kanchrapara", "Kandi",
    "Katwa", "Kharagpur", "Kharagpur IIT", "Khatra", "Koch Bihar", "Kolkata",
    "Kolkata Airport (CCU)", "Kolkata Alipore", "Kolkata Ballygunge", "Kolkata Howrah Bridge Area", "Kolkata Jadavpur", "Kolkata New Town",
    "Kolkata Park Street", "Kolkata Salt Lake", "Kotrung", "Krishnanagar", "Krishnarajpur", "Kurseong",
    "Kurseong Dow Hill", "Kurseong Hills", "Labpur", "Lalgola", "Lava Hill Forest", "Madarihat",
    "Madhyamgram", "Mahishadal", "Mainaguri", "Malbazar", "Malda", "Mandarmoni Sea Beach",
    "Manikchak", "Mathabhanga", "Mayapur (ISKCON)", "Mayapur ISKCON Chandrodaya", "Medinipur", "Memari",
    "Mirik", "Mirik Lake", "Mirik Sumendu Lake", "Mohanpur (WB)", "Moyna", "Mukutmanipur Dam",
    "Murshidabad", "Murshidabad Hazarduari Palace", "Nabadwip", "Naihati", "Nalhati", "Nandigram",
    "Onda", "Pandua", "Panihati", "Panskura", "Purulia", "Purulia Ayodhya Hills",
    "Raghunathganj", "Raghunathpur (WB)", "Raiganj", "Rampurhat", "Rampurhat Temple", "Ranaghat",
    "Ranibandh", "Raniganj", "Rhenock Border", "Rishra", "Rishyap Hills", "Sainthia",
    "Sainthia Rural", "Salboni", "Santipur", "Serampore", "Sevoke", "Shantiniketan Visva-Bharati",
    "Siliguri", "Siliguri Bagdogra", "Siliguri Sevoke Road", "Singur", "Sonamukhi", "Sonarpur",
    "Srirampore", "Sunderbans Gateway", "Sunderbans Sajnekhali Watchtower", "Suri", "Suri Rural", "Taherpur",
    "Tajpur Marine Drive", "Taki", "Tamluk", "Tamluk Rural", "Tarakeswar", "Tarakeswar Temple",
    "Tarapith", "Tarapith Temple Rampurhat", "Titagarh", "Toofanganj", "Uluberia"
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
