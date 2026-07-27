export type Store = {
  id: string
  name: string
  category: string
  rating: number
  time: string
  delivery: string
  image: string
  featured?: boolean
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  soldOut?: boolean
  popular?: boolean
}

export const images = {
  landingLogo:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuClc0kjRcGe_Ouj1DVnAB67fqD35Hu4ZD5_CNvNYRL4fFmXjDETmO0WzfdW0Bl5urIbjK6rcFC7ohZvxdoTZO3nUJmaEGiXSK35AxoXs2vAnp_thfN50n5GdlEXzCiTuyvA7e2gsR0JyFPAnmHDWKm7GsLeqkewsLinthmVEGejlbjYAuLRss_c15p_oJ1qfR2Vxi8d_FWLnCNZo6y_cVuPFN48Sv8B4b0nrGVxYJNBhBeXtXlc7uGpz2Gfh8grmMLMUa6cjX0wHUgR',
  owner:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB8DsLTr_OUDCHIdU150bNQMAH_ap1YLCnjmEHyrRbSIeWcvMpbexIWAbsNc4x4oBd0aFYr6EHRkI9W0s3YE8THmmRqsosZdOXHmGHwP0u910ONd-yPbOfhyEYgdPBNkyxLw-ziH_f56g53hZra2iAKLQcLwVqf5-PgvVaHwxEhpaIcd80PxxJTukkr9oWHN3oXU-uziKw7mTzD3WGNDEEVsND6NdNaemdbrBEzBg8Xj5Q4QOK6sxDN_BLJy6XkNwxUUL5z55QjYByY',
  driver:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBmQtFHF3r4fwgjNMSmKDIB6UWuqqlHofQGWKppEyDjP_dkqoBbGKuP9N3hmC-GhHZSbrzgG--VWfC7nEAAvQVfjFXk-n6cleWzatd3gT2RZpcX3Xxqtt-frIfOWQOk9ewbbvDBovNrK1UI6ftgS-nUy5NaTYv1j6jOnkR80vXLByaMJUaxBLzlVK936qu4cThMrGc3R7Z8iDcKa_7Lw0mnJfxOob-gGev83JFDJSAlgcunijVDRv9leyXiQe1SDjH9wsTF8grxaPWd',
  customer:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZL0xOFhr6damHmn_hKeeIRgW0DI7K-3wko1A1_db8jX09PM8KgWARoNAaBWAvpp5iY7UnzhGI630ZFBTrIfoOjYwhBPBsWxqEpLMc8Q46rboM947i8fEhHpg385-aavsoX_qu6w5wyQUh4u_kkxIbPCXzYtG4AQIzGUMyUbQkJ0iY3ut58VGq8TUpooDpU4OeJOmsubMjNnl86bcZBn2IXEkTi-0QhCZbyrugwKGlVd6sLyOhcvibPtE2i4v6WCEhKLIcMz4qveHa',
  burger:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAvHq863VLiQcVU7n-7qYw86EzBW-grAZXm4gl-_hujqMPUh99If2CeGSEiZjd4rE9qTNOSRsstblXpeJJe1vEQCj9Ng2mhSAG-xRrPGbWP-4GLmrw2u09Z9jyg-Xik1p31jxCr5JftIGiiWPlWsTTytWXDb0oLBSGI_HW80lDNp7jjGEQmUSUcx18sBc4ZXY4DLPIEPyx1zZyKVr08GJ8ClCam3zZKL1tJq751zsFp-DmkSf29hSO5eccXSpr0aBtclxN1eveI18ps',
  chicken:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCDxoL3_8eBVcJDh7LBwzg2z9xLtJHKucvjHKT6XVmK3nY-6m0muLidL9_rHFTkXBH7EnAWFsPgy3fKnkoq34PLsAhSSYdkkhfjCs0YbpwnoAnd_MCAxuv0dGD868WufYnmnw1MWg89iqOB0fryH2gafj2tfU9NpPcePvyO0XFKKc3VuhTJfNealFjtfFFKO9Brs841KLZpkSQ4U_QkjRaX_OdD1fsLosL3j1o59FEpMyRfirYgqENKxBeq87R3Y5Y1qE8T_sJH4eSJ',
  smash:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDgUn7CyzMnXnAvTdVADniLhyAVzJMm3xaD1gAFPQKrfCr0h4O9NkYVGq80T9O01hDvsbNiR2uf5b-xLM1MdO7OevjaoX5LqQjlMUfcIpkDB5UscOHiv9iRtrH-VcFPZxqOgmgnLp4Lbc55-YW_rn0tK99HK1KDcMPCqPE11oD8HD6w6Pd0wRxjoALibNuP0LBCmxZIAJrbKncqw3kYomV3ofqk98l_ccKUkRt--5ufr8kk5oWl5U3zfnhrCTqSv5XtBTZXqsy7PRR9',
  steak:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAvfK1kMh4h_LVhFmu2kJLqoG9f15UOruiQf9uZFhEdBCD6Qnj0g8udgtjygmth_HzPz8vOD_7-s_HZ7faEH6I97YWMK6EDgdgpiKs44V8BC7OLwf4F1Me3JZIIOC7NRygCWhuWLVVUVhRUfCB_MYkbxva2HtrXAvuy7Ec8XiQGGO8J_ct1xofWp62QVzONfJcQ8GurOMn8o1v2I_6sQvBbP887qhkSuYhR1XjUAkuszoDlPbitrAXpkGhbQbvU3pOQrVHHrOmSeO_D',
  sushi:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB9950iCWUcGl1R0OL9qAVzV6clwgCYMkIpgYjv0KiJVq4HPrDRF2qrTWAN4Ir0pg3rd-yVJcAR8aPag9hxV5ldh1CMdYlvnlxCvrm51mAvuRw3Nr0plree0-BSUtDdJYr16ScNpWIL8OSM6e7EVYrEvVMGW98Z5AC_esfby9a1bN3ijR0a8Z3rG1TRDOGrQXev3S-1fcTXp2XOTDzohVqb1hqnX4yer4PWnsLJBAmlNQKJBxmdaKlF9jql3Q_I3pLPWYgM34WXUzBa',
  tacos:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDVYkMAbOIRbGiTFdMUNEZeAWFA-jAYHhVUX839yV04ufq_flUrT6bWbJ2YbFSfS6GRzo0DqP851Iq3nxNauA-29BfWGLXlG9YCfaPQtjXupW7o2GbRXPzJY0FrK3tmiLkvrwcySFnZ7WL03R-3rqDSXX4okpnlen9ROXLJXPdfK6_EoCidBkEGaHQRLEQNUlWR3GL5GvXVManTPxMBv97NoddLrbRoPDGHGHdhOunwsKM0AIZ1kL9wUy40RGxWwRG1pM8v1uw5bAb0',
  healthy:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBLT89VKaU1kMejFfPKHt-u1PwoITjz7yux49zzZOlP5Y5Cn_BJnDm7m_cA3_ADjiPLmCCBy8FVmDarUmOFbVft3DqP8nEbgw4Ph9G9uQ2SCMkKdDrjY0m9eTXfBmH6BDXWheOVAXS4rbn2yhSml8kkghiS2Zdz-DFnCeCjgWlFwnKWmH9REOVswdL7dyPJhsUv4o6PMA6WRmckM_8urGMZkcMeJzMiTNydlJGRT7SC3qXbgtquOx_NRWKgayyOZM_ESiDFFeQNjjaf',
  fries:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAinTud2Tie0ZyC1ZsNwPhxULgZbjh1rIJM7S518iiVBoLd8m-swMPERFhUfwhj4mKWy4pLBfB18AS7ZPlB8eVNjrWJfWpGIyPh8cFehMt1XXPtGA5g403zM3EgNJNL0cdYWvL2NNADWP9v8HNdZM-RNCUA7WybPt04pA8SqFOfHDgMeybOBzg1iTsxVW3bzaqESgSoXtZ2-L6y8fxKqUte4V7LBUzyM0jgdB8QPg5CVSss8yGc4S22LhZWa80_UVMYah3haZEsNnFa',
  login:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCGzm5r8wEOdwaupi6lpdtuR0EUEP_Bs1pN7umR4KW3zmBS6JiQUmx0ZvAYlaGYDXuCGZZIshwbEfiUi9RHGTAuFwcKOVBDb12S5t9Epa2qNSPP2A2a_YM9j8SEPqb9cuE6f8PFl4uuh_dSNO5sykvYA1NwX1fUqUUItP4YkblH1Bx0HTsZvcw0kIlSwhSuqeFGriQFRw-KQYtotFUh8DwOJSV3Hf4wWgDB7PwVtvxcbTZJXzdhi_eoldCn6IhLdzGvRgqk4hx8PUF_',
}

