import {Vector3} from 'three';

export const sceneObjects = [
  {
    id: 'Water',
    tooltip: 'This is just a water',
    mesh: null,
  },
  {
    id: 'Kromhouthal',
    label: 'De Kromhouthal',
    tooltip: 'The venue itself. Here the conference happens, also lunch and after party concert.',
    mesh: null,

    cameraPosition: new Vector3(-0.06157549650097849, 0.5, 1.3406159022279274),
    cameraTarget: new Vector3(0.10750799112688592, 0.0020002103296028148, 0.08373953636661358),
  },
  {
    id: 'Baristatruck',
    label: 'Barista Truck',
    tooltip: 'There are several barista quality coffee spots at the event. This one is at the waterfront.',
    mesh: null,
    cameraPosition: new Vector3(0.5505262407756342, 0.5, 1.3782882680128457),
    cameraTarget: new Vector3(0.26324404122882905, 0.002000332244578139, 0.8770147369617076),
  },
  {
    id: 'Hotel',
    label: 'HolidayInn Hotel',
    tooltip: 'The hotel where speakers and VIP attendees stay',
    mesh: null,
    cameraPosition: new Vector3(-1.047873974171954, 0.3, -0.9051465686666578),
    cameraTarget: new Vector3(-0.214484666553989, 0.0019999451800348064, -1.6380197376254468),
  },
  {
    id: 'Ferrypier',
    label: 'Ferry Pier',
    tooltip: 'The pier where ferry from Central Station arrives',
    mesh: null,
    cameraPosition: new Vector3( -1.0191165338217198, 1, 1.0199307079038749),
    cameraTarget: new Vector3( -0.7083083503448264, 0.002482047203224608, 0.333541499697274),
  },
  {
    id: 'Foodtrucks',
    label: 'Food Trucks Area',
    tooltip: 'Foodtracks pit stop. This is a free addition to the main lunch served inside of the Kromhouthal.',
    mesh: null,
    cameraTarget: new Vector3(0.7198280416960714, 0.0020003199356387067, 0.889453850800386),
    cameraPosition: new Vector3( 0.8227426764069051, 0.2, 1.2885774026893668),
  },
  {
    id: 'Waterfront',
    label: 'Entrance',
    tooltip: 'The waterfront of the venue and the main entrance. The place to hangout during breaks and get some fresh air during the after party. Also lunches are great with the river view.',
    mesh: null,
    cameraPosition: new Vector3(-0.07484324395156938, 0.5, 1.2213224662928868),
    cameraTarget: new Vector3(0.12355608929044298, 0.001976783270933715, 0.8163365389447157),
  },
  {
    id: 'Lowlander',
    label: 'Lowlander Cafe',
    tooltip: 'Cafe and brewery Lowlander. The place for C3Fest.com workshops and speed dating on June 15th',
    mesh: null,
    cameraPosition: new Vector3(-0.7594474196997869, 0.25, 1.0654153574885319),
    cameraTarget: new Vector3(-0.3408560865195054, 0.002000354518021211, 0.898018629068255)
  },
  {
    id: 'Oedipus',
    label: 'Oedipus Brewery',
    tooltip: 'Famous Oedipus brewery. The place to preparty on June 13th',
    mesh: null,
    cameraPosition: new Vector3(0.1574732268749206, 0.5, -1.090837175905949),
    cameraTarget: new Vector3(0.5783575155036691, 0, -0.9608591178505858),
  },
  {
    id: 'Noordwaards',
    label: 'Noordwaards',
    tooltip: 'The place for techno/house stage. Stage to open at 23:00 on 15th June',
    mesh: null,
    cameraPosition: new Vector3(0.23989680903899302, 0.5, -1.0062195865627226),
    cameraTarget: new Vector3(0.6123124960441166, 0, -1.376993670058706),
  }
];
