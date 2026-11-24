import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */
type Lang = 'lt' | 'en'
type Page =
  | 'home'
  | 'directory'
  | 'resources'
  | 'how'
  | 'specialists'
  | 'profile'
  | 'booking'
  | 'dashboard'
  | 'article'
  | 'my-bookings'
  | 'privacy'
  | 'terms'
  | 'cancellation'

type Profile = {
  id: number
  name: string
  title: Record<Lang, string>
  category: string
  expertise: Record<Lang, string>
  city: string
  price: number
  languages: string[]
  formats: ('online' | 'in-person')[]
  image: string
  about: Record<Lang, string>
  qualifications: Record<Lang, string>
  age: Record<Lang, string>
}

type Booking = {
  id: string
  profileId: number
  date: string
  time: string
  format: 'online' | 'in-person'
  name: string
  email: string
  phone: string
  price: number
  status: 'paid' | 'cancelled'
  createdAt: string
}

/* ═══════════════════════════════════════════════════════════════════
   CENTRAL STORE – React Context
   ═══════════════════════════════════════════════════════════════════ */
type Store = {
  lang: Lang
  setLang: (l: Lang) => void
  page: Page
  go: (p: Page) => void
  selected: number
  setSelected: (id: number) => void
  bookings: Booking[]
  addBooking: (b: Booking) => void
  cancelBooking: (id: string) => void
  resetBookings: () => void
  category: string
  setCategory: (c: string) => void
  city: string
  setCity: (c: string) => void
  articleIdx: number
  setArticleIdx: (i: number) => void
  openProfile: (id: number) => void
  openBooking: (id: number) => void
  findWithCategory: (cat: string) => void
  isSlotTaken: (profileId: number, date: string, time: string) => boolean
  paidBookings: Booking[]
  totalRevenue: number
  platformRevenue: number
  specialistEarnings: number
}

const Ctx = createContext<Store>(null as unknown as Store)
const useStore = () => useContext(Ctx)

function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLangRaw] = useState<Lang>(() => (localStorage.getItem('nc-lang') as Lang) || 'lt')
  const [page, setPage] = useState<Page>('home')
  const [selected, setSelected] = useState(0)
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try { return JSON.parse(localStorage.getItem('nc-bookings') || '[]') } catch { return [] }
  })
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [articleIdx, setArticleIdx] = useState(0)

  const setLang = useCallback((l: Lang) => { setLangRaw(l); localStorage.setItem('nc-lang', l) }, [])

  useEffect(() => { localStorage.setItem('nc-bookings', JSON.stringify(bookings)) }, [bookings])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [page])

  const go = useCallback((p: Page) => setPage(p), [])
  const addBooking = useCallback((b: Booking) => setBookings(prev => [...prev, b]), [])
  const cancelBooking = useCallback((id: string) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b)), [])
  const resetBookings = useCallback(() => { setBookings([]); localStorage.removeItem('nc-bookings') }, [])
  const openProfile = useCallback((id: number) => { setSelected(id); setPage('profile') }, [])
  const openBooking = useCallback((id: number) => { setSelected(id); setPage('booking') }, [])
  const findWithCategory = useCallback((cat: string) => { setCategory(cat); setPage('directory') }, [])
  const isSlotTaken = useCallback((profileId: number, date: string, time: string) =>
    bookings.some(b => b.profileId === profileId && b.date === date && b.time === time && b.status === 'paid'), [bookings])

  const paidBookings = useMemo(() => bookings.filter(b => b.status === 'paid'), [bookings])
  const totalRevenue = useMemo(() => paidBookings.reduce((a, b) => a + b.price, 0), [paidBookings])
  const platformRevenue = useMemo(() => +(totalRevenue * 0.15).toFixed(2), [totalRevenue])
  const specialistEarnings = useMemo(() => +(totalRevenue * 0.85).toFixed(2), [totalRevenue])

  const value = useMemo<Store>(() => ({
    lang, setLang, page, go, selected, setSelected, bookings, addBooking, cancelBooking, resetBookings,
    category, setCategory, city, setCity, articleIdx, setArticleIdx,
    openProfile, openBooking, findWithCategory, isSlotTaken,
    paidBookings, totalRevenue, platformRevenue, specialistEarnings,
  }), [lang, setLang, page, go, selected, bookings, addBooking, cancelBooking, resetBookings,
    category, city, articleIdx, openProfile, openBooking, findWithCategory, isSlotTaken,
    paidBookings, totalRevenue, platformRevenue, specialistEarnings])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/* ═══════════════════════════════════════════════════════════════════
   TRANSLATIONS  (complete bilingual strings)
   ═══════════════════════════════════════════════════════════════════ */
