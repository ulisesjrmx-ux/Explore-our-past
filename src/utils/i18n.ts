import { Language, PlanetId, RescueObject } from '../types/game';

export const LANG_STORAGE_KEY = 'horizonte_orbital_lang_v1';

export function getPlanetDisplayName(planetId: PlanetId, lang: Language): string {
  if (lang === 'en') {
    return planetId === 'moon' ? 'The Moon' : 'Mars';
  }
  return planetId === 'moon' ? 'La Luna' : 'Marte';
}

export function getPlanetSectorName(planetId: PlanetId, lang: Language): string {
  if (lang === 'en') {
    return planetId === 'moon' ? 'Mare Tranquillitatis' : 'Jezero Crater';
  }
  return planetId === 'moon' ? 'Mare Tranquillitatis' : 'Cráter Jezero';
}

const OBJECT_COPY_EN: Record<
  string,
  {
    name: string;
    sector: string;
    transmissionTitle: string;
    transmissionSummary: string;
    telemetryReading: string;
  }
> = {
  'moon-obj-1': {
    name: 'Apollo Lunar Modules',
    sector: 'Mare Tranquillitatis',
    transmissionTitle: 'Lunar Descent Telemetry',
    transmissionSummary:
      'Descent stage recovered crewed landing logs, cabin thermal control telemetry, and initial basalt rock sample records.',
    telemetryReading: 'Descent: Nominal · Samples: 21.5 kg · O₂: 100%',
  },
  'moon-obj-2': {
    name: 'Lunar Roving Vehicles (LRVs)',
    sector: 'Hadley Rille / Apennines',
    transmissionTitle: 'Lunar Traverse Log',
    transmissionSummary:
      'Electric rover transmitted regolith traction curves, inertial navigation headings, and long-range geological traverse routes.',
    telemetryReading: 'Distance: 35.9 km · AgZn Battery: 36 V · Speed: 13 km/h',
  },
  'moon-obj-3': {
    name: 'ALSEP Scientific Packages',
    sector: 'Oceanus Procellarum',
    transmissionTitle: 'Lunar Geophysical & Seismic Station',
    transmissionSummary:
      'Surface experiment array recorded deep moonquakes, subsurface heat flow, and solar wind particle density.',
    telemetryReading: 'Quakes: 1.9 Mw · Heat Flow: 21 mW/m² · RTG: Active',
  },
  'moon-obj-4': {
    name: 'Surveyor Landers',
    sector: 'Tycho Crater / South Orbit',
    transmissionTitle: 'Surface Soil & Bearing Survey',
    transmissionSummary:
      'Pre-Apollo robotic lander verified lunar dust bearing strength and beamed thousands of panoramic surface frames.',
    telemetryReading: 'Soil Bearing: 34 kPa · Panoramas: 11,150 · -145 °C',
  },
  'mars-obj-1': {
    name: 'Sojourner Rover',
    sector: 'Ares Vallis',
    transmissionTitle: 'Sojourner Rover',
    transmissionSummary: 'Sojourner Rover telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: Ares Vallis',
  },
  'mars-obj-2': {
    name: 'Spirit & Opportunity',
    sector: 'Gusev / Meridiani',
    transmissionTitle: 'Spirit & Opportunity',
    transmissionSummary: 'Spirit & Opportunity telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: Gusev / Meridiani',
  },
  'mars-obj-3': {
    name: 'Viking 1 & 2 Landers',
    sector: 'Chryse / Utopia Planitia',
    transmissionTitle: 'Viking 1 & 2 Landers',
    transmissionSummary: 'Viking 1 & 2 Landers telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: Chryse / Utopia Planitia',
  },
  'mars-obj-4': {
    name: 'Phoenix & InSight Landers',
    sector: 'Vastitas / Elysium',
    transmissionTitle: 'Phoenix & InSight Landers',
    transmissionSummary: 'Phoenix & InSight Landers telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: Vastitas / Elysium',
  },
  'mars-obj-5': {
    name: 'Dawn Spacecraft',
    sector: 'Ceres / Outer Orbit',
    transmissionTitle: 'Dawn Spacecraft',
    transmissionSummary: 'Dawn Spacecraft telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: Outer Orbit',
  },
  'mars-obj-6': {
    name: 'NEAR Shoemaker',
    sector: '433 Eros Belt',
    transmissionTitle: 'NEAR Shoemaker',
    transmissionSummary: 'NEAR Shoemaker telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: 433 Eros Belt',
  },
  'mars-obj-7': {
    name: 'Pioneer 10 & 11',
    sector: 'Outer Deep Space',
    transmissionTitle: 'Pioneer 10 & 11',
    transmissionSummary: 'Pioneer 10 & 11 telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: Deep Space',
  },
  'mars-obj-8': {
    name: 'Ingenuity Helicopter',
    sector: 'Jezero Crater',
    transmissionTitle: 'Ingenuity Helicopter',
    transmissionSummary: 'Ingenuity Helicopter telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: Jezero Crater',
  },
  'mars-obj-9': {
    name: 'Kepler Space Telescope',
    sector: 'Heliocentric Orbit',
    transmissionTitle: 'Kepler Space Telescope',
    transmissionSummary: 'Kepler Space Telescope telemetry logged in Mars mission records.',
    telemetryReading: 'Signal: Active · Sector: Heliocentric Orbit',
  },
};

