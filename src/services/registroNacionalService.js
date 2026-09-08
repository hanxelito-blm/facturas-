// Servicio API Registro Nacional de Costa Rica
// Formato de cédula: X-XXXX-XXXX (física) o X-XXX-XXXXXX (jurídica)
// Basado en el padrón del TSE/RNC costarricense

export const validateCedulaFormat = (cedula) => {
  const cleaned = cedula.replace(/[-\s]/g, '');
  const fisicaRegex = /^\d{9}$/;
  const juridicaRegex = /^\d{10}$/;
  return fisicaRegex.test(cleaned) || juridicaRegex.test(cleaned);
};

export const formatCedula = (cedula) => {
  const cleaned = cedula.replace(/[-\s]/g, '');
  if (cleaned.length === 9) {
    return `${cleaned[0]}-${cleaned.slice(1, 5)}-${cleaned.slice(5)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned[0]}-${cleaned.slice(1, 4)}-${cleaned.slice(4)}`;
  }
  return cedula;
};

// Simulación de consulta al Registro Nacional
// En producción, esto se reemplazaría por fetch() al endpoint real
export const consultarRegistroNacional = async (cedula) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const cleaned = cedula.replace(/[-\s]/g, '');

  if (!validateCedulaFormat(cedula)) {
    return {
      success: false,
      error: 'Formato de cédula inválido. Use: X-XXX-XXXX o X-XXXX-XXXXX',
    };
  }

  const nombres = [
    'Juan Carlos', 'María José', 'Carlos Alberto', 'Ana Lucía',
    'José Manuel', 'Patricia Elena', 'Luis Fernando', 'Sandra Milena',
    'Roberto Antonio', 'Gabriela Estefanía', 'Miguel Ángel', 'Isabel Cristina',
  ];

  const apellidos = [
    'González Morales', 'Rodríguez Pérez', 'Martínez López', 'Hernández García',
    'Sánchez Ramírez', 'Ramírez Torres', 'Flores Rivera', 'Gutiérrez Díaz',
    'Vargas Castro', 'Rojas Aguilar', 'Morales Chaves', 'Brenes Villalobos',
  ];

  const hash = cleaned.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  const nombreIndex = hash % nombres.length;
  const apellidoIndex = (hash + 3) % apellidos.length;

  return {
    success: true,
    data: {
      cedula: formatCedula(cedula),
      nombreCompleto: `${nombres[nombreIndex]} ${apellidos[apellidoIndex]}`,
      fechaNacimiento: `${1950 + (hash % 50)}-${String((hash % 12) + 1).padStart(2, '0')}-${String((hash % 28) + 1).padStart(2, '0')}`,
      nacionalidad: 'Costarricense',
      estadoCivil: ['Soltero/a', 'Casado/a', 'Divorciado/a'][hash % 3],
      provincia: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'][hash % 7],
      canton: ['Central', 'Desamparados', 'Escazú', 'Turrialba'][hash % 4],
      distrito: ['Central', 'San Antonio', 'Concepción', 'Dulce Nombre'][hash % 4],
      fuente: 'Registro Nacional de Costa Rica (Simulación)',
    },
  };
};

export default { validateCedulaFormat, formatCedula, consultarRegistroNacional };
