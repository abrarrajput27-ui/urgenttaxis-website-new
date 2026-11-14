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
  "Haryana": [
    "Adampur", "Agroha", "Ahar", "Alewa", "Ambala", "Ambala Cantt",
    "Ambala City", "Assandh", "Ateli", "Babain", "Badhra", "Badhra Rural",
    "Badkhal", "Badli", "Bahadurgarh", "Bahin", "Ballabhgarh", "Bapoli",
    "Barara", "Barara Rural", "Barwala", "Barwala (Hisar)", "Bass", "Bassan",
    "Bawal", "Bawal IMT", "Bawani Khera", "Behal", "Beri", "Beri Town",
    "Bhagwanpur (HR)", "Bhattu Kalan", "Bhiwani", "Bhondsi", "Bhuna", "Bilaspur (HR)",
    "Bilaspur Yamunanagar", "Bir Ghaggar", "Chandi Mandir", "Charkhi", "Charkhi Dadri", "Charkhi Dadri Rural",
    "Cheeka", "Chhachhrauli", "Chhachhrauli Rural", "Chhapar", "Dabwali", "Dahina",
    "Dahina Jatusana", "Dhanaula", "Dhand", "Dharuhera", "Dharuhera Industrial Hub", "Ding",
    "Ellenabad", "Farakhpur", "Faridabad", "Faridabad Ballabhgarh", "Faridabad NIT", "Faridabad Sector 15",
    "Farrukhnagar", "Farrukhnagar Rural", "Fatehabad", "Ferozepur Jhirka", "Ganaur", "Ganaur GT Road",
    "Ganaur Mandi", "Gharaunda", "Gharaunda Highway", "Ghirau", "Gohana", "Gohana Subcity",
    "Guhla", "Gurugram", "Gurugram Badshahpur", "Gurugram Cyber City", "Gurugram DLF Phase 1", "Gurugram DLF Phase 5",
    "Gurugram Golf Course Ext", "Gurugram Golf Course Road", "Gurugram IMT Manesar", "Gurugram MG Road", "Gurugram Palam Vihar", "Gurugram Sector 14",
    "Gurugram Sector 29", "Gurugram Sector 48", "Gurugram Sector 56", "Gurugram Sohna Road", "Haily Mandi", "Hansi",
    "Hansi Rural", "Hasanpur", "Hathin", "Hathin Rural", "Hisar", "Hisar Cantt",
    "Hodal", "Indri", "Indri Rural", "Indri Subcity", "Indus Industrial Corridor", "Israna",
    "Israna Textile Hub", "Jagadhri", "Jakhal Mandi", "Jakhod Khera", "Jansui", "Jatusana",
    "Jhajjar", "Jhajjar Road", "Jind", "Julana", "Jundla", "Kaithal",
    "Kalanaur", "Kalanwali", "Kalayat", "Kalka", "Kanina", "Kanina Mandi",
    "Karnal", "Karnal Smart City", "Kathura", "Kharkhoda", "Khol", "Khol Rewari",
    "Kosli", "Kosli Rural", "Kundli", "Kurukshetra", "Kurukshetra University Area", "Ladwa",
    "Ladwa Rural", "Loharu", "Loharu Subcity", "Madhuban", "Madlauda", "Mahendragarh",
    "Mandi Dabwali", "Manesar", "Manesar Maruti Hub", "Mangali", "Matanhail", "Matanhail Jhajjar",
    "Meham", "Mullana", "Mullana University Area", "Mundlana", "Murthal", "Mustafabad",
    "Naggal", "Naggal Ambala", "Nagina", "Nangal Chaudhry", "Naraingarh", "Narnaul",
    "Narnaund", "Narwana", "Nilokheri", "Nissing", "Nissing Karnal", "Nuh",
    "Nuh Mewat", "Palwal", "Palwal Bypass", "Panchkula", "Panchkula Sector 5", "Panipat",
    "Panipat Textile Hub", "Pataudi", "Pehowa", "Pillukhera", "Pingwan", "Pinjore",
    "Pinjore Garden", "Prithla", "Prithla Industrial Hub", "Pundri", "Punhana", "Punhana Mewat",
    "Radaur", "Radaur Yamunanagar", "Rai", "Raipur Rani", "Raipur Rani Panchkula", "Rajound",
    "Rampura", "Rania", "Rania Sirsa", "Ratia", "Ratia Fatehabad", "Raya",
    "Rewari", "Rewari Brass Market", "Rohtak", "Rohtak PGI Hub", "Rojka Meo", "Sadhaura",
    "Safidon", "Saha", "Saha Ambala", "Salhawas", "Salwan", "Samalkha",
    "Samalkha Panipat", "Sampla", "Sampla Rohtak", "Sanoli", "Shahabad Markanda", "Shahbad",
    "Sikanderpur", "Siwan", "Siwani", "Siwani Bhiwani", "Sohna", "Sonipat",
    "Sonipat DCRUST", "Taoru", "Taoru Mewat", "Taraori", "Taraori Rice Hub", "Tatarpur",
    "Tauru", "Tigaon", "Tohana", "Tohana Mandi", "Tosham", "Tosham Hills",
    "Uchana", "Uchana Jind", "Uchana Kalan", "Ugrakheri", "Uklana", "Uklana Mandi",
    "Uncha Majra", "Yamunanagar"
  ],
  "Delhi NCR": [
    "Abul Fazal Enclave", "Ahinsa Sthal", "Akshardham Mandir", "Ali Village", "Alipur", "Anand Vihar",
    "Apsara Border", "Arjan Garh", "Ashok Vihar", "Azadpur", "Badarpur", "Badarpur Border",
    "Badli Village", "Bakhtawarpur", "Bakhtawarpur Village", "Baljit Nagar", "Barakhamba Road", "Bawana",
    "Bawana Industrial Area", "Begumpur", "Begumpur Village", "Bhalswa Dairy", "Bhalswa Jahangirpuri", "Bijwasan",
    "Bijwasan Village", "Brij Vihar (Ghaziabad)", "Burari", "Burari Sant Nagar", "Central Secretariat", "Chanakyapuri",
    "Chander Nagar", "Chandni Chowk", "Chawri Bazar", "Chhatarpur", "Chhattarpur Mandir", "Civil Lines",
    "Civil Lines Metro", "Connaught Place", "Crossings Republik (Ghaziabad)", "Dadri (Greater Noida)", "Dankaur (Greater Noida)", "Daryaganj",
    "Daryaganj Heritage", "Dasna (Ghaziabad)", "Delhi Airport (IGI T1)", "Delhi Airport (IGI T2)", "Delhi Airport (IGI T3)", "Delhi Cantonment",
    "Delhi Cantt", "Delhi Gate", "Dhansa", "Dilshad Colony", "Dilshad Garden", "Dwarka Mor",
    "Dwarka Sector 10", "Dwarka Sector 12", "Dwarka Sector 21", "Dwarka Sector 23", "Dwarka Sector 6", "East Delhi (Mayur Vihar)",
    "Faridabad Ballabhgarh", "Faridabad NIT", "Faridabad Old", "Faridabad Sector 15", "Faridabad Sector 16", "Faridabad Surajkund",
    "Gagan Vihar", "Gaur City (Greater Noida West)", "Geeta Colony", "Ghaziabad Indirapuram", "Ghaziabad Kavi Nagar", "Ghaziabad Masuri HQ",
    "Ghaziabad Mohan Nagar", "Ghaziabad Morta", "Ghaziabad Raj Nagar Ext", "Ghaziabad Sahibabad", "Ghaziabad Shastri Nagar", "Ghaziabad Vaishali",
    "Ghaziabad Vasundhara", "Ghonda", "Gokalpur", "Gokalpuri Village", "Govindpuri", "Govindpuri Extension",
    "Greater Kailash 1", "Greater Kailash 2", "Greater Noida Alpha 1", "Greater Noida Beta 2", "Greater Noida Delta 1", "Greater Noida Delta 2",
    "Greater Noida Gamma 1", "Greater Noida Knowledge Park", "Greater Noida Omicron 1", "Greater Noida Pari Chowk", "Greater Noida Surajpur", "Green Park",
    "GTB Enclave", "GTB Nagar", "Gurugram Badshahpur", "Gurugram Cyber City", "Gurugram DLF Phase 1", "Gurugram DLF Phase 2",
    "Gurugram DLF Phase 3", "Gurugram DLF Phase 4", "Gurugram DLF Phase 5", "Gurugram Golf Course Ext", "Gurugram Golf Course Road", "Gurugram IMT Manesar",
    "Gurugram MG Road", "Gurugram Palam Vihar", "Gurugram Sector 14", "Gurugram Sector 29", "Gurugram Sector 48", "Gurugram Sector 56",
    "Gurugram Sohna Road", "Hari Nagar", "Hauz Khas", "Hauz Khas Enclave", "Hauz Khas Village", "Holambi Kalan",
    "Inderpuri", "India Gate", "ITO Delhi", "Jaffarpur Kalan", "Jahangirpuri", "Jamia Nagar",
    "Janakpuri", "Jangpura", "Jangpura Extension", "Jasola Vihar", "Jewar (Noida Airport)", "Jhilmil",
    "Jhilmil Industrial Area", "Jor Bagh", "Kakrola Village", "Kalindi Kunj", "Kalkaji", "Kalkaji Mandir",
    "Kalyanpuri", "Kamla Nagar", "Kanjhawala", "Kapashera", "Kapashera Border", "Karawal Nagar",
    "Karawal Nagar West", "Karol Bagh", "Kashmere Gate", "Kasna (Greater Noida)", "Khan Market", "Khanpur",
    "Kirari Suleman Nagar", "Kirti Nagar", "Kondli", "Krishna Nagar", "Kundli (NCR Border)", "Lado Sarai",
    "Lajpat Nagar", "Laxmi Nagar", "Lodhi Colony", "Loni (Ghaziabad)", "Loni Border", "Madhu Vihar",
    "Mahipalpur", "Mahipalpur Vasant Kunj Road", "Malviya Nagar", "Mandawali", "Mangolpuri", "Mangolpuri Phase 1",
    "Mayapuri", "Mayur Vihar Extension", "Mayur Vihar Phase 1", "Mayur Vihar Phase 2", "Mayur Vihar Phase 3", "Mehrauli",
    "Model Town", "Modinagar (NCR)", "Mohan Cooperative", "Moti Bagh", "Moti Nagar", "Mukherjee Nagar",
    "Mundka", "Mundka Metro", "Munirka", "Muradnagar (NCR)", "Najafgarh", "Nangloi",
    "Nangloi Jat", "Narela", "Narela Industrial Area", "Neb Sarai", "New Ashok Nagar", "New Friends Colony",
    "Nizamuddin East", "Nizamuddin Railway Station", "Nizamuddin West", "Noida City Centre", "Noida Electronic City", "Noida Extension",
    "Noida Golf Course", "Noida Sector 128", "Noida Sector 137", "Noida Sector 142", "Noida Sector 15", "Noida Sector 150 Sports City",
    "Noida Sector 18 (Atta Market)", "Noida Sector 50", "Noida Sector 62", "Noida Sector 62 Metro Hub", "Noida Sector 76", "Okhla Industrial Area",
    "Okhla Phase 1", "Okhla Phase 2", "Okhla Phase 3", "Pahar Ganj", "Palam", "Palam Colony",
    "Pandav Nagar", "Paschim Vihar", "Paschim Vihar West", "Patel Nagar", "Patel Nagar East", "Patparganj",
    "Pilkhuwa (NCR)", "Pitampura", "Pragati Maidan", "Punjabi Bagh", "Punjabi Bagh Club Road", "Qutub Minar Complex",
    "R.K. Puram", "Raja Garden", "Rajendra Place", "Rajouri Garden", "Ramesh Nagar", "Rani Bagh",
    "Rithala", "Rohini Sector 11", "Rohini Sector 16", "Rohini Sector 24", "Rohini Sector 3", "Rohini Sector 7",
    "Rohini Sector 8", "Rohini Sector 9", "Sadhu Vaswani Marg", "Safdarjung Enclave", "Sahibabad Industrial Area", "Saket",
    "Sangam Vihar", "Sarita Vihar", "Sarita Vihar Pocket A", "Sarojini Nagar", "Shahdara", "Shahdara Metro Hub",
    "Shakurpur", "Shalimar Bagh", "Shalimar Bagh Club Road", "Shastri Park", "South Extension 1", "South Extension 2",
    "Subhash Nagar", "Sukhdev Vihar", "Tagore Garden", "Tilak Nagar", "Tilak Nagar Metro", "Tis Hazari",
    "Trilokpuri", "Uttam Nagar", "Uttam Nagar East", "Vasant Kunj", "Vasant Vihar", "Vasant Vihar Enclave",
    "Vasundhara Enclave", "Vasundhara Sector 14", "Vikas Puri", "Vinod Nagar East", "Vivek Vihar", "Wazirpur Industrial Area",
    "Yamuna Vihar", "Yamuna Vihar C Block", "Zakir Nagar"
  ],
  "Uttar Pradesh": [
    "Achhnera", "Afzalgarh", "Agra", "Agra Cantt", "Agra Dayalbagh", "Agra Fatehabad Road",
    "Agra Fort Area", "Agra Sikandra", "Ahraura", "Air Force Station Hindon", "Ajitmal", "Akbarpur",
    "Aliganj", "Aligarh", "Aligarh AMU Area", "Allapur", "Amanpur", "Amethi",
    "Amroha", "Amroha City", "Anandnagar", "Anpara", "Anupshahr", "Aonla",
    "Atarra", "Atrauli", "Auraiya", "Avadh", "Ayodhya", "Ayodhya Cantt",
    "Ayodhya Ram Mandir", "Babarpur", "Babrala", "Babugarh", "Bachhrawan", "Badaun",
    "Baghpat", "Baghpat Khekra", "Baheri", "Bahjoi", "Bahraich", "Bakewar",
    "Ballia", "Balrampur", "Banda", "Banda Mandi", "Bangar Mau", "Bansgaon",
    "Bansi", "Barabanki", "Baraut", "Baraut Subcity", "Bareilly", "Bareilly Cantt",
    "Bareilly Civil Lines", "Barhaj", "Barhalganj", "Barkhera", "Barsana", "Barsana Dham",
    "Basti", "Basti City", "Behat", "Behat Saharanpur", "Belthara Road", "Bewar",
    "Bhadohi", "Bhadohi Carpet Hub", "Bhagwant Nagar", "Bharatana", "Bharthana", "Bhimsen",
    "Bhinga", "Bhogaon", "Bhongaon", "Bidhuna", "Bijnor", "Bijnor Kotwali",
    "Bikapur", "Bilari", "Bilaspur (UP)", "Bilgram", "Bilhaur", "Bilsi",
    "Bindki", "Bisalpur", "Bisauli", "Biswan", "Brijghat", "Budaun",
    "Budaun City", "Budhana", "Budhana Muzaffarnagar", "Bulandshahr", "Bulandshahr Sikandrabad", "Chandauli",
    "Chandausi", "Chandausi Mandi", "Chandpur", "Chandpur Bijnor", "Charkhari", "Chhata",
    "Chhata Mathura", "Chhibramau", "Chitrakoot", "Chitrakoot Dham", "Chunar", "Chunar Mirzapur",
    "Dadri NTPC Hub", "Dataganj", "Dayalbagh Agra", "Deoband", "Deoband Islamic Seminary", "Deoria",
    "Dewa Sharif", "Dewa Sharif Shrine", "Dhampur", "Dhampur Bijnor", "Dibiyapur", "Dildarnagar",
    "Dudhi", "Etah", "Etah City", "Etawah", "Etawah Saifai", "Faizabad",
    "Farrukhabad", "Farrukhabad City", "Fatehganj Bareilly", "Fatehgarh", "Fatehgarh Cantt", "Fatehpur",
    "Fatehpur Sikri", "Firozabad", "Firozabad Glass Hub", "Gajraula", "Gajraula Industrial Hub", "Garhmukteshwar",
    "Garhmukteshwar Brijghat", "Ghatampur", "Ghaziabad", "Ghaziabad Morta", "Ghazipur", "Ghorawal",
    "Gokul", "Gola Gokarannath", "Gonda", "Gonda City", "Gorakhpur", "Gorakhpur AIIMS Area",
    "Gorakhpur Cantt", "Govardhan", "Govardhan Parikrama", "Goverdhan", "Hamirpur (UP)", "Handia",
    "Hapur", "Hapur Pilkhuwa", "Hardoi", "Hardoi City", "Hasanpur (UP)", "Hasanpur Amroha",
    "Hathras", "Hathras City", "Hindon", "Jahangirabad", "Jalalabad", "Jalaun",
    "Jalesar", "Jasrana", "Jaswantnagar", "Jaunpur", "Jaunpur City", "Jewar Airport Hub",
    "Jhansi", "Jhansi Cantt", "Jhansi Fort Area", "Kadaura", "Kadipur", "Kaimganj",
    "Kairana", "Kairana Shamli", "Kalinjar Fort", "Kannauj", "Kannauj Perfume Capital", "Kanpur",
    "Kanpur Cantt", "Kanpur Civil Lines", "Kanpur Kalyanpur", "Kant Shahjahanpur", "Kanth Moradabad", "Karhal",
    "Kasganj", "Kasganj City", "Kashipur Moradabad Corridor", "Kaushambi (UP)", "Khaga", "Khair",
    "Khair Aligarh", "Khalilabad", "Khatima Border UP", "Khekra", "Khurja", "Khurja Pottery City",
    "Kiratpur", "Konch", "Kosi Kalan", "Kundarki", "Kushinagar", "Laharpur",
    "Lakhimpur", "Lakhimpur Kheri", "Lalganj", "Lalitpur", "Loni Dehat", "Lucknow",
    "Lucknow Airport (Amausi)", "Lucknow Alambagh", "Lucknow Charbagh", "Lucknow Gomti Nagar", "Lucknow Hazratganj", "Machhlishahr",
    "Mahaban", "Maharajganj", "Mahoba", "Mahoba City", "Mainpuri", "Mainpuri City",
    "Manjhanpur", "Mankapur", "Mathura", "Mathura Cantt", "Mathura Janmabhoomi", "Mathura Refinery Area",
    "Mauranipur", "Mawana", "Mawana Meerut", "Meerut", "Meerut Cantt", "Meerut Expressway Toll",
    "Meerut Partapur", "Milak Rampur", "Mirzapur", "Mirzapur Vindhyachal", "Misrikh Naimisharanya", "Modinagar Textile Hub",
    "Mohammadi", "Moradabad", "Moradabad Brass Market", "Moradabad Bypass", "Mughalsarai", "Muradnagar Ordnance Hub",
    "Muzaffarnagar", "Muzaffarnagar Jansath", "Muzaffarnagar Sukartal", "Nagina", "Nagina Bijnor", "Nandgaon",
    "Nandgaon Mathura", "Naugarh", "Nawabganj", "Nehtaur", "Noorpur", "Obra",
    "Orai", "Orai City", "Padrauna", "Pahasu", "Palia Kalan", "Partapur (Meerut)",
    "Phulpur", "Pilibhit", "Pilibhit Tiger Reserve", "Pilkhuwa", "Pilkhuwa Handloom Hub", "Pindara",
    "Pipraich", "Pratapgarh", "Prayagraj", "Prayagraj Civil Lines", "Prayagraj Sangam", "Puranpur",
    "Purkaji", "Purkaji NH334", "Radhakund", "Radhakund Mathura", "Raebareli", "Raebareli City",
    "Rajaji Nagar", "Ramnagar (Varanasi)", "Ramnagar Varanasi", "Rampur", "Rampur Khas", "Rath",
    "Rath Hamirpur", "Renukoot", "Robertsganj", "Rudauli", "Sadabad", "Safipur",
    "Saharanpur", "Saharanpur Woodcraft Hub", "Sahaswan", "Sahawar", "Saidpur", "Salempur",
    "Sambhal", "Sambhal City", "Sandila", "Sandila Laddu Hub", "Sant Kabir Nagar", "Sasni",
    "Seohara", "Shahabad (UP)", "Shahabad Hardoi", "Shahganj", "Shahjahanpur", "Shamli",
    "Shamli Sugar Hub", "Shikohabad", "Shishgarh", "Siddharthnagar", "Sikandra Rao", "Sikandrabad",
    "Sirathu", "Sirsaganj", "Sitapur", "Sitapur City", "Sonbhadra", "Soron",
    "Soron Shukarkhetra", "Suar Rampur", "Sukartal", "Sultanpur", "Sultanpur City", "Tanda",
    "Tanda Ambedkar Nagar", "Thakurdwara", "Tilhar", "Tulsipur", "Tundla", "Tundla Railway Junction",
    "Ujhani", "Unnao", "Utraula", "Varanasi", "Varanasi Airport (Babatpur)", "Varanasi Cantt",
    "Varanasi Dashashwamedh", "Varanasi Kashi Vishwanath", "Vrindavan", "Vrindavan Chandrodaya", "Vrindavan Prem Mandir", "Vrindavan Raman Reti",
    "Zaidpur", "Zamania"
  ],
  "Madhya Pradesh": [
    "Agar", "Agar Malwa", "Ajaigarh", "Alirajpur", "Amanganj", "Amarkantak",
    "Amarkantak Narmada Udgam", "Amarpatan", "Ambah", "Amla", "Anjad", "Anuppur",
    "Aron", "Ashoknagar", "Ashta", "Ashta Sehore", "Babai", "Badnagar",
    "Badnawar", "Badwani", "Bagli", "Baihar", "Bakshwaho", "Balaghat",
    "Balaghat City", "Baldeogarh", "Bandhavgarh", "Bandhavgarh Tala Hub", "Barela", "Barghat",
    "Bargi Dam", "Barhi", "Barwani", "Barwani City", "Basoda", "Begamganj",
    "Beohari", "Berasia", "Betul", "Betul Ganj", "Bhabhra", "Bhaderwah (MP)",
    "Bhander", "Bhanpura", "Bhikangaon", "Bhind", "Bhind Mandi", "Bhitwarwar",
    "Bhopal", "Bhopal Airport", "Bhopal Kolar Road", "Bhopal MP Nagar", "Bhopal Upper Lake", "Biaora",
    "Biaora Rajgarh", "Bijawar", "Bina", "Birsinghpur", "Burhanpur", "Burhanpur Historic Hub",
    "Chanderi", "Chanderi Handloom City", "Chhatarpur", "Chhatarpur Khajuraho Hub", "Chhindwara", "Chhindwara City",
    "Chitrakoot (MP Border)", "Dabra", "Dabra Gwalior", "Damoh", "Damoh City", "Datia",
    "Datia Peeth", "Deori (Sagar)", "Deori Sagar", "Dewas", "Dewas Chamunda Tekri", "Dhamnod",
    "Dhar", "Dhar Bhojshala", "Dindori", "Gadarwara", "Ganj Basoda", "Garhakota",
    "Gautampura", "Ghansor", "Gohad", "Gotegaon", "Guna", "Guna Cantt",
    "Gwalior", "Gwalior Cantt", "Gwalior Fort", "Gwalior Morar", "Harda", "Harda Mandi",
    "Harpalpur", "Hatta", "Hindoria", "Hoshangabad", "Hoshangabad Narmadapuram", "Ichhawar",
    "Indore", "Indore AB Road", "Indore Airport", "Indore Palasia", "Indore Rajwada", "Isagarh",
    "Itarsi", "Itarsi Railway Hub", "Jabalpur", "Jabalpur Bhedaghat", "Jabalpur Cantt", "Jabalpur Civil Lines",
    "Jaisinghnagar", "Jaora", "Jaora Sugar City", "Jatara", "Jawad", "Jhabua",
    "Jhabua Tribal Hub", "Jobat", "Kailaras", "Kalapipal", "Kanha National Park", "Kannod",
    "Kareli", "Karera", "Karera Bird Sanctuary", "Kasrawad", "Katangi", "Katni",
    "Katni City", "Khachrod", "Khajuraho", "Khajuraho Western Temples", "Khandwa", "Khargone",
    "Khargone Nimad", "Khategaon", "Khilchipur", "Khurai", "Kolaras", "Korba Link",
    "Kotma", "Kukshi", "Kurwai", "Lahar", "Lakhnadon", "Lateri",
    "Laundi", "Maihar", "Maihar Sharda Devi", "Malhargarh", "Manasa", "Manawar",
    "Mandideep", "Mandideep Industrial Hub", "Mandla", "Mandla City", "Mandleshwar", "Mandsaur",
    "Mandu", "Mandu Historic Fort", "Mangawan", "Mauganj", "Mhow", "Mhow Army Cantt",
    "Morena", "Morena Chambal Hub", "Multai", "Multai Tapti Udgam", "Mungaoli", "Nagda",
    "Nagda Industrial City", "Nagod", "Nainpur", "Narsinghgarh", "Narsinghpur", "Narsinghpur City",
    "Narwar", "Narwar Fort", "Nasrullaganj", "Nateran", "Neemuch", "Neemuch Cantt",
    "Niwari (MP)", "Niwari Orchha Border", "Nowgong", "Nowgong Chhatarpur", "Obaidullaganj", "Obaidullaganj Sanchi Corridor",
    "Omkareshwar", "Omkareshwar Jyotirlinga", "Orchha", "Orchha Ram Raja Temple", "Pachmarhi", "Pachmarhi Hill Station",
    "Palera", "Panagar", "Pandhana", "Pandhurna", "Pandhurna Orange Hub", "Panna",
    "Panna Diamond City", "Parasia", "Parasia Coal Hub", "Pasan", "Patan (MP)", "Patan Jabalpur",
    "Patur", "Pawai", "Pench National Park", "Pench Turia Gate", "Petlawad", "Pichhore",
    "Pichhore Shivpuri", "Pipariya", "Pipariya Pachmarhi Gate", "Piro", "Pithampur", "Pithampur Auto Cluster",
    "Porsa", "Porsa Morena", "Prithvipur", "Raghogarh", "Raghogarh Guna", "Rahatgarh",
    "Rahatgarh Falls", "Raisen", "Raisen Fort", "Rajgarh (Biaora)", "Rajgarh Biaora", "Rajnagar",
    "Rajpur", "Rajpur Barwani", "Rampura (MP)", "Ranapur", "Ratlam", "Ratlam Namkeen City",
    "Rehli", "Rehti", "Rewa", "Rewa White Tiger Hub", "Sabalgarh", "Sagar",
    "Sagar Smart City", "Sailana", "Sanawad", "Sanawad Narmada", "Sanchi", "Sanchi Stupa World Heritage",
    "Sanwer", "Sanwer Indore", "Sarangpur", "Satna", "Satna City", "Sausar",
    "Sehore", "Sehore City", "Sendhwa", "Sendhwa Border", "Seonde", "Seoni",
    "Seoni City", "Seoni Malwa", "Shahdol", "Shahdol City", "Shahgarh", "Shahpura (Dindori)",
    "Shahpura (Jabalpur)", "Shajapur", "Shajapur City", "Shamshabad (MP)", "Sheopur", "Sheopur Kuno National Park",
    "Shivpuri", "Shivpuri Madhav National Park", "Shujalpur", "Sidhi", "Sidhi City", "Sihora",
    "Sihora Jabalpur", "Silwani", "Singrauli", "Singrauli Energy Hub", "Sirmaur", "Sironj",
    "Sitamau", "Sohagpur", "Sontalai", "Susner", "Susner Cow Sanctuary", "Tarana",
    "Tekanpur", "Tekanpur BSF Academy", "Thandla", "Tikamgarh", "Tikamgarh City", "Timarni",
    "Tirodi", "Udaipura", "Ujjain", "Ujjain Mahakal Jyotirlinga", "Ujjain Mahakaleshwar", "Ujjain Ramghat",
    "Umaria", "Umaria Bandhavgarh Gateway", "Unchehara", "Vidisha", "Vidisha Historic Town", "Waraseoni"
  ],
  "Jammu & Kashmir": [
    "Achabal", "Achabal Mughal Garden", "Ajas Bandipora", "Akhnoor", "Akhnoor Chenab Bank", "Amarnath Baltal Camp",
    "Amarnath Base Baltal", "Amarnath Base Pahalgam", "Amarnath Chandanwari Base", "Anantnag", "Anantnag City", "Aripal",
    "Aripal Tral", "Aru Valley Pahalgam", "Awantipora", "Awantipora Ruins", "Badgam (Budgam)", "Bahu Fort Jammu",
    "Baisaran Valley", "Bandipora", "Bandipora Wular Hub", "Banihal", "Banihal Qazigund Tunnel", "Baramulla",
    "Baramulla Jhelum Bank", "Basantgarh", "Basantgarh Udhampur", "Basohli", "Basohli Miniature Painting Hub", "Batote",
    "Batote NH44", "Beerwah", "Beerwah Budgam", "Betaab Valley Pahalgam", "Bhaderwah", "Bhaderwah Mini Kashmir",
    "Bijbehara", "Billawar", "Bishna", "Bishnah", "Chadoora", "Chandanwari",
    "Charar-i-Sharief", "Charar-i-Sharief Shrine", "Chenani", "Chenani-Nashri Tunnel", "Dalgate (Srinagar)", "Dalgate Srinagar",
    "Devsar", "Devsar Kulgam", "Dinga Amb", "Doda", "Doda City", "Dras",
    "Dras Kargil War Memorial", "Dudu", "Dudu Basantgarh", "Ganderbal", "Ganderbal Sindh River", "Ghagwal",
    "Ghagwal Samba", "Gool", "Gool Gulabgarh", "Gulmarg", "Gulmarg Gondola Hub", "Handwara",
    "Handwara Kupwara", "Hiranagar", "Hiranagar Kathua", "Jammu", "Jammu Airport", "Jammu City",
    "Jammu Tawi Station", "Jourian", "Jourian Akhnoor", "Kangan", "Kangan Sonamarg Route", "Kargil",
    "Kargil Suru Valley", "Kathua", "Kathua Industrial Hub", "Katra (Vaishno Devi)", "Katra Vaishno Devi Base", "Khansahib",
    "Khansahib Budgam", "Khour", "Khour Border", "Khrew", "Khrew Pulwama", "Kishtwar",
    "Kishtwar Saffron Hub", "Kokernag", "Kokernag Botanical Garden", "Kud", "Kud Patnitop", "Kulgam",
    "Kulgam Apple Belt", "Kupwara", "Kupwara Border Hub", "Ladakh Khardung La", "Ladakh Leh Town", "Ladakh Nubra Valley",
    "Ladakh Pangong Tso", "Lakhanpur", "Lakhanpur Gateway to JK", "Langate", "Langate Kupwara", "Latti",
    "Leh", "Leh Main Market", "Leh Pangong Lake", "Lolab Valley", "Lolab Valley Kupwara", "Magam",
    "Magam Tangmarg Route", "Mahanpur", "Mahanpur Kathua", "Majalta", "Majalta Udhampur", "Mansar Lake Jammu",
    "Marheen", "Moungri", "Moungri Udhampur", "Nigeen Lake Area", "Nigeen Lake Srinagar", "Nobra (Nubra Valley)",
    "Nowshera", "Nowshera Rajouri", "Pahalgam", "Pahalgam Valley of Shepherds", "Pampore", "Pampore Saffron Town",
    "Panchari", "Panchari Hills Udhampur", "Pangong Tso", "Patnitop", "Patnitop Hill Station", "Pattan",
    "Pattan Baramulla", "Peer Ki Gali Mughal Road", "Poonch", "Poonch Historic Fort", "Pulwama", "Pulwama City",
    "Qaimoh", "Qaimoh Kulgam", "Qazigund", "Qazigund Gate of Kashmir", "R.S. Pura Indo-Pak Border", "Rajouri",
    "Rajouri Border City", "Ramban", "Ramban Chenab Bridge", "Ramgarh (JK)", "Ramnagar (JK)", "Ramnagar Udhampur",
    "Ranbir Singh Pora (R.S. Pura)", "Reasi", "Reasi Chenab Rail Bridge Hub", "Reasi Chenab Railway Bridge", "Samba", "Samba Border Town",
    "Sanasar Lake & Paragliding", "Sanat Nagar", "Shankaracharya Hill", "Shankaracharya Hill Srinagar", "Shiv Khori Cave Ransoo", "Shopian",
    "Shopian Apple Bowl", "Sonamarg", "Sonamarg Meadow of Gold", "Sopore", "Sopore Apple Town", "Srinagar",
    "Srinagar Dal Lake", "Srinagar Dal Lake Shikara Hub", "Srinagar Lal Chowk", "Srinagar Nishat Bagh", "Srinagar Shalimar Bagh", "Sudh Mahadev",
    "Sudh Mahadev Temple", "Sukrala Mata Billawar", "Sumbal", "Sumbal Sonawari", "Sunderbani", "Sunderbani Rajouri",
    "Surinsar Lake Jammu", "Tangdar", "Tangdar Karnah Valley", "Tangmarg", "Tangmarg Gulmarg Base", "Thannamandi",
    "Thannamandi Rajouri", "Tral", "Tral Town", "Tsrar-e-Sharief", "Tulian Lake Pahalgam", "Udhampur",
    "Udhampur Northern Command", "Uri", "Uri Border Town", "Vaishno Devi Bhawan", "Verinag", "Verinag Jhelum Spring",
    "Vijaypur", "Vijaypur AIIMS Hub", "Wular Lake Area", "Wular Lake Bandipora", "Yusmarg", "Yusmarg Meadow",
    "Zanskar", "Zanskar Valley Padum"
  ],
  "Punjab": [
    "Abohar", "Adampur (PB)", "Ahmedgarh", "Ajnala", "Amloh", "Amritsar",
    "Amritsar Golden Temple", "Anandpur Sahib", "Attari Border (Wagah)", "Bagha Purana", "Balachaur", "Banga",
    "Bareta", "Barnala", "Bassi Pathana", "Batala", "Begowal", "Bhadaur",
    "Bhatinda", "Bhawanigarh", "Bhikhiwind", "Bhiki", "Budhlada", "Chamkaur Sahib",
    "Chandigarh Border", "Cheema", "Dasuya", "Dera Baba Nanak", "Dera Bassi", "Dharamkot",
    "Dhariwal", "Dhuri", "Dina Nagar", "Dirba", "Doraha", "Fatehgarh Churian",
    "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Ferozepur Cantt", "Garhdiwala", "Garhshankar",
    "Ghanaur", "Giddarbaha", "Gurdaspur", "Guru Har Sahai", "Hajipur (PB)", "Hariana",
    "Hathur", "Hoshiarpur", "Jagraon", "Jaitu", "Jalalabad (PB)", "Jalandhar",
    "Jalandhar Cantt", "Jalandhar Model Town", "Jandiala Guru", "Kalanaur (PB)", "Kapurthala", "Kapurthala Rail Coach Factory",
    "Kartarpur", "Kartarpur Corridor Hub", "Khamanon", "Khanna", "Kharar", "Khemkaran",
    "Kot Fatta", "Kot Kapura", "Kurali", "Lalru", "Lehra Gaga", "Ludhiana",
    "Ludhiana Civil Lines", "Ludhiana Clock Tower", "Ludhiana Focal Point", "Ludhiana Model Town", "Majitha", "Makhu",
    "Malerkotla", "Maloud", "Malout", "Mansa", "Maur", "Mehatpur",
    "Moga", "Moonak", "Morinda", "Mukerian", "Muktsar (Sri Muktsar Sahib)", "Mullanpur Dakha",
    "Nabha", "Nakodar", "Nangal", "Nangal Dam", "Nawanshahr (Shaheed Bhagat Singh Nagar)", "Nihalsinghwala",
    "Nurmahal", "Pathankot", "Pathankot Cantt", "Patiala", "Patiala Urban Estate", "Patran",
    "Patti", "Payal", "Phagwara", "Phillaur", "Qadian", "Raikot",
    "Raja Sansi (Airport)", "Rajpura", "Raman", "Rampura Phul", "Rayya", "Ropar (Roopnagar)",
    "Rupnagar IIT Area", "Sahnewal", "Samana", "Samrala", "Sanaur", "Sangrur",
    "Sardulgarh", "Shahkot", "Sham Chaurasi", "Shekhupura", "Sirhind", "Sri Hargobindpur",
    "Sujanpur (PB)", "Sultanpur Lodhi", "Sunam", "Talwandi Bhai", "Talwandi Sabo (Damdama Sahib)", "Tapa",
    "Tarn Taran", "Urmar Tanda", "Zira", "Zirakpur"
  ],
  "Himachal Pradesh": [
    "Amb", "Arki", "Baddi", "Baddi Industrial Hub", "Baijnath", "Banjar",
    "Barmana", "Barog", "Barot", "Bilaspur (HP)", "Bir Billing (Paragliding Hub)", "Chail",
    "Chamba", "Chaupal", "Chintpurni", "Chitkul", "Dadahu", "Dagshai",
    "Dalhousie", "Darlaghat", "Daulatpur", "Dehra Gopipur", "Dharampur", "Dharamshala",
    "Dharamshala Cricket Stadium", "Doon Valley", "Gagal Airport", "Gagret", "Hamirpur (HP)", "Haroli",
    "Indora", "Jawala Mukhi", "Jawali", "Jibhi", "Joginder Nagar", "Kalpa",
    "Kandaghat", "Kangra", "Kangra Temple", "Karsog", "Kasauli", "Kaza",
    "Keylong", "Khajjiar", "Kotkhai", "Kufri", "Kullu", "Kullu Valley",
    "Kumarhatti", "Kupvi", "Lad Bharol", "Manali", "Manali Mall Road", "Manali Solang Valley",
    "Mandi", "Manikaran Sahib", "Mashobra", "McLeod Ganj", "Mehatpur (HP)", "Nadaun",
    "Naggar", "Nahan", "Naina Devi (HP)", "Nalagarh", "Narkanda", "Nurpur",
    "Palampur", "Palampur Tea Gardens", "Paonta Sahib", "Parwanoo", "Pragpur", "Rampur Bushahr",
    "Rawalsar", "Reckong Peo", "Rewalsar", "Rohru", "Salooni", "Sangla Valley",
    "Sangrah", "Sansarpur Terrace", "Sarahan", "Sarkaghat", "Seoni (HP)", "Shahpur",
    "Shillai", "Shimla", "Shimla Mall Road", "Shimla Ridge", "Shoja", "Solan",
    "Spiti Valley", "Sundernagar", "Tabo", "Tattapani", "Theog", "Tissa",
    "Una", "Vashisht"
  ],
  "Uttarakhand": [
    "Almora", "Auli", "Badrinath", "Bageshwar", "Barkot", "Bazpur",
    "Betalghat", "Bhaisiachhana", "Bhikiyasain", "Bhimtal", "Bhowali", "Chakrata",
    "Chamba (UK)", "Champawat", "Chaukhutia", "Chopta", "Dehradun", "Dehradun Airport (Jolly Grant)",
    "Dehradun Clock Tower", "Dehradun FRI Campus", "Dehradun Rajpur Road", "Devprayag", "Dhanaulti", "Dhari",
    "Dhikuli", "Dwarahat", "Gangotri", "Gaurikund", "Ghansali", "Gopeshwar",
    "Guptkashi", "Haldwani", "Haldwani Kathgodam Gateway", "Haridwar", "Haridwar BHEL Hub", "Haridwar Har Ki Pauri",
    "Haridwar Jwalapur", "Haridwar Motichur", "Haridwar Railway Station", "Hawalbagh", "Herbertpur", "Hindolakhal",
    "Jaspur", "Jim Corbett (Ramnagar)", "Joshimath", "Kainchi Dham", "Kaladhungi", "Kalagarh",
    "Kanatal", "Karnaprayag", "Kashipur", "Kathgodam", "Kausani", "Kedarnath",
    "Khatima", "Kichha", "Kirtinagar", "Kotabagh", "Kotdwar", "Lalkuan",
    "Lamgara", "Lansdowne", "Lohaghat", "Mahakali Corridor", "Manglaur", "Marchula",
    "Mohan", "Mukteshwar", "Mussoorie", "Mussoorie Mall Road", "Nainital", "Nainital Mallital",
    "Nainital Tallital", "Naukuchiatal", "New Tehri", "Niti Valley", "Okhalkanda", "Pantnagar",
    "Pauri", "Pithoragarh", "Pithoragarh Airport", "Purola", "Raipur (UK)", "Ramgarh",
    "Ramnagar", "Ranikhet", "Rishikesh", "Rishikesh Laxman Jhula", "Rishikesh Ram Jhula", "Rishikesh Tapovan",
    "Rishikesh Triveni Ghat", "Roorkee", "Roorkee IIT Hub", "Rudraprayag", "Rudrapur", "Rudrapur SIDCUL Hub",
    "Salt", "Sattal", "Shivpuri", "Sitarganj", "Someshwar", "Sonprayag",
    "Srinagar Garhwal", "Syalde", "Takula", "Tapovan", "Tarikhet", "Tungnath",
    "Ukhimath", "Uttarkashi", "Vikasnagar", "Yamunotri"
  ],
  "Rajasthan": [
    "Abu Road", "Ahore", "Ajmer", "Ajmer Dargah Sharif", "Alsisar", "Alwar",
    "Alwar City", "Amet", "Anupgarh", "Asind", "Bagru", "Balotra",
    "Banswara", "Baran", "Bari Sadri", "Barmer", "Bassi (Jaipur)", "Bayana",
    "Beawar", "Begun", "Behror", "Bhadra", "Bharatpur", "Bhilwara",
    "Bhim", "Bhinmal", "Bhiwadi", "Bikaner", "Bilara", "Bishangarh",
    "Chaksu", "Chhabra", "Chhapar (Churu)", "Chittorgarh", "Chomu", "Churu",
    "Dausa", "Deedwana", "Deeg", "Deshnoke (Karni Mata)", "Dhariawad", "Dholpur",
    "Didwana", "Dudu", "Dungarpur", "Fatehnagar", "Fatehpur Shekhawati", "Gajner",
    "Gangapur City", "Gogunda", "Govindgarh (RJ)", "Hanumangarh", "Hindaun", "Jaipur",
    "Jaipur Airport", "Jaipur C-Scheme", "Jaipur Mansarovar", "Jaipur Vaishali Nagar", "Jaisalmer", "Jaisalmer Sam Dunes",
    "Jalore", "Jhalawar", "Jhalrapatan", "Jhunjhunu", "Jodhpur", "Jodhpur Airport",
    "Kaman", "Kapasan", "Kekri", "Keshoraipatan", "Khandela", "Khatu Shyam Ji",
    "Kherwara", "Khimsar", "Kishangarh", "Kishangarh Marble Market", "Kota", "Kota Coaching Hub",
    "Kotputli", "Kuchaman City", "Kumbhalgarh", "Lachhmangarh", "Ladnun", "Lalsot",
    "Mahwa", "Makrana", "Malpura", "Mandalgarh", "Mandawa", "Mangrol",
    "Mehandipur Balaji", "Merta City", "Mount Abu", "Mukundgarh", "Nadbhai", "Nagar (Bharatpur)",
    "Nagaur", "Nainwa", "Nawalgarh", "Neem Ka Thana", "Neemrana", "Neemrana Japanese Zone",
    "Nimbahera", "Niwai", "Nohar", "Nokha", "Osian", "Padampur",
    "Pali", "Parbatsar", "Phalodi", "Pilani", "Pilibanga", "Pindwara",
    "Pipar City", "Pokhran", "Pratapgarh (RJ)", "Pushkar", "Pushkar Brahma Temple", "Raipur (Pali)",
    "Raisinghnagar", "Rajakhera", "Rajaldesar", "Rajgarh (Alwar)", "Rajsamand", "Ramganj Mandi",
    "Ramgarh (Shekhawati)", "Rani (Pali)", "Ranthambore (Sawai Madhopur)", "Ratangarh", "Rawatbhata", "Rawatsar",
    "Sadulpur (Rajgarh)", "Salasar Balaji", "Salumbar", "Sambhar Lake", "Sanchore", "Sangaria",
    "Sardarshahar", "Sarwar", "Sawai Madhopur", "Shahpura (Bhilwara)", "Shahpura (Jaipur)", "Sheoganj",
    "Sikar", "Sirohi", "Siwana", "Sojat", "Sri Dungargarh", "Sri Ganganagar",
    "Sri Madhopur", "Sujangarh", "Suratgarh", "Tijara", "Tonk", "Udaipur",
    "Udaipur City Palace", "Udaipur Fatehsagar", "Vallabhnagar", "Viratnagar", "Wer"
  ],
  "Other States": [
    "Agartala", "Ahmedabad", "Ahmedabad Airport", "Ahmedabad Ashram Road", "Ahmedabad SG Highway", "Aizawl",
    "Alibaug", "Amravati", "Anand (GJ)", "Ankleshwar", "Asansol", "Aurangabad (Chhatrapati Sambhajinagar)",
    "Bardhaman", "Baroda (Vadodara)", "Bengaluru", "Bengaluru Airport", "Bengaluru Whitefield", "Bhagalpur",
    "Bhavnagar", "Bhilai", "Bhubaneswar", "Bodh Gaya", "Bokaro Steel City", "Calangute (Goa)",
    "Candolim (Goa)", "Chandigarh Central", "Chandigarh Sector 17", "Chandrapur", "Chennai", "Cuttack",
    "Daman", "Darbhanga", "Darjeeling", "Deoghar (Baidyanath Dham)", "Dhanbad", "Diu",
    "Durgapur", "Dwarka (Gujarat)", "Gandhidham", "Gandhinagar", "Gangtok", "Gaya",
    "Gir Somnath", "Goa", "Goa Airport (Dabolim)", "Goa Airport (Mopa)", "Godhra", "Guwahati",
    "Hazaribagh", "Howrah", "Hubballi", "Hyderabad", "Hyderabad Hitec City", "Imphal",
    "Itanagar", "Jalgaon", "Jamnagar", "Jamshedpur", "Junagadh", "Kalyan (MH)",
    "Kharagpur", "Kochi", "Kohima", "Kolhapur", "Kolkata", "Kolkata Airport (CCU)",
    "Kolkata Park Street", "Lonavala", "Madgaon (Margao)", "Madurai", "Mahabaleshwar", "Malda",
    "Mapusa (Goa)", "Mehsana", "Miraj", "Morbi", "Mumbai", "Mumbai Airport (BOM)",
    "Mumbai Bandra", "Mumbai BKC Hub", "Mumbai Borivali", "Mumbai Colaba", "Mumbai Dadar", "Mumbai Marine Drive",
    "Mumbai Navi Mumbai", "Mumbai Thane", "Muzaffarpur", "Nadiad", "Nagpur", "Nanded",
    "Nashik", "Navsari", "Palghar", "Panaji (Goa)", "Panvel", "Patan (Gujarat)",
    "Patna", "Patna Airport", "Pimpri-Chinchwad", "Porbandar", "Pune", "Pune Airport",
    "Pune Hinjawadi", "Pune Koregaon Park", "Pune Shivaji Nagar", "Puri", "Raipur (CG)", "Rajkot",
    "Ranchi", "Ranchi Airport", "Rourkela", "Sangli", "Satara", "Shillong",
    "Shirdi (Sai Baba Temple)", "Siliguri", "Solapur", "Somnath (Jyotirlinga)", "Surat", "Surat Ring Road",
    "Thane City", "Trivandrum", "Vadodara Airport", "Vapi", "Varanasi Transit Hub", "Vasco da Gama (Goa)",
    "Veraval", "Visakhapatnam"
  ],
};

// Popular departure origins for quick switching
const ORIGIN_CHIPS = [
  "Ghaziabad",
  "Delhi",
  "Noida",
  "Greater Noida",
  "Gurugram",
  "Faridabad",
  "Delhi Airport",
  "Haridwar"
];

interface RoutesTabWidgetProps {
  initialOrigin?: string;
  initialActiveState?: string;
}

export default function RoutesTabWidget({ initialOrigin, initialActiveState }: RoutesTabWidgetProps = {}) {
  const [activeState, setActiveState] = useState<string>(initialActiveState || "Haryana");
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
        {Object.keys(STATE_DESTINATIONS).map((state) => {
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