export function getLocalizedObjectCopy(
  obj: Pick<
    RescueObject,
    'id' | 'name' | 'sector' | 'transmissionTitle' | 'transmissionSummary' | 'telemetryReading'
  >,
  lang: Language
) {
  if (lang === 'en' && OBJECT_COPY_EN[obj.id]) {
    return OBJECT_COPY_EN[obj.id];
  }
  return {
    name: obj.name,
    sector: obj.sector,
    transmissionTitle: obj.transmissionTitle,
    transmissionSummary: obj.transmissionSummary,
    telemetryReading: obj.telemetryReading,
  };
}

export const UI_TEXT = {
  es: {
    brandTitle: 'Explore our past',
    titleTagline: 'Cuaderno Espacial · La Luna y Marte',
    titleSubtitle:
      'Pilota tu nave entre estrellas y cráteres dibujados a crayola para rescatar las bitácoras y grabaciones de las misiones históricas.',
    titleStartBtn: 'Iniciar',
    titleLaunchingBtn: 'Despegando...',
    backToMenu: 'Volver al menú',
    backToTitleMenu: 'Menú principal',
    scoreLabel: 'Puntos',
    rescuedLabel: 'Rescatados',
    logbookLabel: 'Bitácora',
    pause: 'Pausa',
    resume: 'Reanudar',
    pauseAria: 'Pausar misión',
    resumeAria: 'Reanudar misión',
    audio: 'Audio',
    muted: 'Silenciado',
    muteAria: 'Silenciar audio',
    unmuteAria: 'Activar audio',
    reset: 'Reiniciar',
    langSwitchLabel: 'ES',
    langSwitchTitle: 'Cambiar idioma a Inglés',
    gravity: 'Gravedad',
    temp: 'Temp',
    outOfGasBanner: '¡Sin gasolina! Motores apagados',
    lowGasBanner: (pct: number) => `¡Gasolina baja (${pct}%)! Recoge los tanques verdes`,
    dataReceivedSuffix: 'Información recibida',
    viewInLogbook: 'Ver registro en Bitácora',
    controlsHint: 'WASD o Flechas para volar · Espacio para turbo · Recoge tanques verdes de gasolina',
    missionCompleted: (planet: string, total: number) =>
      `Misión en ${planet} completada (${total}/${total} objetos)`,
    thrustersReady: (target: string) => `Propulsores listos para despegar hacia ${target}.`,
    launchTo: (target: string) => `Despegar hacia ${target}`,
    switchToPrefix: 'Cambiar a',
    switchPlanetAria: (target: string) => `Cambiar a ${target}`,
    switchMarsLockedAria: (rescued: number, total: number) =>
      `Marte bloqueado · Completa los ${total} objetivos de La Luna (${rescued}/${total})`,
    origin: 'Origen',
    destination: 'Destino',
    menuKicker: 'Exploración y Rescate de Datos',
    menuDesc:
      'Pilota tu nave espacial sobre la superficie planetaria, vigila tu nivel de gasolina recogiendo tanques verdes en el mapa y localiza los objetivos científicos en orden para transmitir su información hacia tu bitácora.',
    chooseStart: 'Elige tu destino',
    objectsCountLabel: (n: number) => `${n} objetos`,
    marsLockedBadge: 'Bloqueado',
    marsUnlockedBadge: 'Desbloqueado',
    marsLockedMenuDesc: (moonTotal: number) =>
      `Completa los ${moonTotal} objetivos de La Luna para desbloquear`,
    marsUnlockedKicker: (moonTotal: number) =>
      `${moonTotal}/${moonTotal} Objetivos Lunares Completados`,
    marsUnlockedTitle: '¡Marte Desbloqueado!',
    marsUnlockedDesc:
      'Has recolectado toda la información científica de La Luna. Tu nave ya tiene autorización para despegar rumbo a Marte.',
    stayOnMoon: 'Seguir en La Luna',
    menuControls: ['Controles: WASD / Flechas', 'Clic sostenido para volar', 'Espacio: Propulsor'],
    startMission: 'Comenzar Misión',
    continueMission: 'Continuar Misión',
    pausedFromLogbook: 'Bitácora Abierta · Juego en Pausa',
    pausedManual: 'Nave Detenida · Pausa Activa',
    pausedTitle: 'Misión en Pausa',
    pausedLogbookDesc:
      'El vuelo, los meteoritos y el consumo de gasolina se pausaron automáticamente mientras revisas la bitácora.',
    pausedManualDesc:
      'Los motores, los asteroides y el consumo de gasolina están detenidos hasta que reanudes la misión.',
    resetMission: 'Reiniciar Misión',
    hullKicker: 'Impacto de Asteroide · Casco Crítico',
    hullTitle: 'Nave Averiada',
    hullDesc:
      'Los asteroides de alta velocidad superaron la integridad del casco. Tus datos rescatados en la bitácora siguen a salvo.',
    repairAndRelaunch: 'Reparar y Relanzar',
    fuelKicker: 'Tanque Vacío · Misión Perdida',
    fuelTitle: 'Te quedaste sin gasolina',
    fuelDesc:
      'Perdiste la partida porque tu nave consumió toda la gasolina y quedó varada en el espacio antes de recoger los bidones verdes a tiempo. Todo tu progreso ha regresado a cero.',
    retryFromZero: 'Volver a intentar',
    allKicker: 'Explore our past · Misión Completada',
    allTitle: '¡Felicidades! Has terminado de explorar el pasado',
    allDesc: (moonTotal: number, marsTotal: number) =>
      `Has recolectado toda la información de La Luna (${moonTotal}/${moonTotal}) y de Marte (${marsTotal}/${marsTotal}). Todas las bitácoras y grabaciones espaciales están completas.`,
    finalScore: 'Puntuación Final',
    keepExploring: 'Seguir Explorando',
    newMission: 'Nueva Misión',
    returnToEarth: 'Regresar a la Tierra',
    // Step-by-step non-intrusive mission guide
    guideBadge: 'Guía paso a paso',
    guideShowBtn: 'Guía',
    guideHideBtn: 'Ocultar',
    guideStepLabel: (step: number, total: number) => `Paso ${step}/${total}`,
    guidePrevAria: 'Paso anterior',
    guideNextAria: 'Siguiente paso',
    guideSteps: {
      collectTarget: (planet: string, targetName: string, rescued: number, total: number) => ({
        title: `Consigue el objetivo (${rescued}/${total})`,
        body: `En ${planet}, usa WASD, Flechas o clic sostenido para acercarte a «${targetName}» y quédate cerca hasta completar la descarga.`,
      }),
      collectFuel: {
        title: 'Consigue gasolina para no quedar varado',
        body: 'Recoge los bidones verdes en el mapa. Si tu gasolina llega a 0%, pierdes la partida y todo se reinicia a cero.',
      },
      dodgeMeteors: {
        title: 'Esquiva los meteoros',
        body: 'Mantén la nave a salvo evitando los meteoritos rápidos. Usa Espacio para impulso y rescata sondas para reparar +25% del casco.',
      },
      launchNext: (fromPlanet: string, toPlanet: string) => ({
        title: `Despega hacia ${toPlanet}`,
        body: `¡Ya rescataste todo en ${fromPlanet}! Pulsa el botón «Despegar hacia ${toPlanet}» para continuar tu viaje.`,
      }),
      finishAll: {
        title: '¡Último paso en Marte!',
        body: 'Termina de recolectar todas las sondas de Marte para completar Explore our past y volver a la Tierra.',
      },
    },
    // Earth return animation
    earthReturnOrigin: 'Marte',
    earthReturnDest: 'Planeta Tierra',
    earthReturnStages: [
      'Encendiendo cohetes de regreso desde Marte...',
      'Viajando de vuelta a casa por el espacio...',
      '¡Entrando en órbita de la Tierra!',
    ],
    tabRadar: 'Radar',
    tabLogbook: 'Bitácora',
    interplanetaryPropulsion: 'Propulsión Interplanetaria',
    unlocked: 'Desbloqueado',
    locked: 'Bloqueado',
    launchUnlockedDesc: (planet: string, target: string) =>
      `Todos los objetos de ${planet} fueron rescatados. Puedes despegar hacia ${target}.`,
    launchLockedDesc: (planet: string, target: string, total: number) =>
      `Rescata los ${total} objetos de ${planet} para habilitar el despegue hacia ${target}.`,
    // RadarPanel
    radarTitle: 'Radar de Rescate',
    radarRescued: (n: number, total: number) => `${n}/${total} rescatados`,
    currentPos: 'Posición actual',
    activeTarget: (idx: number, total: number) => `Objetivo activo (${idx}/${total})`,
    bearing: 'Rumbo',
    sweepComplete: 'Barrido completado',
    sweepCompleteDesc: (planet: string) => `Todas las señales de ${planet} han sido recuperadas.`,
    unconfirmedSignal: 'Señal por confirmar',
    appearsNextDesc: 'Aparecerá al recoger el objeto actual',
    rescuedBadge: 'Rescatado',
    standbyBadge: 'En espera',
    // ProbeMinimap
    minimapTitle: 'Radar de Sondas',
    minimapTarget: (dist: number) => `Objetivo actual: ${dist} m`,
    minimapAllScanned: (total: number) => `${total}/${total} sondas escaneadas`,
    minimapScanning: 'Escaneando sector...',
    // LogbookPanel
    logbookTitle: 'Bitácora de Misión',
    unlockedCount: (n: number, total: number) => `${n}/${total} desbloqueados`,
    tapToOpenImage: 'Desbloqueado · Toca para abrir imagen',
    tapToViewLog: 'Desbloqueado · Toca para ver registro',
    lockedCollect: 'Bloqueado · Recógelo para desbloquear',
    viewImage: 'Ver imagen',
    open: 'Abierto',
    pendingImage: 'Imagen de bitácora pendiente por agregar.',
    // StoryPopupModal
    exitStory: 'Salir',
    chooseArchiveMode: 'Elige cómo explorar este archivo',
    readLogbookOption: 'Leer Bitácora',
    readLogbookDesc: 'Hoja ilustrada con la historia y fotografía del objeto',
    listenRecordingOption: 'Escuchar Grabación',
    listenRecordingDesc: 'Grabadora interactiva con la narración en audio',
    backToOptions: 'Opciones',
    viewLogbookBtn: 'Ver bitácora',
    listenRecording: 'Escuchar grabación',
    backToLogbook: 'Volver a la bitácora',
    recorderPlay: 'Reproducir',
    recorderPause: 'Pausar',
    recorderRewind: 'Retroceder',
    recorderPlayingStatus: 'Reproduciendo grabación',
    recorderPausedStatus: 'Grabación en pausa',
    recorderLoadingStatus: 'Sintetizando grabación de voz...',
    recorderReadyStatus: 'Listo para reproducir',
    recorderFinishedStatus: 'Grabación finalizada',
    // Canvas
    canvasSaved: 'DATOS EN BITÁCORA',
    canvasTransmitting: (pct: number) => `TRANSMITIENDO ${pct}%`,
    cardinals: ['E', 'SE', 'S', 'SO', 'O', 'NO', 'N', 'NE'],
    canvasCardinals: { n: 'N', s: 'S', w: 'O', e: 'E' },
    stageIgnition: 'Ignición de Propulsores',
    stageTakeoff: (from: string) => `Despegando de ${from}`,
    stageTransit: (to: string) => `Tránsito propulsado hacia ${to}`,
    stageDescent: (to: string) => `Descenso orbital en ${to}`,
    stageLanding: (sector: string) => `Aterrizaje en ${sector}`,
  },
  en: {
    brandTitle: 'Explore our past',
    titleTagline: 'Space Sketchbook · The Moon & Mars',
    titleSubtitle:
      'Pilot your spacecraft across crayon-drawn stars and craters to rescue the illustrated logbooks and voice recordings of historic space missions.',
    titleStartBtn: 'Start',
    titleLaunchingBtn: 'Launching...',
    backToMenu: 'Back to menu',
    backToTitleMenu: 'Main menu',
    scoreLabel: 'Score',
    rescuedLabel: 'Rescued',
    logbookLabel: 'Logbook',
    pause: 'Pause',
    resume: 'Resume',
    pauseAria: 'Pause mission',
    resumeAria: 'Resume mission',
    audio: 'Audio',
    muted: 'Muted',
    muteAria: 'Mute audio',
    unmuteAria: 'Unmute audio',
    reset: 'Reset',
    langSwitchLabel: 'EN',
    langSwitchTitle: 'Switch language to Spanish',
    gravity: 'Gravity',
    temp: 'Temp',
    outOfGasBanner: 'Out of gas! Engines off',
    lowGasBanner: (pct: number) => `Low gas (${pct}%)! Collect green fuel tanks`,
    dataReceivedSuffix: 'Data received',
    viewInLogbook: 'View in Logbook',
    controlsHint: 'WASD or Arrows to fly · Space for boost · Collect green gas tanks',
    missionCompleted: (planet: string, total: number) =>
      `${planet} mission complete (${total}/${total} objects)`,
    thrustersReady: (target: string) => `Thrusters ready for launch toward ${target}.`,
    launchTo: (target: string) => `Launch to ${target}`,
    switchToPrefix: 'Switch to',
    switchPlanetAria: (target: string) => `Switch to ${target}`,
    switchMarsLockedAria: (rescued: number, total: number) =>
      `Mars locked · Complete all ${total} Moon objectives (${rescued}/${total})`,
    origin: 'Origin',
    destination: 'Destination',
    menuKicker: 'Exploration & Data Rescue',
    menuDesc:
      'Pilot your spacecraft across the planetary surface, watch your gas gauge by collecting green fuel tanks on the map, and locate all scientific targets in order to transmit their data to your logbook.',
    chooseStart: 'Choose your destination',
    objectsCountLabel: (n: number) => `${n} objects`,
    marsLockedBadge: 'Locked',
    marsUnlockedBadge: 'Unlocked',
    marsLockedMenuDesc: (moonTotal: number) =>
      `Complete all ${moonTotal} Moon objectives to unlock`,
    marsUnlockedKicker: (moonTotal: number) =>
      `${moonTotal}/${moonTotal} Moon Objectives Complete`,
    marsUnlockedTitle: 'Mars Unlocked!',
    marsUnlockedDesc:
      'You recovered all scientific data from The Moon. Your spacecraft is now cleared for interplanetary launch to Mars.',
    stayOnMoon: 'Stay on Moon',
    menuControls: ['Controls: WASD / Arrows', 'Hold click to steer', 'Space: Booster'],
    startMission: 'Start Mission',
    continueMission: 'Continue Mission',
    pausedFromLogbook: 'Logbook Open · Game Paused',
    pausedManual: 'Ship Halted · Pause Active',
    pausedTitle: 'Mission Paused',
    pausedLogbookDesc:
      'Flight, incoming meteors, and fuel burn paused automatically while you review the logbook.',
    pausedManualDesc:
      'Engines, asteroids, and fuel consumption are paused until you resume the mission.',
    resetMission: 'Reset Mission',
    hullKicker: 'Asteroid Impact · Critical Hull',
    hullTitle: 'Ship Damaged',
    hullDesc:
      'High-speed asteroids overwhelmed hull integrity. Your rescued data in the logbook remains safe.',
    repairAndRelaunch: 'Repair & Relaunch',
    fuelKicker: 'Empty Tank · Mission Lost',
    fuelTitle: 'Out of Gasoline',
    fuelDesc:
      'You lost the mission because your ship burned through all gasoline and got stranded in space before reaching the green fuel cans in time. All progress has been reset to zero.',
    retryFromZero: 'Try Again',
    allKicker: 'Explore our past · Mission Complete',
    allTitle: 'Congratulations! You finished exploring our past',
    allDesc: (moonTotal: number, marsTotal: number) =>
      `You collected all scientific records from The Moon (${moonTotal}/${moonTotal}) and Mars (${marsTotal}/${marsTotal}). Every logbook page and voice recording is complete.`,
    finalScore: 'Final Score',
    keepExploring: 'Keep Exploring',
    newMission: 'New Mission',
    returnToEarth: 'Return to Earth',
    // Step-by-step non-intrusive mission guide
    guideBadge: 'Step-by-step guide',
    guideShowBtn: 'Guide',
    guideHideBtn: 'Hide',
    guideStepLabel: (step: number, total: number) => `Step ${step}/${total}`,
    guidePrevAria: 'Previous step',
    guideNextAria: 'Next step',
    guideSteps: {
      collectTarget: (planet: string, targetName: string, rescued: number, total: number) => ({
        title: `Collect the target (${rescued}/${total})`,
        body: `On ${planet}, fly with WASD, Arrows, or hold click toward "${targetName}" and stay close until the download finishes.`,
      }),
      collectFuel: {
        title: 'Collect gas so you don’t get stranded',
        body: 'Pick up the green gas cans across the map. If your fuel hits 0%, you lose the run and everything resets to zero.',
      },
      dodgeMeteors: {
        title: 'Dodge incoming meteors',
        body: 'Keep your ship safe from fast asteroids. Press Space for quick boost; each rescued probe repairs +25% hull.',
      },
      launchNext: (fromPlanet: string, toPlanet: string) => ({
        title: `Launch toward ${toPlanet}`,
        body: `You rescued everything on ${fromPlanet}! Press "Launch to ${toPlanet}" to continue your journey.`,
      }),
      finishAll: {
        title: 'Final stretch on Mars!',
        body: 'Finish collecting all Mars probes to complete Explore our past and fly back home to Earth.',
      },
    },
    // Earth return animation
    earthReturnOrigin: 'Mars',
    earthReturnDest: 'Planet Earth',
    earthReturnStages: [
      'Firing return thrusters from Mars...',
      'Cruising back home through deep space...',
      'Entering Earth orbit! Welcome home',
    ],
    tabRadar: 'Radar',
    tabLogbook: 'Logbook',
    interplanetaryPropulsion: 'Interplanetary Propulsion',
    unlocked: 'Unlocked',
    locked: 'Locked',
    launchUnlockedDesc: (planet: string, target: string) =>
      `All targets on ${planet} have been rescued. You are cleared to launch toward ${target}.`,
    launchLockedDesc: (planet: string, target: string, total: number) =>
      `Rescue all ${total} targets on ${planet} to unlock launch toward ${target}.`,
    // RadarPanel
    radarTitle: 'Rescue Radar',
    radarRescued: (n: number, total: number) => `${n}/${total} rescued`,
    currentPos: 'Current position',
    activeTarget: (idx: number, total: number) => `Active target (${idx}/${total})`,
    bearing: 'Bearing',
    sweepComplete: 'Sweep complete',
    sweepCompleteDesc: (planet: string) => `All signals from ${planet} have been recovered.`,
    unconfirmedSignal: 'Unconfirmed signal',
    appearsNextDesc: 'Appears after rescuing current target',
    rescuedBadge: 'Rescued',
    standbyBadge: 'Standby',
    // ProbeMinimap
    minimapTitle: 'Probe Radar',
    minimapTarget: (dist: number) => `Active target: ${dist} m`,
    minimapAllScanned: (total: number) => `${total}/${total} probes scanned`,
    minimapScanning: 'Scanning sector...',
    // LogbookPanel
    logbookTitle: 'Mission Logbook',
    unlockedCount: (n: number, total: number) => `${n}/${total} unlocked`,
    tapToOpenImage: 'Unlocked · Tap to open image',
    tapToViewLog: 'Unlocked · Tap to view log',
    lockedCollect: 'Locked · Collect to unlock',
    viewImage: 'View image',
    open: 'Open',
    pendingImage: 'Logbook image pending.',
    // StoryPopupModal
    exitStory: 'Exit',
    chooseArchiveMode: 'Choose how to explore this archive',
    readLogbookOption: 'Read Logbook',
    readLogbookDesc: 'Illustrated notebook page with object story and photo',
    listenRecordingOption: 'Listen to Recording',
    listenRecordingDesc: 'Interactive tape recorder with narrated audio',
    backToOptions: 'Options',
    viewLogbookBtn: 'View logbook',
    listenRecording: 'Listen to recording',
    backToLogbook: 'Back to logbook',
    recorderPlay: 'Play',
    recorderPause: 'Pause',
    recorderRewind: 'Rewind',
    recorderPlayingStatus: 'Playing recording',
    recorderPausedStatus: 'Recording paused',
    recorderLoadingStatus: 'Preparing voice recording...',
    recorderReadyStatus: 'Ready to play',
    recorderFinishedStatus: 'Recording complete',
    // Canvas
    canvasSaved: 'SAVED IN LOGBOOK',
    canvasTransmitting: (pct: number) => `TRANSMITTING ${pct}%`,
    cardinals: ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'],
    canvasCardinals: { n: 'N', s: 'S', w: 'W', e: 'E' },
    stageIgnition: 'Thruster Ignition',
    stageTakeoff: (from: string) => `Taking off from ${from}`,
    stageTransit: (to: string) => `Powered transit to ${to}`,
    stageDescent: (to: string) => `Orbital descent at ${to}`,
    stageLanding: (sector: string) => `Landing at ${sector}`,
  },
} as const;