export const stores: Store[] = [
  {
    id: 'maya-burger',
    name: 'Maya Burger',
    category: 'Hamburguesas artesanales',
    rating: 4.9,
    time: '20–30 min',
    delivery: '$25 MXN',
    image: images.burger,
    featured: true,
  },
  {
    id: 'esquina-sabor',
    name: 'La Esquina del Sabor',
    category: 'Tacos y antojitos',
    rating: 4.8,
    time: '25–35 min',
    delivery: '$19 MXN',
    image: images.tacos,
  },
  {
    id: 'sushi-itza',
    name: 'Sushi Itzá Express',
    category: 'Sushi y cocina japonesa',
    rating: 4.7,
    time: '30–40 min',
    delivery: '$29 MXN',
    image: images.sushi,
  },
  {
    id: 'green-bowl',
    name: 'Green Bowl Center',
    category: 'Saludable',
    rating: 4.9,
    time: '15–25 min',
    delivery: 'Gratis',
    image: images.healthy,
  },
]

export const products: Product[] = [
  {
    id: 'maya-clasica',
    name: 'Hamburguesa Maya',
    description: 'Carne artesanal, cheddar, vegetales frescos y aderezo de la casa.',
    price: 149,
    image: images.burger,
    popular: true,
  },
  {
    id: 'pollo-itzamal',
    name: 'Pollo Itzamal',
    description: 'Pollo a la parrilla, aguacate, cebolla morada y crema especiada.',
    price: 135,
    image: images.chicken,
    popular: true,
  },
  {
    id: 'smash-doble',
    name: 'Smash doble',
    description: 'Doble carne, queso americano, pepinillos y cebolla caramelizada.',
    price: 169,
    image: images.smash,
  },
  {
    id: 'papas',
    name: 'Papas fritas grandes',
    description: 'Crujientes, recién hechas y con sal de la casa.',
    price: 65,
    image: images.fries,
  },
  {
    id: 'especial',
    name: 'Especial del chef',
    description: 'Edición limitada con ingredientes locales.',
    price: 189,
    image: images.steak,
    soldOut: true,
  },
]

export const categories = [
  ['restaurant', 'Restaurantes'],
  ['lunch_dining', 'Hamburguesas'],
  ['local_pizza', 'Pizza'],
  ['tapas', 'Tacos'],
  ['grocery', 'Despensa'],
  ['medication', 'Farmacia'],
  ['local_bar', 'Bebidas'],
  ['cake', 'Postres'],
] as const
