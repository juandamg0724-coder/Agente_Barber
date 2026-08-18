const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  const burger = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  
document.getElementById('bookingForm').addEventListener('submit', async function(e){
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const telefono = document.getElementById('telefono').value;
  const dia = document.getElementById('fecha-dia').value;
  const mes = document.getElementById('fecha-mes').value;
  const anio = document.getElementById('fecha-anio').value;
  const servicio = document.getElementById('servicio').value;

  // Convertimos día/mes/año a formato de fecha MySQL: AAAA-MM-DD
  const fecha = `${anio}-${mes}-${dia}`;

  try {
    const response = await fetch('http://localhost:3000/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono, fecha, servicio })
    });

    if (!response.ok) throw new Error('Error al enviar la reserva');

    alert('¡Gracias! Tu solicitud de cita fue enviada. Te contactaremos pronto para confirmar.');
    this.reset();
  } catch (err) {
    console.error(err);
    alert('Hubo un problema al enviar tu reserva. Por favor intenta de nuevo.');
  }
});