const tr = {
  lt: {
    nav: ['Pradžia', 'Rasti specialistą', 'Ištekliai', 'Kaip tai veikia', 'Specialistams'],
    heroTitle: 'Kiekvienas vaikas nusipelno sveikos gyvenimo pradžios.',
    heroText: 'Raskite patikimus specialistus, kurie padės jūsų vaiko raidai, emocinei gerovei ir jūsų tėvystės kelionėje.',
    find: 'Rasti specialistą',
    how: 'Kaip tai veikia',
    trusted: 'Patikrinti specialistai visoje Lietuvoje',
    searchTitle: 'Kokios pagalbos ieškote?',
    type: 'Specialisto sritis',
    location: 'Miestas arba internetu',
    all: 'Visos sritys',
    allCities: 'Visi miestai',
    search: 'Ieškoti',
    categories: 'Atraskite specialistus',
    categoriesSub: 'Profesionali pagalba kiekvienam jūsų šeimos raidos etapui.',
    missionEyebrow: 'Mūsų misija',
    missionTitle: 'Ankstyva pagalba gali pakeisti vaiko gyvenimą.',
    missionText: 'NewChapter padeda šeimoms rasti tinkamą profesionalią pagalbą tada, kai jos labiausiai reikia. Aiškiai, šiltai ir be bereikalingų kliūčių.',
    learn: 'Sužinoti daugiau',
    featured: 'Rekomenduojami specialistai',
    featuredSub: 'Patyrę profesionalai, pasirengę padėti jūsų šeimai.',
    viewAll: 'Peržiūrėti visus',
    view: 'Peržiūrėti profilį',
    book: 'Rezervuoti',
    fictional: 'Demonstracinis profilis',
    verified: 'Patikrinta',
    from: 'nuo',
    next: 'Artimiausias laikas',
    joinTitle: 'Jūsų žinios gali pakeisti šeimos istoriją.',
    joinText: 'Prisijunkite prie NewChapter, pasiekite daugiau šeimų ir paprasčiau valdykite konsultacijas.',
    join: 'Tapti specialistu',
    directoryTitle: 'Raskite tinkamą specialistą',
    directorySub: 'Palyginkite patirtį, konsultacijų formą, kainas ir laisvus laikus.',
    filters: 'Filtrai',
    category: 'Sritis',
    city: 'Miestas',
    format: 'Konsultacijos forma',
    price: 'Kaina iki',
    language: 'Kalba',
    any: 'Nesvarbu',
    online: 'Nuotoliu',
    inPerson: 'Gyvai',
    results: 'specialistai',
    clear: 'Išvalyti filtrus',
    qualifications: 'Kvalifikacija',
    about: 'Apie specialistą',
    expertise: 'Sritys',
    ages: 'Amžiaus grupės',
    languages: 'Kalbos',
    duration: 'Trukmė',
    consultation: 'Konsultacija',
    min: 'min.',
    chooseTime: 'Pasirinkite laiką',
    booking: 'Konsultacijos rezervacija',
    step: 'Žingsnis',
    chooseDate: 'Pasirinkite datą ir laiką',
    chooseFormat: 'Kaip norite susitikti?',
    details: 'Jūsų kontaktai',
    fullName: 'Vardas ir pavardė',
    email: 'El. paštas',
    phone: 'Telefono numeris',
    privacyNote: 'Tai demonstracija. Prašome neįvesti jautrios medicininės informacijos.',
    review: 'Peržiūrėkite rezervaciją',
    continue: 'Tęsti',
    back: 'Atgal',
    payment: 'Demonstracinis mokėjimas',
    paymentNote: 'Tik simuliacija — jokių tikrų kortelės duomenų.',
    total: 'Mokėtina suma',
    pay: 'Apmokėti demonstracinį užsakymą',
    processing: 'Apdorojamas demonstracinis mokėjimas…',
    confirmed: 'Rezervacija patvirtinta',
    confirmedText: 'Jūsų demonstracinė konsultacija rezervuota. Kvitas išsiųstas nurodytu el. paštu.',
    reference: 'Užsakymo numeris',
    receipt: 'Skaitmeninis kvitas',
    specialistGets: 'Specialistui',
    platformGets: 'NewChapter komisinis (15 %)',
    bookings: 'Mano rezervacijos',
    cancel: 'Atšaukti rezervaciją',
    cancelled: 'Atšaukta',
    confirmed2: 'Patvirtinta',
    home: 'Grįžti į pradžią',
    resourcesTitle: 'Naudingi ištekliai tėvams',
    resourcesSub: 'Patikima, lengvai suprantama informacija jūsų šeimos kasdienybei.',
    read: 'Skaityti straipsnį',
    related: 'Rasti susijusį specialistą',
    disclaimer: 'Šis turinys yra edukacinis ir nepakeičia individualios specialisto konsultacijos ar medicininės diagnozės.',
    howTitle: 'Profesionali pagalba — trimis paprastais žingsniais',
    steps: [['Atraskite', 'Peržiūrėkite kvalifikuotų specialistų profilius.'], ['Pasirinkite', 'Palyginkite patirtį, kainas ir laisvus laikus.'], ['Rezervuokite', 'Pasirinkite konsultaciją ir saugiai atlikite demonstracinį mokėjimą.']] as [string, string][],
    forTitle: 'Auginkite savo praktiką. Padėkite daugiau šeimų.',
    forText: 'NewChapter suteikia specialistams patikimą erdvę būti atrastiems ir paprastai valdyti konsultacijas vienoje vietoje.',
    benefits: ['Pasiekite daugiau tėvų', 'Didinkite profesinį matomumą', 'Gaukite konsultacijų rezervacijas', 'Paprastinkite darbo grafiką', 'Valdykite mokėjimus vienoje platformoje'],
    apply: 'Demonstracinė paraiška',
    profession: 'Profesinė sritis',
    experience: 'Patirties metai',
    send: 'Pateikti paraišką',
    sent: 'Ačiū! Demonstracinė paraiška pateikta.',
    dashboard: 'Demo valdymo skydelis',
    completed: 'Įvykdytos rezervacijos',
    transactionValue: 'Bendra sandorių vertė',
    revenue: 'NewChapter pajamos',
    earnings: 'Specialistų pajamos',
    upcoming: 'Artėjančios konsultacijos',
    recent: 'Naujausi sandoriai',
    reset: 'Atkurti demonstraciją',
    noData: 'Kol kas nėra demonstracinių rezervacijų.',
    prototype: 'Universiteto demonstracinis prototipas',
    legal: 'Visi specialistai, rezervacijos ir mokėjimai yra išgalvoti bei simuliuojami.',
    myBookingsTitle: 'Mano rezervacijos',
    myBookingsSub: 'Peržiūrėkite ir valdykite savo demonstracines konsultacijas.',
    noBookings: 'Dar neturite jokių rezervacijų.',
    startBooking: 'Rasti specialistą',
    statusPaid: 'Patvirtinta',
    statusCancelled: 'Atšaukta',
    bookingDate: 'Data ir laikas',
    bookingFormat: 'Konsultacijos forma',
    bookingPrice: 'Kaina',
    privacyTitle: 'Privatumo politika',
    termsTitle: 'Naudojimo sąlygos',
    cancellationTitle: 'Atšaukimo politika',
    readMore: 'Skaityti toliau',
    backToResources: 'Grįžti prie išteklių',
  },
  en: {
    nav: ['Home', 'Find a Specialist', 'Resources', 'How It Works', 'For Specialists'],
    heroTitle: 'Every child deserves a healthy beginning.',
    heroText: "Find trusted specialists who can support your child's development, emotional well-being and your parenting journey.",
    find: 'Find a Specialist',
    how: 'How It Works',
    trusted: 'Verified specialists across Lithuania',
    searchTitle: 'What kind of support are you looking for?',
    type: 'Type of specialist',
    location: 'City or online',
    all: 'All specialities',
    allCities: 'All locations',
    search: 'Search',
    categories: 'Explore specialist care',
    categoriesSub: "Professional support for every stage of your family's journey.",
    missionEyebrow: 'Our mission',
    missionTitle: "Early support can change the course of a child's life.",
    missionText: 'NewChapter helps families find the right professional support when they need it most. Clearly, warmly and without unnecessary barriers.',
    learn: 'Learn more',
    featured: 'Featured specialists',
    featuredSub: 'Experienced professionals ready to support your family.',
    viewAll: 'View all specialists',
    view: 'View profile',
    book: 'Book now',
    fictional: 'Demonstration profile',
    verified: 'Verified',
    from: 'from',
    next: 'Next available',
    joinTitle: 'Your expertise can change a family\u2019s story.',
    joinText: 'Join NewChapter, reach more families and make appointment management simple.',
    join: 'Join NewChapter',
    directoryTitle: 'Find the right specialist',
    directorySub: 'Compare expertise, consultation format, pricing and availability.',
    filters: 'Filters',
    category: 'Speciality',
    city: 'City',
    format: 'Consultation format',
    price: 'Price up to',
    language: 'Language',
    any: 'Any',
    online: 'Online',
    inPerson: 'In person',
    results: 'specialists',
    clear: 'Clear filters',
    qualifications: 'Qualifications',
    about: 'About the specialist',
    expertise: 'Areas of expertise',
    ages: 'Age groups',
    languages: 'Languages',
    duration: 'Duration',
    consultation: 'Consultation',
    min: 'min',
    chooseTime: 'Choose a time',
    booking: 'Appointment booking',
    step: 'Step',
    chooseDate: 'Choose a date and time',
    chooseFormat: 'How would you like to meet?',
    details: 'Your contact details',
    fullName: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    privacyNote: 'This is a demonstration. Please do not enter sensitive medical information.',
    review: 'Review your booking',
    continue: 'Continue',
    back: 'Back',
    payment: 'Demonstration payment',
    paymentNote: 'Simulation only \u2014 no real card details are collected.',
    total: 'Total payment',
    pay: 'Pay demonstration order',
    processing: 'Processing demonstration payment\u2026',
    confirmed: 'Booking confirmed',
    confirmedText: 'Your demonstration consultation is booked. A simulated receipt has been sent to the email provided.',
    reference: 'Booking reference',
    receipt: 'Digital receipt',
    specialistGets: 'Specialist receives',
    platformGets: 'NewChapter commission (15%)',
    bookings: 'My bookings',
    cancel: 'Cancel booking',
    cancelled: 'Cancelled',
    confirmed2: 'Confirmed',
    home: 'Return home',
    resourcesTitle: 'Practical resources for parents',
    resourcesSub: 'Trusted, easy-to-understand information for everyday family life.',
    read: 'Read article',
    related: 'Find a relevant specialist',
    disclaimer: 'This content is educational and does not replace individual professional advice or medical diagnosis.',
    howTitle: 'Professional support in three simple steps',
    steps: [['Find', 'Explore profiles of qualified specialists.'], ['Choose', 'Compare expertise, prices and availability.'], ['Book', 'Select a consultation and make a secure demonstration payment.']] as [string, string][],
    forTitle: 'Grow your practice. Support more families.',
    forText: 'NewChapter gives specialists a trusted place to be discovered and manage appointments simply, all in one place.',
    benefits: ['Reach more parents', 'Increase professional visibility', 'Receive appointment bookings', 'Simplify scheduling', 'Manage payments through one platform'],
    apply: 'Demonstration application',
    profession: 'Professional field',
    experience: 'Years of experience',
    send: 'Submit application',
    sent: 'Thank you! Your demonstration application was submitted.',
    dashboard: 'Demo Dashboard',
    completed: 'Completed bookings',
    transactionValue: 'Total transaction value',
    revenue: 'NewChapter revenue',
    earnings: 'Specialist earnings',
    upcoming: 'Upcoming appointments',
    recent: 'Recent transactions',
    reset: 'Reset demo',
    noData: 'No demonstration bookings yet.',
    prototype: 'University demonstration prototype',
    legal: 'All specialists, appointments and payments are fictional and simulated.',
    myBookingsTitle: 'My Bookings',
    myBookingsSub: 'View and manage your demonstration consultations.',
    noBookings: 'You don\u2019t have any bookings yet.',
    startBooking: 'Find a specialist',
    statusPaid: 'Confirmed',
    statusCancelled: 'Cancelled',
    bookingDate: 'Date and time',
    bookingFormat: 'Consultation format',
    bookingPrice: 'Price',
    privacyTitle: 'Privacy Policy',
    termsTitle: 'Terms & Conditions',
    cancellationTitle: 'Cancellation Policy',
    readMore: 'Continue reading',
    backToResources: 'Back to resources',
  },
} as const

/* ═══════════════════════════════════════════════════════════════════
   DATA — Categories, Profiles, Resources (with full article content)
   ═══════════════════════════════════════════════════════════════════ */
const categories = [
  ['child-psychology', 'Vaikų psichologija', 'Child Psychology', 'heart'],
  ['family-psychology', 'Šeimos psichologija', 'Family Psychology', 'users'],
  ['speech-therapy', 'Logopedija', 'Speech Therapy', 'message'],
  ['child-development', 'Vaiko raida', 'Child Development', 'spark'],
  ['occupational-therapy', 'Ergoterapija', 'Occupational Therapy', 'hand'],
  ['parental-wellbeing', 'Tėvų gerovė', 'Parental Well-being', 'sun'],
]

