export const DAILY_CHALLENGES = [
  { id: 1,  icon: 'shopping-bag', title: 'Reusable Bag Day',       desc: 'Carry a cloth bag instead of accepting plastic bags when shopping.' },
  { id: 2,  icon: 'shower', title: 'Short Shower Challenge',  desc: 'Take a shower that is 5 minutes shorter than usual to save water.' },
  { id: 3,  icon: 'lightbulb', title: 'Lights Out',              desc: 'Turn off lights in every empty room in your home for the full day.' },
  { id: 4,  icon: 'salad', title: 'Plant-Based Meal',        desc: 'Eat at least one completely plant-based meal today — no meat or dairy.' },
  { id: 5,  icon: 'trash', title: 'Litter Patrol',           desc: 'Pick up at least 3 pieces of litter you see outside today.' },
  { id: 6,  icon: 'footprints', title: 'Walk or Cycle',           desc: 'Replace one car/bike ride with walking or cycling today.' },
  { id: 7,  icon: 'printer', title: 'Paperless Day',           desc: 'Avoid printing anything today — use digital notes instead.' },
  { id: 8,  icon: 'tree', title: 'Tree Appreciation',       desc: 'Learn about one tree species in your area and share the fact with a friend.' },
  { id: 9,  icon: 'plug', title: 'Unplug Electronics',      desc: 'Unplug all chargers and electronics you are not using today.' },
  { id: 10, icon: 'recycle', title: 'Proper Waste Sorting',   desc: 'Sort your household waste into recyclable and non-recyclable today.' },
  { id: 11, icon: 'sprout', title: 'Herb Garden Start',       desc: 'Plant a seed or herb cutting in a small pot or bottle today.' },
  { id: 12, icon: 'bird', title: 'Bird Watching',           desc: 'Spot and identify at least 2 bird species near you today.' },
  { id: 13, icon: 'monitor', title: 'Dark Mode Day',           desc: 'Switch all your screens to dark mode to save energy today.' },
  { id: 14, icon: 'leaf', title: 'Composting Start',        desc: 'Set aside vegetable peels and food scraps for composting today.' },
  { id: 15, icon: 'droplet', title: 'Fix the Drip',            desc: 'Check all taps in your home for leaks and report or fix them.' },
  { id: 16, icon: 'sun', title: 'Solar Learning',          desc: 'Read or watch one video about solar energy for 10 minutes.' },
  { id: 17, icon: 'smartphone', title: 'Eco App Explorer',        desc: 'Download and explore one environment-focused app today.' },
  { id: 18, icon: 'handshake', title: 'Swap & Share',            desc: 'Share or swap one item with a friend instead of buying new.' },
  { id: 19, icon: 'droplet', title: 'Refill, Don\'t Buy',      desc: 'Refill a water bottle or container instead of buying a new one.' },
  { id: 20, icon: 'waves', title: 'Ocean Fact Spread',       desc: 'Share one ocean conservation fact with at least 2 people today.' },
  { id: 21, icon: 'flower', title: 'Pollinator Friend',       desc: 'Leave out a shallow dish of water to help bees and butterflies.' },
  { id: 22, icon: 'x-circle', title: 'Single-Use Free Day',     desc: 'Go the entire day without using any single-use plastic items.' },
  { id: 23, icon: 'book-open', title: 'Eco Reading',             desc: 'Read an article or chapter about climate change for 15 minutes.' },
  { id: 24, icon: 'shower', title: 'Bucket Bath',             desc: 'Use a bucket instead of a shower or bath to conserve water.' },
  { id: 25, icon: 'globe', title: 'Carbon Footprint Check',  desc: 'Use an online calculator to estimate your daily carbon footprint.' },
  { id: 26, icon: 'apple', title: 'Local Produce Day',       desc: 'Eat only locally grown or seasonal produce today to cut food miles.' },
  { id: 27, icon: 'handshake', title: 'Eco Volunteer',           desc: 'Sign up for or participate in a local environment clean-up event.' },
  { id: 28, icon: 'wind', title: 'Wind Energy Learn',       desc: 'Learn how wind turbines work and share your knowledge today.' },
  { id: 29, icon: 'flower', title: 'Save the Bees',           desc: 'Plant or water a bee-friendly flower in a garden or balcony pot.' },
  { id: 30, icon: 'tree-pine', title: 'Gratitude for Nature',    desc: 'Spend 10 minutes outdoors in silence appreciating the natural world.' },
];

export const getTodayChallenge = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
};

