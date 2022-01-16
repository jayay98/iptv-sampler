const { default: axios } = require('axios')
const { initializeApp } = require('firebase/app')
const firestore = require('firebase/firestore')
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
}
initializeApp(firebaseConfig)

const fetchFromGH = async () => {
  const data = await axios.get('https://iptv-org.github.io/iptv/channels.json')
  return data.data
}

const updateDB = async (data) => {
  const db = firestore.getFirestore()

  data.filter((chn) => !!chn.tvg.id).splice(300).forEach((chn) => {
    firestore.setDoc(firestore.doc(db, 'iptv', chn.tvg.id.replace('/', '')), chn)
  })
}

fetchFromGH().then((data) => updateDB(data))
