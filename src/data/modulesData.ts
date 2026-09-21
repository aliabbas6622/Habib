import { CompetitionModule, TeamRegistrationData } from '../types';

import hurcLogoImg from '../assets/images/hurc_logo.png';
import robowarsImg from '../assets/images/robowars_combat_1789497570448.jpg';
import roboSoccerImg from '../assets/images/robo_soccer_pitch_1789497614322.jpg';
import lfrImg from '../assets/images/line_follower_robot_1789497669616.jpg';
import sumoWarsImg from '../assets/images/sumo_wars_ring_1789497628023.jpg';
import autonomousNavImg from '../assets/images/autonomous_nav_1789497647067.jpg';
import droneWorkshopImg from '../assets/images/drone_workshop_1789497593358.jpg';

export const HURC_LOGO = hurcLogoImg;

export const COMPETITION_MODULES: CompetitionModule[] = [
  {
    id: 'robowars',
    slug: 'robowars',
    title: 'RoboWars (Combat Robotics)',
    shortTitle: 'RoboWars',
    category: 'Combat Robotics',
    iconName: 'Swords',
    badge: 'RoboWars',
    image: robowarsImg,
    tagline: 'Armor, Torque, and Destruction Inside the Steel Arena',
    description:
      'RoboWars is the premier category of HURC. Custom-engineered remote-controlled armored robots battle inside an enclosed steel and polycarbonate arena. Robots must disable, immobilize, or damage opponents while surviving rotating hazards and arena pits.',
    specs: {
      teamSize: '3 - 5 Members',
      robotWeight: 'Up to 15.0 kg (Featherweight Class)',
      dimensions: 'Maximum 60cm × 60cm × 45cm at start',
      arenaSize: '16 ft × 16 ft enclosed bulletproof polycarbonate',
      powerLimit: 'Max 24V DC battery with manual safety kill-switch',
      controlType: '2.4 GHz digital spread spectrum RC with fail-safe'
    },
    rulebook: {
      overview: [
        'RoboWars tests mechanical robustness, electrical weapon drive, and aggressive pilot driving skill in full-contact robot combat.',
        'Matches take place in a fully sealed battle arena with steel floor plates and dual 10mm ballistic polycarbonate walls.',
        'Robots must be equipped with active offensive weapons (spinners, drums, flippers, axes, or wedges) and pass stringent safety scrutineering.'
      ],
      arenaDetails: [
        'Arena dimensions: 4.88m × 4.88m with 2m ceiling.',
        'Hazards include dual pneumatic floor flippers, motorized hazard spikes, and a designated perimeter ditch.',
        'Only certified HURC safety marshals may arm and disarm robots inside the lockbox.'
      ],
      robotConstraints: [
        'Weight limit: 15.00 kg strictly enforced including all batteries and fluids (+1.0% tolerance).',
        'Weapons prohibited: liquids, open flames, explosives, wireless jammers, nets/tethers, uncontained chemical reactions.',
        'High-speed kinetic spinners must spin down to 0 RPM within 60 seconds upon triggering the mandatory master cutoff link.'
      ],
      matchFormat: [
        'Each fight lasts 3 minutes of continuous combat.',
        'If a robot cannot produce controlled translational movement for 10 seconds, the referee initiates a 10-second countdown.',
        'Matches not ending in knockouts are adjudicated by a 3-judge panel based on: Damage (5 pts), Aggression (3 pts), and Control (3 pts).'
      ],
      scoringSystem: [
        'Damage (5 points): Visible functional destruction to armor, drive chains, or weapon systems.',
        'Aggression (3 points): Frequency and intensity of proactive attacks initiated by the bot.',
        'Control (3 points): Ability to dictate battle location, avoid hazards, and push opponent.'
      ],
      penaltiesAndDisqualifications: [
        'Unsafe weapon activation in pit area: Immediate disqualification.',
        'Exceeding maximum RF power or transmitting on banned bands: Forfeit.',
        'Deliberate delay of match start beyond 3 minutes call: Walkover awarded.'
      ]
    },
    prizePool: {
      firstPlace: 'PKR 150,000 + Champion Trophy',
      secondPlace: 'PKR 75,000 + Silver Plate',
      thirdPlace: 'PKR 35,000 + Bronze Plate',
      bestDesign: 'PKR 20,000 (Best Engineering Craft)'
    }
  },
  {
    id: 'robo-soccer',
    slug: 'robo-soccer',
    title: 'Robo Soccer',
    shortTitle: 'Robo Soccer',
    category: 'Sports Robotics',
    iconName: 'Trophy',
    badge: 'Robo Soccer',
    image: roboSoccerImg,
    tagline: 'Precision Ball Handling, Dribbling, and Fast-Paced Teamwork',
    description:
      'Robo Soccer tests mechanical agility, torque drive systems, and team coordination. Teams deploy custom-designed mobile robots onto a marked turf arena to outmaneuver opponent bots, control the ball, and score goals within regulation match time.',
    specs: {
      teamSize: '3 - 5 Members (2 Operator Pilots)',
      robotWeight: 'Maximum 5.0 kg per bot',
      dimensions: '30cm × 30cm × 30cm bounding box',
      arenaSize: '3.6m × 2.4m green synthetic turf with perimeter barriers',
      powerLimit: 'Max 14.8V (4S LiPo) with individual isolation switch',
      controlType: '2.4 GHz digital multi-channel wireless controllers'
    },
    rulebook: {
      overview: [
        'Robo Soccer puts teams in a 2 vs 2 dynamic competitive soccer arena.',
        'Teams must field two robots (one Striker, one Goalkeeper/Defender) operated simultaneously by two team pilots.',
        'Robots must employ custom chassis, high-traction wheels (omni-wheels allowed), and custom mechanical dribbler or kicking paddles.'
      ],
      arenaDetails: [
        'Field size: 3600mm length × 2400mm width, with 600mm wide goalposts on opposing ends.',
        'Playing surface: Short-pile low friction synthetic robotics turf.',
        'Official ball: Standard orange regulation golf ball or low-bounce compressed turf mini-ball.'
      ],
      robotConstraints: [
        'Dribbling mechanisms must not entrap more than 20% of the ball’s diameter.',
        'Electromagnetic or pneumatic kickers must not elevate the ball above 30cm crossbar height.',
        'No spikes, sharp metal corners, or adhesive substances permitted on robot hulls.'
      ],
      matchFormat: [
        'Two halves of 5 minutes each with a 2-minute halftime interval.',
        'Direct and indirect free kicks awarded for pinning opponents against walls for >5 seconds.',
        'In case of a draw in knockout stages: 3-minute golden goal period, followed by penalty shootout.'
      ],
      scoringSystem: [
        '1 Goal = 1 Point scored when the entire ball crosses the goal line.',
        'Clean Sheet Bonus for tournament standings tiebreakers.',
        'Fair Play Points factored into group qualification rankings.'
      ],
      penaltiesAndDisqualifications: [
        'Deliberate damage or ramming off-ball: Yellow Card (1-minute penalty box).',
        'Two Yellow Cards in a single fixture: Red Card (Ejection of the robot for remainder of match).',
        'Physical interference by team members during live play: Match forfeit.'
      ]
    },
    prizePool: {
      firstPlace: 'PKR 100,000 + Golden Boot Trophy',
      secondPlace: 'PKR 50,000 + Silver Plate',
      thirdPlace: 'PKR 25,000 + Bronze Plate',
      bestDesign: 'PKR 15,000 (Best Mechanical Kicker)'
    }
  },
  {
    id: 'lfr',
    slug: 'lfr',
    title: 'Line Following Robot (LFR)',
    shortTitle: 'Line Following (LFR)',
    category: 'Autonomous Racing',
    iconName: 'Zap',
    badge: 'Line Following [LFR]',
    image: lfrImg,
    tagline: 'Millisecond Microcontroller PID Algorithms at High Velocity',
    description:
      'The Line Following Robot (LFR) Ready to Race challenge tests autonomous PID control, high-speed microcontroller processing, and sensor array calibration. Autonomous robots must traverse complex tracks featuring sharp turns, loops, breaks, and intersections at maximum speed.',
    specs: {
      teamSize: '2 - 4 Members',
      robotWeight: 'Maximum 1.5 kg (Optimized for speed)',
      dimensions: '25cm × 25cm × 15cm max',
      arenaSize: '6m × 4m white matte track with 25mm black electrical tape',
      powerLimit: 'Max 12.6V (3S LiPo) battery pack',
      controlType: '100% Fully Autonomous microcontroller (STM32/ESP32/AVR)'
    },
    rulebook: {
      overview: [
        'LFR challenges engineering teams to design the fastest, most stable autonomous line-tracking robot.',
        'Once placed behind the starting line and triggered via push button, zero human interaction or wireless teleoperation is permitted.',
        'The track features acute hairpin turns (up to 45°), orthogonal 90° turns, line breaks (up to 10cm gap), inverted curves, and cross-junctions.'
      ],
      arenaDetails: [
        'Arena track surface: High-contrast matte white vinyl flooring.',
        'Track line: 25mm to 30mm width black matte non-reflective electrical line.',
        'Electronic laser optical gate sensors record lap times with millisecond precision.'
      ],
      robotConstraints: [
        'Sensor array: Optical, infrared, or photodiode arrays up to 16 sensors.',
        'Suction fans / ground effect downforce impellers are allowed up to 12V with safety mesh covering.',
        'No external computing: All calculations must happen on board the vehicle.'
      ],
      matchFormat: [
        'Each team receives 1 calibration run and 3 official timed competitive attempts.',
        'The lowest recorded single lap time among the 3 attempts determines the team’s final standing.',
        'Track completion timeout is capped at 120 seconds per run.'
      ],
      scoringSystem: [
        'Primary metric: Fastest official lap completion time.',
        'Penalty: 5-second penalty added for each manual reset/touch by team handler.',
        'Max 2 hand touches permitted per attempt before the run is marked DNF.'
      ],
      penaltiesAndDisqualifications: [
        'Leaving track bounds without recovering within 30cm: Attempt invalidated.',
        'Damaging the track surface or adhesive lines: Team disqualified from round.',
        'Use of wireless communication during race run: Instant disqualification.'
      ]
    },
    prizePool: {
      firstPlace: 'PKR 80,000 + Speed King Trophy',
      secondPlace: 'PKR 40,000 + Silver Shield',
      thirdPlace: 'PKR 20,000 + Bronze Shield',
      bestDesign: 'PKR 15,000 (Best PID Tuning)'
    }
  },
  {
    id: 'sumo-wars',
    slug: 'sumo-wars',
    title: 'Sumo Wars (Robo Sumo)',
    shortTitle: 'Sumo Wars',
    category: 'Robo Sumo',
    iconName: 'Shield',
    badge: 'Sumo Wars',
    image: sumoWarsImg,
    tagline: 'High-Torque Push, Optical Edge Detection, and Ring Supremacy',
    description:
      'Inspired by traditional Japanese sumo, Sumo Wars pits two autonomous robots against each other inside a circular elevated ring (Dohyo). Robots rely on optical line sensors to detect the ring bounds and ultrasonic or LiDAR sensors to hunt and eject the opponent.',
    specs: {
      teamSize: '2 - 4 Members',
      robotWeight: 'Strictly 3.0 kg max (Standard Class)',
      dimensions: '20cm × 20cm initial footprint (Unlimited after match start)',
      arenaSize: '154 cm diameter circular elevated steel/timber Dohyo ring',
      powerLimit: 'Max 24V DC battery system',
      controlType: '100% Autonomous, started via 5-second mandatory delay'
    },
    rulebook: {
      overview: [
        'Two autonomous sumo robots face opposite directions at the starting lines (Shikiri-sen).',
        'Upon referee command, team operators press the start button. Both robots must remain strictly motionless for a 5-second safety count.',
        'The objective is to locate the opposing robot and push it completely off the Dohyo ring surface.'
      ],
      arenaDetails: [
        'Dohyo diameter: 1540 mm circular platform, elevated 50 mm above floor level.',
        'Surface: Matte black with a 50 mm wide solid white ring boundary (Tawara).',
        'Shikiri-sen: Two brown parallel starting lines 200 mm long, spaced 200 mm apart.'
      ],
      robotConstraints: [
        'Neodymium magnet downforce is permitted ONLY on magnetic steel dohyos where specified.',
        'Sharp razor blades or edges that could puncture or slice opponents are strictly forbidden; wedges must be blunt (R > 0.5mm).',
        'No sticky glues, liquids, vacuum pumps, jamming signals, or projectile devices.'
      ],
      matchFormat: [
        'Each match consists of 3 rounds (Yuhkoh) of up to 3 minutes each.',
        'The first robot to win two Yuhkoh points wins the bout.',
        'If neither robot pushes the opponent out within 3 minutes, judges decide based on center control and attacks.'
      ],
      scoringSystem: [
        '1 Yuhkoh awarded when any part of an opponent touches the area outside the Dohyo perimeter.',
        '1 Yuhkoh awarded if opponent immobilizes itself or falls off the edge under its own momentum.',
        'Direct victory awarded if opponent robot catches fire, leaks fluid, or suffers terminal mechanical failure.'
      ],
      penaltiesAndDisqualifications: [
        'Moving before the 5-second post-start countdown expires: False Start warning. Two false starts = 1 Yuhkoh to opponent.',
        'Intentional damage to dohyo surface: Disqualification from tournament.',
        'Failure to respond to referee calls within 2 minutes: Match forfeited.'
      ]
    },
    prizePool: {
      firstPlace: 'PKR 90,000 + Grand Yokozuna Trophy',
      secondPlace: 'PKR 45,000 + Silver Shield',
      thirdPlace: 'PKR 25,000 + Bronze Shield',
      bestDesign: 'PKR 15,000 (Best Wedge & Sensor Architecture)'
    }
  },
  {
    id: 'autonomous-nav',
    slug: 'autonomous-nav',
    title: 'Autonomous Navigation & Obstacle Challenge',
    shortTitle: 'Autonomous Nav',
    category: 'Exploration & AI',
    iconName: 'Cpu',
    badge: 'Autonomous Nav',
    image: autonomousNavImg,
    tagline: 'SLAM, Obstacle Avoidance, and Fire Hazard Extinguishing',
    description:
      'HURC indigenous category into the inferno! Designed for robotics innovators, this challenge tests autonomous firefighting and navigation rovers navigating an unknown terrain. Robots must map corridors, detect simulated fire sources, and navigate safely around dynamic hazards.',
    specs: {
      teamSize: '3 - 5 Members',
      robotWeight: 'Maximum 8.0 kg',
      dimensions: '40cm × 40cm × 40cm maximum bounding box',
      arenaSize: '5m × 5m modular walled labyrinth with multi-room layout',
      powerLimit: 'Max 16.8V battery (with dedicated suppression fan power)',
      controlType: 'Fully Autonomous onboard compute (ROS/ROS2/OpenCV/Python)'
    },
    rulebook: {
      overview: [
        'Autonomous rovers must navigate a 5m × 5m indoor labyrinth with blind corners, dead ends, and movable obstacles.',
        'The rover must autonomously map the environment, discover target beacons (simulated heat/sound/LED points), extinguish simulated flames, and return to home base.',
        'Teams are graded on SLAM mapping accuracy, speed, obstacle collision count, and mission completion.'
      ],
      arenaDetails: [
        'Arena walls: 350mm high white melamine partition panels forming corridors.',
        'Lighting conditions: Ambient indoor light with variable localized shadows.',
        'Target zone: 3 designated mission rooms with flame targets (LED flicker + flame simulators).'
      ],
      robotConstraints: [
        'Sensors: 2D/3D LiDAR, RealSense depth cameras, ultrasonic, thermal IR sensors encouraged.',
        'Fire suppression: High-speed electric blower fan or localized dry CO2 air blast. (NO WATER OR WET FOAM ALLOWED).',
        'All compute must reside on board (e.g. Jetson Nano/Orin, Raspberry Pi 5, or mini PC).'
      ],
      matchFormat: [
        'Each team has a 10-minute slot: 2 minutes setup, 8 minutes active autonomous run.',
        'Teams are awarded points for each milestone reached without operator assistance.',
        'A single manual reposition is permitted with a 150-point deduction.'
      ],
      scoringSystem: [
        'Navigating through waypoint zones: 100 points each.',
        'Successful target flame suppression: 250 points per target.',
        'Returning autonomously to starting base: 200 points.',
        'Deductions: -25 points per physical wall contact/collision.'
      ],
      penaltiesAndDisqualifications: [
        'Teleoperation or external joystick input during autonomous run: Zero score.',
        'Spilling liquids or destructive impact with modular walls: Disqualification.',
        'Exceeding the 8-minute maximum arena run time.'
      ]
    },
    prizePool: {
      firstPlace: 'PKR 120,000 + AI Pioneer Trophy',
      secondPlace: 'PKR 60,000 + Silver Plate',
      thirdPlace: 'PKR 30,000 + Bronze Plate',
      bestDesign: 'PKR 20,000 (Best SLAM & Computer Vision)'
    }
  },
  {
    id: 'drone-workshop',
    slug: 'drone-workshop',
    title: 'Drone Building & Workshop',
    shortTitle: 'Drone Workshop',
    category: 'Avionics & Flight',
    iconName: 'Compass',
    badge: 'Drone Workshop',
    image: droneWorkshopImg,
    isStandalone: true,
    tagline: '',
    description:
      'Drone Building Workshop is a 2-day hands-on program where teams of five build a fully functional drone from the ground up. Sessions cover flight dynamics, motor and ESC selection, flight controller setup, and frame assembly, followed by hands-on wiring, soldering, and calibration — giving participants real, practical experience in robotics and embedded systems.',
    specs: {
      teamSize: '1 - 3 Members (Individual or Small Teams)',
      robotWeight: 'FPV Micro/Cinewhoop Class (Sub-250g with propeller guards)',
      dimensions: '2.5 inch to 3.5 inch ducted propeller wheelbase',
      arenaSize: '10m × 8m enclosed safety flight net with LED gates and rings',
      powerLimit: '3S / 4S LiPo certified safety battery with voltage buzzer',
      controlType: 'ELRS / Crossfire / FrSky 2.4GHz / 868MHz + 5.8GHz Analog/HD Zero'
    },
    rulebook: {
      overview: [
        'A hands-on intensive 2-day technical bootcamp followed by the HURC Precision Flight Time Trial.',
        'Day 1 covers Quadcopter Aerodynamics, Flight Controller firmware (Betaflight/ArduPilot), ESC calibration, Soldering, and RF Telemetry.',
        'Day 2 features full indoor netted arena flight trials, hovering precision challenges, and obstacle course slalom racing.'
      ],
      arenaDetails: [
        'Arena enclosed with heavy-duty safety netting on all 4 sides and ceiling.',
        'Features 6 glowing LED obstacle gates, 2 vertical dive towers, and slalom flags.',
        'Live pilot FPV feed routed to high-definition spectator monitors.'
      ],
      robotConstraints: [
        'All quadcopters flown inside arena MUST feature full propeller guards / duct protectors.',
        'Fail-safe configuration test mandatory: cutting transmitter power must immediately disarm motors within 0.5s.',
        'Sub-250g AUW (All-Up-Weight) including battery.'
      ],
      matchFormat: [
        'Workshop sessions are followed by two timed slalom trial runs per participant/team.',
        'Fastest clean run without gate misses wins the Flight Trophy.',
        'Certified completion certificates awarded to all workshop attendees.'
      ],
      scoringSystem: [
        'Gate Passage: 50 points per completed gate.',
        'Clean Run Bonus: 100 points for zero contact with safety net or pylons.',
        'Time Multiplier: Remaining seconds under the 180s cap convert to bonus points.'
      ],
      penaltiesAndDisqualifications: [
        'Arming drone outside safety net enclosure: Immediate expulsion from venue.',
        'Flying without propeller guards during trial: Flight attempt canceled.',
        'Operating on non-assigned video channels causing pilot frequency bleed: Disqualification.'
      ]
    },
    prizePool: {
      firstPlace: 'PKR 70,000 + Top Gun Flight Trophy',
      secondPlace: 'PKR 35,000 + Silver Shield',
      thirdPlace: 'PKR 20,000 + Bronze Shield',
      bestDesign: 'PKR 15,000 (Best Custom Build & Telemetry)'
    }
  }
];