export const ECO_NEWS = [
  {
    id: 1, icon: 'thermometer', source: 'Climate Monitor',
    date: 'Apr 28, 2026',
    headline: 'Global Temperatures Hit Record High for Third Consecutive Year',
    content: 'Scientists from 45 countries confirmed that 2025 was the hottest year on record, surpassing the previous mark set in 2024. The global average temperature rose 1.6°C above pre-industrial levels, triggering renewed calls for accelerated emissions cuts at the upcoming COP32 summit.',
  },
  {
    id: 2, icon: 'waves', source: 'Ocean Watch',
    date: 'Apr 25, 2026',
    headline: 'Great Barrier Reef Shows Signs of Recovery After New Conservation Push',
    content: 'A two-year intensive reef restoration project using coral fragment seeding has shown a 23% increase in live coral coverage in three pilot zones of the Great Barrier Reef. Marine biologists call it a "cautious win" while stressing water temperature reduction remains critical.',
  },
  {
    id: 3, icon: 'sun', source: 'Green Energy Today',
    date: 'Apr 22, 2026',
    headline: 'India Surpasses 200 GW Solar Capacity, Leads Asia in Renewable Growth',
    content: 'India achieved a major milestone on Earth Day, crossing 200 gigawatts of installed solar power capacity. The country\'s renewable energy sector now employs over 850,000 workers, making it the second-largest green economy employer in Asia after China.',
  },
  {
    id: 4, icon: 'globe', source: 'Wildlife Weekly',
    date: 'Apr 20, 2026',
    headline: 'African Elephant Population Grows 10% Following Anti-Poaching Crackdown',
    content: 'A continent-wide census revealed a 10% increase in African elephant numbers over five years, attributed to strengthened anti-poaching laws, community ranger programs, and expanded protected corridor zones. Conservationists warn habitat loss remains an ongoing threat.',
  },
  {
    id: 5, icon: 'recycle', source: 'Zero Waste Journal',
    date: 'Apr 18, 2026',
    headline: 'EU Bans Single-Use Plastics in All Member States Starting May 2026',
    content: 'The European Union\'s landmark single-use plastic ban officially takes effect next month, covering items including cutlery, plates, straws, and cotton bud sticks. Member states report 30,000+ businesses have already transitioned to biodegradable alternatives.',
  },
  {
    id: 6, icon: 'droplet', source: 'WaterWatch Global',
    date: 'Apr 15, 2026',
    headline: 'New Atmospheric Water Harvesting Tech Brings Fresh Water to Desert Communities',
    content: 'A Chennai-based startup\'s mesh-based atmospheric water generator now provides 200 litres of potable water per day to each of 50 villages in Rajasthan. The device requires no electricity and uses only ambient humidity, offering a model for water-scarce regions worldwide.',
  },
  {
    id: 7, icon: 'tree', source: 'Forest Future',
    date: 'Apr 12, 2026',
    headline: 'Brazil\'s Amazon Deforestation Rate Drops 65% Under New Environmental Laws',
    content: 'Brazil\'s environment ministry reported a 65% drop in Amazon deforestation rates compared to the 2019 peak, crediting stricter enforcement, satellite monitoring, and an Indigenous land rights expansion that protects 2.6 million square kilometres of forest.',
  },
  {
    id: 8, icon: 'ship', source: 'Maritime Eco',
    date: 'Apr 10, 2026',
    headline: 'First Hydrogen-Powered Cargo Ship Completes Trans-Pacific Voyage',
    content: 'The MV Eco Pioneer completed its maiden voyage from Osaka to Los Angeles powered entirely by green hydrogen, covering 9,000 km with zero carbon emissions. The milestone signals a turning point for the shipping industry which accounts for 3% of global greenhouse gases.',
  },
  {
    id: 9, icon: 'wheat', source: 'Agri-Climate News',
    date: 'Apr 8, 2026',
    headline: 'Regenerative Farming Boom: 12 Million Acres Converted in India This Year',
    content: 'A government subsidy programme and NGO partnerships have converted over 12 million acres of Indian farmland to regenerative agriculture practices, improving soil carbon storage, reducing fertiliser use by 40%, and boosting average farmer income by ₹18,000 annually.',
  },
  {
    id: 10, icon: 'battery', source: 'Battery Tech Digest',
    date: 'Apr 5, 2026',
    headline: 'New Sodium-Ion Battery Breakthrough Could Replace Lithium at Half the Cost',
    content: 'Researchers at IIT Bombay unveiled a sodium-ion battery with energy density comparable to lithium-ion but using 60% cheaper and more abundant materials. Analysts predict commercial production by 2028, potentially accelerating EV adoption in cost-sensitive markets like India and Africa.',
  },
  {
    id: 11, icon: 'fish', source: 'Seafood Watch',
    date: 'Apr 3, 2026',
    headline: 'Global Fish Stocks Show Improvement as Sustainable Fishing Agreements Expand',
    content: 'A UN Food and Agriculture Organization report shows 15% of previously overfished stocks have recovered since 2022 under expanded sustainable fishing agreements signed by 78 nations. The report highlights marine protected areas as the single most effective conservation tool.',
  },
  {
    id: 12, icon: 'wind', source: 'Wind Power Daily',
    date: 'Apr 1, 2026',
    headline: 'Offshore Wind Farm Powers Entire Mumbai for One Week During Monsoon',
    content: 'During peak monsoon winds last week, Maharashtra\'s offshore wind farms generated enough electricity to power all of Mumbai\'s 22 million residents for seven consecutive days. The event is being called a "proof of concept" for India\'s ambitious 60 GW offshore wind target by 2030.',
  },
];

export const getNewsForThisWeek = () => {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const startIndex = (weekNumber * 3) % ECO_NEWS.length;
  return [
    ECO_NEWS[startIndex % ECO_NEWS.length],
    ECO_NEWS[(startIndex + 1) % ECO_NEWS.length],
    ECO_NEWS[(startIndex + 2) % ECO_NEWS.length],
  ];
};
