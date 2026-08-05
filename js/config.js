const translations = { /* Toàn bộ object translations vi/en của bạn */ };
const defaultSlogans = { /* Dữ liệu defaultSlogans */ };
const defaultHints = { /* Dữ liệu defaultHints */ };
const defaultPlaylist = [ /* Dữ liệu defaultPlaylist */ ];
const defaultSystemConfig = { /* Dữ liệu defaultSystemConfig */ };

const firebaseConfig = {
    apiKey: "AIzaSyBAY8N4lKXlLexdcEoEuE6DdyVVcA0cDs",
    authDomain: "bgvp-challenge.firebaseapp.com",
    databaseURL: "https://bgvp-challenge-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bgvp-challenge",
    storageBucket: "bgvp-challenge.firebasestorage.app",
    messagingSenderId: "122013691059",
    appId: "1:122013691059:web:2e2963a573faf2915bd4c6"
};
firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database().ref('bvgpOfficialTeamData');

const defaultMembers = [
    { id: 'member_1', name: 'Khánh Nguyễn', avatar: '', pin: '', pinHistory: [] }
];

let appData = { 
    members: defaultMembers, 
    pendingMembers: [], 
    sharedChallenges: [], 
    personalHabits: { 'member_1': [] }, 
    notifications: {},
    systemConfig: defaultSystemConfig,
    playlist: defaultPlaylist,
    slogansPool: defaultSlogans,
    hintsPool: defaultHints
};