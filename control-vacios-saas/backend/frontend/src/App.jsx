import { useState } from 'react'

function App() {
  const [pantalla, setPantalla] = useState('chofer') 
  const [cajas, setCajas] = useState('')
  const [vacios, setVacios] = useState('')
  
  // Para esta prueba, asumiremos que estamos atendiendo al cliente ID 1 (el primero que creaste)
  const saldoAnterior = 0; 
  const numCajas = parseInt(cajas) || 0
  const numVacios = parseInt(vacios) || 0
  const nuevoSaldo = saldoAnterior + numCajas - numVacios

  // --- FUNCIÓN QUE ENVÍA LOS DATOS A LA BASE DE DATOS ---
  const guardarEntregaBD = async () => {
    if (numCajas === 0 && numVacios === 0) {
      alert("Debes ingresar alguna cantidad de cajas o vacíos.");
      return;
    }

    try {
      const respuesta = await fetch('http://localhost:5000/api/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: 1, // Le enviamos los datos al primer cliente que creaste
          cajas_despachadas: numCajas,
          vacios_recibidos: numVacios
        })
      });

      const data = await respuesta.json();
      
      if (respuesta.ok) {
        alert(`✅ ${data.mensaje}\nEl saldo real en la base de datos ahora es: ${data.nuevoSaldo}`);
        setCajas(''); // Limpiamos la pantalla
        setVacios('');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error de conexión. Revisa que el backend esté encendido.');
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#121212', color: 'white', minHeight: '100vh', padding: '15px' }}>
      
      <div style={{ display: 'flex', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
        <button 
          onClick={() => setPantalla('admin')} 
          style={{ flex: 1, padding: '15px', backgroundColor: pantalla === 'admin' ? '#333' : '#222', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          🏢 Oficina
        </button>
        <button 
          onClick={() => setPantalla('chofer')} 
          style={{ flex: 1, padding: '15px', backgroundColor: pantalla === 'chofer' ? '#0052cc' : '#222', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          🚚 Camión
        </button>
      </div>

      {pantalla === 'chofer' && (
        <div>
          <h2 style={{ textAlign: 'center', marginTop: 0 }}>Despacho Rápido</h2>
          
          <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>Bodegón (Prueba ID 1)</h3>
            <p style={{ margin: '0 0 20px 0', color: '#ff4d4d', fontWeight: 'bold' }}>Deuda inicial en pantalla: {saldoAnterior} vacíos</p>

            <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px' }}>📦 Cajas Llenas Dejadas:</label>
            <input 
              type="number" 
              value={cajas}
              onChange={(e) => setCajas(e.target.value)}
              style={{ width: '100%', padding: '15px', fontSize: '24px', textAlign: 'center', borderRadius: '8px', border: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
              placeholder="0"
            />

            <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px' }}>🍾 Vacíos Recogidos:</label>
            <input 
              type="number" 
              value={vacios}
              onChange={(e) => setVacios(e.target.value)}
              style={{ width: '100%', padding: '15px', fontSize: '24px', textAlign: 'center', borderRadius: '8px', border: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
              placeholder="0"
            />

            <div style={{ backgroundColor: nuevoSaldo <= 0 ? '#003300' : '#330000', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', color: '#ccc' }}>El nuevo saldo será:</p>
              <h2 style={{ margin: 0, color: nuevoSaldo <= 0 ? '#00ff00' : '#ff4d4d' }}>
                {nuevoSaldo <= 0 ? `A FAVOR: ${Math.abs(nuevoSaldo)}` : `DEBE: ${nuevoSaldo}`}
              </h2>
            </div>

            {/* AQUÍ CONECTAMOS EL BOTÓN A LA FUNCIÓN */}
            <button 
              onClick={guardarEntregaBD}
              style={{ width: '100%', padding: '20px', fontSize: '20px', fontWeight: 'bold', backgroundColor: '#00cc66', border: 'none', borderRadius: '8px', color: 'black', cursor: 'pointer' }}>
              CONFIRMAR ENTREGA
            </button>
          </div>
        </div>
      )}

      {pantalla === 'admin' && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
          <p>La vista de administración está en pausa mientras probamos el camión.</p>
        </div>
      )}

    </div>
  )
}

export default App
