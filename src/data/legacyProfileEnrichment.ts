import { Profile } from '../types/profile';

export type LegacyProfileEnrichment = Partial<Pick<Profile, 'bio' | 'name' | 'openingMove' | 'prompts' | 'interests'>>;

/** Realistic copy overrides for legacy demo profiles (ids 1–88). */
export const LEGACY_PROFILE_ENRICHMENT: Record<string, LegacyProfileEnrichment> = {
  '1': {
    bio: "Product designer at a Brooklyn startup — weekend hikes, pour-over coffee, and bad puns that somehow still land.",
    openingMove: "Best cheap espresso within walking distance?",
    prompts: [{ question: "My simple pleasures", answer: "Golden-hour walks and a perfect cortado." }],
  },
  '2': {
    bio: "UX lead by day, vinyl collector by night. Tacos are a love language and I will rank your neighborhood spots.",
    openingMove: "Best hidden gem in Manhattan?",
    prompts: [{ question: "Together we could", answer: "Dig for records then hunt the best taco cart." }],
  },
  '3': {
    bio: "Marketing coordinator who plans trips around ramen shops. Yoga mornings, indie cinema nights, always scouting the next bowl.",
    openingMove: "Coffee or cocktails for a first meet?",
    prompts: [{ question: "The way to win me over is", answer: "Recommend a spot I have not tried yet." }],
  },
  '4': {
    bio: "Founder building a pet-tech side project from Jersey City. Dog dad to a chaotic corgi; playlist swaps are mandatory.",
    openingMove: "What song is on repeat for you this week?",
  },
  '5': {
    bio: "Curator at a small SoHo gallery — museum dates over club nights, currently obsessed with a pottery class I am bad at.",
    openingMove: "Last exhibit that actually stuck with you?",
    prompts: [{ question: "Typical Sunday", answer: "Gallery hop, then wine on the terrace." }],
  },
  '6': {
    bio: "Mechanical engineer in Astoria who runs before work and experiments in the kitchen after. Road trips with no fixed plan.",
    openingMove: "Spontaneous weekend trip — beach or mountains?",
  },
  '11': {
    bio: "Data analyst at a fintech in Long Island City. Still cries at Pixar, boulders on weeknights, and a soft spot for animated films.",
    openingMove: "Tabs or spaces? (Kidding — coffee first.)",
    prompts: [{ question: "Green flags I look for", answer: "Curiosity and kindness without the performance." }],
  },
  '12': {
    bio: "Jazz pianist playing gigs around Harlem. Coffee snob with kind feedback, late-night sets, and a growing vinyl collection.",
    openingMove: "Neighborhood spot or stay-in-and-cook?",
  },
  '13': {
    bio: "Third-year med student at Columbia — matcha-dependent, tennis when the schedule allows, and unreasonably optimistic.",
    name: "Elise",
    openingMove: "Best study-break snack in your rotation?",
  },
  '14': {
    bio: "Software engineer in Rockaway who surfs when the swell cooperates and codes when it does not. Dog named Biscuit runs the house.",
    openingMove: "Morning person or night owl — defend your answer.",
  },
  '15': {
    bio: "Architect at a Brooklyn studio — sketches buildings and strangers on the subway, Pratt grad, modern art on slow Sundays.",
    name: "Arielle",
    openingMove: "Favorite building in the city and why?",
    prompts: [{ question: "A life goal of mine", answer: "Design a community library that feels alive." }],
  },
  '16': {
    bio: "Physical therapist in Queens — soccer Sundays, salsa Tuesdays, and a serious opinion about where to get tacos.",
    openingMove: "Dance floor or dinner reservation?",
  },
  '17': {
    bio: "Book editor in Park Slope who hosts a monthly book club and will recommend three novels before appetizers arrive.",
    name: "Helen",
    openingMove: "Fiction or nonfiction rabbit hole lately?",
    prompts: [{ question: "Best travel story", answer: "Got lost in Lisbon and found the best pasteis." }],
  },
  '18': {
    bio: "Freelance photographer based in Bushwick — chases golden hour across the boroughs, shoots on film when the light cooperates.",
    openingMove: "Favorite NYC view at sunset?",
  },
  '19': {
    bio: "Pastry chef in Greenwich running a small vegan bakery side hustle. Sourdough starter has its own personality at this point.",
    openingMove: "Sweet or savory brunch person?",
  },
  '20': {
    bio: "High school history teacher in Newark who hosts trivia nights and collects useless facts the way others collect stamps.",
    openingMove: "Team name if we entered pub trivia tonight?",
  },
  '21': {
    bio: "Florist in Hoboken with a green thumb and a soft spot for rom-coms. Sunday mornings mean flowers and a slow breakfast.",
    openingMove: "Farmers market or sleep-in kind of Sunday?",
    prompts: [{ question: "My simple pleasures", answer: "Fresh flowers and rainy Sundays." }],
  },
  '22': {
    bio: "Financial analyst in Stamford who would rather talk climbing gear than spreadsheets. Whiskey on the porch after long hikes.",
    openingMove: "Indoor gym or outdoor crag?",
  },
  '23': {
    bio: "Freelance illustrator in White Plains — cat mom, vintage postcard collector, and always carrying a sketchbook.",
    openingMove: "Cats, dogs, or something weirder?",
  },
  '24': {
    bio: "Personal trainer in Yonkers who meal-preps like it is a sport and plays pickup basketball on Thursdays.",
    openingMove: "Favorite post-workout meal?",
  },
  '25': {
    bio: "Film student at Princeton — subtitles only, thrift-store jackets, and strong opinions about directors you have not heard of.",
    openingMove: "Last movie that genuinely surprised you?",
  },
  '26': {
    bio: "Winery tour guide in New Brunswick on weekends. Dad jokes are complimentary; travel stories are not.",
    openingMove: "Red, white, or something weird and natural?",
  },
  '27': {
    bio: "ER nurse in Philadelphia with impossible hours and stories that should be a podcast. Hikes when off-duty to reset.",
    openingMove: "Comfort food after a long day?",
  },
  '28': {
    bio: "Barista who won a local pour-over competition in Philly. Bikes everywhere and takes coffee as seriously as you would expect.",
    openingMove: "Pour-over or straight espresso?",
  },
  '29': {
    bio: "DJ and plant parent in Baltimore — apartment is mostly speakers and ferns, and I am not apologizing for it.",
    openingMove: "House show or quiet bar with good music?",
    prompts: [{ question: "I'm looking for", answer: "Someone who dances like nobody's watching." }],
  },
  '30': {
    bio: "Environmental lawyer in DC who picks up litter on first dates without making it a whole thing. Kayaks when the weather allows.",
    openingMove: "Best farmers market find this month?",
  },
  '31': {
    bio: "Remote developer bouncing between Boston coffee shops — skis in winter, board games when the Wi-Fi is good.",
    name: "Eli",
    openingMove: "Co-op game or competitive trash talk?",
  },
  '32': {
    bio: "Fashion buyer in Boston with opinions about fit, thrifting as a sport, and museum dates that run long.",
    openingMove: "Best thrift score you are still proud of?",
  },
  '33': {
    bio: "Marine biologist in Providence with strong octopus opinions and scuba stories that go too long.",
    openingMove: "Ocean person or pool person?",
  },
  '34': {
    bio: "Dance instructor in Hartford — rhythm in my body, chaos in my calendar, smoothies for dinner more often than I admit.",
    openingMove: "Salsa class or just go straight to the dance floor?",
  },
  '35': {
    bio: "Head brewer at a small Portland brewery — hoppy IPAs, longer hikes, and live music in basements.",
    name: "Luca B.",
    openingMove: "IPA, lager, or something sour?",
  },
  '36': {
    bio: "UX researcher in Montreal who interviews strangers for work and still gets nervous on first dates. Bilingual and ski-obsessed.",
    name: "Meilin W.",
    openingMove: "Explore a new neighborhood or revisit a favorite?",
    prompts: [{ question: "Together we could", answer: "Pick a new city every few months." }],
  },
  '37': {
    bio: "Editorial assistant in Chelsea — always has a novel in her bag, brunch is a personality trait, museums on rainy days.",
    openingMove: "Book you wish more people would read?",
  },
  '38': {
    bio: "Outdoor guide on the Lower East Side — climber, dog person, perpetually planning the next trip on a cork board.",
    openingMove: "Last place you traveled that felt worth the hype?",
  },
  '39': {
    bio: "Film student in the East Village who lives at indie cinemas and midnight screenings. Coffee before conversation.",
    openingMove: "Subtitles or dubbed — and why?",
  },
  '40': {
    bio: "Sous chef in Tribeca — serious about ingredients, relaxed about everything else. Will cook for you by date two.",
    openingMove: "Farmers market haul or restaurant reservation?",
  },
  '41': {
    bio: "Therapist in the West Village who practices boundaries and brunch with equal conviction. Yoga when the week allows.",
    openingMove: "What helps you unwind after a heavy week?",
    prompts: [{ question: "Green flags I look for", answer: "Emotional intelligence and good humor." }],
  },
  '42': {
    bio: "Product manager in Brooklyn Heights — bikes to work rain or shine and tests recipes like they are user flows.",
    openingMove: "Best bike route in the city?",
  },
  '43': {
    bio: "Street photographer in DUMBO chasing golden hour along the waterfront. Coffee before 9 a.m. is non-negotiable.",
    openingMove: "Favorite photo spot tourists miss?",
  },
  '44': {
    bio: "Restaurant owner in Little Italy — Sunday pasta from scratch, wine list opinions, and soccer matches on the calendar.",
    openingMove: "Carbonara or cacio e pepe?",
  },
  '45': {
    bio: "Nonprofit director in the Bronx building community gardens. Running clears my head; composting is a hobby now.",
    openingMove: "Volunteer project or cozy night in?",
    prompts: [{ question: "A life goal of mine", answer: "Launch a neighborhood compost program." }],
  },
  '46': {
    bio: "Neuroscience PhD candidate at Columbia — chess in the park, jazz bars after lab, and dream analysis with disclaimers.",
    openingMove: "Ever kept a dream journal?",
  },
  '47': {
    bio: "Voice actor in Hell's Kitchen — karaoke is research, theater kid energy, and a shower-singer rivalry waiting to happen.",
    openingMove: "Go-to karaoke song — no shame.",
  },
  '48': {
    bio: "Firefighter in Queens who meal-preps on night shifts and reads sci-fi between calls. Fitness is part of the job.",
    openingMove: "Board game night or outdoor adventure?",
  },
  '49': {
    bio: "Ceramic artist in Gowanus — apartment smells like clay and incense, tea ritual every morning, wheel throwing on Sundays.",
    openingMove: "Museum or maker studio date?",
    prompts: [{ question: "Typical Sunday", answer: "Wheel throwing and a long bath." }],
  },
  '50': {
    bio: "Stand-up comedian in Williamsburg — will make you laugh or die trying. Podcasts, tacos, and open mics on Tuesdays.",
    openingMove: "Funniest thing that happened to you this week?",
  },
  '51': {
    bio: "Event planner in Fort Greene known for dinner parties that run late. Wine pairings are a love language.",
    openingMove: "Dinner party theme you would actually host?",
  },
  '52': {
    bio: "Cardiologist in Jersey City with a soft spot for board game nights and morning runs along the waterfront.",
    openingMove: "Competitive or cooperative games?",
  },
  '53': {
    bio: "Sustainability consultant in Hoboken — thrifted wardrobe, zero-waste kitchen experiments, and strong opinions about takeout containers.",
    name: "Camila",
    openingMove: "Best secondhand find you still wear?",
  },
  '54': {
    bio: "Architectural photographer in Newark chasing perfect light on brutalist buildings. Travel when assignments allow.",
    openingMove: "Favorite building in the tri-state area?",
  },
  '55': {
    bio: "Veterinary student in Stamford who stops for every dog and bakes when procrastinating on studying.",
    name: "Tess",
    openingMove: "Cats, dogs, or something exotic?",
  },
  '56': {
    bio: "Former sommelier turned tech founder in Greenwich — pairs wine with pitch decks and skis when the quarter ends.",
    openingMove: "Startup idea or vineyard tour?",
    prompts: [{ question: "Together we could", answer: "Tour vineyards upstate." }],
  },
  '57': {
    bio: "UX designer in Williamsburg — museums by day, jazz bars by night, and a sketchbook always in my bag.",
    openingMove: "Live music venue worth the cover?",
  },
  '58': {
    bio: "Youth basketball coach in Harlem who meal-preps Sundays and argues about Knicks lineups with affection.",
    name: "Malcolm",
    openingMove: "Celtics or Knicks — pick a side.",
  },
  '59': {
    bio: "Translator in Astoria fluent in three languages, always booking the window seat, and hunting for underrated bakeries.",
    name: "Helena",
    openingMove: "Language you wish you spoke fluently?",
  },
  '60': {
    bio: "Firefighter in Queens — dad jokes are cardio, BBQ on the roof when the weather cooperates, dog person without a dog yet.",
    name: "Jesse",
    openingMove: "Grill master or takeout loyalist?",
  },
  '66': {
    bio: "Elementary school teacher in Jersey City with too many plants and mugs. Steady vibes, slow mornings, yoga when I can.",
    openingMove: "Book or show you recommend to everyone?",
  },
  '67': {
    bio: "Dentist in Washington Heights — salsa on Thursdays, tacos as a love language, and dance shoes in the office closet.",
    name: "Rafael",
    openingMove: "Lead or follow on the dance floor?",
  },
  '68': {
    bio: "Animator in Bushwick who hypes side projects and stays up too late watching reference reels.",
    name: "Simone",
    openingMove: "Favorite animated film that is not Disney?",
  },
  '69': {
    bio: "Jazz singer with a day job in product design — tiny venues, strong playlist opinions, and wine bars after sets.",
    name: "Reese",
    openingMove: "Desert island album?",
    prompts: [{ question: "I go crazy for", answer: "Live sets in small rooms." }],
  },
  '70': {
    bio: "Youth basketball coach in the Bronx who meal-preps like clockwork and listens to podcasts on the train.",
    name: "Darius",
    openingMove: "Knicks game or pickup at the park?",
  },
  '71': {
    bio: "Backend engineer in Flatiron who still writes thank-you notes by hand and hikes upstate when the sprint ends.",
    name: "Anjali",
    openingMove: "Best Thai spot near your place?",
  },
  '72': {
    bio: "Craft cocktail bartender on the Lower East Side — old fashioneds, film recommendations, and bike rides over the bridge.",
    name: "Finn",
    openingMove: "Neat, rocks, or spicy marg?",
  },
  '73': {
    bio: "Veterinarian on the Upper East Side who sends dog pictures without asking and runs before the clinic opens.",
    name: "Zoey",
    openingMove: "Cats or dogs — defend your answer.",
  },
  '74': {
    bio: "Architect in DUMBO sketching facades and brunch menus with equal seriousness. Museums when the weather turns.",
    name: "Andreas",
    openingMove: "Best croissant in Brooklyn?",
    prompts: [{ question: "Together we could", answer: "Find the best croissant in Brooklyn." }],
  },
  '75': {
    bio: "Tattoo artist in Bushwick — gentle hands, sharp lines, punk shows on weekends, and a skateboard that has seen things.",
    name: "Lenore",
    openingMove: "First tattoo or adding to the collection?",
  },
  '76': {
    bio: "Documentary filmmaker in Long Island City between projects — scouting locations, drinking too much coffee, always carrying a camera.",
    openingMove: "Doc or narrative — what hooked you last?",
  },
  '77': {
    bio: "Psych grad student in Greenwich Village — good listener, better at ranking takeout, true crime on the commute.",
    name: "Eleni",
    openingMove: "Podcast episode you would make everyone hear?",
  },
  '78': {
    bio: "High school math teacher in Park Slope who climbs on weekends and hosts board game nights that get competitive.",
    name: "Tomas",
    openingMove: "Indoor boulder or outdoor route?",
  },
  '79': {
    bio: "Pastry chef in Chinatown — sugar rush is a lifestyle, karaoke after closing, anime when the kitchen is clean.",
    name: "Meilin",
    openingMove: "Sweet or savory brunch?",
  },
  '80': {
    bio: "Real estate agent in Hoboken who actually reads neighborhood guides and cooks soccer-match snacks for friends.",
    name: "Karim",
    openingMove: "Best block in your neighborhood?",
  },
  '81': {
    bio: "Pilates instructor in the West Village — alignment matters in movement and in conversation. Matcha after class.",
    name: "Jada",
    openingMove: "Reformer or mat person?",
  },
  '82': {
    bio: "Indie game developer in Williamsburg who beta-tests weird ideas and treats espresso like a hobby.",
    name: "Colin",
    openingMove: "Last game that stole your weekend?",
    prompts: [{ question: "I geek out on", answer: "Roguelikes and sourdough." }],
  },
  '83': {
    bio: "ER nurse in Queens with stories that should be classified and a yoga habit that keeps her upright.",
    openingMove: "Best thrift store in your borough?",
  },
  '84': {
    bio: "Sommelier in Tribeca pretending not to judge your wine order — jazz bars, natural wine, and long dinners.",
    openingMove: "Red, white, or natural?",
  },
  '85': {
    bio: "Fashion buyer in SoHo — thrift stores are temples, sample sales are sport, and street photography on lunch breaks.",
    openingMove: "Vintage find you still wear every week?",
  },
  '86': {
    bio: "Comedian in the East Village — stand-up on Tuesdays, dad jokes on Wednesdays, tacos always.",
    name: "Dean",
    openingMove: "Open mic or polished show?",
  },
  '87': {
    bio: "Nonprofit director in Brooklyn Heights — optimistic with a planner, morning runs, and a stack of books by the bed.",
    openingMove: "Cause you care about that does not get enough attention?",
    prompts: [{ question: "A life goal of mine", answer: "Open a community garden." }],
  },
  '88': {
    bio: "Chef in Little Italy — serious about pasta, relaxed about everything else, cycling when the kitchen is closed.",
    openingMove: "Carbonara or amatriciana?",
  },
};

export function applyLegacyProfileEnrichment(profile: Profile): Profile {
  const patch = LEGACY_PROFILE_ENRICHMENT[profile.id];
  if (!patch) {
    return profile;
  }
  return {
    ...profile,
    ...patch,
    prompts: patch.prompts ?? profile.prompts,
    interests: patch.interests ?? profile.interests,
  };
}