const profiles: Profile[] = [
  { id: 1, name: 'Dr. Emilija Petrauskaitė', title: { lt: 'Vaikų psichologė', en: 'Child Psychologist' }, category: 'child-psychology', expertise: { lt: 'Ankstyvoji raida · Emocijų reguliavimas', en: 'Early development · Emotional regulation' }, city: 'Vilnius', price: 60, languages: ['LT', 'EN'], formats: ['online', 'in-person'], image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=85', about: { lt: 'Padedu tėvams geriau suprasti mažų vaikų emocinius poreikius ir kurti saugų ryšį šeimoje. Mano darbe svarbiausias yra šiltas, pagarbius ryšys su šeima.', en: 'I help parents understand young children\u2019s emotional needs and build a secure connection at home. My work centres on a warm, respectful relationship with the family.' }, qualifications: { lt: 'Psichologijos mokslų daktarė · 9 metų patirtis', en: 'PhD in Psychology · 9 years of experience' }, age: { lt: '0\u20135 metų', en: '0\u20135 years' } },
  { id: 2, name: 'Rūta Jankauskienė', title: { lt: 'Šeimos psichologė', en: 'Family Psychologist' }, category: 'family-psychology', expertise: { lt: 'Tėvystės iššūkiai · Šeimos santykiai', en: 'Parenting challenges · Family relationships' }, city: 'Kaunas', price: 55, languages: ['LT', 'EN'], formats: ['online', 'in-person'], image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=85', about: { lt: 'Kuriu saugią erdvę šeimoms kalbėtis, stiprinti ryšį ir atrasti kasdienius sprendimus. Tikiu, kad kiekviena šeima turi vidinių išteklių augimui.', en: 'I create a safe space for families to talk, strengthen connection and find practical solutions. I believe every family has inner resources for growth.' }, qualifications: { lt: 'Sveikatos psichologijos magistrė · 7 metų patirtis', en: 'MSc Health Psychology · 7 years of experience' }, age: { lt: 'Tėvai ir šeimos', en: 'Parents and families' } },
  { id: 3, name: 'Ieva Kazlauskaitė', title: { lt: 'Logopedė', en: 'Speech Therapist' }, category: 'speech-therapy', expertise: { lt: 'Kalbos raida · Ankstyvoji komunikacija', en: 'Speech development · Early communication' }, city: 'Vilnius', price: 45, languages: ['LT', 'EN', 'PL'], formats: ['online', 'in-person'], image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=85', about: { lt: 'Žaismingai ir pagarbiai padedu mažiesiems atrasti komunikacijos džiaugsmą. Kiekvienas vaikas turi savo tempą — aš padedu jį palaikyti.', en: 'I help little ones discover the joy of communication through respectful, play-based practice. Every child has their own pace \u2014 I help sustain it.' }, qualifications: { lt: 'Klinikinės logopedijos magistrė · 6 metų patirtis', en: 'MA Clinical Speech Therapy · 6 years of experience' }, age: { lt: '1\u20135 metų', en: '1\u20135 years' } },
  { id: 4, name: 'Gabija Vaitkutė', title: { lt: 'Vaiko raidos specialistė', en: 'Child Development Specialist' }, category: 'child-development', expertise: { lt: 'Motorinė raida · Ankstyvoji intervencija', en: 'Motor development · Early intervention' }, city: 'Klaipėda', price: 50, languages: ['LT', 'EN'], formats: ['online', 'in-person'], image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=85', about: { lt: 'Padedu šeimoms pastebėti vaiko stiprybes ir palaikyti raidą natūralioje aplinkoje. Ankstyvoji intervencija gali reikšmingai pakeisti vaiko ateitį.', en: 'I help families notice each child\u2019s strengths and support development in natural environments. Early intervention can meaningfully change a child\u2019s future.' }, qualifications: { lt: 'Vaiko raidos magistrė · 8 metų patirtis', en: 'MSc Child Development · 8 years of experience' }, age: { lt: '0\u20134 metų', en: '0\u20134 years' } },
  { id: 5, name: 'Monika Balčiūnaitė', title: { lt: 'Ergoterapeutė', en: 'Occupational Therapist' }, category: 'occupational-therapy', expertise: { lt: 'Sensorinė integracija · Kasdieniai įgūdžiai', en: 'Sensory integration · Daily skills' }, city: 'Šiauliai', price: 48, languages: ['LT'], formats: ['in-person'], image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=85', about: { lt: 'Praktiškais metodais padedu vaikams savarankiškiau ir ramiau dalyvauti kasdienėje veikloje. Dirbu su šeima kaip komanda.', en: 'I use practical methods to help children participate more independently and calmly in daily life. I work with the family as a team.' }, qualifications: { lt: 'Ergoterapijos magistrė · 5 metų patirtis', en: 'MSc Occupational Therapy · 5 years of experience' }, age: { lt: '1\u20135 metų', en: '1\u20135 years' } },
  { id: 6, name: 'Austėja Rimkutė', title: { lt: 'Perinatalinė psichologė', en: 'Perinatal Psychologist' }, category: 'parental-wellbeing', expertise: { lt: 'Tėvų emocinė gerovė · Pokyčiai šeimoje', en: 'Parental wellbeing · Family transitions' }, city: 'Vilnius', price: 58, languages: ['LT', 'EN', 'RU'], formats: ['online'], image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85', about: { lt: 'Lydžiu tėvus per emocinius pokyčius, padedu atkurti vidinę pusiausvyrą ir pasitikėjimą. Naudoju įrodymais pagrįstus metodus.', en: 'I guide parents through emotional transitions, helping restore balance and confidence. I use evidence-based methods.' }, qualifications: { lt: 'Klinikinės psichologijos magistrė · 10 metų patirtis', en: 'MSc Clinical Psychology · 10 years of experience' }, age: { lt: 'Besilaukiantys ir tėvai', en: 'Expecting and new parents' } },
]

type ArticleData = { id: string; titleLt: string; titleEn: string; category: string; contentLt: string[]; contentEn: string[] }
const articles: ArticleData[] = [
  {
    id: '01', titleLt: 'Kaip suprasti vaiko raidą pirmaisiais metais', titleEn: 'Understanding development in the early years', category: 'child-development',
    contentLt: [
      'Pirmieji treji vaiko gyvenimo metai yra neįtikėtinai svarbūs. Per šį laikotarpį formuojasi smegenų ryšiai, kurie lems vaiko mokymąsi, elgesį ir sveikatą visą gyvenimą.',
      'Kūdikiai gimsta su daugiau nei 100 milijardų neuronų, tačiau ryšiai tarp jų sustiprėja per patirtį — kalbėjimą, žaidimą, prisilietimą ir kasdienę priežiūrą.',
      'Raidos gairės, tokios kaip pirmas žodis ar pirmieji žingsniai, padeda orientuotis, tačiau kiekvienas vaikas vystosi savu tempu. Svarbiausia stebėti, ar vaikas nuolat daro pažangą.',
      'Jei pastebite, kad vaikas vėluoja pasiekti kelias raidos gaires, verta pasikonsultuoti su vaiko raidos specialistu. Ankstyvoji intervencija gali reikšmingai padėti.',
      'Kasdienės veiklos — skaitymas, dainavimas, žaidimas lauke ir bendras valgymas — yra galingiausios raidos priemonės, kurias tėvai turi.',
    ],
    contentEn: [
      'The first three years of life are incredibly important. During this period, brain connections form that will shape learning, behaviour and health across a lifetime.',
      'Babies are born with over 100 billion neurons, but the connections between them strengthen through experience — talking, playing, touch and everyday care.',
      'Developmental milestones such as a first word or first steps help as guideposts, but every child develops at their own pace. The key is to watch for consistent progress.',
      'If you notice your child is behind on several milestones, it\u2019s worth consulting a child development specialist. Early intervention can make a meaningful difference.',
      'Everyday activities — reading, singing, outdoor play and shared mealtimes — are the most powerful developmental tools a parent has.',
    ],
  },
  {
    id: '02', titleLt: 'Mažo vaiko emocinė gerovė: nuo ko pradėti', titleEn: 'A young child\u2019s emotional wellbeing: where to begin', category: 'child-psychology',
    contentLt: [
      'Emocinė gerovė prasideda nuo saugaus ryšio su artimais žmonėmis. Kai vaikas jaučiasi suprastas ir priimtas, jis gali laisviau tyrinėti pasaulį.',
      'Mažiems vaikams emocijos dažnai yra pernelyg didelės, kad jie galėtų jas patys valdyti. Čia tėvų vaidmuo — padėti reguliuoti emocijas per ramią buvimą šalia.',
      'Tankrumai, verksmas ir pyktis nėra „blogas elgesys" — tai vaiko būdas pranešti, kad jam reikia pagalbos susitvarkyti su per dideliu jausmu.',
      'Keli paprasti principai padeda stiprinti vaiko emocinę gerovę: nuoseklios dienos rutinos, žodinė emocijų įvardinimas ir fizinis kontaktas.',
      'Jei pastebite, kad vaikas ilgą laiką yra itin nerimaujantis, atsitraukęs arba agresyvus, vaikų psichologas gali padėti rasti priežastis ir sprendimus.',
    ],
    contentEn: [
      'Emotional wellbeing begins with a secure bond with close adults. When a child feels understood and accepted, they can explore the world more freely.',
      'Young children\u2019s emotions are often too big for them to manage alone. The parent\u2019s role is to help regulate emotions through calm presence.',
      'Tantrums, crying and anger are not \u201Cbad behaviour\u201D — they are a child\u2019s way of signalling that they need help managing an overwhelming feeling.',
      'A few simple principles strengthen a child\u2019s emotional wellbeing: consistent daily routines, naming emotions out loud and physical contact.',
      'If you notice your child is persistently anxious, withdrawn or aggressive, a child psychologist can help identify causes and solutions.',
    ],
  },
  {
    id: '03', titleLt: 'Kalba ir bendravimas kasdieniuose žaidimuose', titleEn: 'Speech and communication through everyday play', category: 'speech-therapy',
    contentLt: [
      'Kalba yra viena svarbiausių raidos sričių, ir ji natūraliausiai vystosi per kasdienį bendravimą ir žaidimą.',
      'Net paprasčiausios veiklos, kaip dainelių dainavimas, knygučių vartymas ar komentavimas, ką darote kartu, yra galingos kalbos skatinimo priemonės.',
      'Pirmaisiais metais svarbiausia reaguoti į vaiko garsus, gestus ir žvilgsnį — tai pagrindas bendravimui, net jei tikrų žodžių dar nėra.',
      'Nuo antro gyvenimo metų žaidimai su imitavimu (virtuvėlė, gydytojas, parduotuvė) skatina vaikus naudoti naujus žodžius ir kurti sakinius.',
      'Jei vaikas iki 2 metų nekalba žodžių arba iki 3 metų nesudaro dviejų žodžių frazių, rekomenduojama pasikonsultuoti su logopede.',
    ],
    contentEn: [
      'Speech is one of the most important developmental areas, and it develops most naturally through everyday interaction and play.',
      'Even the simplest activities — singing songs, browsing picture books or narrating what you are doing together — are powerful speech-building tools.',
      'In the first year, the key is to respond to your child\u2019s sounds, gestures and gaze — this is the foundation of communication, even before real words appear.',
      'From the second year, pretend play (kitchen, doctor, shop) encourages children to use new words and build sentences.',
      'If a child is not using words by age 2, or not combining two words by age 3, it is recommended to consult a speech therapist.',
    ],
  },
  {
    id: '04', titleLt: 'Ribos su švelnumu: kas padeda šeimai', titleEn: 'Boundaries with warmth: what helps families', category: 'family-psychology',
    contentLt: [
      'Ribos yra ne bausmė — tai struktūra, kuri padeda vaikui jaustis saugiai. Kai vaikas žino, ko tikėtis, jo nerimas mažėja.',
      'Efektyvios ribos yra aiškios, nuoseklios ir perduodamos su pagarba. „Ne" turi būti paprastas ir trumpas, o po to — alternatyva.',
      'Svarbu atskirti vaiko jausmą nuo jo elgesio: „Suprantu, kad pyksti" (pripažįstame jausmą), „bet mušti negalima" (ribojame elgesį).',
      'Tėvų nuoseklumas yra svarbesnis nei griežtumas. Vaikas mokosi ne iš vienkartinės lekcijos, o iš kasdienių pasikartojančių situacijų.',
      'Jei ribų klausimas kelia didelę šeimos įtampą arba konfliktus, šeimos psichologas gali padėti rasti balansą tarp šilumos ir struktūros.',
    ],
    contentEn: [
      'Boundaries are not punishment — they are structure that helps a child feel safe. When a child knows what to expect, anxiety decreases.',
      'Effective boundaries are clear, consistent and delivered with respect. \u201CNo\u201D should be simple and short, followed by an alternative.',
      'It is important to separate the child\u2019s feeling from their behaviour: \u201CI understand you are angry\u201D (acknowledging the feeling), \u201Cbut hitting is not allowed\u201D (limiting the behaviour).',
      'Parental consistency matters more than strictness. A child learns not from a one-time lecture but from daily repeating situations.',
      'If boundaries are causing significant family tension or conflict, a family psychologist can help find the balance between warmth and structure.',
    ],
  },
  {
    id: '05', titleLt: 'Kaip stiprinti tėvų ir vaiko ryšį', titleEn: 'Strengthening the parent\u2013child relationship', category: 'family-psychology',
    contentLt: [
      'Ryšys tarp tėvų ir vaiko yra pagrindas, ant kurio vaikas stato savo supratimą apie santykius, pasitikėjimą ir saugumą.',
      'Kokybiškas laikas kartu neturi būti ilgas ar sudėtingas. 15 minučių dėmesingo buvimo be telefono gali būti galingesnės nei valandos fizinio artumo.',
      'Atsakingumas — gebėjimas pastebėti vaiko signalus ir tinkamai reaguoti — yra vienas svarbiausių ryšio stiprinimo įrankių.',
      'Fizinis kontaktas, kaip apkabinimai, glostimas ar sėdėjimas greta, stiprina saugaus prieraišumo jausmą vaikui kiekvieną dieną.',
      'Jei jaučiate, kad ryšys su vaiku yra susilpnėjęs arba sunkiai randamas, šeimos specialistas gali padėti žingsnis po žingsnio jį atkurti.',
    ],
    contentEn: [
      'The bond between parent and child is the foundation on which a child builds their understanding of relationships, trust and safety.',
      'Quality time together does not need to be long or complicated. 15 minutes of attentive presence without a phone can be more powerful than hours of physical proximity.',
      'Responsiveness — the ability to notice a child\u2019s signals and react appropriately — is one of the most important relationship-strengthening tools.',
      'Physical contact, such as hugs, stroking or sitting close, strengthens the child\u2019s sense of secure attachment every day.',
      'If you feel the bond with your child has weakened or is hard to find, a family specialist can help restore it step by step.',
    ],
  },
  {
    id: '06', titleLt: 'Kada verta kreiptis profesionalios pagalbos', titleEn: 'When to seek professional support', category: 'child-psychology',
    contentLt: [
      'Kreiptis pagalbos nėra silpnumo ženklas — tai atsakingas sprendimas, kuris rodo, kad jums rūpi vaiko ir šeimos gerovė.',
      'Keletas situacijų, kai verta pasikonsultuoti: vaikas ilgam praranda jau turėtus įgūdžius, yra labai nerimaujantis arba agresyvus, arba šeimoje vyksta dideli pokyčiai.',
      'Taip pat verta kreiptis, jei jūs patys jaučiatės pervargę, nerimaujate dėl savo emocinės būklės arba jaučiatės izoliuoti.',
      'Profesionalas gali padėti ne tik spręsti konkrečią problemą, bet ir suteikti pasitikėjimo, kad einate tinkamu keliu.',
      'NewChapter padeda rasti patikimą specialistą lengvai ir greitai — pradėkite nuo specialistų katalogo.',
    ],
    contentEn: [
      'Seeking help is not a sign of weakness — it is a responsible decision that shows you care about your child\u2019s and family\u2019s wellbeing.',
      'Some situations where it\u2019s worth consulting: your child has lost previously gained skills for an extended time, is highly anxious or aggressive, or significant family changes are happening.',
      'It is also worth reaching out if you yourself feel exhausted, worried about your emotional state, or isolated.',
      'A professional can help not only address a specific issue but also give you confidence that you are on the right path.',
      'NewChapter makes it easy to find a trusted specialist quickly — start from the specialist directory.',
    ],
  },
]

const resourcesMeta = articles.map(a => [a.id, a.titleLt, a.titleEn, a.category] as const)

/* ═══════════════════════════════════════════════════════════════════
   ICONS  (SVG inline icon system)
   ═══════════════════════════════════════════════════════════════════ */
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    heart: <><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />,
    spark: <><path d="m12 3-1.6 4.4L6 9l4.4 1.6L12 15l1.6-4.4L18 9l-4.4-1.6Z" /><path d="m5 15-.8 2.2L2 18l2.2.8L5 21l.8-2.2L8 18l-2.2-.8Z" /></>,
    hand: <path d="M18 11V6a2 2 0 0 0-4 0v4-7a2 2 0 0 0-4 0v7-5a2 2 0 0 0-4 0v8l-1.5-1.5a2 2 0 0 0-3 2.6l5 6A5 5 0 0 0 10.3 21H14a6 6 0 0 0 6-6v-4a2 2 0 0 0-4 0" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2Z" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.spark}</svg>
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE TRANSITION WRAPPER
   ═══════════════════════════════════════════════════════════════════ */
function PageTransition({ children, page }: { children: ReactNode; page: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(false); const t = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(t) }, [page])
  return <div className={`page-transition ${visible ? 'page-visible' : ''}`}>{children}</div>
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */
function dateLabel(d: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'lt' ? 'lt-LT' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${d}T12:00:00`))
}

function nextDates(count: number) {
  return Array.from({ length: count }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d.toISOString().slice(0, 10) })
}

const TIMES = ['09:00', '10:30', '13:00', '15:30', '17:00']

function genRef() {
  return `NC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

/* ═══════════════════════════════════════════════════════════════════
   APP SHELL
   ═══════════════════════════════════════════════════════════════════ */
function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  )
}

function AppShell() {
  const { lang, setLang, page, go, selected } = useStore()
  const [menu, setMenu] = useState(false)
  const t = tr[lang]
  const navPages: Page[] = ['home', 'directory', 'resources', 'how', 'specialists']

  useEffect(() => { setMenu(false) }, [page])

  return (
    <div className="app-shell">
      <header>
        <button className="brand" onClick={() => go('home')} aria-label="NewChapter home">
          <span className="brand-mark"><span /></span>
          <span>NewChapter<small>LITHUANIA</small></span>
        </button>
        <nav className={menu ? 'open' : ''}>
          {t.nav.map((item, i) => <button key={item} className={page === navPages[i] ? 'active' : ''} onClick={() => go(navPages[i])}>{item}</button>)}
        </nav>
        <div className="header-actions">
          <div className="language"><button className={lang === 'lt' ? 'active' : ''} onClick={() => setLang('lt')}>LT</button><i /><button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button></div>
          <button className="button button-small desktop-cta" onClick={() => go('directory')}>{t.find}<Icon name="arrow" size={17} /></button>
          <button className="menu-button" onClick={() => setMenu(!menu)}><Icon name={menu ? 'close' : 'menu'} /></button>
        </div>
      </header>

      <main>
        <PageTransition page={page}>
          {page === 'home' && <Home />}
          {page === 'directory' && <Directory />}
          {page === 'profile' && <ProfilePage profileId={selected} />}
          {page === 'booking' && <BookingFlow profileId={selected} />}
          {page === 'resources' && <Resources />}
          {page === 'article' && <ArticlePage />}
          {page === 'how' && <How />}
          {page === 'specialists' && <ForSpecialists />}
          {page === 'dashboard' && <Dashboard />}
          {page === 'my-bookings' && <MyBookings />}
          {page === 'privacy' && <PolicyPage type="privacy" />}
          {page === 'terms' && <PolicyPage type="terms" />}
          {page === 'cancellation' && <PolicyPage type="cancellation" />}
        </PageTransition>
      </main>

      <Footer />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════════ */
function Home() {
  const { lang, category, city, setCategory, setCity, go, openProfile, openBooking, findWithCategory } = useStore()
  const t = tr[lang]

  return <>
    <section className="hero">
      <div className="hero-content">
        <div className="eyebrow"><span /><Icon name="shield" size={16} />{t.trusted}</div>
        <h1>{t.heroTitle}</h1>
        <p>{t.heroText}</p>
        <div className="button-row"><button className="button" onClick={() => go('directory')}>{t.find}<Icon name="arrow" /></button><button className="button button-ghost" onClick={() => go('how')}>{t.how}</button></div>
      </div>
      <div className="hero-image"><img src="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=900&q=85" alt={lang === 'lt' ? 'Mama su mažu vaiku namuose' : 'A parent and young child at home'} /><div className="image-note"><span><Icon name="heart" /></span><div><strong>0–5</strong><small>{lang === 'lt' ? 'metų šeimoms' : 'years of support'}</small></div></div></div>
    </section>

    <section className="search-panel">
      <div><span className="search-number">01</span><label>{t.searchTitle}</label></div>
      <select value={category} onChange={e => setCategory(e.target.value)}><option value="">{t.all}</option>{categories.map(c => <option key={c[0]} value={c[0]}>{c[lang === 'lt' ? 1 : 2]}</option>)}</select>
      <select value={city} onChange={e => setCity(e.target.value)}><option value="">{t.allCities}</option><option>Vilnius</option><option>Kaunas</option><option>Klaipėda</option><option>Šiauliai</option><option value="online">{t.online}</option></select>
      <button className="button" onClick={() => go('directory')}>{t.search}<Icon name="arrow" /></button>
    </section>

    <section className="section">
      <div className="section-head"><div><span className="eyebrow-text">02 — {lang === 'lt' ? 'SPECIALISTŲ SRITYS' : 'AREAS OF CARE'}</span><h2>{t.categories}</h2><p>{t.categoriesSub}</p></div></div>
      <div className="category-grid">{categories.map((c, i) => <button className="category-card" key={c[0]} onClick={() => findWithCategory(c[0])}><span className="category-icon"><Icon name={c[3]} size={26} /></span><small>0{i + 1}</small><strong>{c[lang === 'lt' ? 1 : 2]}</strong><span className="round-arrow"><Icon name="arrow" size={17} /></span></button>)}</div>
    </section>

    <section className="mission">
      <div className="mission-image"><img src="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=900&q=85" alt="" /></div>
      <div className="mission-copy"><span className="eyebrow-text">03 — {t.missionEyebrow.toUpperCase()}</span><h2>{t.missionTitle}</h2><p>{t.missionText}</p><button className="text-link" onClick={() => go('how')}>{t.learn}<Icon name="arrow" /></button><div className="mission-stats"><div><strong>6</strong><span>{lang === 'lt' ? 'pagalbos sritys' : 'care specialities'}</span></div><div><strong>100%</strong><span>{lang === 'lt' ? 'skaidrios kainos' : 'transparent prices'}</span></div></div></div>
    </section>

    <section className="section featured">
      <div className="section-head"><div><span className="eyebrow-text">04 — {lang === 'lt' ? 'PROFESIONALI PAGALBA' : 'PROFESSIONAL CARE'}</span><h2>{t.featured}</h2><p>{t.featuredSub}</p></div><button className="text-link" onClick={() => go('directory')}>{t.viewAll}<Icon name="arrow" /></button></div>
      <div className="profile-grid">{profiles.slice(0, 3).map(p => <ProfileCard key={p.id} profile={p} />)}</div>
    </section>

    <section className="join-banner"><span className="join-orbit"><span /></span><div><span className="eyebrow-text">{lang === 'lt' ? 'SPECIALISTAMS' : 'FOR PROFESSIONALS'}</span><h2>{t.joinTitle}</h2><p>{t.joinText}</p></div><button className="button button-cream" onClick={() => go('specialists')}>{t.join}<Icon name="arrow" /></button></section>
  </>
}

/* ═══════════════════════════════════════════════════════════════════
   PROFILE CARD  (reusable)
   ═══════════════════════════════════════════════════════════════════ */
function ProfileCard({ profile: p }: { profile: Profile }) {
  const { lang, openProfile, openBooking } = useStore()
  const t = tr[lang]

  return <article className="profile-card">
    <div className="profile-photo"><img src={p.image} alt={p.name} /><span className="demo-label">{t.fictional}</span><span className="verified"><Icon name="check" size={12} />{t.verified}</span></div>
    <div className="profile-body"><div><p className="profile-title">{p.title[lang]}</p><h3>{p.name}</h3></div><p>{p.expertise[lang]}</p><div className="profile-meta"><span><Icon name="pin" size={16} />{p.city} · {p.formats.includes('online') ? t.online : t.inPerson}</span><span><b>€{p.price}</b> / 50 {t.min}</span></div><div className="availability"><span /><small>{t.next}</small><strong>{lang === 'lt' ? 'Rytoj, 10:30' : 'Tomorrow, 10:30'}</strong></div><div className="card-actions"><button className="button button-outline" onClick={() => openProfile(p.id)}>{t.view}</button><button className="button" onClick={() => openBooking(p.id)}>{t.book}</button></div></div>
  </article>
}

/* ═══════════════════════════════════════════════════════════════════
   SPECIALIST DIRECTORY
   ═══════════════════════════════════════════════════════════════════ */
function Directory() {
  const { lang, category, city, setCategory, setCity, openProfile, openBooking } = useStore()
  const t = tr[lang]
  const [format, setFormat] = useState('')
  const [language, setLanguage] = useState('')
  const [maxPrice, setMaxPrice] = useState(70)

  const filtered = profiles.filter(p =>
    (!category || p.category === category) &&
    (!city || (city === 'online' ? p.formats.includes('online') : p.city === city)) &&
    (!format || p.formats.includes(format as 'online' | 'in-person')) &&
    (!language || p.languages.includes(language)) &&
    p.price <= maxPrice
  )
  const clear = () => { setCategory(''); setCity(''); setFormat(''); setLanguage(''); setMaxPrice(70) }

  return <div className="page">
    <div className="page-hero"><span className="eyebrow-text">NEWCHAPTER · {lang === 'lt' ? 'LIETUVA' : 'LITHUANIA'}</span><h1>{t.directoryTitle}</h1><p>{t.directorySub}</p></div>
    <div className="directory-layout">
      <aside className="filters"><div className="filter-head"><h3>{t.filters}</h3><button onClick={clear}>{t.clear}</button></div>
        <label>{t.category}<select value={category} onChange={e => setCategory(e.target.value)}><option value="">{t.all}</option>{categories.map(c => <option key={c[0]} value={c[0]}>{c[lang === 'lt' ? 1 : 2]}</option>)}</select></label>
        <label>{t.city}<select value={city} onChange={e => setCity(e.target.value)}><option value="">{t.allCities}</option>{['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>{t.format}<select value={format} onChange={e => setFormat(e.target.value)}><option value="">{t.any}</option><option value="online">{t.online}</option><option value="in-person">{t.inPerson}</option></select></label>
        <label>{t.language}<select value={language} onChange={e => setLanguage(e.target.value)}><option value="">{t.any}</option><option>LT</option><option>EN</option><option>PL</option><option>RU</option></select></label>
        <label>{t.price}: <b>€{maxPrice}</b><input type="range" min="40" max="70" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} /></label>
      </aside>
      <div className="directory-results"><div className="results-head"><strong>{filtered.length} {t.results}</strong><span>{lang === 'lt' ? 'Visi profiliai yra demonstraciniai' : 'All profiles are for demonstration'}</span></div><div className="profile-grid">{filtered.map(p => <ProfileCard key={p.id} profile={p} />)}</div>{!filtered.length && <div className="empty">{t.noData}<button className="text-link" onClick={clear}>{t.clear}</button></div>}</div>
    </div>
  </div>
}

/* ═══════════════════════════════════════════════════════════════════
   SPECIALIST PROFILE PAGE
   ═══════════════════════════════════════════════════════════════════ */
function ProfilePage({ profileId }: { profileId: number }) {
  const { lang, go, openBooking } = useStore()
  const t = tr[lang]
  const p = profiles.find(x => x.id === profileId) || profiles[0]

  return <div className="page profile-page">
    <button className="back-link" onClick={() => go('directory')}>← {t.back}</button>
    <div className="profile-hero">
      <div className="profile-large-photo"><img src={p.image} alt={p.name} /><span className="demo-label">{t.fictional}</span></div>
      <div className="profile-intro"><div className="verified-line"><Icon name="shield" />{t.verified} · {t.fictional}</div><p className="profile-title">{p.title[lang]}</p><h1>{p.name}</h1><p className="lead">{p.expertise[lang]}</p><div className="profile-chips"><span><Icon name="pin" />{p.city}</span><span><Icon name="video" />{p.formats.map(f => f === 'online' ? t.online : t.inPerson).join(' / ')}</span><span>{p.languages.join(' · ')}</span></div></div>
      <div className="booking-summary"><span>{t.consultation}</span><strong>€{p.price}</strong><small>50 {t.min}</small><div className="availability"><span /><small>{t.next}</small><strong>{lang === 'lt' ? 'Rytoj, 10:30' : 'Tomorrow, 10:30'}</strong></div><button className="button" onClick={() => openBooking(p.id)}>{t.book}<Icon name="arrow" /></button></div>
    </div>
    <div className="profile-details"><div><section><h2>{t.about}</h2><p>{p.about[lang]}</p></section><section><h2>{t.qualifications}</h2><p>{p.qualifications[lang]}</p></section></div><aside><h3>{lang === 'lt' ? 'Trumpai' : 'At a glance'}</h3><dl><div><dt>{t.expertise}</dt><dd>{p.expertise[lang]}</dd></div><div><dt>{t.ages}</dt><dd>{p.age[lang]}</dd></div><div><dt>{t.languages}</dt><dd>{p.languages.join(', ')}</dd></div><div><dt>{t.duration}</dt><dd>50 {t.min}</dd></div></dl></aside></div>
  </div>
}

/* ═══════════════════════════════════════════════════════════════════
   BOOKING FLOW  (6-step interactive journey)
   ═══════════════════════════════════════════════════════════════════ */
function BookingFlow({ profileId }: { profileId: number }) {
  const { lang, go, addBooking, isSlotTaken, bookings } = useStore()
  const t = tr[lang]
  const p = profiles.find(x => x.id === profileId) || profiles[0]
  const [step, setStep] = useState(1)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [format, setFormat] = useState<'online' | 'in-person'>(p.formats[0])
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [processing, setProcessing] = useState(false)
  const [confirmed, setConfirmed] = useState<Booking | null>(null)
  const dates = nextDates(5)

  const canContinue = step === 1 ? !!date && !!time : step === 2 ? !!format : step === 3 ? !!contact.name && /\S+@\S+/.test(contact.email) : true

  const pay = () => {
    setProcessing(true)
    setTimeout(() => {
      const booking: Booking = {
        id: genRef(), profileId: p.id, date, time, format, name: contact.name, email: contact.email, phone: contact.phone,
        price: p.price, status: 'paid', createdAt: new Date().toISOString(),
      }
      addBooking(booking)
      setConfirmed(booking)
      setProcessing(false)
      setStep(6)
    }, 1600)
  }

  if (step === 6 && confirmed) return <div className="page confirmation">
    <div className="success-mark"><Icon name="check" size={34} /></div>
    <span className="eyebrow-text">{t.payment}</span>
    <h1>{t.confirmed}</h1>
    <p>{t.confirmedText}</p>
    <div className="receipt">
      <div className="receipt-head"><span>{t.receipt}</span><strong>{confirmed.id}</strong></div>
      <div><span>{p.name}</span><strong>€{p.price.toFixed(2)}</strong></div>
      <div><span>{dateLabel(date, lang)} · {time}</span><span>{format === 'online' ? t.online : t.inPerson}</span></div>
      <hr />
      <div><span>{t.specialistGets}</span><span>€{(p.price * .85).toFixed(2)}</span></div>
      <div><span>{t.platformGets}</span><span>€{(p.price * .15).toFixed(2)}</span></div>
      <div className="receipt-total"><span>{t.total}</span><strong>€{p.price.toFixed(2)}</strong></div>
    </div>
    <div className="button-row"><button className="button button-outline" onClick={() => go('my-bookings')}>{t.bookings}</button><button className="button" onClick={() => go('home')}>{t.home}</button></div>
  </div>

  return <div className="page booking-page">
    <div className="booking-top"><button className="back-link" onClick={() => step > 1 ? setStep(step - 1) : go('profile')}>← {t.back}</button><span>{t.booking}</span><span>{t.step} {Math.min(step, 5)} / 5</span></div>
    <div className="progress">{[1, 2, 3, 4, 5].map(n => <span key={n} className={step >= n ? 'done' : ''} />)}</div>
    <div className="booking-layout"><div className="booking-form">
      {step === 1 && <><span className="eyebrow-text">01 — {t.chooseTime.toUpperCase()}</span><h1>{t.chooseDate}</h1><div className="date-grid">{dates.map(d => <button key={d} className={date === d ? 'selected' : ''} onClick={() => { setDate(d); setTime('') }}>{dateLabel(d, lang)}</button>)}</div>{date && <div className="time-grid">{TIMES.map(tm => <button key={tm} disabled={isSlotTaken(p.id, date, tm)} className={time === tm ? 'selected' : ''} onClick={() => setTime(tm)}>{tm}{isSlotTaken(p.id, date, tm) && <small>{lang === 'lt' ? 'Užimta' : 'Booked'}</small>}</button>)}</div>}</>}
      {step === 2 && <><span className="eyebrow-text">02 — {t.format.toUpperCase()}</span><h1>{t.chooseFormat}</h1><div className="format-options">{p.formats.map(f => <button key={f} className={format === f ? 'selected' : ''} onClick={() => setFormat(f)}><span><Icon name={f === 'online' ? 'video' : 'pin'} size={26} /></span><strong>{f === 'online' ? t.online : t.inPerson}</strong><small>{f === 'online' ? (lang === 'lt' ? 'Saugus vaizdo skambutis' : 'Secure video call') : p.city}</small></button>)}</div></>}
      {step === 3 && <><span className="eyebrow-text">03 — {t.details.toUpperCase()}</span><h1>{t.details}</h1><div className="form-grid"><label>{t.fullName}<input value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} placeholder={lang === 'lt' ? 'Jūsų vardas' : 'Your name'} /></label><label>{t.email}<input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="name@example.com" /></label><label>{t.phone}<input value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="+370 600 00000" /></label></div><p className="privacy-note"><Icon name="shield" />{t.privacyNote}</p></>}
      {step === 4 && <><span className="eyebrow-text">04 — {t.review.toUpperCase()}</span><h1>{t.review}</h1><div className="review-list"><div><span>{lang === 'lt' ? 'Specialistas' : 'Specialist'}</span><strong>{p.name}</strong></div><div><span>{t.chooseDate}</span><strong>{dateLabel(date, lang)} · {time}</strong></div><div><span>{t.format}</span><strong>{format === 'online' ? t.online : t.inPerson}</strong></div><div><span>{t.fullName}</span><strong>{contact.name}</strong></div></div></>}
      {step === 5 && <><span className="eyebrow-text">05 — {t.payment.toUpperCase()}</span><h1>{t.payment}</h1><div className="payment-box"><Icon name="shield" size={28} /><div><strong>{t.paymentNote}</strong><p>{lang === 'lt' ? 'Paspaudus mygtuką bus imituojamas sėkmingas mokėjimas.' : 'Clicking below will simulate a successful payment.'}</p></div></div><div className="total-row"><span>{t.total}</span><strong>€{p.price.toFixed(2)}</strong></div><button className="button pay-button" disabled={processing} onClick={pay}>{processing ? <><span className="spinner" />{t.processing}</> : <>{t.pay}<Icon name="arrow" /></>}</button></>}
      {step < 5 && <button className="button continue" disabled={!canContinue} onClick={() => setStep(step + 1)}>{t.continue}<Icon name="arrow" /></button>}
    </div><aside className="booking-specialist"><img src={p.image} alt={p.name} /><div><small>{p.title[lang]}</small><strong>{p.name}</strong></div><hr /><span><Icon name="calendar" />{date ? `${dateLabel(date, lang)} ${time}` : t.chooseTime}</span><span><Icon name={format === 'online' ? 'video' : 'pin'} />{format === 'online' ? t.online : t.inPerson}</span><div className="price-line"><span>{t.total}</span><strong>€{p.price}</strong></div></aside></div>
  </div>
}

/* ═══════════════════════════════════════════════════════════════════
   RESOURCES & ARTICLE PAGE
   ═══════════════════════════════════════════════════════════════════ */
function Resources() {
  const { lang, findWithCategory, go, setArticleIdx } = useStore()
  const t = tr[lang]

  const openArticle = (idx: number) => { setArticleIdx(idx); go('article') }

  return <div className="page"><div className="page-hero"><span className="eyebrow-text">{lang === 'lt' ? 'ŽINIOS ŠEIMAI' : 'KNOWLEDGE FOR FAMILIES'}</span><h1>{t.resourcesTitle}</h1><p>{t.resourcesSub}</p></div><div className="resource-grid">{resourcesMeta.map((r, i) => <article key={r[0]} className={`resource-card tone-${i % 3}`}><span>{r[0]}</span><div className="resource-art"><Icon name={categories.find(c => c[0] === r[3])?.[3] || 'spark'} size={38} /></div><p>{categories.find(c => c[0] === r[3])?.[lang === 'lt' ? 1 : 2]}</p><h2>{r[lang === 'lt' ? 1 : 2]}</h2><div className="resource-actions"><button className="button button-small" onClick={() => openArticle(i)}>{t.read}<Icon name="arrow" size={15} /></button><button className="text-link" onClick={() => findWithCategory(r[3])}>{t.related}<Icon name="arrow" /></button></div></article>)}</div><div className="disclaimer"><Icon name="shield" /><p>{t.disclaimer}</p></div></div>
}

function ArticlePage() {
  const { lang, go, articleIdx, findWithCategory } = useStore()
  const t = tr[lang]
  const a = articles[articleIdx] || articles[0]
  const content = lang === 'lt' ? a.contentLt : a.contentEn
  const title = lang === 'lt' ? a.titleLt : a.titleEn
  const catName = categories.find(c => c[0] === a.category)?.[lang === 'lt' ? 1 : 2] || ''

  return <div className="page article-page">
    <button className="back-link" onClick={() => go('resources')}>← {t.backToResources}</button>
    <div className="article-header">
      <span className="eyebrow-text">{catName}</span>
      <h1>{title}</h1>
    </div>
    <div className="article-body">
      <div className="article-content">
        {content.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <aside className="article-sidebar">
        <div className="article-cta">
          <Icon name="heart" size={28} />
          <h3>{lang === 'lt' ? 'Reikia pagalbos?' : 'Need support?'}</h3>
          <p>{lang === 'lt' ? 'Raskite specialistą šioje srityje.' : 'Find a specialist in this area.'}</p>
          <button className="button" onClick={() => findWithCategory(a.category)}>{t.related}<Icon name="arrow" /></button>
        </div>
        <div className="disclaimer-box">
          <Icon name="shield" size={18} />
          <p>{t.disclaimer}</p>
        </div>
      </aside>
    </div>
  </div>
}

/* ═══════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════ */
function How() {
  const { lang, go } = useStore()
  const t = tr[lang]

  return <div className="page"><div className="page-hero narrow"><span className="eyebrow-text">NEWCHAPTER</span><h1>{t.howTitle}</h1></div><div className="how-grid">{t.steps.map((s, i) => <article key={s[0]}><span>0{i + 1}</span><div className="how-icon"><Icon name={['spark', 'heart', 'calendar'][i]} size={28} /></div><h2>{s[0]}</h2><p>{s[1]}</p>{i < 2 && <i>→</i>}</article>)}</div><div className="how-cta"><h2>{lang === 'lt' ? 'Pradėkite nuo tinkamo pokalbio.' : 'Start with the right conversation.'}</h2><button className="button" onClick={() => go('directory')}>{t.find}<Icon name="arrow" /></button></div></div>
}

/* ═══════════════════════════════════════════════════════════════════
   FOR SPECIALISTS
   ═══════════════════════════════════════════════════════════════════ */
function ForSpecialists() {
  const { lang } = useStore()
  const t = tr[lang]
  const [sent, setSent] = useState(false)

  return <div className="page for-page"><div className="for-hero"><div><span className="eyebrow-text">{lang === 'lt' ? 'SPECIALISTAMS' : 'FOR SPECIALISTS'}</span><h1>{t.forTitle}</h1><p>{t.forText}</p></div><div className="benefits">{t.benefits.map(x => <div key={x}><span><Icon name="check" /></span>{x}</div>)}</div></div><div className="application"><div><span className="eyebrow-text">{t.apply}</span><h2>{lang === 'lt' ? 'Prisijunkite prie augančios profesionalų bendruomenės.' : 'Join a growing community of professionals.'}</h2><p>{lang === 'lt' ? 'Tai demonstracinė forma — duomenys nėra saugomi ar siunčiami.' : 'This is a demonstration form — information is not stored or sent.'}</p></div>{sent ? <div className="sent"><Icon name="check" size={30} /><strong>{t.sent}</strong></div> : <form onSubmit={e => { e.preventDefault(); setSent(true) }}><label>{t.fullName}<input required /></label><label>{t.email}<input type="email" required /></label><label>{t.profession}<select required><option value="">—</option>{categories.map(c => <option key={c[0]}>{c[lang === 'lt' ? 1 : 2]}</option>)}</select></label><label>{t.experience}<input type="number" min="0" required /></label><button className="button">{t.send}<Icon name="arrow" /></button></form>}</div></div>
}

/* ═══════════════════════════════════════════════════════════════════
   MY BOOKINGS  (user-facing booking management)
   ═══════════════════════════════════════════════════════════════════ */
function MyBookings() {
  const { lang, go, bookings, cancelBooking, openBooking } = useStore()
  const t = tr[lang]

  return <div className="page my-bookings-page">
    <div className="page-hero"><span className="eyebrow-text">{lang === 'lt' ? 'JŪSŲ KONSULTACIJOS' : 'YOUR CONSULTATIONS'}</span><h1>{t.myBookingsTitle}</h1><p>{t.myBookingsSub}</p></div>
    {bookings.length === 0 ? (
      <div className="empty-bookings">
        <Icon name="calendar" size={48} />
        <h3>{t.noBookings}</h3>
        <button className="button" onClick={() => go('directory')}>{t.startBooking}<Icon name="arrow" /></button>
      </div>
    ) : (
      <div className="bookings-list">
        {bookings.slice().reverse().map(b => {
          const p = profiles.find(x => x.id === b.profileId)!
          return <div className={`booking-card ${b.status}`} key={b.id}>
            <div className="booking-card-left">
              <img src={p.image} alt={p.name} />
              <div>
                <small className="profile-title">{p.title[lang]}</small>
                <strong>{p.name}</strong>
                <span className={`status ${b.status}`}>{b.status === 'paid' ? t.statusPaid : t.statusCancelled}</span>
              </div>
            </div>
            <div className="booking-card-details">
              <div><small>{t.reference}</small><strong>{b.id}</strong></div>
              <div><small>{t.bookingDate}</small><strong>{dateLabel(b.date, lang)} · {b.time}</strong></div>
              <div><small>{t.bookingFormat}</small><strong>{b.format === 'online' ? t.online : t.inPerson}</strong></div>
              <div><small>{t.bookingPrice}</small><strong>€{b.price.toFixed(2)}</strong></div>
            </div>
            <div className="booking-card-actions">
              {b.status === 'paid' && <button className="button button-outline button-small" onClick={() => cancelBooking(b.id)}>{t.cancel}</button>}
              <button className="button button-small" onClick={() => openBooking(p.id)}>{t.book}<Icon name="arrow" size={15} /></button>
            </div>
          </div>
        })}
      </div>
    )}
  </div>
}

/* ═══════════════════════════════════════════════════════════════════
   BUSINESS DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */
function Dashboard() {
  const { lang, bookings, paidBookings, totalRevenue, platformRevenue, specialistEarnings, cancelBooking, resetBookings } = useStore()
  const t = tr[lang]

  // Revenue per specialist for chart
  const revenueBySpecialist = useMemo(() => {
    const map: Record<number, number> = {}
    paidBookings.forEach(b => { map[b.profileId] = (map[b.profileId] || 0) + b.price })
    return profiles.map(p => ({ name: p.name.split(' ').pop()!, amount: map[p.id] || 0 }))
  }, [paidBookings])

  const maxChartVal = Math.max(1, ...revenueBySpecialist.map(r => r.amount))

  return <div className="page dashboard">
    <div className="dashboard-head"><div><span className="eyebrow-text">{t.prototype}</span><h1>{t.dashboard}</h1><p>{t.legal}</p></div><button className="button button-outline" onClick={resetBookings}>{t.reset}</button></div>
    <div className="stat-grid">
      <div><span>{t.completed}</span><strong>{paidBookings.length}</strong></div>
      <div><span>{t.transactionValue}</span><strong>€{totalRevenue.toFixed(2)}</strong></div>
      <div className="accent"><span>{t.revenue}</span><strong>€{platformRevenue.toFixed(2)}</strong><small>15% commission</small></div>
      <div><span>{t.earnings}</span><strong>€{specialistEarnings.toFixed(2)}</strong></div>
    </div>
    <div className="dashboard-grid">
      <section>
        <h2>{lang === 'lt' ? 'Pajamos pagal specialistą' : 'Revenue by specialist'}</h2>
        <div className="chart">{revenueBySpecialist.map((r, i) => <div key={i}><span style={{ height: `${r.amount ? (r.amount / maxChartVal * 85 + 5) : 3}%` }} /><small>{r.name?.slice(0, 3)}</small></div>)}</div>
        <div className="chart-legend"><span><i />{t.transactionValue}</span><strong>€{totalRevenue.toFixed(2)}</strong></div>
      </section>
      <section>
        <h2>{t.upcoming}</h2>
        {paidBookings.length ? paidBookings.map(b => {
          const p = profiles.find(x => x.id === b.profileId)!
          return <div className="appointment" key={b.id}><div className="date-box"><strong>{new Date(`${b.date}T12:00`).getDate()}</strong><small>{new Date(`${b.date}T12:00`).toLocaleString(lang, { month: 'short' })}</small></div><div><strong>{p.name}</strong><span>{b.time} · {b.format === 'online' ? t.online : t.inPerson}</span></div><button onClick={() => cancelBooking(b.id)}>{t.cancel}</button></div>
        }) : <p className="empty-text">{t.noData}</p>}
      </section>
    </div>
    <section className="transactions">
      <h2>{t.recent}</h2>
      {bookings.length ? <div className="table">
        <div className="table-row table-head-row"><span>{t.reference}</span><span>{lang === 'lt' ? 'Specialistas' : 'Specialist'}</span><span>{lang === 'lt' ? 'Būsena' : 'Status'}</span><span>{t.total}</span></div>
        {bookings.slice().reverse().map(b => <div className="table-row" key={b.id}><strong>{b.id}</strong><span>{profiles.find(p => p.id === b.profileId)?.name}</span><span className={`status ${b.status}`}>{b.status === 'paid' ? t.confirmed2 : t.cancelled}</span><strong>€{b.price.toFixed(2)}</strong></div>)}
      </div> : <p className="empty-text">{t.noData}</p>}
    </section>
  </div>
}

/* ═══════════════════════════════════════════════════════════════════
   POLICY PAGES  (Privacy, Terms, Cancellation)
   ═══════════════════════════════════════════════════════════════════ */
const policyContent = {
  privacy: {
    lt: {
      title: 'Privatumo politika',
      sections: [
        ['Apie šią politiką', 'NewChapter Lithuania yra universiteto demonstracinis prototipas. Ši privatumo politika skirta pademonstruoti, kaip veiktų tikra platformos privatumo politika.'],
        ['Kokią informaciją renkame', 'Demonstracinėje versijoje nerenkami jokie tikri asmens duomenys. Visos rezervacijos ir mokėjimai yra simuliuojami ir saugomi tik jūsų naršyklės atmintyje (localStorage).'],
        ['Kaip naudojame informaciją', 'Demonstraciniai duomenys naudojami tik platformos veikimui pademonstruoti ir yra automatiškai ištrinami uždarant naršyklę arba paspaudus „Atkurti demonstraciją" mygtuką.'],
        ['Duomenų saugumas', 'Kadangi nerenkami tikri duomenys, nereikia specialių saugumo priemonių. Tikroje platformoje būtų taikomi BDAR reikalavimai ir šifravimas.'],
        ['Kontaktinė informacija', 'Jei turite klausimų, kreipkitės: hello@newchapter.lt'],
      ],
    },
    en: {
      title: 'Privacy Policy',
      sections: [
        ['About this policy', 'NewChapter Lithuania is a university demonstration prototype. This privacy policy is designed to demonstrate how a real platform privacy policy would function.'],
        ['What information we collect', 'In the demonstration version, no real personal data is collected. All bookings and payments are simulated and stored only in your browser memory (localStorage).'],
        ['How we use information', 'Demonstration data is used solely to showcase the platform\u2019s functionality and is automatically deleted when the browser is closed or by clicking the \u201CReset demo\u201D button.'],
        ['Data security', 'Since no real data is collected, no special security measures are required. A real platform would comply with GDPR requirements and use encryption.'],
        ['Contact information', 'If you have questions, contact us: hello@newchapter.lt'],
      ],
    },
  },
  terms: {
    lt: {
      title: 'Naudojimo sąlygos',
      sections: [
        ['Bendrosios sąlygos', 'NewChapter Lithuania yra universiteto demonstracinis prototipas. Naudodami šią svetainę, sutinkate, kad tai yra demonstracija, neatliekanti tikrų operacijų.'],
        ['Paslaugos aprašymas', 'Platforma pademonstruoja dvišalį turgavietės modelį, kuris jungia tėvus su vaikų raidos specialistais Lietuvoje. Visi profiliai yra fiktyvūs.'],
        ['Mokėjimai', 'Visos mokėjimo operacijos yra simuliuojamos. Jokia tikra finansinė informacija neperduodama ir nerenkama. Demonstracinis komisinis mokestis — 15% nuo konsultacijos kainos.'],
        ['Atsakomybės apribojimas', 'Ši svetainė nepateikia medicininių diagnozių ar gydymo rekomendacijų. Turinys yra edukacinis ir informacinis.'],
        ['Intelektinė nuosavybė', 'NewChapter prekės ženklas, dizainas ir turinys yra sukurti universitetinio projekto tikslais.'],
      ],
    },
    en: {
      title: 'Terms & Conditions',
      sections: [
        ['General terms', 'NewChapter Lithuania is a university demonstration prototype. By using this website, you agree that this is a demonstration that does not perform real operations.'],
        ['Service description', 'The platform demonstrates a two-sided marketplace model connecting parents with child development specialists in Lithuania. All profiles are fictional.'],
        ['Payments', 'All payment operations are simulated. No real financial information is transmitted or collected. The demonstration commission rate is 15% of the consultation price.'],
        ['Limitation of liability', 'This website does not provide medical diagnoses or treatment recommendations. Content is educational and informational.'],
        ['Intellectual property', 'The NewChapter brand, design, and content are created for the purposes of a university project.'],
      ],
    },
  },
  cancellation: {
    lt: {
      title: 'Atšaukimo politika',
      sections: [
        ['Demonstracinių rezervacijų atšaukimas', 'Kadangi visos rezervacijos yra demonstracinės, jas galima atšaukti bet kuriuo metu per „Mano rezervacijos" arba „Demo valdymo skydelis" puslapius.'],
        ['Atšaukimo procesas', 'Paspauskite „Atšaukti rezervaciją" šalia norimos konsultacijos. Rezervacija bus pažymėta kaip atšaukta ir laikas vėl taps prieinamas.'],
        ['Pinigų grąžinimas', 'Kadangi jokios tikros mokėjimo operacijos neatliekamos, pinigų grąžinimo procedūra netaikoma. Tikroje platformoje būtų aiškios grąžinimo taisyklės.'],
        ['Pakartotinė rezervacija', 'Atšaukę konsultaciją, galite iš karto rezervuoti naują laiką pas tą patį ar kitą specialistą.'],
        ['Kontaktai', 'Kilus klausimams: hello@newchapter.lt'],
      ],
    },
    en: {
      title: 'Cancellation Policy',
      sections: [
        ['Cancelling demonstration bookings', 'Since all bookings are demonstrations, they can be cancelled at any time via the \u201CMy Bookings\u201D or \u201CDemo Dashboard\u201D pages.'],
        ['Cancellation process', 'Click \u201CCancel booking\u201D next to the desired consultation. The booking will be marked as cancelled and the time slot will become available again.'],
        ['Refunds', 'Since no real payment operations are performed, the refund procedure does not apply. A real platform would have clear refund rules.'],
        ['Rebooking', 'After cancelling a consultation, you can immediately book a new time with the same or a different specialist.'],
        ['Contact', 'For questions: hello@newchapter.lt'],
      ],
    },
  },
}

function PolicyPage({ type }: { type: 'privacy' | 'terms' | 'cancellation' }) {
  const { lang, go } = useStore()
  const content = policyContent[type][lang]

  return <div className="page policy-page">
    <button className="back-link" onClick={() => go('home')}>← {tr[lang].back}</button>
    <div className="policy-header">
      <span className="eyebrow-text">{tr[lang].prototype}</span>
      <h1>{content.title}</h1>
    </div>
    <div className="policy-body">
      {content.sections.map(([heading, text], i) => (
        <section key={i}>
          <h2>{heading}</h2>
          <p>{text}</p>
        </section>
      ))}
    </div>
  </div>
}

/* ═══════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════ */
function Footer() {
  const { lang, go } = useStore()
  const t = tr[lang]

  return <footer><div className="footer-main"><div className="footer-brand"><div className="brand light"><span className="brand-mark"><span /></span><span>NewChapter<small>LITHUANIA</small></span></div><p>{lang === 'lt' ? 'Jungiame šeimas. Palaikome raidą. Kuriame sveikesnes pradžias.' : 'Connecting families. Supporting development. Creating healthier beginnings.'}</p></div><div><h4>{lang === 'lt' ? 'Atraskite' : 'Explore'}</h4><button onClick={() => go('directory')}>{t.find}</button><button onClick={() => go('resources')}>{t.nav[2]}</button><button onClick={() => go('how')}>{t.how}</button></div><div><h4>{lang === 'lt' ? 'Informacija' : 'Information'}</h4><button onClick={() => go('privacy')}>{lang === 'lt' ? 'Privatumo politika' : 'Privacy Policy'}</button><button onClick={() => go('terms')}>{lang === 'lt' ? 'Naudojimo sąlygos' : 'Terms & Conditions'}</button><button onClick={() => go('cancellation')}>{lang === 'lt' ? 'Atšaukimo politika' : 'Cancellation Policy'}</button><button onClick={() => go('my-bookings')}>{t.bookings}</button></div><div><h4>{lang === 'lt' ? 'Susisiekite' : 'Contact'}</h4><a href="mailto:hello@newchapter.lt">hello@newchapter.lt</a><button className="dashboard-link" onClick={() => go('dashboard')}>{t.dashboard}<Icon name="arrow" size={16} /></button></div></div><div className="footer-bottom"><span>© 2026 NewChapter Lithuania</span><strong>{t.prototype}</strong><span>{t.legal}</span></div></footer>
}

export default App
