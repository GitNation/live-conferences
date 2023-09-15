const conferenceTitle = 'DevOps_JS';
const eventYear = 'Y2024';

const tagColors = {
  Build: {
    tagBG: '#dd4b39',
    color: '#fbff00',
  },
  'CI/CD': {
    tagBG: '#5e8de3',
    color: '#FFFFFF',
  },
  Monorepo: {
    tagBG: '#8cc84b',
    color: '#fff',
  },
  HumanOps: {
    tagBG: '#ff7302',
    color: '#ffffff',
  },
  Toolkit: {
    tagBG: '#fff40d',
    color: '#ae4f01',
  },
  DevOps: {
    tagBG: '#fff40d',
    color: '#ae4f01',
  },
  Packaging: {
    tagBG: '#f200fa',
    color: '#fff',
  },
  'Cloud Native': {
    tagBG: '#198bb0',
    color: '#FFFFFF',
  },
  'Monitoring & Observability': {
    tagBG: '#3fb984',
    color: '#fff',
  },
  'Infrastructure as Code': {
    tagBG: '#00a6ff',
    color: '#fff',
  },
  'Best Practices': {
    tagBG: '#007acc',
    color: '#fff',
  },
  Performance: {
    tagBG: '#dd0031',
    color: '#FFFFFF',
  },
  'Feature Flagging': {
    tagBG: '#8ac1ce',
    color: '#fff',
  },
  Security: {
    tagBG: '#61dbfb',
    color: '#004d61',
  },
  Nx: {
    tagBG: '#00ed24',
    color: '#00410a',
  },
  Serverless: {
    tagBG: '#9c00ff',
    color: '#fff',
  },
  'Quality & Security': {
    tagBG: '#ffaa45',
    color: '#fff',
  },
  // "December 7": {
  //   tagBG: '#00a6ff',
  //   color: '#fff',
  // },
  // "December 8": {
  //   tagBG: '#ff00d2',
  //   color: '#fff',
  // },
  // "Lightning Talk": {
  //   tagBG: '#9b4fe8',
  //   color: '#fff',
  // },
  // "Workshops": {
  //   tagBG: '#8e67ca',
  //   color: '#fff',
  // },
  default: {
    tagBG: 'black',
    color: 'white',
  },
};
const speakerAvatar = {
  dimensions: {
    avatarWidth: 500,
    avatarHeight: 500,
  },
};

module.exports = {
  tagColors,
  speakerAvatar,
  conferenceTitle,
  eventYear,
};
