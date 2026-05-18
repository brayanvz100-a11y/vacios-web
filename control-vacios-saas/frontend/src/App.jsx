import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from 'recharts' 

// --- ICONOS COMPACTOS SVG ---
const IconoOficina = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1"/></svg>;
const IconoCamion = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon"><path d="M10 17h4V5H2v12h3M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>;
const IconoDescarga = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconoDashboard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const IconoVacio = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto 10px auto', display:'block'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 21V9M15 21V9"/></svg>;
const IconoEditar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconoEliminar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;

const BadgeEstado = ({ saldo }) => {
  if (saldo > 0) return <span style={{background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px'}}>DEUDOR</span>;
  if (saldo < 0) return <span style={{background: 'rgba(52,211,153,0.2)', color: '#34d399', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px'}}>A FAVOR</span>;
  return <span style={{background: 'rgba(148,163,184,0.2)', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px'}}>AL DÍA</span>;
};

function App() {
  const [logueado, setLogueado] = useState(false)
  const [tokenUsuario, setTokenUsuario] = useState('') 
  const [usuarioInput, setUsuarioInput] = useState('')
  const [claveInput, setClaveInput] = useState('')
  const [rolUsuario, setRolUsuario] = useState('') 
  const [nombreConectado, setNombreConectado] = useState('') 

  const [pantalla, setPantalla] = useState('dashboard') 
  const [clientes, setClientes] = useState([]) 
  const [productos, setProductos] = useState([])
  const [historial, setHistorial] = useState([]) 
  const [cargandoDatos, setCargandoDatos] = useState(false)
  
  const [clienteSeleccionado, setClienteSeleccionado] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cajas, setCajas] = useState('')
  const [vacios, setVacios] = useState('')
  const [busquedaCliente, setBusquedaCliente] = useState('')
  
  const [tasaBcv, setTasaBcv] = useState(() => {
    const guardada = localStorage.getItem('tasaBcvOficial');
    return guardada ? parseFloat(guardada) : 36.50;
  });
  const [pagadoUsd, setPagadoUsd] = useState('')
  const [pagadoBs, setPagadoBs] = useState('')

  // NUEVO ESTADO: RECIBO DIGITAL
  const [reciboModal, setReciboModal] = useState(null)

  const [nuevoNombreCliente, setNuevoNombreCliente] = useState('')
  const [nuevoChoferUser, setNuevoChoferUser] = useState('')
  const [nuevoChoferPass, setNuevoChoferPass] = useState('')
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7))

  const [editandoId, setEditandoId] = useState(null)
  const [editCajas, setEditCajas] = useState('')
  const [editVacios, setEditVacios] = useState('')
  const [editPagado, setEditPagado] = useState('')

  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: '' })
  const mostrarNotificacion = (mensaje, tipo) => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: '', tipo: '' }), 4000); 
  }

  useEffect(() => { localStorage.setItem('tasaBcvOficial', tasaBcv); }, [tasaBcv]);

  const iniciarSesion = async () => {
    if (!usuarioInput || !claveInput) return mostrarNotificacion("Ingresa tus credenciales", "error");
    try {
      const respuesta = await fetch('http://localhost:5000/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: usuarioInput, password: claveInput })
      });
      const data = await respuesta.json();
      if (respuesta.ok) {
        setTokenUsuario(data.token); setLogueado(true); setRolUsuario(data.rol); setNombreConectado(usuarioInput);
        setPantalla(data.rol === 'admin' ? 'dashboard' : 'chofer');
        mostrarNotificacion("Acceso concedido", "success");
      } else { mostrarNotificacion(data.error, "error"); }
    } catch (error) { mostrarNotificacion("Servidor apagado", "error"); }
  }

  const cargarDatos = useCallback(async () => {
    if (!tokenUsuario) return;
    setCargandoDatos(true);
    try {
      const config = { headers: { 'Authorization': `Bearer ${tokenUsuario}` } }; 
      const [resC, resP, resH] = await Promise.all([
        fetch('http://localhost:5000/api/clientes', config),
        fetch('http://localhost:5000/api/productos', config),
        fetch('http://localhost:5000/api/transacciones', config)
      ]);
      if (resC.ok) setClientes(await resC.json());
      if (resP.ok) setProductos(await resP.json());
      if (resH.ok) setHistorial(await resH.json());
    } catch (error) { console.error("Error cargando datos."); }
    setTimeout(() => setCargandoDatos(false), 500);
  }, [tokenUsuario]);

  useEffect(() => { if (logueado) cargarDatos(); }, [logueado, cargarDatos]);

  const cActual = clientes.find(c => c.id?.toString() === clienteSeleccionado);
  const pActual = productos.find(p => p.id?.toString() === productoSeleccionado);
  const saldoAnteriorUsd = cActual ? cActual.saldo_usd : 0; 
  const precioAct = pActual ? pActual.precio_usd : 0;

  const numCajas = parseInt(cajas) || 0; 
  const numVacios = parseInt(vacios) || 0;
  const numPagadoUsd = parseFloat(pagadoUsd) || 0;

  const proyeccionGenerado = numCajas * precioAct;
  const nuevoSaldoProyectado = saldoAnteriorUsd + proyeccionGenerado - numPagadoUsd;

  const guardarEntregaBD = async () => {
    if (!clienteSeleccionado || !productoSeleccionado || (numCajas === 0 && numVacios === 0 && numPagadoUsd === 0)) 
      return mostrarNotificacion("Complete todos los campos", "error");
    try {
      const respuesta = await fetch('http://localhost:5000/api/transacciones', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUsuario}` },
        body: JSON.stringify({ cliente_id: clienteSeleccionado, producto_id: productoSeleccionado, cajas_despachadas: numCajas, vacios_recibidos: numVacios, monto_pagado_usd: numPagadoUsd, tasa_bcv: tasaBcv })
      });
      if (respuesta.ok) {
        // GENERAR RECIBO ANTES DE BORRAR DATOS
        setReciboModal({
          cliente: cActual.nombre, producto: pActual.nombre, 
          llenas: numCajas, vacios: numVacios, pagoUsd: numPagadoUsd, 
          pagoBs: pagadoBs, totalFactura: proyeccionGenerado,
          deudaFinal: nuevoSaldoProyectado, tasa: tasaBcv, fecha: new Date()
        });

        setCajas(''); setVacios(''); setPagadoUsd(''); setPagadoBs(''); setClienteSeleccionado(''); setProductoSeleccionado(''); setBusquedaCliente('');
        cargarDatos(); mostrarNotificacion("Venta registrada con éxito", "success");
      } else { const data = await respuesta.json(); mostrarNotificacion(data.error, "error"); }
    } catch (error) { mostrarNotificacion("Error al guardar", "error"); }
  }

  const manejarPagoUsd = (val) => {
    setPagadoUsd(val); const num = parseFloat(val);
    if (!isNaN(num) && tasaBcv > 0) setPagadoBs((num * tasaBcv).toFixed(2)); else setPagadoBs('');
  }
  const manejarPagoBs = (val) => {
    setPagadoBs(val); const num = parseFloat(val);
    if (!isNaN(num) && tasaBcv > 0) setPagadoUsd((num / tasaBcv).toFixed(2)); else setPagadoUsd('');
  }

  const eliminarTransaccion = async (id) => {
    if (!window.confirm("¿Seguro que deseas ELIMINAR esta venta?")) return;
    try {
      const respuesta = await fetch(`http://localhost:5000/api/transacciones/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${tokenUsuario}` } });
      if (respuesta.ok) { cargarDatos(); mostrarNotificacion("Registro eliminado", "success"); }
    } catch (e) {}
  }
  
  const iniciarEdicion = (viaje) => { setEditandoId(viaje.id); setEditCajas(viaje.cajas_despachadas); setEditVacios(viaje.vacios_recibidos); setEditPagado(viaje.monto_pagado_usd); }
  const guardarEdicion = async (id) => {
    try {
      const respuesta = await fetch(`http://localhost:5000/api/transacciones/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUsuario}` },
        body: JSON.stringify({ cajas_despachadas: editCajas, vacios_recibidos: editVacios, monto_pagado_usd: editPagado })
      });
      if (respuesta.ok) { setEditandoId(null); cargarDatos(); mostrarNotificacion("Modificación guardada", "success"); }
    } catch (e) {}
  }

  const registrarNuevoCliente = async () => { 
    if (!nuevoNombreCliente.trim()) return;
    try { const res = await fetch('http://localhost:5000/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUsuario}` }, body: JSON.stringify({ nombre: nuevoNombreCliente }) }); if (res.ok) { setNuevoNombreCliente(''); cargarDatos(); mostrarNotificacion("Registrado", "success"); } } catch (e) {}
  }
  const registrarNuevoChofer = async () => { 
    if (!nuevoChoferUser.trim() || !nuevoChoferPass.trim()) return;
    try { const res = await fetch('http://localhost:5000/api/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenUsuario}` }, body: JSON.stringify({ username: nuevoChoferUser, password: nuevoChoferPass }) }); if (res.ok) { setNuevoChoferUser(''); setNuevoChoferPass(''); mostrarNotificacion("Operador creado", "success"); } } catch (e) {}
  }

  const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()));
  const historialFiltrado = historial.filter(v => v.fecha.startsWith(mesFiltro));
  
  const totalGeneradoMes = historialFiltrado.reduce((acc, curr) => acc + curr.monto_generado_usd, 0);
  const totalPagadoMes = historialFiltrado.reduce((acc, curr) => acc + curr.monto_pagado_usd, 0);

  const datosGrafico = historialFiltrado.slice(0, 15).reverse().map(v => ({
    dia: new Date(v.fecha).toLocaleDateString('es-VE', {day:'numeric', month:'short'}),
    Llenas: v.cajas_despachadas,
    Vacíos: v.vacios_recibidos
  }));

  const formatoUSD = (monto) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monto || 0);
  const formatoBS = (monto) => new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto || 0) + ' Bs';
  const obtenerHora = (f) => { try { return new Date(f).toLocaleTimeString('es-VE', {hour:'2-digit', minute:'2-digit'}); } catch(e) { return "--:--"; } }
  const obtenerDia = (f) => { try { return new Date(f).toLocaleDateString('es-VE'); } catch(e) { return "--/--/--"; } }
  const cerrarSesion = () => { window.location.reload(); }

  return (
    <div className="app-container" style={{ justifyContent: logueado ? 'flex-start' : 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap');
        body { margin: 0; background-color: #020617; } 
        .bg-orb-1 { position: absolute; top: -10%; left: -10%; width: 450px; height: 450px; background: rgba(0, 71, 171, 0.25); border-radius: 50%; filter: blur(120px); animation: pulseGlow 8s infinite alternate; z-index: 0; pointer-events: none; }
        .bg-orb-2 { position: absolute; bottom: -10%; right: -10%; width: 550px; height: 550px; background: rgba(255, 204, 0, 0.15); border-radius: 50%; filter: blur(140px); animation: pulseGlow 12s infinite alternate-reverse; z-index: 0; pointer-events: none; }
        @keyframes pulseGlow { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 0.8; } }
        .app-container { min-height: 100vh; background-color: transparent; color: #ffffff; font-family: 'Inter', sans-serif; padding: 20px; display: flex; flex-direction: column; align-items: center; position: relative; overflow-x: hidden; z-index: 1; }
        .main-wrapper { width: 100%; max-width: 900px; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); z-index: 2; position: relative; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; }
        .toast { padding: 16px 24px; border-radius: 12px; font-weight: 600; font-size: 14px; color: white; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
        .toast-success { border-left: 4px solid #10b981; background: rgba(16, 185, 129, 0.2); }
        .toast-error { border-left: 4px solid #ef4444; background: rgba(239, 68, 68, 0.2); }
        
        .nav-container { display: flex; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 100px; padding: 6px; margin-bottom: 25px; backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .nav-btn { flex: 1; padding: 12px; border: none; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; background: transparent; color: #64748b; display: flex; align-items: center; justify-content: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .nav-icon { margin-right: 8px; }
        .nav-btn:hover:not(.active) { color: #f8fafc; background: rgba(255,255,255,0.05); }
        .nav-btn.active { background: linear-gradient(135deg, #0047AB 0%, #002D72 100%); color: white; box-shadow: 0 4px 20px rgba(0, 71, 171, 0.5); transform: scale(1.02); }
        
        .glass-card { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); margin-bottom: 24px; }
        .title { font-weight: 800; font-size: 20px; color: #f8fafc; margin: 0 0 20px 0; }
        
        .premium-input, .premium-select { width: 100%; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 14px 16px; color: white; font-size: 14px; outline: none; box-sizing: border-box; margin-bottom: 18px; transition: all 0.2s; }
        .premium-input:focus, .premium-select:focus { border-color: #0047AB; background: rgba(0,0,0,0.6); box-shadow: 0 0 0 4px rgba(0, 71, 171, 0.2); }
        .label { display: block; margin-bottom: 8px; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; }
        
        .btn-action { background: linear-gradient(135deg, #0047AB 0%, #002D72 100%); border: none; padding: 14px; border-radius: 12px; color: white; font-weight: 800; cursor: pointer; transition: all 0.3s; text-transform: uppercase; display: inline-flex; align-items: center; justify-content: center; }
        .btn-action:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 71, 171, 0.4); }
        .btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .btn-warning { background: linear-gradient(135deg, #FFCC00 0%, #F59E0B 100%); color: #000; }
        .btn-danger { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
        .btn-icon-only { padding: 8px; border-radius: 8px; min-width: 32px; height: 32px; }
        
        .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
        .stat-card { background: rgba(255,255,255,0.03); padding: 18px 15px; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
        .stat-val { display: block; font-size: 28px; font-weight: 800; margin-top: 8px; }
        .input-row { display: flex; gap: 15px; }
        
        .data-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
        .data-table th { color: #64748b; font-weight: 600; font-size: 11px; text-transform: uppercase; padding: 0 10px 10px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .data-table td { background: rgba(0,0,0,0.2); padding: 12px 10px; font-size: 13px; }
        .data-table tr:hover td { background: rgba(255,255,255,0.05); }
        .data-table tr td:first-child { border-radius: 10px 0 0 10px; }
        .data-table tr td:last-child { border-radius: 0 10px 10px 0; }
        
        .search-results { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; margin-top: -10px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .search-item { padding: 12px 16px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; }
        .search-item:hover { background: rgba(0,71,171,0.2); }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 99999; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; }
        .receipt-card { background: white; color: black; border-radius: 12px; width: 100%; max-width: 350px; padding: 25px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); position: relative; animation: slideUp 0.3s ease; }
        .receipt-header { border-bottom: 2px dashed #ccc; padding-bottom: 15px; margin-bottom: 15px; text-align: center; }
        .receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: skeletonLoading 1.5s infinite; border-radius: 8px; }
        @keyframes skeletonLoading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 600px) {
          .app-container { padding: 10px; }
          .glass-card { padding: 20px; border-radius: 18px; margin-bottom: 15px; }
          .stat-grid { grid-template-columns: 1fr; gap: 10px; }
          .input-row { flex-direction: column; gap: 0; }
          .nav-container { border-radius: 16px; padding: 5px; }
          .nav-btn { flex-direction: column; font-size: 10px; padding: 10px 5px; border-radius: 12px; gap: 4px; }
          .nav-icon { margin-right: 0; margin-bottom: 2px; }
          .data-table { min-width: 800px; }
        }
      `}</style>

      <div className="bg-orb-1"></div><div className="bg-orb-2"></div>
      {toast.visible && <div className="toast-container"><div className={`toast toast-${toast.tipo}`}>{toast.mensaje}</div></div>}

      {/* MODAL DEL TICKET DE RECIBO DIGITAL */}
      {reciboModal && (
        <div className="modal-overlay">
          <div className="receipt-card">
            <div className="receipt-header">
              <h2 style={{margin: '0 0 5px 0', color: '#0047AB', fontWeight: '900', fontSize: '24px'}}>NEXUS LOGÍSTICA</h2>
              <p style={{margin: 0, color: '#666', fontSize: '12px'}}>Comprobante de Despacho</p>
              <p style={{margin: '5px 0 0 0', color: '#333', fontSize: '12px', fontWeight: 'bold'}}>{reciboModal.fecha.toLocaleString('es-VE')}</p>
            </div>
            
            <div className="receipt-row"><span style={{color: '#666'}}>Cliente:</span><strong style={{textAlign: 'right'}}>{reciboModal.cliente}</strong></div>
            <div className="receipt-row"><span style={{color: '#666'}}>Producto:</span><strong style={{textAlign: 'right'}}>{reciboModal.producto}</strong></div>
            <div className="receipt-row"><span style={{color: '#666'}}>Tasa BCV:</span><strong>{formatoBS(reciboModal.tasa)}</strong></div>
            
            <div style={{borderBottom: '1px solid #eee', margin: '15px 0'}}></div>
            
            <div className="receipt-row"><span style={{color: '#666'}}>Cajas Entregadas:</span><strong>{reciboModal.llenas}</strong></div>
            <div className="receipt-row"><span style={{color: '#666'}}>Vacíos Devueltos:</span><strong>{reciboModal.vacios}</strong></div>
            <div className="receipt-row" style={{marginTop: '10px'}}><span style={{color: '#333', fontWeight: 'bold'}}>Total Factura:</span><strong style={{color: '#0047AB', fontSize: '16px'}}>{formatoUSD(reciboModal.totalFactura)}</strong></div>
            
            <div style={{borderBottom: '1px solid #eee', margin: '15px 0'}}></div>

            <div className="receipt-row"><span style={{color: '#666'}}>Abono Pagado ($):</span><strong style={{color: '#10b981'}}>{formatoUSD(reciboModal.pagoUsd)}</strong></div>
            <div className="receipt-row"><span style={{color: '#666'}}>Equivalente (Bs):</span><strong style={{color: '#10b981'}}>{formatoBS(reciboModal.pagoUsd * reciboModal.tasa)}</strong></div>
            
            <div style={{background: reciboModal.deudaFinal <= 0 ? '#ecfdf5' : '#fef2f2', padding: '15px', borderRadius: '8px', marginTop: '20px', textAlign: 'center', border: reciboModal.deudaFinal <= 0 ? '1px solid #34d399' : '1px solid #f87171'}}>
              <span style={{display: 'block', fontSize: '11px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '5px'}}>Saldo Final Actualizado</span>
              <strong style={{fontSize: '22px', color: reciboModal.deudaFinal <= 0 ? '#10b981' : '#ef4444'}}>
                {reciboModal.deudaFinal <= 0 ? `A FAVOR: ${formatoUSD(Math.abs(reciboModal.deudaFinal))}` : `DEUDA: ${formatoUSD(reciboModal.deudaFinal)}`}
              </strong>
            </div>

            <button onClick={() => setReciboModal(null)} style={{width: '100%', padding: '15px', marginTop: '20px', background: '#0047AB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>
              Cerrar Ticket
            </button>
          </div>
        </div>
      )}

      {!logueado ? (
        <div className="glass-card" style={{ width: '100%', maxWidth: '380px', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #0047AB, #002D72)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 15px 35px rgba(0,71,171,0.5)' }}>
              <IconoCamion />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 5px 0' }}>ERP Nexus</h2>
            <p style={{ color: '#FFCC00', margin: 0, fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Venta Oficial</p>
          </div>
          <label className="label">Usuario</label>
          <input className="premium-input" type="text" value={usuarioInput} onChange={e => setUsuarioInput(e.target.value)} />
          <label className="label">Contraseña</label>
          <input className="premium-input" type="password" value={claveInput} onChange={e => setClaveInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && iniciarSesion()} />
          <button className="btn-action" style={{width: '100%', marginTop: '10px'}} onClick={iniciarSesion}>Acceder al Sistema</button>
        </div>
      ) : (
        <div className="main-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,71,171,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '18px', fontWeight: '800', border: '1px solid rgba(0,71,171,0.4)' }}>
                {(nombreConectado || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#f8fafc', fontSize: '15px', fontWeight: '700' }}>{nombreConectado}</div>
                <div style={{ color: '#FFCC00', fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>{rolUsuario}</div>
              </div>
            </div>
            <button onClick={cerrarSesion} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Salir ✕</button>
          </div>

          <div className="nav-container">
            {rolUsuario === 'admin' && (
              <>
                <button className={`nav-btn ${pantalla === 'dashboard' ? 'active' : ''}`} onClick={() => setPantalla('dashboard')}><IconoDashboard /> ERP PANEL</button>
                <button className={`nav-btn ${pantalla === 'admin' ? 'active' : ''}`} onClick={() => setPantalla('admin')}><IconoOficina /> CONFIG</button>
              </>
            )}
            <button className={`nav-btn ${pantalla === 'chofer' ? 'active' : ''}`} onClick={() => setPantalla('chofer')}><IconoCamion /> PUNTO DE VENTA</button>
          </div>

          {/* DASHBOARD CON GRÁFICO RECHARTS Y BADGES */}
          {pantalla === 'dashboard' && (
            <div style={{ animation: 'slideUp 0.4s ease' }}>
              <div className="glass-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
                  <h2 className="title" style={{margin: 0}}>Estados Financieros</h2>
                  <input type="month" className="premium-input" style={{width: 'auto', padding: '8px 12px', margin: 0, fontSize: '12px'}} value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} />
                </div>
                
                <div className="stat-grid">
                  <div className="stat-card">
                    <span className="label">Ventas del Mes</span>
                    {cargandoDatos ? <div className="skeleton" style={{height: '30px', width: '60%', margin: '8px auto 0 auto'}}></div> : <span className="stat-val" style={{color: '#60a5fa'}}>{formatoUSD(totalGeneradoMes)}</span>}
                  </div>
                  <div className="stat-card">
                    <span className="label">Ingresos Reales (Pagos)</span>
                    {cargandoDatos ? <div className="skeleton" style={{height: '30px', width: '60%', margin: '8px auto 0 auto'}}></div> : <span className="stat-val" style={{color: '#34d399'}}>{formatoUSD(totalPagadoMes)}</span>}
                  </div>
                </div>

                <div style={{ height: '260px', marginTop: '30px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '15px'}}>Dinámica Diaria (Llenas vs Vacíos)</h3>
                  {historialFiltrado.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosGrafico} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="dia" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff'}} />
                        <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                        <Bar dataKey="Llenas" fill="#0047AB" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="Vacíos" fill="#FFCC00" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div style={{textAlign: 'center', paddingTop: '40px', color: '#64748b'}}>Sin datos para graficar en este mes.</div>}
                </div>
              </div>

              <div className="glass-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                   <h2 className="title" style={{margin: 0}}>Estado de Cuenta Global</h2>
                   <div style={{fontSize: '11px', color: '#94a3b8'}}>Tasa Ref: {formatoBS(tasaBcv)} x $1</div>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '25px', paddingRight: '10px' }}>
                  {cargandoDatos ? <div className="skeleton" style={{height:'100px', borderRadius:'12px'}}></div> : clientes.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#e2e8f0', display: 'block', marginBottom: '5px' }}>{c.nombre}</span>
                        <BadgeEstado saldo={c.saldo_usd} />
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <strong style={{fontSize: '16px', display: 'block', color: c.saldo_usd <= 0 ? '#34d399' : '#f87171'}}>
                          {formatoUSD(Math.abs(c.saldo_usd))}
                        </strong>
                        <span style={{fontSize: '11px', color: '#94a3b8'}}>{formatoBS(Math.abs(c.saldo_usd * tasaBcv))}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="title">Auditoría de Transacciones</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Fecha</th><th>Chofer</th><th>Cliente</th><th>Producto</th><th>Movimiento</th><th>Factura USD / Bs</th><th>Acción</th></tr>
                    </thead>
                    <tbody>
                      {historialFiltrado.map(viaje => (
                        <tr key={viaje.id}>
                          <td style={{ color: '#94a3b8' }}><div style={{fontWeight: '600'}}>{obtenerDia(viaje.fecha)}</div><div style={{fontSize: '10px'}}>{obtenerHora(viaje.fecha)}</div></td>
                          <td style={{ color: '#FFCC00', fontWeight: '600' }}>@{viaje.chofer}</td>
                          <td style={{ color: '#f8fafc', fontWeight: '500' }}>{viaje.cliente}</td>
                          <td style={{ color: '#94a3b8', fontSize: '11px' }}>{viaje.producto || 'Genérico'}</td>
                          
                          {editandoId === viaje.id ? (
                            <td colSpan="3" style={{ background: 'rgba(0,71,171,0.2)' }}>
                              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <input className="premium-input" style={{width:'50px', padding:'5px', margin:0}} type="number" value={editCajas} onChange={e=>setEditCajas(e.target.value)} title="Llenas" />
                                <input className="premium-input" style={{width:'50px', padding:'5px', margin:0}} type="number" value={editVacios} onChange={e=>setEditVacios(e.target.value)} title="Vacíos" />
                                <input className="premium-input" style={{width:'70px', padding:'5px', margin:0}} type="number" value={editPagado} onChange={e=>setEditPagado(e.target.value)} title="Pagado $" />
                                <button className="btn-action btn-success btn-icon-only" onClick={() => guardarEdicion(viaje.id)}>💾</button>
                                <button className="btn-action btn-danger btn-icon-only" onClick={() => setEditandoId(null)}>✕</button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td>
                                <span style={{color: '#38bdf8', fontWeight: 'bold'}} title="Llenas">📦 {viaje.cajas_despachadas}</span><br/>
                                <span style={{color: '#34d399', fontWeight: 'bold'}} title="Vacíos">🍾 {viaje.vacios_recibidos}</span>
                              </td>
                              <td>
                                <div style={{color: '#ef4444', fontSize: '11px'}}>Venta: {formatoUSD(viaje.monto_generado_usd)} <span style={{color: '#64748b'}}>({formatoBS(viaje.monto_generado_usd * viaje.tasa_bcv)})</span></div>
                                <div style={{color: '#10b981', fontSize: '11px', fontWeight:'bold'}}>Pagó: {formatoUSD(viaje.monto_pagado_usd)} <span style={{color: '#64748b', fontWeight:'normal'}}>({formatoBS(viaje.monto_pagado_usd * viaje.tasa_bcv)})</span></div>
                              </td>
                              <td>
                                <div style={{display:'flex', gap:'5px'}}>
                                  <button className="btn-action btn-warning btn-icon-only" onClick={() => iniciarEdicion(viaje)}><IconoEditar/></button>
                                  <button className="btn-action btn-danger btn-icon-only" onClick={() => eliminarTransaccion(viaje.id)}><IconoEliminar/></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PUNTO DE VENTA (CHOFER) CON BUSCADOR INTELIGENTE Y RECIBO DIGITAL */}
          {pantalla === 'chofer' && (
            <div className="glass-card" style={{ animation: 'slideUp 0.4s ease' }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px'}}>
                <h2 className="title" style={{margin: 0}}>Terminal de Venta</h2>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <label className="label" style={{margin: 0, color: '#FFCC00'}}>Tasa BCV</label>
                  <input className="premium-input" style={{width: '90px', padding: '8px', margin: 0, border: '1px solid #FFCC00', color: '#FFCC00', fontWeight: 'bold'}} type="number" step="0.01" value={tasaBcv} onChange={e => setTasaBcv(e.target.value)} />
                </div>
              </div>
              
              <label className="label">1. Buscador de Clientes</label>
              {!clienteSeleccionado ? (
                <>
                  <input className="premium-input" placeholder="Escribe para buscar franquiciado..." value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)} autoFocus />
                  {busquedaCliente && (
                    <div className="search-results">
                      {clientesFiltrados.map(c => (
                        <div key={c.id} className="search-item" onClick={() => { setClienteSeleccionado(c.id.toString()); setBusquedaCliente(''); }}>
                          <span style={{color: '#f8fafc', fontWeight: '600'}}>{c.nombre}</span>
                        </div>
                      ))}
                      {clientesFiltrados.length === 0 && <div style={{padding: '15px', color: '#64748b'}}>No se encontró ningún cliente</div>}
                    </div>
                  )}
                </>
              ) : (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,71,171,0.2)', padding: '15px', borderRadius: '14px', marginBottom: '20px', border: '1px solid rgba(0,71,171,0.4)'}}>
                  <span style={{fontSize: '18px', fontWeight: 'bold'}}>{cActual?.nombre}</span>
                  <button className="btn-action btn-danger btn-icon-only" onClick={() => setClienteSeleccionado('')}>✕</button>
                </div>
              )}

              {clienteSeleccionado && (
                <div style={{ animation: 'slideUp 0.3s ease' }}>
                  <div className="stat-card" style={{marginBottom: '20px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{textAlign: 'left'}}>
                      <span className="label">Deuda Actual</span>
                      <span className="stat-val text-glow-red" style={{fontSize: '24px'}}>{formatoUSD(saldoAnteriorUsd)}</span>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <span className="label">Equivalente a:</span>
                      <span style={{color: '#94a3b8', fontSize: '18px', fontWeight: 'bold'}}>{formatoBS(saldoAnteriorUsd * tasaBcv)}</span>
                    </div>
                  </div>

                  <label className="label">2. Producto Entregado</label>
                  <select className="premium-select" value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)}>
                    <option value="">-- Catálogo de Cajas --</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({formatoUSD(p.precio_usd)} | {formatoBS(p.precio_usd * tasaBcv)})</option>)}
                  </select>

                  {productoSeleccionado && (
                    <>
                      <div className="input-row">
                        <div style={{flex:1}}><label className="label">📦 Llenas (Dejadas)</label><input className="premium-input" type="number" placeholder="Ej. 10" value={cajas} onChange={e => setCajas(e.target.value)} /></div>
                        <div style={{flex:1}}><label className="label">🍾 Vacíos (Abono)</label><input className="premium-input" type="number" placeholder="Ej. 10" value={vacios} onChange={e => setVacios(e.target.value)} /></div>
                      </div>

                      <div style={{ background: 'rgba(0,71,171,0.15)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,71,171,0.4)', marginBottom: '20px' }}>
                        <h4 style={{margin: '0 0 15px 0', fontSize: '14px', color: '#60a5fa', display: 'flex', justifyContent: 'space-between'}}>
                          <span>3. Dinero Recibido (Cobro)</span>
                          <span style={{color: '#94a3b8', fontSize: '11px'}}>Venta Hoy: {formatoUSD(proyeccionGenerado)}</span>
                        </h4>
                        <div className="input-row">
                          <div style={{flex:1}}>
                            <label className="label" style={{color: '#10b981'}}>PAGO EN DÓLARES ($)</label>
                            <input className="premium-input" style={{marginBottom: 0, color: '#34d399', fontWeight: 'bold', fontSize: '20px'}} type="number" placeholder="0.00" value={pagadoUsd} onChange={e => manejarPagoUsd(e.target.value)} />
                          </div>
                          <div style={{flex:1}}>
                            <label className="label" style={{color: '#FFCC00'}}>O PAGO EN BOLÍVARES (Bs)</label>
                            <input className="premium-input" style={{marginBottom: 0, color: '#FFCC00', fontWeight: 'bold', fontSize: '20px'}} type="number" placeholder="0.00" value={pagadoBs} onChange={e => manejarPagoBs(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div className="stat-card" style={{marginBottom: '20px', background: nuevoSaldoProyectado <= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: nuevoSaldoProyectado <= 0 ? '1px solid #10b981' : '1px solid #ef4444'}}>
                        <span className="label">NUEVO SALDO DEL CLIENTE DESPUÉS DE ESTA VENTA</span>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span className="stat-val" style={{color: nuevoSaldoProyectado <= 0 ? '#34d399' : '#f87171'}}>{nuevoSaldoProyectado <= 0 ? `A FAVOR: ${formatoUSD(Math.abs(nuevoSaldoProyectado))}` : `DEUDA: ${formatoUSD(nuevoSaldoProyectado)}`}</span>
                          <span style={{color: '#94a3b8', fontSize: '14px', fontWeight: 'bold'}}>{formatoBS(Math.abs(nuevoSaldoProyectado) * tasaBcv)}</span>
                        </div>
                      </div>

                      <button className="btn-action btn-success" style={{width: '100%', fontSize: '18px', padding: '20px'}} onClick={guardarEntregaBD}>PROCESAR VENTA</button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GESTIÓN ADMIN */}
          {pantalla === 'admin' && (
            <div style={{ animation: 'slideUp 0.4s ease' }}>
              <div className="glass-card">
                 <h2 className="title">Configuración Global</h2>
                 
                 <label className="label">Crear Nuevo Operador (Chofer)</label>
                 <div className="input-row" style={{marginBottom: '25px'}}>
                   <input className="premium-input" style={{marginBottom: 0}} placeholder="Usuario" value={nuevoChoferUser} onChange={e => setNuevoChoferUser(e.target.value)} />
                   <input className="premium-input" style={{marginBottom: 0}} type="password" placeholder="Clave" value={nuevoChoferPass} onChange={e => setNuevoChoferPass(e.target.value)} />
                   <button className="btn-action" style={{width: '120px'}} onClick={registrarNuevoChofer}>CREAR</button>
                 </div>
                 
                 <label className="label">Registrar Nuevo Franquiciado (Licorería)</label>
                 <div className="input-row">
                   <input className="premium-input" style={{marginBottom: 0}} placeholder="Nombre fiscal..." value={nuevoNombreCliente} onChange={e => setNuevoNombreCliente(e.target.value)} />
                   <button className="btn-action btn-success" style={{width: '120px'}} onClick={registrarNuevoCliente}>AÑADIR</button>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App