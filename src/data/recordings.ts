import { Language } from '../types/game';

export interface RecordingScript {
  title: Record<Language, string>;
  sentences: Record<Language, string[]>;
}

export const RECORDINGS_BY_OBJECT_ID: Record<string, RecordingScript> = {
  'moon-obj-1': {
    title: {
      es: 'Apolo 11 · Módulo "Eagle"',
      en: 'Apollo 11 · "Eagle" Module',
    },
    sentences: {
      es: [
        'Hace mucho tiempo, una pequeña nave con forma de insecto plateado llamada Eagle flotaba en el silencio del espacio.',
        'Dos astronautas, Neil y Buzz, viajaban dentro, mientras su amigo Michael esperaba orbitando en la nave grande.',
        'Neil y Buzz se despidieron y comenzaron a descender hacia la Luna, rumbo al Mar de la Tranquilidad.',
        'Con mucho cuidado, Eagle se posó sobre el suelo gris y Neil habló por radio: Houston, aquí Base Tranquilidad, el Eagle ha alunizado.',
        'Luego Neil abrió la compuerta, bajó por la escalera y dio el primer paso: un pequeño paso para un hombre, un gran salto para la humanidad.',
        'Buzz salió después y llamó a aquel hermoso paisaje solitario una magnífica desolación.',
        'Los dos exploradores plantaron una bandera, recogieron rocas y polvo lunar, y dejaron instrumentos científicos para medir lunamotos y reflejar luz desde la Tierra.',
        'Al terminar el día lunar, Eagle encendió su motor, se reunió con Michael y regresaron a casa, dejando su recuerdo eterno en la Luna.',
      ],
      en: [
        'A long time ago, a little spacecraft shaped like a silver insect, called Eagle, floated in the silence of space.',
        'Two astronauts, Neil and Buzz, traveled inside while their friend Michael waited in orbit aboard the big ship.',
        'Neil and Buzz said goodbye and began to descend toward the Moon, down to the Sea of Tranquility.',
        'Very carefully, Eagle settled onto the ground, and Neil spoke over the radio: Houston, Tranquility Base here. The Eagle has landed.',
        'Then Neil opened the hatch, climbed down the ladder, and took the first step—a small step, yet a giant leap for humanity.',
        'Buzz came out afterward and called that lonely, beautiful landscape magnificent desolation.',
        'The two explorers planted a flag, collected rocks and dust, and left behind seismic sensors and a special mirror for Earth.',
        'When the lunar day ended, Eagle fired its engine, rejoined Michael in orbit, and headed home.',
      ],
    },
  },
  'moon-obj-2': {
    title: {
      es: 'Apolo 15 · Lunar Roving Vehicle',
      en: 'Apollo 15 · Lunar Roving Vehicle',
    },
    sentences: {
      es: [
        'En 1971, una nave llamada Falcon se acercó a la Luna con David y James a bordo, mientras su amigo Alfred vigilaba desde la órbita.',
        'Falcon alunizó suavemente en una llanura gris al pie de enormes montañas y junto a un largo cañón que parecía una cicatriz en el suelo.',
        'Al día siguiente salieron a explorar, pero no a pie: llevaban el primer vehículo lunar de la historia.',
        'Se subieron al rover, lo encendieron y, saltando entre nubes de polvo, recorrieron colinas y los bordes del cañón recogiendo rocas antiquísimas.',
        'También instalaron una estación de escucha científica para medir el calor del suelo y el viento del Sol durante años.',
        'Antes de despedirse, David dejó caer un martillo y una pluma al mismo tiempo ante las cámaras, y ambos cayeron juntos como gemelos.',
        'Con su cofre lleno de rocas, despegaron para reunirse con Alfred y volver a la Tierra.',
      ],
      en: [
        'In 1971, a spacecraft called Falcon approached the Moon with David and James inside, while their friend Alfred waited in lunar orbit.',
        'Falcon landed gently on a gray plain at the foot of enormous mountains beside a long canyon like a scar on the ground.',
        'The next day they went out to explore, not on foot, but aboard the very first lunar rover.',
        'Bouncing along in clouds of dust, they traveled across hills and canyon edges collecting ancient rocks.',
        'They also set up a listening station to tell Earth what the ground, the heat, and the solar wind felt like for years.',
        'Before saying goodbye, David dropped a hammer and a feather at the same time, and they fell together like twins.',
        'With a chest full of rocks, they lifted off, rejoined Alfred, and headed home.',
      ],
    },
  },
  'moon-obj-3': {
    title: {
      es: 'Apolo 12 · Módulo Lunar y ALSEP',
      en: 'Apollo 12 · Lunar Module & ALSEP',
    },
    sentences: {
      es: [
        'En noviembre de 1969, dos astronautas, Pete y Alan, viajaron a la Luna en una pequeña nave llamada Intrepid.',
        'Su misión tenía un reto especial: alunizar muy cerca de Surveyor, un viejo robot explorador que llevaba dos años solo en la Luna.',
        'Y lo lograron: Intrepid se posó suavemente en el polvo gris a tan solo unos pasos de su viejo amigo robótico.',
        'Pete y Alan salieron a caminar dando saltos ligeros y armaron una estación de instrumentos ALSEP para escuchar los secretos de la Luna.',
        'En su segunda caminata visitaron al viejo Surveyor y recuperaron algunas piezas como recuerdo para analizarlas en la Tierra.',
        'Al regresar, se reunieron con Richard en órbita y dejaron caer a Intrepid de vuelta sobre la Luna; cuando chocó, la Luna resonó como una campana gigante.',
      ],
      en: [
        'In November 1969, two astronauts, Pete and Alan, traveled to the Moon in a tiny spacecraft called Intrepid.',
        'Their mission had a special challenge: to land very close to Surveyor, an old robot explorer sitting alone on the Moon for two years.',
        'Intrepid settled gently into the gray dust just a few steps away from its old robot friend.',
        'Pete and Alan went out for a walk, hopping effortlessly as they assembled a station of instruments to listen to the Moon’s secrets.',
        'On their second walk they visited old Surveyor and removed a few pieces to bring back to Earth.',
        'When it was time to return, they rejoined Richard in orbit and sent Intrepid back down; when it struck the surface, the Moon rang like a giant bell.',
      ],
    },
  },
  'moon-obj-4': {
    title: {
      es: 'Surveyor 3 · Aterrizador Robótico',
      en: 'Surveyor 3 · Robotic Lander',
    },
    sentences: {
      es: [
        'En un laboratorio lleno de científicos nació un pequeño robot explorador llamado Surveyor, equipado con una cámara giratoria y una pala metálica.',
        'Su cohete lo lanzó hacia la Luna, pero al acercarse, el brillo de las rocas confundió sus sensores y rebotó tres veces antes de posarse suavemente.',
        'Poco después abrió su ojo mecánico y envió más de seis mil fotografías a la Tierra, dejando asombrados a los científicos.',
        'Siguiendo órdenes desde la Tierra, extendió su brazo y cavó cuatro zanjas en el polvo lunar como un niño jugando en la arena.',
        'Gracias a Surveyor se comprobó que el suelo de la Luna era firme como arena húmeda y capaz de sostener una nave tripulada.',
        'Más de tres años después, dos astronautas visitaron al pequeño robot dormido y trajeron su cámara y su pala de regreso a casa.',
      ],
      en: [
        'In a laboratory full of scientists, a little robot explorer named Surveyor was born with a swiveling camera and a metal scoop.',
        'When it approached the Moon, bright rocks confused its eyes; it bounced off the ground twice and landed softly on the third try.',
        'Soon after, it opened its eye and beamed back over six thousand photographs to Earth.',
        'Stretching out its arm, Surveyor dug four trenches in the lunar dust like a child at the beach.',
        'Scientists discovered the Moon’s soil was firm enough for a crewed spaceship to land without sinking.',
        'Over three years later, two astronauts found the sleeping robot and brought its scoop and camera back to Earth.',
      ],
    },
  },
  'mars-obj-1': {
    title: {
      es: 'Sojourner Rover · Mars Pathfinder',
      en: 'Sojourner Rover · Mars Pathfinder',
    },
    sentences: {
      es: [
        'Había una vez una pequeña nave llamada Mars Pathfinder, que tenía una misión muy especial: viajar hasta Marte y descubrir sus secretos.',
        'Después de un largo viaje, llegó al planeta rojo el 4 de julio de 1997, abrió una pequeña rampa y dejó salir a su compañero Sojourner.',
        'Sojourner era pequeño, pero muy valiente: comenzó a recorrer el suelo marciano observando piedras y tomando fotografías.',
        'Su aventura ocurrió en Ares Vallis, un valle lleno de rocas que, hace muchísimo tiempo, pudo haber tenido grandes cantidades de agua.',
        'Mientras exploraba, Sojourner enviaba miles de imágenes e información a la Tierra con pistas de un Marte muy distinto en el pasado.',
        'La pequeña misión enseñó algo enorme: ¡Marte guardaba muchos misterios, y Sojourner fue el primero de muchos exploradores!',
      ],
      en: [
        'Once upon a time, a small spacecraft named Mars Pathfinder set out on a special mission to travel to Mars and uncover its secrets.',
        'After a long journey, it reached the Red Planet on July 4, 1997, unfolded a small ramp, and rolled out its companion rover, Sojourner.',
        'Sojourner was tiny but brave, roaming across the Martian soil, studying rocks, and snapping photographs.',
        'Its adventure took place in Ares Vallis, a rocky valley that long ago may have held vast amounts of flowing water.',
        'As it explored, Sojourner beamed thousands of images back to Earth, revealing clues about a wetter, warmer past.',
        'This small mission proved Mars still held many mysteries—and Sojourner was the first of many rovers to follow.',
      ],
    },
  },
  'mars-obj-2': {
    title: {
      es: 'Spirit y Opportunity · Rovers Gemelos',
      en: 'Spirit & Opportunity · Twin Rovers',
    },
    sentences: {
      es: [
        'Había una vez dos robots gemelos llamados Spirit y Opportunity que viajaron a Marte para descubrir si alguna vez existió agua en aquel planeta.',
        'Spirit llegó el 3 de enero de 2004, y Opportunity el 24 de enero del mismo año, aterrizando en lados opuestos del planeta.',
        'Con sus seis ruedas, cámaras y herramientas especiales investigaron el suelo y descubrieron algo sorprendente: ¡Marte había tenido agua hace muchísimo tiempo!',
        'Opportunity encontró rocas que estuvieron cerca de un antiguo lago de agua salada.',
        'Spirit recorrió grandes distancias hasta quedar atrapado en la arena y dejar de enviar señales en 2010.',
        'Mientras tanto, Opportunity exploró durante años y viajó unos 45 kilómetros hasta que una gran tormenta de polvo cubrió Marte en 2018.',
        'Sus descubrimientos ayudaron a imaginar cómo pudo haber sido Marte hace millones de años.',
      ],
      en: [
        'Once upon a time, twin robots named Spirit and Opportunity traveled to Mars to discover whether water had ever existed there.',
        'Spirit arrived on January 3, 2004, and Opportunity landed on January 24 on opposite sides of the planet.',
        'Equipped with six wheels, cameras, and scientific tools, they discovered remarkable evidence that Mars once had liquid water long ago.',
        'Opportunity uncovered rocks that had formed near an ancient salty lake.',
        'Spirit traveled great distances until it became trapped in soft sand and stopped sending signals in 2010.',
        'Meanwhile, Opportunity kept exploring for years, traveling roughly 45 kilometers until a massive dust storm ended its mission in 2018.',
        'Together, the twin explorers transformed our understanding of ancient Mars.',
      ],
    },
  },
  'mars-obj-3': {
    title: {
      es: 'Viking 1 · Primer Aterrizaje en Marte',
      en: 'Viking 1 · First Mars Landing',
    },
    sentences: {
      es: [
        'Hace muchos años, cuando viajar a Marte parecía un sueño, la NASA envió la nave Viking 1 para descubrir los secretos del Planeta Rojo.',
        'El 20 de agosto de 1975 comenzó su viaje desde la Tierra y, tras orbitar Marte buscando un lugar seguro, descendió con éxito.',
        'El 20 de julio de 1976, por primera vez en la historia, la NASA logró aterrizar suavemente y enviar fotografías desde la superficie marciana.',
        'Viking 1 tenía cámaras, herramientas y un pequeño brazo robótico que recogió suelo para analizarlo en busca de señales de vida.',
        'Aunque no halló pruebas claras de vida, reveló detalles fascinantes sobre el clima y la composición del suelo marciano hasta 1982.',
        'Viking 1 demostró que lo que parecía imposible podía hacerse realidad y abrió el camino para futuros exploradores.',
      ],
      en: [
        'Many years ago, when trips to Mars still seemed like a dream, NASA sent Viking 1 to uncover the secrets of the Red Planet.',
        'Launched on August 20, 1975, it orbited Mars taking photos to locate a safe landing site.',
        'On July 20, 1976, part of the spacecraft gently touched down, sending back the very first successful photographs from the Martian surface.',
        'Viking 1 used its robotic arm to scoop soil into an onboard laboratory to search for any signs of life.',
        'Continuing to work until 1982, it uncovered fascinating details about Martian soil, weather, and geology.',
        'Viking 1 proved that landing on Mars was possible and paved the way for every explorer after it.',
      ],
    },
  },
  'mars-obj-4': {
    title: {
      es: 'InSight Lander · El Interior de Marte',
      en: 'InSight Lander · Deep Inside Mars',
    },
    sentences: {
      es: [
        'Había una vez un robot llamado InSight con una misión distinta: no quería rodar por Marte, sino descubrir qué había oculto en su interior.',
        'Despegó el 5 de mayo de 2018 y aterrizó el 26 de noviembre en una llanura llamada Elysium Planitia.',
        'Sobre el suelo marciano colocó un sismómetro, como un oído muy especial capaz de escuchar los movimientos del planeta y detectar martemotos.',
        'También llevó un instrumento para estudiar el calor del subsuelo y sus sensores captaron el misterioso zumbido del viento marciano.',
        'Tras varios años de trabajo hasta diciembre de 2022, InSight dejó pistas valiosas sobre el corazón oculto bajo las arenas rojas de Marte.',
      ],
      en: [
        'Once upon a time, a robot named InSight had a different mission: not to roam Mars, but to discover what was hidden deep inside it.',
        'Launched on May 5, 2018, it landed on November 26, 2018, on a broad plain called Elysium Planitia.',
        'InSight placed a special ear on the Martian soil capable of listening to planet-wide tremors and detecting marsquakes.',
        'It also measured subsurface heat and captured the eerie, mysterious hum of the Martian wind.',
        'Working until December 15, 2022, InSight gave scientists a window into the deep interior beneath the reddish sands.',
      ],
    },
  },
  'mars-obj-5': {
    title: {
      es: 'Dawn · Exploradora de Vesta y Ceres',
      en: 'Dawn · Explorer of Vesta & Ceres',
    },
    sentences: {
      es: [
        'La nave espacial Dawn tuvo un sueño muy especial: explorar dos mundos misteriosos situados entre Marte y Júpiter.',
        'Despegó el 27 de septiembre de 2007 y su primera parada fue Vesta, un enorme asteroide rocoso donde tomó fotografías para entender su formación.',
        'Después viajó hasta Ceres, un planeta enano que, a diferencia de Vesta, guarda hielo y materiales relacionados con el agua.',
        'Gracias a sus motores de iones, Dawn pudo visitar ambos mundos y descubrir lo distintos que eran pese a estar relativamente cerca.',
        'Su misión concluyó en octubre de 2018 al agotarse su combustible, pero sigue orbitando Ceres como testigo silencioso del origen del Sistema Solar.',
      ],
      en: [
        'Once upon a time, a spacecraft named Dawn had a special dream: to explore two mysterious worlds between Mars and Jupiter.',
        'Lifting off on September 27, 2007, its first stop was Vesta, a massive rocky asteroid where it photographed ancient craters.',
        'Next, it traveled on to Ceres, a dwarf planet rich in ice and water-bearing minerals.',
        'Using specialized ion engines, Dawn orbited both worlds and revealed how different they were despite being neighbors.',
        'Its mission ended on October 31, 2018, when it ran out of fuel, yet Dawn remains in silent orbit around Ceres.',
      ],
    },
  },
  'mars-obj-6': {
    title: {
      es: 'NEAR Shoemaker · Encuentro con Eros',
      en: 'NEAR Shoemaker · Encounter with Eros',
    },
    sentences: {
      es: [
        'La nave NEAR Shoemaker emprendió en febrero de 1996 una misión extraordinaria: viajar hasta el asteroide Eros para revelar sus secretos.',
        'En el camino visitó el asteroide Mathilde, captando imágenes de sus gigantescos cráteres.',
        'El 14 de febrero del año 2000 hizo historia al convertirse en la primera nave humana en orbitar un asteroide.',
        'Tras estudiar las rocas de Eros durante meses, dio una última sorpresa el 12 de febrero de 2001: descendió suavemente y aterrizó sobre su superficie.',
        'Aunque no estaba diseñada para aterrizar, siguió enviando datos durante dos semanas hasta que el frío extremo del espacio silenció sus comunicaciones.',
      ],
      en: [
        'On February 17, 1996, the NEAR Shoemaker spacecraft began a daring mission to travel to the asteroid Eros.',
        'Along the way it flew past the cratered asteroid Mathilde before continuing onward to Eros.',
        'On February 14, 2000, it made history as the first human-built spacecraft ever to orbit an asteroid.',
        'Then on February 12, 2001, it pulled off one last surprise: descending slowly to touch down intact on the asteroid’s surface.',
        'Even though it wasn’t built to land, it continued beaming data for two weeks before the deep cold of space silenced its radio.',
      ],
    },
  },
  'mars-obj-7': {
    title: {
      es: 'Pioneer 10 · Viajera Interestelar',
      en: 'Pioneer 10 · Star Traveler',
    },
    sentences: {
      es: [
        'El 2 de marzo de 1972, Pioneer 10 inició su aventura desde la Tierra, atravesando el cinturón de asteroides hasta llegar a Júpiter en 1973.',
        'Al acercarse al gigante gaseoso tomó alrededor de 500 fotografías de sus nubes, tormentas y la enorme Gran Mancha Roja.',
        'Pero no se detuvo allí: continuó su camino hacia los confines del espacio y cruzó más allá de la órbita de Neptuno.',
        'La nave llevaba consigo una pequeña placa metálica con el dibujo de un hombre, una mujer y nuestro Sistema Solar como carta de presentación de la humanidad.',
        'Aunque fue planeada para durar 21 meses, trabajó más de 30 años hasta su última señal en 2003, viajando hoy en silencio hacia las estrellas.',
      ],
      en: [
        'On March 2, 1972, Pioneer 10 began its journey from Earth, crossing the asteroid belt to reach Jupiter in December 1973.',
        'As it swept past the gas giant, it captured around 500 photographs of swirling clouds, storms, and the Great Red Spot.',
        'Pioneer 10 kept going into the outer reaches of space, becoming the first spacecraft to pass beyond the orbit of Neptune.',
        'It carried a special golden plaque depicting a man, a woman, and our Solar System as humanity’s greeting to the cosmos.',
        'Planned for just 21 months, it operated for over 30 years until 2003, and still glides silently toward the stars.',
      ],
    },
  },
  'mars-obj-8': {
    title: {
      es: 'Ingenuity · Helicóptero en Marte',
      en: 'Ingenuity · Mars Helicopter',
    },
    sentences: {
      es: [
        'El pequeño helicóptero Ingenuity tenía un sueño que parecía imposible: ¡volar por primera vez en otro planeta!',
        'Viajó a Marte en 2021 sujeto bajo el rover Perseverance y llegó al Cráter Jezero.',
        'El 19 de abril de 2021 hizo girar sus hélices y se elevó sobre el suelo marciano, logrando el primer vuelo propulsado en otro mundo.',
        'Al principio se esperaba que realizara solo cinco vuelos, pero sorprendió al mundo completando 72 vuelos durante casi tres años.',
        'Exploró caminos desde el cielo ayudando a Perseverance hasta su último vuelo en enero de 2024, demostrando que también podemos conquistar los cielos de otros planetas.',
      ],
      en: [
        'A small helicopter named Ingenuity held a dream that seemed impossible: to fly for the first time on another planet.',
        'In 2021 it traveled to Jezero Crater tucked underneath the Perseverance rover.',
        'On April 19, 2021, Ingenuity spun up its blades and lifted off above the Martian dust—the first powered flight on another world.',
        'Designed for just five test flights, Ingenuity amazed everyone by completing 72 flights over nearly three years.',
        'Until its final flight in January 2024, it scouted routes from the sky and proved humans can explore other worlds from the air.',
      ],
    },
  },
  'mars-obj-9': {
    title: {
      es: 'Telescopio Espacial Kepler / K2',
      en: 'Kepler / K2 Space Telescope',
    },
    sentences: {
      es: [
        'El telescopio espacial Kepler tuvo una misión fascinante: observar miles de estrellas buscando planetas lejanos más allá de nuestro Sistema Solar.',
        'Lanzado el 6 de marzo de 2009, usó un truco muy ingenioso: medir el pequeñísimo parpadeo en la luz de una estrella cuando un planeta pasaba frente a ella.',
        'Así descubrió miles de mundos desconocidos, algunos gigantes y otros de tamaño parecido al de la Tierra.',
        'En 2013 superó una falla técnica y recibió una segunda vida con la misión K2, estudiando más de quinientas mil estrellas.',
        'Terminó su aventura en octubre de 2018 al quedarse sin combustible, pero nos enseñó que la galaxia rebosa de planetas y posibles mundos con agua líquida.',
      ],
      en: [
        'The Kepler Space Telescope had a fascinating mission: to watch thousands of distant stars in search of planets beyond our Solar System.',
        'Launched on March 6, 2009, it used a clever trick—detecting the tiny dip in starlight whenever a planet crossed in front of its star.',
        'In this way it discovered thousands of new worlds, from gas giants to Earth-sized rocky planets.',
        'After a technical issue in 2013, engineers gave it a second life called K2, studying over 500 thousand stars.',
        'Kepler retired in October 2018, leaving behind proof that our galaxy is filled with diverse worlds—some possibly able to hold liquid water.',
      ],
    },
  },
};
