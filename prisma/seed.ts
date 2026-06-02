import { PrismaClient, ReportType, PetSpecies, PetStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando semilla de datos de Huellitas...');

  // 1. Limpieza de base de datos
  console.log('🗑️  Limpiando tablas previas...');
  await prisma.reportImage.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear Usuarios de prueba
  console.log('👤 Creando usuarios de demostración...');
  
  const userAdmin = await prisma.user.create({
    data: {
      email: 'contacto@huellitas.org',
      firstName: 'Sofía',
      lastName: 'García',
      phone: '+5215555555501',
    },
  });

  const userTest = await prisma.user.create({
    data: {
      email: 'test@example.com',
      firstName: 'Alejandro',
      lastName: 'Mendoza',
      phone: '+5215555555502',
    },
  });

  // 3. Crear Reportes (10 casos realistas)
  console.log('🐕🐈 Creando reportes de mascotas...');

  const reportsData = [
    // Caso 1: Perro perdido (Golden) - Activo
    {
      userId: userAdmin.id,
      type: ReportType.LOST,
      species: PetSpecies.DOG,
      name: 'Firulais',
      status: PetStatus.LOST_ACTIVE,
      hasCollar: true,
      hasSpots: false,
      hasChip: true,
      hasScars: false,
      color: 'Dorado / Canela claro',
      distinctiveText: 'Ojo izquierdo ligeramente nublado. Trae collar de cuero rojo con una plaquita metálica que dice su nombre y teléfono.',
      location: 'Coyoacán, Av. Francisco Sosa entre Melchor Ocampo',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
      description: 'Es sumamente amigable pero puede estar asustado y desorientado. Responde al silbido y al nombre de Firulais. Por favor, si lo ves no lo corretees, llámame.',
      contactPhone: '+5215555555501',
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 2: Gato perdido (Atigrado) - Activo
    {
      userId: userTest.id,
      type: ReportType.LOST,
      species: PetSpecies.CAT,
      name: 'Mimi',
      status: PetStatus.LOST_ACTIVE,
      hasCollar: false,
      hasSpots: true,
      hasChip: false,
      hasScars: true,
      color: 'Marrón atigrado / Gris',
      distinctiveText: 'Oreja izquierda cortada en la punta (señal de esterilización). Cicatriz fina sobre la ceja derecha.',
      location: 'Colonia Condesa, Parque España',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Hace 4 días
      description: 'Mimi es muy asustadiza con desconocidos. No se deja agarrar fácil. Suele esconderse debajo de carros estacionados o arbustos. Agradezco infinitamente cualquier pista.',
      contactPhone: '+5215555555502',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 3: Perro Encontrado (Pug) - En resguardo
    {
      userId: userAdmin.id,
      type: ReportType.FOUND,
      species: PetSpecies.DOG,
      name: 'Pug Encontrado',
      status: PetStatus.IN_SHELTER,
      hasCollar: true,
      hasSpots: false,
      hasChip: false,
      hasScars: false,
      color: 'Arena / Negro',
      distinctiveText: 'Trae puesto un collar azul con estrellas, sin placa de datos. Tiene un andar lento.',
      location: 'Polanco, cerca del Museo Soumaya',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
      description: 'Lo resguardé porque andaba a punto de ser atropellado. Está bien de salud, muy dócil y juguetón. Busco a sus dueños originales para regresarlo. Solicitaré fotos comprobatorias para entregarlo.',
      contactPhone: '+5215555555501',
      imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 4: Gato Encontrado (Siames) - Deambulando
    {
      userId: userTest.id,
      type: ReportType.FOUND,
      species: PetSpecies.CAT,
      name: 'Siamés avistado',
      status: PetStatus.WANDERING,
      hasCollar: false,
      hasSpots: false,
      hasChip: false,
      hasScars: false,
      color: 'Crema con puntas marrón oscuro',
      distinctiveText: 'Ojos celestes muy brillantes, cola un poco chueca en la punta.',
      location: 'Roma Norte, Calle Álvaro Obregón',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
      description: 'Visto deambulando por los techos de los comercios locales. Parece asustado y no logré capturarlo, pero se le ve limpio por lo que seguro tiene casa.',
      contactPhone: '+5215555555502',
      imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 5: Perro Perdido (Husky) - Activo
    {
      userId: userAdmin.id,
      type: ReportType.LOST,
      species: PetSpecies.DOG,
      name: 'Lobo',
      status: PetStatus.LOST_ACTIVE,
      hasCollar: true,
      hasSpots: true,
      hasChip: true,
      hasScars: false,
      color: 'Gris, Blanco y Negro',
      distinctiveText: 'Ojos de diferente color (Heterocromía): uno azul claro y uno marrón oscuro.',
      location: 'Tlalpan, bosque de Tlalpan entrada principal',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: 'Lobo se soltó de la correa persiguiendo una ardilla. Trae collar verde militar. Es hiperactivo y responde rápido si le ofreces premios.',
      contactPhone: '+5215555555501',
      imageUrl: 'https://images.unsplash.com/photo-1531804055935-76f44d7c3621?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 6: Gato Perdido (Persa Blanco) - Reunido
    {
      userId: userTest.id,
      type: ReportType.LOST,
      species: PetSpecies.CAT,
      name: 'Copo de Nieve',
      status: PetStatus.REUNITED,
      hasCollar: false,
      hasSpots: false,
      hasChip: false,
      hasScars: false,
      color: 'Blanco puro',
      distinctiveText: 'Pelo extremadamente largo, cara chata, muy silencioso.',
      location: 'Juárez, Calle Hamburgo',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      description: '¡Caso de éxito! Logramos ubicarlo en el sótano del edificio vecino gracias a que un repartidor vio la foto en este portal.',
      contactPhone: '+5215555555502',
      imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 7: Perro Perdido (Bulldog Francés) - Reunido
    {
      userId: userAdmin.id,
      type: ReportType.LOST,
      species: PetSpecies.DOG,
      name: 'Rocco',
      status: PetStatus.REUNITED,
      hasCollar: true,
      hasSpots: true,
      hasChip: true,
      hasScars: false,
      color: 'Negro con pecho blanco',
      distinctiveText: 'Tiene una mancha blanca muy marcada en el pecho en forma de corbata.',
      location: 'Del Valle, Parque Tlacoquemecatl',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      description: 'Rocco ya está de vuelta en casa durmiendo en su camita. Mil gracias a todos por compartir su póster impreso en las calles.',
      contactPhone: '+5215555555501',
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 8: Perro Encontrado (Chihuahua) - Resguardado
    {
      userId: userTest.id,
      type: ReportType.FOUND,
      species: PetSpecies.DOG,
      name: 'Chihuahua Resguardado',
      status: PetStatus.IN_SHELTER,
      hasCollar: false,
      hasSpots: false,
      hasChip: false,
      hasScars: false,
      color: 'Marrón claro / Fuego',
      distinctiveText: 'Orejas muy grandes, tiembla mucho (de frío/susto). Muy pequeño.',
      location: 'Santa Fe, Glorieta de los Carteros',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      description: 'Estaba temblando debajo de la lluvia. Lo abrigamos y alimentamos. Se encuentra a salvo en mi casa. Si eres el dueño por favor mándame mensaje directo.',
      contactPhone: '+5215555555502',
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 9: Gato Encontrado (Negro) - Resguardado
    {
      userId: userAdmin.id,
      type: ReportType.FOUND,
      species: PetSpecies.CAT,
      name: 'Gato negro cariñoso',
      status: PetStatus.IN_SHELTER,
      hasCollar: false,
      hasSpots: false,
      hasChip: false,
      hasScars: false,
      color: 'Negro azabache',
      distinctiveText: 'Completamente negro, ojos verdes redondos. Muy dócil y ronroneador.',
      location: 'San Ángel, Calle Altavista',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      description: 'Se metió a mi cochera buscando comida. Tiene marcas de haber usado collar recientemente, por lo que seguro tiene familia buscándolo.',
      contactPhone: '+5215555555501',
      imageUrl: 'https://images.unsplash.com/photo-1574158622643-69d34d72650a?q=80&w=600&auto=format&fit=crop',
    },
    // Caso 10: Gato Encontrado (Gatito gris) - Deambulando
    {
      userId: userTest.id,
      type: ReportType.FOUND,
      species: PetSpecies.CAT,
      name: 'Gatito deambulando',
      status: PetStatus.WANDERING,
      hasCollar: false,
      hasSpots: true,
      hasChip: false,
      hasScars: false,
      color: 'Gris claro atigrado',
      distinctiveText: 'Gatito de aproximadamente 3 meses. Muy ágil.',
      location: 'Narvarte Poniente, Glorieta SCOP',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: 'Visto en los jardines de la glorieta jugando. Al parecer no tiene hogar fijo o se salió de algún departamento.',
      contactPhone: '+5215555555502',
      imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=600&auto=format&fit=crop',
    },
  ];

  for (const report of reportsData) {
    const { imageUrl, ...rest } = report;
    const createdReport = await prisma.report.create({
      data: {
        ...rest,
        images: {
          create: {
            url: imageUrl,
            isPrimary: true,
          },
        },
      },
    });
    console.log(`✅ Creado reporte de ${createdReport.name || createdReport.species} (${createdReport.id})`);
  }

  console.log('🎉 ¡Datos de prueba sembrados exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error al correr la semilla:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
